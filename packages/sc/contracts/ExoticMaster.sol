// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// Credit to Olympus DAO
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Checkpoints.sol";
import "./interfaces/IExoticMaster.sol";
import "./interfaces/IExoticAuction.sol";

contract ExoticMaster is IExoticMaster {
    using Checkpoints for Checkpoints.Checkpoint[];

    uint32 public override roundDuration;
    uint32 public override vestDuration;
    uint16 public override emissionBasis;

    uint32 public firstRoundStartEpoch;

    function getRoundEpochs(uint256 _roundID)
        external
        view
        override
        returns (
            uint32 startEpoch,
            uint32 endEpoch,
            uint32 vestEpoch
        )
    {
        startEpoch = firstRoundStartEpoch + roundDuration * uint32(_roundID);
        endEpoch = startEpoch + roundDuration;
        vestEpoch = endEpoch + vestDuration;
    }

    function getRoundReward(uint256 _roundID)
        external
        view
        override
        returns (uint112)
    {
        //TODO: getroundreward must include voting and checkpoints
        return roundRewards[_roundID];
    }

    function getCurrentRoundID() external view override returns (uint256) {
        require(
            block.timestamp >= firstRoundStartEpoch,
            "ExoticMaster: First round not yet started"
        );
        return (block.timestamp - firstRoundStartEpoch) / roundDuration;
    }
}
