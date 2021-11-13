// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.4;

import "./interfaces/IExoticMaster.sol";

interface IExoticMaster {
    function roundDuration() external view returns (uint32);

    function vestDuration() external view returns (uint32);

    function emissionBasis() external view returns (uint16);

    function getRoundEpochs(uint256 _roundID)
        external
        view
        returns (
            uint32 startEpoch,
            uint32 endEpoch,
            uint32 vestEpoch
        );

    function getRoundReward(uint256 _roundID) external view returns (uint112);

    function getCurrentRoundID() external view returns (uint256);
}
