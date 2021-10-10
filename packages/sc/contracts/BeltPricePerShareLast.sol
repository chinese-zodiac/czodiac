// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.4;
import "./interfaces/IBeltMultiStrategyToken.sol";

contract BeltPriceShareLast {
    mapping(IBeltMultiStrategyToken => uint256) public pricePerFullShareLast;
    mapping(IBeltMultiStrategyToken => uint256) public updateTimeLast;
    mapping(IBeltMultiStrategyToken => uint256) public pricePerFullShareRecent;
    mapping(IBeltMultiStrategyToken => uint256) public updateTimeRecent;
    uint256 public delaySeconds;

    constructor(uint256 _delaySeconds) {
        delaySeconds = _delaySeconds;
    }

    function start(IBeltMultiStrategyToken _strategyToken) external {
        require(
            updateTimeLast[_strategyToken] == 0,
            "BeltPriceShareLast: Token already started"
        );
        pricePerFullShareLast[_strategyToken] = _strategyToken
            .getPricePerFullShare();
        updateTimeLast[_strategyToken] = block.timestamp;
        pricePerFullShareRecent[_strategyToken] = _strategyToken
            .getPricePerFullShare();
        updateTimeRecent[_strategyToken] = block.timestamp;
    }

    function update(IBeltMultiStrategyToken _strategyToken) external {
        if (block.timestamp < updateTimeRecent[_strategyToken] + delaySeconds)
            return;
        updateTimeLast[_strategyToken] = updateTimeRecent[_strategyToken];
        pricePerFullShareLast[_strategyToken] = pricePerFullShareRecent[
            _strategyToken
        ];
        updateTimeRecent[_strategyToken] = block.timestamp;
        pricePerFullShareRecent[_strategyToken] = _strategyToken
            .getPricePerFullShare();
    }
}
