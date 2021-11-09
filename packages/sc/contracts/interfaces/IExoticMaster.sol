// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.4;

interface IExoticMaster {
    function startRound() external;

    function setVoteWeights(uint16[] calldata _weights) external;

    function updateVotePower() external;

    function roundDuration() external view returns (uint32);

    function vestDuration() external view returns (uint32);

    function emissionBasis() external view returns (uint16);
}
