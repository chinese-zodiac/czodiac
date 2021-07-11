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
    ERC20PresetMinterPauser public tigerHP;

    enum TigerAction {DRINK, EAT, POOP, SLEEP, HUNT, GUARD, STAKE}
    struct TigerAccount {
        uint32[7] actionTimestamps;
        uint totalTigzStaked;
        uint huntBlock;
        address huntTarget;
    }
    mapping(address => TigerAccount) public tigerAccounts;

    mapping(address => bool) public isHuntExempt;

    uint32[7] public actionTimes = [
        3 hours,
        7 hours,
        8 hours,
        24 hours,
        5 hours,
        12 hours,
        24 hours
    ];

    uint32[4] public actionMultipliers = [
        2,
        7,
        3,
        45
    ];

    uint public huntPct = 5;
    uint public huntBlocks = 10;

    constructor(IERC20 _tigz, ERC20PresetMinterPauser _tigerHP) Ownable() { }

    function stake(uint _wad) external {
        TigerAccount storage tigerAccount = tigerAccounts[_msgSender()];
        require(_checkActionTimestamp(tigerAccount, TigerAction.STAKE), "TigerHunt: Recently staked or unstaked.");
        _setActionTimestamp(tigerAccount, TigerAction.STAKE, block.timestamp);
        tigerAccount.totalTigzStaked += _wad;
        tigz.safeTransferFrom(_msgSender(), address(this), _wad);
    }

    function unstake(uint _wad) external {
        TigerAccount storage tigerAccount = tigerAccounts[_msgSender()];
        require(_checkActionTimestamp(tigerAccount, TigerAction.STAKE), "TigerHunt: Recently staked or unstaked.");
        _setActionTimestamp(tigerAccount, TigerAction.STAKE, block.timestamp);
        tigerAccount.totalTigzStaked -= _wad;
        tigz.safeTransfer(_msgSender(), _wad);
    }

    function tryHunt(address target) external whenNotPaused {
        TigerAccount storage tigerAccount = tigerAccounts[_msgSender()];
        require(!isHuntExempt[target], "TigerHunt: Target hunt exempt");
        require(!isOnGuard(target), "TigerHunt: Target is on guard");
        require(tigerAccount.totalTigzStaked*1000 > tigerHP.balanceOf(_msgSender()), "TigerHunt: Not enough TIGZ staked.");
        require(tigerHP.balanceOf(_msgSender()) > 0, "TigerHunt: Sender 0 tigerHP");
        require(tigerHP.balanceOf(target) > 0, "TigerHunt: Target 0 tigerHP");
        require(_checkActionTimestamp(tigerAccount, TigerAction.HUNT), "TigerHunt: Recently hunted.");
        _setActionTimestamp(tigerAccount, TigerAction.HUNT, block.timestamp);
        tigerAccount.huntBlock = block.number + 1;
        tigerAccount.huntTarget = target;
    } 

    function winHunt() external whenNotPaused {
        TigerAccount storage tigerAccount = tigerAccounts[_msgSender()];
        require(isHuntWinning(_msgSender()),"TigerHunt: Hunt not winning.");
        address target = tigerAccount.huntTarget;
        uint amount = tigerHP.balanceOf(target) * 100 / huntPct;
        tigerHP.burnFrom(target,amount);
        tigerHP.transferFrom(target,_msgSender(),amount);
        tigerAccount.huntBlock = 0;
        tigerAccount.huntTarget = address(0);
    }

    function guard() external whenNotPaused {
        TigerAccount storage tigerAccount = tigerAccounts[_msgSender()];
        require(_checkActionTimestamp(tigerAccount, TigerAction.GUARD), "TigerHunt: Already guarding.");
        require(tigerAccount.totalTigzStaked*1000 > tigerHP.balanceOf(_msgSender()), "TigerHunt: Not enough TIGZ staked.");
        tigerHP.burnFrom(_msgSender(),tigerHP.balanceOf(_msgSender())*2*huntPct/100);
        _setActionTimestamp(tigerAccount, TigerAction.GUARD, block.timestamp);
    }

    //TODO: implemention eat, sleep, drink
    function eat() external whenNotPaused {
        TigerAccount storage tigerAccount = tigerAccounts[_msgSender()];
        require(_checkActionTimestamp(tigerAccount, TigerAction.EAT), "TigerHunt: Not hungry.");
        _setActionTimestamp(tigerAccount, TigerAction.EAT, block.timestamp);
    }
    function sleep() external whenNotPaused {
        TigerAccount storage tigerAccount = tigerAccounts[_msgSender()];
        require(_checkActionTimestamp(tigerAccount, TigerAction.SLEEP), "TigerHunt: Not tired.");
        _setActionTimestamp(tigerAccount, TigerAction.SLEEP, block.timestamp);
    }
    function drink() external whenNotPaused {
        TigerAccount storage tigerAccount = tigerAccounts[_msgSender()];
        require(_checkActionTimestamp(tigerAccount, TigerAction.DRINK), "TigerHunt: Not thirsty.");
        _setActionTimestamp(tigerAccount, TigerAction.DRINK, block.timestamp);
    }
    function poop() external whenNotPaused {
        TigerAccount storage tigerAccount = tigerAccounts[_msgSender()];
        require(_checkActionTimestamp(tigerAccount, TigerAction.POOP), "TigerHunt: Not thirsty.");
        _setActionTimestamp(tigerAccount, TigerAction.POOP, block.timestamp);
    }
    function doEatSleepDrinkPoop() external whenNotPaused {
        TigerAccount storage tigerAccount = tigerAccounts[_msgSender()];
        uint32[7] memory actionTimestamps = tigerAccount.actionTimestamps;
        if (_checkActionTimestamp(tigerAccount, TigerAction.EAT)) actionTimestamps[uint(TigerAction.EAT)] = uint32(block.timestamp);
        if (_checkActionTimestamp(tigerAccount, TigerAction.SLEEP)) actionTimestamps[uint(TigerAction.SLEEP)] = uint32(block.timestamp);
        if (_checkActionTimestamp(tigerAccount, TigerAction.DRINK)) actionTimestamps[uint(TigerAction.DRINK)] = uint32(block.timestamp);
        if (_checkActionTimestamp(tigerAccount, TigerAction.POOP)) actionTimestamps[uint(TigerAction.POOP)] = uint32(block.timestamp);
        tigerAccount.actionTimestamps = actionTimestamps;
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
        uint rawRoll = uint256(blockhash(tigerAccount.huntBlock));
        if(rawRoll == uint(0)) return false;
        uint targetHP = tigerHP.balanceOf(tigerAccount.huntTarget)/10**24/2;
        uint hunterHP = tigerHP.balanceOf(tigerAccount.huntTarget)/10**24;
        if(hunterHP == 0) return false;
        if(targetHP == 0) return false;
        if(targetHP / hunterHP >= 2) return false;
        uint minRoll = uint256(~uint128(0)) * targetHP / hunterHP;
        return rawRoll >= minRoll;
    }

    function isOnGuard(address _for) public view returns (bool) {
        TigerAccount storage tigerAccount = tigerAccounts[_for];
        return block.timestamp - _getActionTimestamp(tigerAccount, TigerAction.GUARD) <= actionTimes[uint32(TigerAction.GUARD)];
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

}