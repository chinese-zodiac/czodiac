// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// Credit to Olympus DAO
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./CZFarm.sol";
import "./StimFarm.sol";

contract StimFarmFactory is Ownable {
    CZFarm public czf;

    event NewStimFarm(address indexed stimFarm);

    constructor(CZFarm _czf) Ownable() {
        czf = _czf;
    }

    function deployStimFarm(
        IERC20 _asset,
        uint256 _czfPerAsset,
        uint256 _openEpoch,
        uint256 _closeEpoch,
        uint256 _vestEpoch
    ) public onlyOwner {
        bytes memory bytecode = type(StimFarm).creationCode;
        bytes32 salt = keccak256(
            abi.encodePacked(_asset, _czfPerAsset, block.timestamp)
        );
        address stimFarm;

        assembly {
            stimFarm := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }

        StimFarm(stimFarm).initialize(
            czf,
            _asset,
            _czfPerAsset,
            _openEpoch,
            _closeEpoch,
            _vestEpoch,
            owner()
        );

        czf.grantRole(keccak256("MINTER_ROLE"), stimFarm);

        emit NewStimFarm(address(stimFarm));
    }

    function deployStimFarmCzfStandard(
        IERC20 _asset,
        uint256 _czfPerAsset,
        uint256 _openEpoch
    ) public onlyOwner {
        deployStimFarm(
            _asset,
            _czfPerAsset,
            _openEpoch,
            _openEpoch + 1 days,
            _openEpoch + 8 days
        );
    }

    function deployStimFarmCzfLpHelper(
        IERC20 _asset,
        uint256 _weeklyInterestBasisPoints,
        uint256 _daysUntilOpen,
        uint256 _hoursUntilOpen
    ) public onlyOwner {
        deployStimFarmCzfStandard(
            _asset,
            (_asset.balanceOf(address(czf)) *
                (_weeklyInterestBasisPoints + 10000)) / 10000,
            block.timestamp +
                (_daysUntilOpen * 1 days) +
                (_hoursUntilOpen * 1 hours)
        );
    }
}
