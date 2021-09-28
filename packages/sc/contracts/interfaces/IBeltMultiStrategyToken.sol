// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// Credit to Belt
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IBeltMultiStrategyToken is IERC20 {
    function token() external returns (address);

    function deposit(uint256 _amount, uint256 _minShares) external;

    function depositBNB(uint256 _minShares) external payable;

    function withdraw(uint256 _shares, uint256 _minAmount) external;

    function withdrawBNB(uint256 _shares, uint256 _minAmount) external;
}
