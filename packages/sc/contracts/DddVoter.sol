// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// Set as owner of LSDT to fix upkeeps
pragma solidity ^0.8.4;

import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IDotDotTokenLocker.sol";
import "./interfaces/IDotDotIncentives.sol";
import "./interfaces/IDotDotVoting.sol";
import "./interfaces/IAmmRouter02.sol";
import "./interfaces/IDotDot.sol";
import "./interfaces/IDepxFeeDistributor.sol";

contract DddVoter is KeeperCompatibleInterface, Ownable {
    using SafeERC20 for IERC20;

    IERC20 public czusdval3ps =
        IERC20(0x4A96801f76DdfC182290105AeEb3E4719ff9A380);
    IERC20 public ddd = IERC20(0x84c97300a190676a19D1E13115629A11f8482Bd1);
    IERC20 public depx = IERC20(0x772F317ec695ce20290b56466b3f48501ba81352);
    IDotDotTokenLocker public dddTokenLocker =
        IDotDotTokenLocker(0x51133C54b7bb6CC89DaC86B73c75B1bf98070e0d);
    IDotDotIncentives public dddIncentives =
        IDotDotIncentives(0x4625928fCb2Ece1Aca3dd2B992f7e2e4d9596446);
    IDotDotVoting public dddVoting =
        IDotDotVoting(0x5e4b853944f54C8Cb568b25d269Cd297B8cEE36d);

    bool public isLockingPaused = false;

    function checkUpkeep(bytes calldata)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        upkeepNeeded =
            !isLockingPaused &&
            dddVoting.availableVotes(address(this)) > 0;
    }

    function performUpkeep(bytes calldata performData) external override {
        voteDdd();
    }

    function voteDdd() public {
        require(!isLockingPaused, "lockingPaused");
        uint256 availableVotes = dddVoting.availableVotes(address(this));
        if (availableVotes > 0) {
            address[] memory tokens = new address[](1);
            uint256[] memory votes = new uint256[](1);
            tokens[0] = address(czusdval3ps);
            votes[0] = availableVotes;
            dddVoting.vote(tokens, votes);
        }
    }

    function lockDdd(uint256 _wad) public {
        require(!isLockingPaused, "lockingPaused");
        if (_wad > 0) {
            ddd.transferFrom(msg.sender, address(this), _wad);
        }
        ddd.approve(address(dddTokenLocker), ddd.balanceOf(address(this)));
        dddTokenLocker.lock(address(this), ddd.balanceOf(address(this)), 16);
    }

    function claimRewards() public {
        address[] memory tokens = new address[](1);
        tokens[0] = address(depx);
        dddIncentives.claim(address(this), address(czusdval3ps), tokens);
    }

    function extendLockDdd() public {
        require(!isLockingPaused, "lockingPaused");
        uint256[2][] memory lockData = dddTokenLocker.getActiveUserLocks(
            address(this)
        );
        for (uint256 i; i < lockData.length; i++) {
            dddTokenLocker.extendLock(lockData[i][1], lockData[i][0], 16);
        }
    }

    function setIsLockingPaused(bool _to) public onlyOwner {
        isLockingPaused = true;
    }

    function executeOn(bytes memory _abiSignatureEncoded, address _on)
        external
        onlyOwner
    {
        (bool success, bytes memory returndata) = _on.call(
            _abiSignatureEncoded
        );
    }

    function recoverERC20(address tokenAddress) external onlyOwner {
        IERC20(tokenAddress).safeTransfer(
            msg.sender,
            IERC20(tokenAddress).balanceOf(address(this))
        );
    }
}
