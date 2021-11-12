// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// Credit to Olympus DAO
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./libs/Queue.sol";
import "./interfaces/IExoticMaster.sol";
import "./CZFarm.sol";

contract ExoticAuction is Ownable {
    using SafeERC20 for IERC20;
    using Queue for Queue.List;

    IExoticMaster public exoticMaster;
    IERC20 public asset;
    IERC20 public lp;

    uint112 public totalRewardsWad;
    uint112 public totalClaimedWad;

    struct Account {
        uint112 totalRewardsWad;
        uint112 totalClaimedWad;
        uint32 updateEpoch;
        uint112 emissionRate;
        Queue.List emissionIncreaseQueue;
        Queue.List emissionDecreaseQueue;
        mapping(uint256 => EmissionDelta) queuedEmissionIncrease;
        mapping(uint256 => EmissionDelta) queuedEmissionDecrease;
        mapping(uint256 => uint112) roundLpWad;
    }
    struct EmissionDelta {
        uint224 roundID;
        uint32 epoch;
    }
    mapping(address => Account) internal accounts;
    mapping(uint256 => uint256) public roundLpWad;

    constructor(
        IExoticMaster _exoticMaster,
        IERC20 _asset,
        IERC20 _lp
    ) {
        exoticMaster = _exoticMaster;
        asset = _asset;
        lp = _lp;
    }

    function claim() external {
        claim(msg.sender, uint32(block.timestamp));
    }

    function claimForTo(address _account, uint32 _epoch) public {
        Account storage account = accounts[_account];
        require(
            account.queuedEmissionIncrease.sizeOf() > 0,
            "ExoticAuction: No emissions queued"
        );
        require(
            _toEpoch <= block.timestamp,
            "ExoticAuction: Cannot update account past current timestamp"
        );
        uint32 accountUpdateEpoch = account.updateEpoch;
        uint112 wadToClaim = 0;
        while (accountUpdateEpoch < _toEpoch) {
            EmissionDelta storage emissionUpdate = account.queuedEmissionDelta[
                account.emissionDeltaQueue.getFirstEntry()
            ];
            if (emissionUpdate.epoch < _toEpoch) {
                accountUpdateEpoch = emissionUpdate.epoch;
                wadToClaim +=
                    (accountUpdateEpoch - emissionUpdate.epoch) *
                    account.emissionRate;
                account.emissionRate = uint112(
                    int112(account.emissionRate) + emissionUpdate.delta
                );
                delete account.queuedEmissionDelta[
                    account.emissionDeltaQueue.dequeue()
                ];
            } else {
                wadToClaim +=
                    (_toEpoch - accountUpdateEpoch) *
                    account.emissionRate;
                accountUpdateEpoch = _toEpoch;
            }
        }
        account.totalClaimedWad += wadToClaim;
        account.updateEpoch = accountUpdateEpoch;
        totalClaimedWad += wadToClaim;
        asset.transfer(_forAccount, wadToClaim);
    }

    function deposit(address _for, uint112 _wad) external {
        Account storage account = accounts[_for];
        lp.transferFrom(msg.sender, address(this), _wad);
        uint256 roundID = exoticMaster.getCurrentRoundID();
        (uint256 startEpoch, uint256 endEpoch, uint256 vestEpoch) = exoticMaster
            .getRoundEpochs(roundID);
        require(
            endEpoch > block.timestamp,
            "ExoticAuction: Previous round complete."
        );
        require(
            startEpoch < block.timestamp,
            "ExoticAuction: Round not yet started."
        );
        if (account.roundLpWad[roundID] == 0) {
            //First deposit into round
            account.queuedEmissionIncrease[
                account.emissionIncreaseQueue.queue()
            ] = EmissionDelta({roundID: roundID, epoch: endEpoch});
            account.queuedEmissionDecrease[
                account.emissionDecreaseQueue.queue()
            ] = EmissionDelta({roundID: roundID, epoch: vestEpoch});
        }
        account.roundLpWad[roundID] += _wad;
    }

    function recoverERC20(address tokenAddress) external onlyOwner {
        IERC20(tokenAddress).safeTransfer(
            _msgSender(),
            IERC20(tokenAddress).balanceOf(address(this))
        );
    }
}
