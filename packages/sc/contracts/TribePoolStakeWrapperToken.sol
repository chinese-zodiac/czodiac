// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits

/*
CZUSD consists of three core smart contracts: 
CZUsd for the BEP20 stablecoin; 
CZUsdBorrow for depositing collateral, minting new CZUSD against that collateral, 
and repaying CZUSD to release collateral; 
and CZUsdStablization which mints/burns CZUSD and CZF from the CZUSD/CZF pool 
in an economically neutral way to maintain the CZUSD peg within set bounds.
Additionally CZUSD integrates with several peripheral contracts; 
CZF, the equity token for the algorithmic stabilization; 
IERC20 collalteral tokens, 
and Pancakeswap TWAP oracles for determining both CZUSD and collateral prices.
*/
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Wrapper.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./TribePool.sol";

contract TribePoolStakeWrapperToken is Context, ERC20Wrapper, Ownable {
    using SafeERC20 for IERC20;

    TribePool public pool;

    constructor(
        string memory _name,
        string memory _symbol,
        address _underlying,
        address _pool
    ) ERC20(_name, _symbol) ERC20Wrapper(IERC20(_underlying)) {}

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);
        pool.withdraw(from, amount);
        pool.deposit(to, amount);
    }
}
