// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// Credit to Alchemix
pragma solidity ^0.8.4;

import "./CZUsdBorrow.sol";

contract CZUsdBorrowBnb is CZUsdBorrow {
    constructor(
        ERC20PresetMinterPauser _czusd,
        IERC20Metadata _WBNB,
        address _usdPriceFeedForBNB
    ) CZUsdBorrow(_czusd, _WBNB, _usdPriceFeedForBNB) {}

    //TODO: Add BNB wrap/unwrap
}
