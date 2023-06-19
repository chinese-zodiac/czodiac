// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./CZUsd.sol";

contract CzusdGateV2 is Ownable {
    using SafeERC20 for IERC20;

    CZUsd public czusd = CZUsd(0xE68b79e51bf826534Ff37AA9CeE71a3842ee9c70);
    IERC20 public usdt = IERC20(0x55d398326f99059fF775485246999027B3197955);

    uint256 public sellFeeBasis = 3000;

    constructor() {}

    function usdtIn(uint256 _wad, address _to) external {
        usdt.safeTransferFrom(msg.sender, address(this), _wad);

        czusd.mint(_to, _wad);
    }

    function usdtOut(uint256 _wad, address _to) external {
        czusd.transferFrom(msg.sender, address(this), _wad);

        uint256 fee = (_wad * sellFeeBasis) / 10000;

        usdt.transfer(_to, _wad - fee);
    }

    function recoverERC20(address tokenAddress, uint256 _wad)
        external
        onlyOwner
    {
        IERC20(tokenAddress).safeTransfer(_msgSender(), _wad);
    }

    function setSellFeeBasis(uint256 _to) external onlyOwner {
        sellFeeBasis = _to;
    }
}
