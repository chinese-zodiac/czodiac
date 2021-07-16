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
    IERC20 public oxz;
    ERC20PresetMinterPauser public tigerHP;

    enum TigerAction {DRINK, EAT, POOP, SLEEP, HUNT, GUARD, STAKETIGZ, STAKEOXZ}
    struct TigerAccount {
        uint32[8] actionTimestamps;
        uint tigzStaked;
        uint oxzStaked;
        uint huntBlock;
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

    uint32[4] public actionMultipliers = [
        2,
        7,
        3,
        45
    ];

    uint32[5] public oxBonusMultipliersPct = [
        10,
        20,
        30,
        40,
        50
    ];

    uint[5] public oxBonusThreshold = [
        10000000 ether,
        100000000 ether,
        1000000000 ether,
        10000000000 ether,
        100000000000 ether
    ];

    uint public huntPct = 5;
    uint public huntBlocks = 10;

    constructor(IERC20 _tigz, IERC20 _oxz, ERC20PresetMinterPauser _tigerHP) Ownable() {
        tigz = _tigz;
        oxz = _oxz;
        tigerHP = _tigerHP;
     }

    function stakeTigz(uint _wad) external {
        TigerAccount storage tigerAccount = tigerAccounts[_msgSender()];
        require(_checkActionTimestamp(tigerAccount, TigerAction.STAKETIGZ), "TigerHunt: Recently staked or unstaked TIGZ.");
        _setActionTimestamp(tigerAccount, TigerAction.STAKETIGZ, block.timestamp);
        tigerAccount.tigzStaked += _wad;
        tigz.safeTransferFrom(_msgSender(), address(this), _wad);
    }

    function unstakeTigz(uint _wad) external {
        TigerAccount storage tigerAccount = tigerAccounts[_msgSender()];
        require(_checkActionTimestamp(tigerAccount, TigerAction.STAKETIGZ), "TigerHunt: Recently staked or unstaked TIGZ.");
        _setActionTimestamp(tigerAccount, TigerAction.STAKETIGZ, block.timestamp);
        tigerAccount.tigzStaked -= _wad;
        tigz.safeTransfer(_msgSender(), _wad);
    }

    function stakeOxz(uint _wad) external {
        TigerAccount storage tigerAccount = tigerAccounts[_msgSender()];
        require(_checkActionTimestamp(tigerAccount, TigerAction.STAKEOXZ), "TigerHunt: Recently staked or unstaked OXZ.");
        _setActionTimestamp(tigerAccount, TigerAction.STAKEOXZ, block.timestamp);
        tigerAccount.oxzStaked += _wad;
        tigz.safeTransferFrom(_msgSender(), address(this), _wad);
    }

    function unstakeOxz(uint _wad) external {
        TigerAccount storage tigerAccount = tigerAccounts[_msgSender()];
        require(_checkActionTimestamp(tigerAccount, TigerAction.STAKEOXZ), "TigerHunt: Recently staked or unstaked OXZ.");
        _setActionTimestamp(tigerAccount, TigerAction.STAKEOXZ, block.timestamp);
        tigerAccount.oxzStaked -= _wad;
        tigz.safeTransfer(_msgSender(), _wad);
    }

    function tryHunt(address target) external whenNotPaused {
        TigerAccount storage tigerAccount = tigerAccounts[_msgSender()];
        require(!isHuntExempt[target], "TigerHunt: Target hunt exempt");
        require(!isOnGuard(target), "TigerHunt: Target is on guard");
        require(tigerHP.balanceOf(_msgSender()) > 0, "TigerHunt: Sender 0 tigerHP");
        require(tigerAccount.tigzStaked > 0, "TigerHunt: No TIGZ staked");
        require(_checkActionTimestamp(tigerAccount, TigerAction.HUNT), "TigerHunt: Recently hunted.");
        _setActionTimestamp(tigerAccount, TigerAction.HUNT, block.timestamp);
        tigerAccount.huntBlock = block.number + 1;
        tigerAccount.huntTarget = target;
    } 

    function winHunt() external whenNotPaused {
        TigerAccount storage tigerAccount = tigerAccounts[_msgSender()];
        require(isHuntWinning(_msgSender()),"TigerHunt: Hunt not winning.");
        address target = tigerAccount.huntTarget;
        uint amount = tigerHP.balanceOf(target) * huntPct / 100;
        tigerHP.burnFrom(target,amount);
        tigerHP.transferFrom(target,_msgSender(),amount);
        tigerAccount.huntBlock = 0;
        tigerAccount.huntTarget = address(0);
    }

    function guard() external whenNotPaused {
        TigerAccount storage tigerAccount = tigerAccounts[_msgSender()];
        require(_checkActionTimestamp(tigerAccount, TigerAction.GUARD), "TigerHunt: Already guarding.");
        require(tigerAccount.tigzStaked*1000 > tigerHP.balanceOf(_msgSender()), "TigerHunt: Not enough TIGZ staked.");
        tigerHP.burnFrom(_msgSender(),tigerHP.balanceOf(_msgSender())*2*huntPct/100);
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
        if (_checkActionTimestamp(tigerAccount, TigerAction.EAT)) _doStandardAction(_msgSender(), TigerAction.EAT);
        if (_checkActionTimestamp(tigerAccount, TigerAction.SLEEP)) _doStandardAction(_msgSender(), TigerAction.SLEEP);
        if (_checkActionTimestamp(tigerAccount, TigerAction.DRINK)) _doStandardAction(_msgSender(), TigerAction.DRINK);
        if (_checkActionTimestamp(tigerAccount, TigerAction.POOP)) _doStandardAction(_msgSender(), TigerAction.POOP);
    }

    function setHuntExempt(address[] calldata _fors) external onlyOwner() {
        for(uint i=0; i<_fors.length; i++) {
            isHuntExempt[_fors[i]] = true;
        }
    }

    function unsetHuntExempt(address[] calldata _fors) external onlyOwner() {
        for(uint i=0; i<_fors.length; i++) {
            isHuntExempt[_fors[i]] = false;
        }
    }

    function setPause(bool _to) external onlyOwner() {
        if(_to) {
            _pause();
        } else {
            _unpause();
        }
    }

    function isHuntWinning(address _for) public view returns (bool) {
        TigerAccount storage tigerAccount = tigerAccounts[_for];
        TigerAccount storage tigerAccountTarget = tigerAccounts[tigerAccount.huntTarget];
        uint rawRoll = uint256(blockhash(tigerAccount.huntBlock));
        if(rawRoll == uint(0)) return false;
        uint targetHP = tigerAccountTarget.tigzStaked/10**24/2;
        uint hunterHP = tigerAccount.tigzStaked/10**24;
        if(hunterHP == 0) return false;
        if(targetHP / hunterHP >= 2) return false;
        uint minRoll = uint256(~uint128(0)) * targetHP / hunterHP;
        return rawRoll >= minRoll;
    }

    function isOnGuard(address _for) public view returns (bool) {
        TigerAccount storage tigerAccount = tigerAccounts[_for];
        return block.timestamp - _getActionTimestamp(tigerAccount, TigerAction.GUARD) <= actionTimes[uint32(TigerAction.GUARD)];
    }

    function _doStandardAction(address _for, TigerAction _action) internal {
        TigerAccount storage tigerAccount = tigerAccounts[_msgSender()];
        require(_checkActionTimestamp(tigerAccount, _action), "TigerHunt: Action not available.");
        _setActionTimestamp(tigerAccount, _action, block.timestamp);
        tigerHP.mint(_for,_getReward(tigerAccount,_action));
    }

    function _getOxzBonusPct(TigerAccount storage _tigerAccount) internal view returns (uint32) {
        uint tigzStaked = _tigerAccount.tigzStaked;
        uint32 bonusPct = 0;
        uint32 i;
        while(i<oxBonusThreshold.length) {
            if(tigzStaked < oxBonusThreshold[i]) return bonusPct;
            bonusPct = oxBonusMultipliersPct[i];
        }
        return oxBonusMultipliersPct[oxBonusMultipliersPct.length - 1];
    }

    function _addOxzBonus(TigerAccount storage _tigerAccount, uint _initial) internal view returns (uint) {
        uint32 bonusPct = _getOxzBonusPct(_tigerAccount);
        if(bonusPct == 0) return _initial;
        return _initial * (100 + bonusPct) / 100;
    }

    function _checkActionTimestamp(TigerAccount storage _tigerAccount, TigerAction _action) internal view returns (bool) {
        return block.timestamp - _getActionTimestamp(_tigerAccount, _action) >= actionTimes[uint32(_action)];
    }

    function _getActionTimestamp(TigerAccount storage _tigerAccount, TigerAction _action) internal view returns (uint256) {
        return uint256(_tigerAccount.actionTimestamps[uint256(_action)]);
    }

    function _setActionTimestamp(TigerAccount storage _tigerAccount, TigerAction _action, uint _to) internal {
        _tigerAccount.actionTimestamps[uint256(_action)] = uint32(_to);
    }

    function _getReward(TigerAccount storage _tigerAccount, TigerAction _action) internal view returns (uint256) {
        return _addOxzBonus(_tigerAccount, _tigerAccount.tigzStaked) * actionMultipliers[uint32(_action)];
    }

}