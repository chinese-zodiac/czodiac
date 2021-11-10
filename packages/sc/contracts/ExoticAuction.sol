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
        Queue.List emissionDeltaQueue;
        mapping(uint256 => EmissionDelta) queuedEmissionDelta;
        mapping(uint256 => uint112) roundLpWad;
    }
    struct EmissionDelta {
        int112 delta;
        uint32 epoch;
    }
    mapping(address => Account) internal accounts;

    struct Round {
        uint32 startEpoch;
        uint112 lpWad;
        uint112 assetWad;
    }
    Round[] public rounds;

    constructor(
        IExoticMaster _exoticMaster,
        IERC20 _asset,
        IERC20 _lp
    ) {
        exoticMaster = _exoticMaster;
        asset = _asset;
        lp = _lp;
    }

    function update() external {
        update(msg.sender, uint32(block.timestamp));
    }

    function update(address _forAccount, uint32 _toEpoch) public {
        Account storage account = accounts[_forAccount];
        require(
            account.emissionDeltaQueue.sizeOf() > 0,
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

    function startRound(uint112 _assetWad) external {
        require(
            msg.sender == address(exoticMaster),
            "ExoticAuction: Sender must be exotic master."
        );
        require(
            rounds[rounds.length - 1].startEpoch +
                exoticMaster.roundDuration() <
                block.timestamp,
            "ExoticAuction: Previous round not yet complete"
        );
        asset.transferFrom(address(exoticMaster), address(this), _assetWad);
        rounds.push(
            Round({
                startEpoch: uint32(block.timestamp),
                lpWad: 0,
                assetWad: _assetWad
            })
        );
        totalRewardsWad += totalRewardsWad;
    }

    function deposit(address _for, uint112 _wad) external {
        lp.transferFrom(msg.sender, address(this), _wad);
        uint256 roundID = rounds.length - 1;
        Round storage round = rounds[roundID];
        require(
            round.startEpoch + exoticMaster.roundDuration() > block.timestamp,
            "ExoticAuction: Previous round complete"
        );
        accounts[_for].roundLpWad[roundID] += _wad;
    }

    function startVestingAccountForRound(address _forAccount, uint256 _roundID)
        public
    {
        //Cannot start vesting until round is over
        //Must have deposited lp to round
        //Should add both positive and negative to queued emissions with proper epoch
    }

    function getRoundCount() external view returns (uint256 count_) {
        count_ = rounds.length;
    }

    function getRound(uint256 _roundID)
        external
        view
        returns (
            uint32 startEpoch_,
            uint112 lpWad_,
            uint112 assetWad_
        )
    {
        startEpoch_ = rounds[_roundID].startEpoch;
        lpWad_ = rounds[_roundID].lpWad;
        assetWad_ = rounds[_roundID].assetWad;
    }

    function recoverERC20(address tokenAddress) external onlyOwner {
        IERC20(tokenAddress).safeTransfer(
            _msgSender(),
            IERC20(tokenAddress).balanceOf(address(this))
        );
    }
}
