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
        IPairOracle _czfBusd,
        IPairOracle _czfCzusd,
        uint256 _lowerBoundWad,
        uint256 _upperBoundWad
    ) Ownable() {
        czusdCzfPair = _czusdCzfPair;
        czf = _czf;
        czusd = _czusd;
        czfBusd = _czfBusd;
        czfCzusd = _czfCzusd;
        lowerBoundWad = _lowerBoundWad;
        upperBoundWad = _upperBoundWad;
    }

    //Returns the current czusd price in wad.
    function getCzusdPrice() public returns (uint256 _wad);

    //Rebalances pool, choosing _mintCzfBurnCzusd or _burnCzfMintCZusd based on prices.
    function rebalance() external onlyOwner;

    //Mints CZF and burns CZUSD usd wad amount.
    //Only possible below the lowerBoundWad.
    //Must not push the current CZUSD price above 1.0.
    function mintCzfBurnCzusd(uint256 _wad) external onlyOwner;

    //Burns CZF and mints CZUSD usd wad amount.
    //Only possible above the upperBoundWad.
    //Must not push the current CZUSD price below 1.0.
    function mintCzfBurnCzusd(uint256 _wad) external onlyOwner;
    //Additional onlyOwner methods for setting variables:
    //setLowerBoundWad, setUpperBoundWad.
}
