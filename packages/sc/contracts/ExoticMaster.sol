// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// Credit to Olympus DAO
pragma solidity ^0.8.0;

import "./interfaces/IExoticMaster.sol";

contract ExoticMaster is IExoticMaster {
    uint32 public roundDuration;
    uint32 public vestDuration;
    uint16 public emissionBasis;

    function getRoundEpochs(uint256 _roundID)
        external
        view
        virtual
        returns (
            uint32 startEpoch,
            uint32 endEpoch,
            uint32 vestEpoch
        );

    function getRoundReward(uint256 _roundID)
        external
        view
        virtual
        returns (uint112);

    function getCurrentRoundID() external view virtual returns (uint256);
}
