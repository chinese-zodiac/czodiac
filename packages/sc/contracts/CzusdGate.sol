// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IBoostEligible.sol";
import "./interfaces/IBlacklist.sol";

contract CzusdGate is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public czusd = IERC20(0xE68b79e51bf826534Ff37AA9CeE71a3842ee9c70);
    IERC20 public busd = IERC20(0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56);

    IBoostEligible public boostEligibleChecker =
        IBoostEligible(0xD53760b58c3F4ADAbe947E379D19cc28f1246742);
    IBlacklist public blacklistChecker;

    uint256 public feePublicBps = 186;
    uint256 public feeBoostBps = 0;

    int256 public dailyOutLimitPublic = 500 ether;
    int256 public dailyOutLimitBoost = 2500 ether;
    int256 public dailyOutCurrent;
    uint256 public dailyOutResetTimestamp;

    constructor(IBlacklist _blacklistChecker) {
        blacklistChecker = _blacklistChecker;
        dailyOutResetTimestamp = block.timestamp;
    }

    function busdIn(uint256 _wad, address _to) external {
        if (block.timestamp > dailyOutResetTimestamp + 1 days)
            resetDailyOutCurrent();
        if (_wad == 0) return;

        busd.transferFrom(msg.sender, address(this), _wad);
        //Antibot
        if (
            blacklistChecker.isBlacklisted(_to) ||
            blacklistChecker.isBlacklisted(msg.sender)
        ) return;

        uint256 wadPostFee = _wad -
            calculateFee(_wad, boostEligibleChecker.isBoostEligible(_to));

        //Reduce daily out
        dailyOutCurrent -= int256(_wad);

        czusd.transfer(_to, wadPostFee);
    }

    function busdOut(uint256 _wad, address _to) external {
        if (block.timestamp > dailyOutResetTimestamp + 1 days)
            resetDailyOutCurrent();
        if (_wad == 0) return;
        if (_to == address(0x0)) return; //safety

        czusd.transferFrom(msg.sender, address(this), _wad);
        //Antibot
        if (
            blacklistChecker.isBlacklisted(_to) ||
            blacklistChecker.isBlacklisted(msg.sender)
        ) return;

        uint256 wadPostFee = _wad -
            calculateFee(_wad, boostEligibleChecker.isBoostEligible(_to));

        dailyOutCurrent += int256(wadPostFee);

        bool isBoostEligible = boostEligibleChecker.isBoostEligible(_to);
        busd.transfer(_to, wadPostFee);

        require(
            dailyOutCurrent <=
                (isBoostEligible ? dailyOutLimitBoost : dailyOutLimitPublic),
            "CzusdGate: Daily out exceeded"
        );
    }

    function calculateFee(uint256 _inWad, bool _isBoostEligible)
        public
        view
        returns (uint256 _feeWad)
    {
        _feeWad =
            (_inWad * (_isBoostEligible ? feeBoostBps : feePublicBps)) /
            10000;
    }

    function resetDailyOutCurrent() public {
        require(
            block.timestamp > dailyOutResetTimestamp + 1 days,
            "CzusdGate: Not enough time passed"
        );
        dailyOutResetTimestamp = block.timestamp;
        dailyOutCurrent = 0;
    }

    function recoverERC20(address tokenAddress) external onlyOwner {
        IERC20(tokenAddress).safeTransfer(
            _msgSender(),
            IERC20(tokenAddress).balanceOf(address(this))
        );
    }

    function setFeePublicBps(uint256 _to) external onlyOwner {
        feePublicBps = _to;
    }

    function setFeeBoostBps(uint256 _to) external onlyOwner {
        feeBoostBps = _to;
    }

    function setDailyOutLimitBoost(int256 _to) external onlyOwner {
        dailyOutLimitBoost = _to;
    }

    function setDailyOutLimitPublic(int256 _to) external onlyOwner {
        dailyOutLimitPublic = _to;
    }

    function setBoostEligibleChecker(IBoostEligible _to) external onlyOwner {
        boostEligibleChecker = _to;
    }

    function setBlacklistChecker(IBlacklist _to) external onlyOwner {
        blacklistChecker = _to;
    }
}
