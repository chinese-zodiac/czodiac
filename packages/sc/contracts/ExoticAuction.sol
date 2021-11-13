// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// Credit to Olympus DAO
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
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
    mapping(uint256 => uint112) public roundLpWad;

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
        claimForTo(msg.sender, uint32(block.timestamp));
    }

    function claimForTo(address _account, uint32 _epoch) public {
        Account storage account = accounts[_account];
        require(
            _epoch <= block.timestamp,
            "ExoticAuction: Cannot update account past current timestamp"
        );
        uint32 accountUpdateEpoch = account.updateEpoch;
        uint112 wadToClaim = 0;
        while (accountUpdateEpoch < _epoch) {
            EmissionDelta storage emissionIncrease = account
                .queuedEmissionIncrease[
                    account.emissionIncreaseQueue.getFirstEntry()
                ];
            EmissionDelta storage emissionDecrease = account
                .queuedEmissionIncrease[
                    account.emissionIncreaseQueue.getFirstEntry()
                ];
            bool isIncrease;
            EmissionDelta storage emissionDelta;
            if (emissionIncrease.epoch < emissionDecrease.epoch) {
                isIncrease = true;
                emissionDelta = emissionIncrease;
            } else {
                isIncrease = false;
                emissionDelta = emissionDecrease;
            }
            if (emissionDelta.epoch < _epoch) {
                //Get wad to claim at old emission rate.
                wadToClaim +=
                    (accountUpdateEpoch - emissionDelta.epoch) *
                    account.emissionRate;
                //Change emission rate.
                accountUpdateEpoch = emissionDelta.epoch;
                uint256 roundID = uint256(emissionDelta.roundID);
                uint112 totalRoundRewardsWad = (exoticMaster.getRoundReward( //TODO: getroundreward must include voting
                    roundID
                ) * roundLpWad[roundID]) / account.roundLpWad[roundID];
                uint112 emissionRateDelta = totalRewardsWad /
                    exoticMaster.vestDuration();
                if (isIncrease) {
                    account.totalRewardsWad += totalRoundRewardsWad;
                    account.emissionRate += emissionRateDelta;
                    delete account.queuedEmissionIncrease[
                        account.emissionIncreaseQueue.dequeue()
                    ];
                } else {
                    account.emissionRate -= emissionRateDelta;
                    delete account.queuedEmissionDecrease[
                        account.emissionDecreaseQueue.dequeue()
                    ];
                }
            } else {
                wadToClaim +=
                    (_epoch - accountUpdateEpoch) *
                    account.emissionRate;
                accountUpdateEpoch = _epoch;
            }
        }
        account.totalClaimedWad += wadToClaim;
        account.updateEpoch = accountUpdateEpoch;
        totalClaimedWad += wadToClaim;
        asset.transfer(_account, wadToClaim);
    }

    function depositAll() external {
        depositForWad(msg.sender, uint112(lp.balanceOf(msg.sender)));
    }

    function depositForWad(address _for, uint112 _wad) public {
        Account storage account = accounts[_for];
        //TODO: Update exotic master if it's the first deposit.
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
            require(
                account.emissionIncreaseQueue.getLastEntry() <=
                    uint32(endEpoch),
                "ExoticAuction: Cannot enqueue increase epoch before last epoch"
            );
            require(
                account.emissionDecreaseQueue.getLastEntry() <=
                    uint32(vestEpoch),
                "ExoticAuction: Cannot enqueue decrease epoch before last epoch"
            );
            account.queuedEmissionIncrease[
                account.emissionIncreaseQueue.enqueue()
            ] = EmissionDelta({
                roundID: uint224(roundID),
                epoch: uint32(endEpoch)
            });
            account.queuedEmissionDecrease[
                account.emissionDecreaseQueue.enqueue()
            ] = EmissionDelta({
                roundID: uint224(roundID),
                epoch: uint32(vestEpoch)
            });
        }
        account.roundLpWad[roundID] += _wad;
    }

    function recoverERC20(address tokenAddress) external onlyOwner {
        IERC20(tokenAddress).safeTransfer(
            _msgSender(),
            IERC20(tokenAddress).balanceOf(address(this))
        );
    }

    function setGlobals(
        IExoticMaster _exoticMaster,
        IERC20 _asset,
        IERC20 _lp
    ) external onlyOwner {
        exoticMaster = _exoticMaster;
        asset = _asset;
        lp = _lp;
    }
}
