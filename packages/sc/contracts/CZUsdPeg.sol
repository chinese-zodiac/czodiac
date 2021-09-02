// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// Credit to Frax
pragma solidity ^0.8.4;

import "./interfaces/IPairOracle.sol";
import "./interfaces/IAmmPair.sol";
import "./CZFarm.sol";
import "./CZUsd.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CZUsdBorrowCZF is Ownable {
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    //lpAddress for CZUSD/CZF pair
    IAmmPair public czusdCzfPair;
    //CZF token
    CZFarm public czf;
    //CZUSD token
    CZUsd public czusd;
    //BUSD token
    address public busd;
    //CZFarm Oracle
    IPairOracle public czfBusd;
    //CZUsd oracle
    IPairOracle public czfCzusd;
    //Peg lower bound in USD wad.
    uint256 public lowerBoundWad;
    //Peg upper bound in USD wad.
    uint256 public upperBoundWad;

    constructor(
        IAmmPair _czusdCzfPair,
        CZFarm _czf,
        CZUsd _czusd,
        address _busd,
        IPairOracle _czfBusd,
        IPairOracle _czfCzusd,
        uint256 _lowerBoundWad,
        uint256 _upperBoundWad
    ) Ownable() {
        czusdCzfPair = _czusdCzfPair;
        czf = _czf;
        czusd = _czusd;
        busd = _busd;
        czfBusd = _czfBusd;
        czfCzusd = _czfCzusd;
        lowerBoundWad = _lowerBoundWad;
        upperBoundWad = _upperBoundWad;
    }

    //Returns the BUSD to purchase 1 CZUSD from twap in wad.
    function getBusdFor1CZUsdTwap() public view returns (uint256 _wad) {
        uint256 czfFor1CZUSD = czfCzusd.consultTwap(address(czusd), 1 ether);
        return czfBusd.consultTwap(address(czf), czfFor1CZUSD);
    }

    //Returns the BUSD to purchase 1 CZUSD from pair in wad.
    function getBusdFor1CZUsdPair() public view returns (uint256 _wad) {
        uint256 czfFor1CZUSD = czfCzusd.consultPair(address(czusd), 1 ether);
        return czfBusd.consultPair(address(czf), czfFor1CZUSD);
    }

    //Returns the BUSD to purchase 1 CZF from twap in wad.
    function getBusdFor1CZFTwap() public view returns (uint256 _wad) {
        return czfBusd.consultTwap(address(czf), 1 ether);
    }

    //Returns the BUSD to purchase 1 CZF from pair in wad.
    function getBusdFor1CZFPair() public view returns (uint256 _wad) {
        return czfBusd.consultPair(address(czf), 1 ether);
    }

    //Returns the USD value of CZF and CZUSD currently in the CZF/CZUSD liquidity pool.
    function getPairLiquidityValuesPair()
        public
        view
        returns (uint256 _wadBusdForCzusd, uint256 _wadBusdForCzf)
    {
        address token0 = czusdCzfPair.token0();
        address token1 = czusdCzfPair.token1();
        (uint112 reserve0, uint112 reserve1, ) = czusdCzfPair.getReserves();
        if (token0 == address(czusd)) {
            return (
                (uint256(reserve0) * getBusdFor1CZUsdPair()) / 1 ether,
                (uint256(reserve1) * getBusdFor1CZFPair()) / 1 ether
            );
        } else {
            require(token1 == address(czusd), "CZUsdPeg: Wrong pair!");
            return (
                (uint256(reserve0) * getBusdFor1CZFPair()) / 1 ether,
                (uint256(reserve1) * getBusdFor1CZUsdPair()) / 1 ether
            );
        }
    }

    //Rebalances pool, choosing _mintCzfBurnCzusd or _burnCzfMintCZusd based on prices.
    function rebalance() external onlyOwner {
        uint256 busdFor1CzusdPair = getBusdFor1CZUsdPair();
        uint256 busdFor1CzusdTwap = getBusdFor1CZUsdTwap();
        if (
            busdFor1CzusdPair < lowerBoundWad &&
            busdFor1CzusdTwap < lowerBoundWad
        ) {
            _mintCzfBurnCzusd();
        } else if (
            busdFor1CzusdPair > lowerBoundWad &&
            busdFor1CzusdTwap > lowerBoundWad
        ) {
            _mintCzusdBurnCzf();
        }
    }

    //Mints CZF and burns CZUSD usd to balance pool in an economically neutral fashion.
    function _mintCzfBurnCzusd() internal {
        (
            uint256 _wadBusdForCzusd,
            uint256 _wadBusdForCzf
        ) = getPairLiquidityValuesPair();
        uint256 usdWad = ((_wadBusdForCzusd - _wadBusdForCzf) * 999) / 2000;
        uint256 czfToMint = (usdWad * 1 ether) / getBusdFor1CZFPair();
        uint256 czusdToBurn = (usdWad * 1 ether) / getBusdFor1CZUsdPair();
        czf.mint(address(czusdCzfPair), czfToMint);
        czusd.burnFrom(address(czusdCzfPair), czusdToBurn);
        czusdCzfPair.sync();
    }

    //Burns CZF and mints CZUSD to balance pool in an economically neutral fashion.
    function _mintCzusdBurnCzf() internal {
        (
            uint256 _wadBusdForCzusd,
            uint256 _wadBusdForCzf
        ) = getPairLiquidityValuesPair();
        uint256 usdWad = ((_wadBusdForCzusd - _wadBusdForCzf) * 99) / 200;
        uint256 czfToBurn = (usdWad * 1 ether) / getBusdFor1CZFPair();
        uint256 czusdToMint = (usdWad * 1 ether) / getBusdFor1CZUsdPair();
        czf.burnFrom(address(czusdCzfPair), czfToBurn);
        czusd.mint(address(czusdCzfPair), czusdToMint);
        czusdCzfPair.sync();
    }
}
