// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// Credit to Alchemix
pragma solidity ^0.8.4;

import "./ZusdBorrow.sol";

contract ZusdBorrowBnb is ZusdBorrow {
    constructor(
        ERC20PresetMinterPauser _zusd,
        IERC20Metadata _WBNB,
        address _usdPriceFeedForBNB
    ) ZusdBorrow(_zusd, _WBNB, _usdPriceFeedForBNB) {}

    //TODO: Add BNB wrap/unwrap
}
