// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// Credit to Olympus DAO
pragma solidity ^0.8.0;

import "./interfaces/IExoticMaster.sol";

contract ExoticMaster is IExoticMaster {
    uint32 public roundDuration;
    uint32 public vestDuration;
    uint16 public emissionBasis;

    uint32 public firstRoundStartEpoch;

    mapping(uint256 => uint256) roundRewards;

    function getRoundEpochs(uint256 _roundID)
        external
        view
        returns (
            uint32 startEpoch,
            uint32 endEpoch,
            uint32 vestEpoch
        )
    {
        startEpoch = firstRoundStartEpoch + roundDuration * _roundID;
        endEpoch = startEpoch + roundDuration;
        vestEpoch = endEpoch + vestDuration;
    }

    function getRoundReward(uint256 _roundID) external view returns (uint112) {
        //TODO: getroundreward must include voting
        return roundRewards[_roundID];
    }

    function getCurrentRoundID() external view returns (uint256) {
        require(
            block.timestamp >= firstRoundStartEpoch,
            "ExoticMaster: First round not yet started"
        );
        return (block.timestamp - firstRoundStartEpoch) / roundDuration;
    }
}
