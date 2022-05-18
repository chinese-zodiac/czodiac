// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// Credit to Roger Wu (modified by Plastic Digits)
contract CZusdHolder is Ownable {
    using SafeERC20 for IERC20;
    address public immutable CZUSD =
        address(0xE68b79e51bf826534Ff37AA9CeE71a3842ee9c70); //CZUSD

    constructor() onlyOwner() {}

    function fetchCZUSD() external onlyOwner {
        IERC20(CZUSD).transfer(owner(), IERC20(CZUSD).balanceOf(address(this)));
    }
}
