// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";

contract TigerHunt is Context, Ownable, Pausable {
    using SafeERC20 for IERC20;

    IERC20 public tigz;
    //IERC20 public oxz;
    ERC20PresetMinterPauser public tigerHP;

    enum TigerAction {
        DRINK,
        EAT,
        POOP,
        SLEEP,
        HUNT,
        GUARD,
        STAKETIGZ,
        STAKEOXZ
    }
    struct TigerAccount {
        uint32[8] actionTimestamps;
        uint256 tigzStaked;
        //uint256 oxzStaked;
        uint256 huntBlock;
        address huntTarget;
    }
    mapping(address => TigerAccount) public tigerAccounts;

    mapping(address => bool) public isHuntExempt;

    uint32[8] public actionTimes = [
        3 hours,
        7 hours,
        8 hours,
        24 hours,
        5 hours,
        12 hours,
        24 hours,
        24 hours
    ];

    uint32[4] public actionMultipliers = [2, 7, 3, 45];
    uint32[5] public oxBonusMultipliersPct = [10, 20, 30, 40, 50];
    uint32 public guardTigzMultiplier = 100;

    uint256[5] public oxBonusThreshold = [
        10000000 ether,
        100000000 ether,
        1000000000 ether,
        10000000000 ether,
        100000000000 ether
    ];

    uint256 public huntPct = 5;
    uint256 public huntBlocks = 10;
    uint256 public huntRefreshFee = 100000 ether;

    constructor(
        IERC20 _tigz,
        //IERC20 _oxz,
        ERC20PresetMinterPauser _tigerHP
    ) Ownable() {
        tigz = _tigz;
        //oxz = _oxz;
        tigerHP = _tigerHP;
    }

    function stakeTigz(uint256 _wad) external {
        TigerAccount storage tigerAccount = tigerAccounts[_msgSender()];
        require(
            _checkActionTimestamp(tigerAccount, TigerAction.STAKETIGZ),
            "TigerHunt: Recently staked or unstaked TIGZ."
        );
        _setActionTimestamp(
            tigerAccount,
            TigerAction.STAKETIGZ,
            block.timestamp
        );
        tigerAccount.tigzStaked += _wad;
        tigz.safeTransferFrom(_msgSender(), address(this), _wad);
    }

    function unstakeTigz(uint256 _wad) external {
        TigerAccount storage tigerAccount = tigerAccounts[_msgSender()];
        require(
            _checkActionTimestamp(tigerAccount, TigerAction.STAKETIGZ),
            "TigerHunt: Recently staked or unstaked TIGZ."
        );
        _setActionTimestamp(
            tigerAccount,
            TigerAction.STAKETIGZ,
            block.timestamp
        );
        tigerAccount.tigzStaked -= _wad;
        tigz.safeTransfer(_msgSender(), _wad);
    }

    /*function stakeOxz(uint256 _wad) external {
        TigerAccount storage tigerAccount = tigerAccounts[_msgSender()];
        require(
            _checkActionTimestamp(tigerAccount, TigerAction.STAKEOXZ),
            "TigerHunt: Recently staked or unstaked OXZ."
        );
        _setActionTimestamp(
            tigerAccount,
            TigerAction.STAKEOXZ,
            block.timestamp
        );
        tigerAccount.oxzStaked += _wad;
        oxz.safeTransferFrom(_msgSender(), address(this), _wad);
    }

    function unstakeOxz(uint256 _wad) external {
        TigerAccount storage tigerAccount = tigerAccounts[_msgSender()];
        require(
            _checkActionTimestamp(tigerAccount, TigerAction.STAKEOXZ),
            "TigerHunt: Recently staked or unstaked OXZ."
        );
        _setActionTimestamp(
            tigerAccount,
            TigerAction.STAKEOXZ,
            block.timestamp
        );
        tigerAccount.oxzStaked -= _wad;
        oxz.safeTransfer(_msgSender(), _wad);
    }*/

    function tryHunt(address target) external whenNotPaused {
        TigerAccount storage tigerAccount = tigerAccounts[_msgSender()];
        require(!isHuntExempt[target], "TigerHunt: Target hunt exempt");
        require(
            tigerHP.balanceOf(_msgSender()) > 0,
            "TigerHunt: Sender 0 tigerHP"
        );
        require(tigerHP.balanceOf(target) > 0, "TigerHunt: Target 0 tigerHP");
        require(tigerAccount.tigzStaked > 0, "TigerHunt: No TIGZ staked");
        require(
            _checkActionTimestamp(tigerAccount, TigerAction.HUNT),
            "TigerHunt: Recently hunted."
        );
        _setActionTimestamp(tigerAccount, TigerAction.HUNT, block.timestamp);
        tigerAccount.huntBlock = block.number + huntBlocks;
        tigerAccount.huntTarget = target;
    }

    function winHunt() external whenNotPaused {
        TigerAccount storage tigerAccount = tigerAccounts[_msgSender()];
        require(isHuntWinning(_msgSender()), "TigerHunt: Hunt not winning.");
        address target = tigerAccount.huntTarget;
        uint256 targetBalance = tigerHP.balanceOf(target);
        if (isOnGuard(target)) {
            uint256 gaurdedTigHP = tigerAccounts[target].tigzStaked *
                guardTigzMultiplier;
            if (targetBalance <= gaurdedTigHP) {
                targetBalance = 0;
            } else {
                targetBalance -= gaurdedTigHP;
            }
        }
        uint256 amount = (targetBalance * huntPct) / 100;
        tigerHP.transferFrom(target, _msgSender(), amount);
        tigerHP.burnFrom(target, amount);
        tigerAccount.huntBlock = 0;
        tigerAccount.huntTarget = address(0);
    }

    function guard() external whenNotPaused {
        TigerAccount storage tigerAccount = tigerAccounts[_msgSender()];
        require(
            _checkActionTimestamp(tigerAccount, TigerAction.GUARD),
            "TigerHunt: Already guarding."
        );
        tigerHP.burnFrom(
            _msgSender(),
            (tigerHP.balanceOf(_msgSender()) * huntPct * 2) / 100
        );
        _setActionTimestamp(tigerAccount, TigerAction.GUARD, block.timestamp);
    }

    function eat() external whenNotPaused {
        _doStandardAction(_msgSender(), TigerAction.EAT);
    }

    function sleep() external whenNotPaused {
        _doStandardAction(_msgSender(), TigerAction.SLEEP);
    }

    function drink() external whenNotPaused {
        _doStandardAction(_msgSender(), TigerAction.DRINK);
    }

    function poop() external whenNotPaused {
        _doStandardAction(_msgSender(), TigerAction.POOP);
    }

    function doEatSleepDrinkPoop() external whenNotPaused {
        TigerAccount storage tigerAccount = tigerAccounts[_msgSender()];
        if (_checkActionTimestamp(tigerAccount, TigerAction.EAT))
            _doStandardAction(_msgSender(), TigerAction.EAT);
        if (_checkActionTimestamp(tigerAccount, TigerAction.SLEEP))
            _doStandardAction(_msgSender(), TigerAction.SLEEP);
        if (_checkActionTimestamp(tigerAccount, TigerAction.DRINK))
            _doStandardAction(_msgSender(), TigerAction.DRINK);
        if (_checkActionTimestamp(tigerAccount, TigerAction.POOP))
            _doStandardAction(_msgSender(), TigerAction.POOP);
    }

    function refreshHunt() external whenNotPaused {
        TigerAccount storage tigerAccount = tigerAccounts[_msgSender()];
        require(
            !_checkActionTimestamp(tigerAccount, TigerAction.HUNT),
            "TigerHunt: Hunt already available."
        );
        _setActionTimestamp(tigerAccount, TigerAction.HUNT, 0);
        tigerAccount.tigzStaked -= huntRefreshFee;
    }

    function setHuntExempt(address[] calldata _fors) external onlyOwner() {
        for (uint256 i = 0; i < _fors.length; i++) {
            isHuntExempt[_fors[i]] = true;
        }
    }

    function unsetHuntExempt(address[] calldata _fors) external onlyOwner() {
        for (uint256 i = 0; i < _fors.length; i++) {
            isHuntExempt[_fors[i]] = false;
        }
    }

    function setPause(bool _to) external onlyOwner() {
        if (_to) {
            _pause();
        } else {
            _unpause();
        }
    }

    function getRollAt(uint256 blocknumber) public view returns (uint256) {
        if (blockhash(blocknumber) == 0) return 0;
        return uint256(keccak256(abi.encodePacked(blockhash(blocknumber))));
    }

    function isHuntWinning(address _for) public view returns (bool) {
        TigerAccount storage tigerAccount = tigerAccounts[_for];
        uint256 rawRoll = getRollAt(tigerAccount.huntBlock);
        if (rawRoll == uint256(0)) return false;
        uint256 targetHP = tigerHP.balanceOf(tigerAccount.huntTarget) /
            10**18 /
            2;
        uint256 hunterHP = tigerHP.balanceOf(_for) / 10**18;
        if (hunterHP == 0) return false;
        if (targetHP / hunterHP >= 2) return false;
        uint256 minRoll = (~uint256(0) / 2 / hunterHP) * targetHP;
        return rawRoll >= minRoll;
    }

    function isOnGuard(address _for) public view returns (bool) {
        TigerAccount storage tigerAccount = tigerAccounts[_for];
        return
            block.timestamp -
                _getActionTimestamp(tigerAccount, TigerAction.GUARD) <=
            actionTimes[uint32(TigerAction.GUARD)];
    }

    function recoverERC20(address tokenAddress) external onlyOwner {
        IERC20(tokenAddress).safeTransfer(
            _msgSender(),
            IERC20(tokenAddress).balanceOf(address(this))
        );
    }

    function _doStandardAction(address _for, TigerAction _action) internal {
        TigerAccount storage tigerAccount = tigerAccounts[_msgSender()];
        require(tigerAccount.tigzStaked > 0, "TigerHunt: No TIGZ Staked.");
        require(
            _checkActionTimestamp(tigerAccount, _action),
            "TigerHunt: Action not available."
        );
        _setActionTimestamp(tigerAccount, _action, block.timestamp);
        tigerHP.mint(_for, _getReward(tigerAccount, _action));
    }

    /*function _getOxzBonusPct(TigerAccount storage _tigerAccount)
        internal
        view
        returns (uint32)
    {
        uint256 tigzStaked = _tigerAccount.tigzStaked;
        uint32 bonusPct = 0;
        uint32 i;
        while (i < oxBonusThreshold.length) {
            if (tigzStaked < oxBonusThreshold[i]) return bonusPct;
            bonusPct = oxBonusMultipliersPct[i];
        }
        return oxBonusMultipliersPct[oxBonusMultipliersPct.length - 1];
    }

    function _addOxzBonus(TigerAccount storage _tigerAccount, uint256 _initial)
        internal
        view
        returns (uint256)
    {
        uint32 bonusPct = _getOxzBonusPct(_tigerAccount);
        if (bonusPct == 0) return _initial;
        return (_initial * (100 + bonusPct)) / 100;
    }*/

    function _checkActionTimestamp(
        TigerAccount storage _tigerAccount,
        TigerAction _action
    ) internal view returns (bool) {
        return
            block.timestamp - _getActionTimestamp(_tigerAccount, _action) >=
            actionTimes[uint32(_action)];
    }

    function _getActionTimestamp(
        TigerAccount storage _tigerAccount,
        TigerAction _action
    ) internal view returns (uint256) {
        return uint256(_tigerAccount.actionTimestamps[uint256(_action)]);
    }

    function _setActionTimestamp(
        TigerAccount storage _tigerAccount,
        TigerAction _action,
        uint256 _to
    ) internal {
        _tigerAccount.actionTimestamps[uint256(_action)] = uint32(_to);
    }

    function _getReward(TigerAccount storage _tigerAccount, TigerAction _action)
        internal
        view
        returns (uint256)
    {
        return
            //_addOxzBonus(_tigerAccount, _tigerAccount.tigzStaked) *
            //note: remove tigzstaked mulitplier if readding oxz bonus
            _tigerAccount.tigzStaked * actionMultipliers[uint32(_action)];
    }
}
