// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// Credit to Iron Finance
pragma solidity ^0.8.4;

import "../libs/FixedPoint.sol";
import "../libs/UQ112x112.sol";
import "../libs/AmmLibrary.sol";
import "../interfaces/IPairOracle.sol";
import "../interfaces/IValueLiquidPair.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PairOracle is Ownable, IPairOracle {
    using FixedPoint for *;

    uint256 public PERIOD = 3600; // 1 hour TWAP (time-weighted average price)

    IValueLiquidPair public immutable pair;
    address public immutable token0;
    address public immutable token1;

    uint256 public price0CumulativeLast;
    uint256 public price1CumulativeLast;
    uint32 public blockTimestampLast;
    FixedPoint.uq112x112 public price0Average;
    FixedPoint.uq112x112 public price1Average;

    constructor(address pairAddress) {
        IValueLiquidPair _pair = IValueLiquidPair(pairAddress);
        pair = _pair;
        token0 = _pair.token0();
        token1 = _pair.token1();
        price0CumulativeLast = _pair.price0CumulativeLast(); // Fetch the current accumulated price value (1 / 0)
        price1CumulativeLast = _pair.price1CumulativeLast(); // Fetch the current accumulated price value (0 / 1)
        uint112 reserve0;
        uint112 reserve1;
        (reserve0, reserve1, blockTimestampLast) = _pair.getReserves();
        require(reserve0 != 0 && reserve1 != 0, "PairOracle: NO_RESERVES"); // Ensure that there's liquidity in the pair
    }

    function setPeriod(uint256 _period) external onlyOwner {
        PERIOD = _period;
    }

    function update() external override {
        (
            uint256 price0Cumulative,
            uint256 price1Cumulative,
            uint32 blockTimestamp
        ) = currentCumulativePrices(address(pair));
        unchecked {
            uint32 timeElapsed = blockTimestamp - blockTimestampLast; // Overflow is desired

            // Ensure that at least one full period has passed since the last update
            if (timeElapsed < PERIOD && price0Average.decode() != 0) return;

            // Overflow is desired, casting never truncates
            // Cumulative price is in (uq112x112 price * seconds) units so we simply wrap it after division by time elapsed
            price0Average = FixedPoint.uq112x112(
                uint224((price0Cumulative - price0CumulativeLast) / timeElapsed)
            );
            price1Average = FixedPoint.uq112x112(
                uint224((price1Cumulative - price1CumulativeLast) / timeElapsed)
            );
            price0CumulativeLast = price0Cumulative;
            price1CumulativeLast = price1Cumulative;
            blockTimestampLast = blockTimestamp;
        }
    }

    // Note this will always return 0 before update has been called successfully for the first time.
    function consultTwap(address token, uint256 amountIn)
        external
        view
        override
        returns (uint256 amountOut)
    {
        if (token == token0) {
            amountOut = price0Average.mul(amountIn).decode144();
        } else {
            require(token == token1, "PairOracle: INVALID_TOKEN");
            amountOut = price1Average.mul(amountIn).decode144();
        }
    }

    function consultPair(address token, uint256 amountIn)
        external
        view
        override
        returns (uint256 amountOut)
    {
        (uint112 reserve0, uint112 reserve1, ) = pair.getReserves();
        if (token == token0) {
            amountOut = AmmLibrary.getAmountOut(amountIn, reserve0, reserve1);
        } else {
            require(token == token1, "PairOracle: INVALID_TOKEN");
            amountOut = AmmLibrary.getAmountOut(amountIn, reserve1, reserve0);
        }
    }

    function currentBlockTimestamp() internal view returns (uint32) {
        return uint32(block.timestamp % 2**32);
    }

    // produces the cumulative price using counterfactuals to save gas and avoid a call to sync.
    function currentCumulativePrices(address _pair)
        internal
        view
        returns (
            uint256 price0Cumulative,
            uint256 price1Cumulative,
            uint32 blockTimestamp
        )
    {
        blockTimestamp = currentBlockTimestamp();
        price0Cumulative = IValueLiquidPair(_pair).price0CumulativeLast();
        price1Cumulative = IValueLiquidPair(_pair).price1CumulativeLast();

        // if time has elapsed since the last update on the pair, mock the accumulated price values
        (
            uint112 reserve0,
            uint112 reserve1,
            uint32 _blockTimestampLast
        ) = IValueLiquidPair(pair).getReserves();
        if (_blockTimestampLast != blockTimestamp) {
            unchecked {
                // subtraction overflow is desired
                uint32 timeElapsed = blockTimestamp - _blockTimestampLast;
                // addition overflow is desired
                // counterfactual
                price0Cumulative +=
                    uint256(FixedPoint.fraction(reserve1, reserve0)._x) *
                    timeElapsed;
                // counterfactual
                price1Cumulative +=
                    uint256(FixedPoint.fraction(reserve0, reserve1)._x) *
                    timeElapsed;
            }
        }
    }
}
