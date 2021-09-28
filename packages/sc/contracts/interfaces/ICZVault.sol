// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ICZVault is IERC20 {
    function asset() external returns (IERC20 _asset);

    function deposit(address _for, uint256 _wad) external;

    function withdraw(address _to, uint256 _wad) external;
}
