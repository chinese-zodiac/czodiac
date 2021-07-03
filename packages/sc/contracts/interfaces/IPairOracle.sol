// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// Credit to Iron Finance
pragma solidity ^0.8.4;

interface IPairOracle {
    function consultTwap(address token, uint256 amountIn) external view returns (uint256 amountOut);
    function consultPair(address token, uint256 amountIn) external view returns (uint256 amountOut);

    function update() external;
}