// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// Credit to Pancakeswap
/*pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import '../interfaces/IAmmPair.sol';
import '../interfaces/IAmmRouter01.sol';


import '../libs/AmmLibrary.sol';
import '../libs/Babylonian.sol';

contract SwapToPrice {

    IAmmRouter01 public immutable router;
    address public immutable factory;

    constructor(address factory_, IAmmRouter01 router_) public {
        factory = factory_;
        router = router_;
    }

    // computes the direction and magnitude of the profit-maximizing trade
    function computeProfitMaximizingTrade(
        uint256 truePriceTokenA,
        uint256 truePriceTokenB,
        uint256 reserveA,
        uint256 reserveB
    ) pure public returns (bool aToB, uint256 amountIn) {
        aToB = reserveA * truePriceTokenB / reserveB < truePriceTokenA;

        uint256 invariant = reserveA * reserveB;

        uint256 leftSide = Babylonian.sqrt(
            (invariant * (aToB ? truePriceTokenA : truePriceTokenB) * 1000) /
            uint256(aToB ? truePriceTokenB : truePriceTokenA) * 997
        );
        uint256 rightSide = (aToB ? reserveA *  1000 : reserveB * 1000) / 997;

        // compute the amount that must be sent to move the price to the profit-maximizing price
        amountIn = leftSide - rightSide;
    }

    // swaps an amount of either token such that the trade is profit-maximizing, given an external true price
    // true price is expressed in the ratio of token A to token B
    // caller must approve this contract to spend whichever token is intended to be swapped
    function swapToPrice(
        address tokenA,
        address tokenB,
        uint256 truePriceTokenA,
        uint256 truePriceTokenB,
        uint256 maxSpendTokenA,
        uint256 maxSpendTokenB,
        address to,
        uint256 deadline
    ) public {
        // true price is expressed as a ratio, so both values must be non-zero
        require(truePriceTokenA != 0 && truePriceTokenB != 0, "ExampleSwapToPrice: ZERO_PRICE");
        // caller can specify 0 for either if they wish to swap in only one direction, but not both
        require(maxSpendTokenA != 0 || maxSpendTokenB != 0, "ExampleSwapToPrice: ZERO_SPEND");

        bool aToB;
        uint256 amountIn;
        {
            (uint256 reserveA, uint256 reserveB) = PancakeLibrary.getReserves(factory, tokenA, tokenB);
            (aToB, amountIn) = computeProfitMaximizingTrade(
                truePriceTokenA, truePriceTokenB,
                reserveA, reserveB
            );
        }

        // spend up to the allowance of the token in
        uint256 maxSpend = aToB ? maxSpendTokenA : maxSpendTokenB;
        if (amountIn > maxSpend) {
            amountIn = maxSpend;
        }

        address tokenIn = aToB ? tokenA : tokenB;
        address tokenOut = aToB ? tokenB : tokenA;
        SafeERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        SafeERC20(tokenIn).safeApprove(address(router), amountIn);

        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;

        router.swapExactTokensForTokens(
            amountIn,
            0, // amountOutMin: we can skip computing this number because the math is tested
            path,
            to,
            deadline
        );
    }
}*/
