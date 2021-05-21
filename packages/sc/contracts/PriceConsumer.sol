// Authored by Plastic Digits
pragma solidity ^0.8.4;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol"; // SPDX-License-Identifier: GPL-3.0

contract PriceConsumer {
    AggregatorV3Interface internal priceFeed;

    constructor(address _priceFeedAggregator) {
        priceFeed = AggregatorV3Interface(_priceFeedAggregator);
    }

    /**
     * Returns the latest price
     */
    function getPrice() public view returns (uint256) {
        (
            ,
            //roundID
            int256 price, //startedAt //timeStamp
            ,
            ,

        ) =
            //answeredInRound
            priceFeed.latestRoundData();
        require(price > 0, "PriceConsumer: Negative Price.");
        return uint256(price);
    }

    /**
     * Returns the latest price
     */
    function getDecimals() public view returns (uint8) {
        return priceFeed.decimals();
    }
}
