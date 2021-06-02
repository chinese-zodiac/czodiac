// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";

contract CZFarm is Context, ERC20PresetMinterPauser, Ownable {
    constructor() ERC20PresetMinterPauser("CZFarm", "CZF") Ownable() {}
}
