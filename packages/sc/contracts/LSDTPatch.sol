// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// Set as owner of LSDT to fix upkeeps
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";
import "./LSDT.sol";

contract LSDTPatch is KeeperCompatibleInterface, Ownable {
    LSDT public lsdt;

    constructor(LSDT _lsdt) {
        lsdt = _lsdt;
    }

    function transferLsdtOwnership(address _to) external onlyOwner {
        lsdt.transferOwnership(_to);
    }

    // For mint only, no checkData
    function checkUpkeep(bytes calldata)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory)
    {
        (upkeepNeeded, ) = lsdt.checkUpkeep(abi.encodePacked(uint256(1)));
    }

    // For mint only, no performData
    function performUpkeep(bytes calldata) external override {
        lsdt.performUpkeep(abi.encodePacked(uint256(1)));
    }
}
