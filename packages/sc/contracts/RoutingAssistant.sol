// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.4;
//import "hardhat/console.sol";
import "./interfaces/IAmmRouter02.sol";

contract RoutingAssistant {
    IAmmRouter02 public router =
        IAmmRouter02(0x10ED43C718714eb63d5aA57B78B54704E256024E);

    address[5] public intermediateTokens;

    address public CZUSD = address(0xE68b79e51bf826534Ff37AA9CeE71a3842ee9c70);
    address public WBNB = address(0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c);

    constructor() {
        intermediateTokens[0] = address(
            0x55d398326f99059fF775485246999027B3197955
        ); //USDT
        intermediateTokens[1] = address(
            0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56
        ); //BUSD
        intermediateTokens[2] = address(
            0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82
        ); //CAKE
        intermediateTokens[3] = address(
            0x2170Ed0880ac9A755fd29B2688956BD959F933F8
        ); //WETH
        intermediateTokens[4] = address(
            0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c
        ); //BTCB
    }

    function getIntermediatePairedTokenRate(address _tradingToken)
        public
        view
        returns (uint256 rateWad_, address intermediateToken_)
    {
        uint256[7] memory amountOuts; //intermediateTokens.length+2
        address[] memory path3 = new address[](3);
        address[] memory path4 = new address[](4);

        //Direct swap
        amountOuts[0] = getCzusdPairedTokenRate(_tradingToken);

        //Thru WBNB
        path3[0] = CZUSD;
        path3[1] = WBNB;
        path3[2] = _tradingToken;
        amountOuts[1] = tryGetAmountOut(1 ether, path3);

        //Thru intermediates
        path4[0] = CZUSD;
        path4[1] = WBNB;
        path4[3] = _tradingToken;
        for (
            uint256 i;
            i < 5; /* 5 int tokens*/
            i++
        ) {
            path4[2] = intermediateTokens[i];
            amountOuts[i + 2] = tryGetAmountOut(1 ether, path4);
        }

        uint256 winningIndex = 7; //If no one wins, this will be 7
        uint256 winningAmountOut = 7; //If no one wins, this will be 7
        for (
            uint256 i;
            i < 7; /* 7 amtout*/
            i++
        ) {
            if (winningAmountOut < amountOuts[i]) {
                winningAmountOut = amountOuts[i];
                winningIndex = i;
            }
        }

        rateWad_ = winningAmountOut;
        if (winningIndex == 0) {
            intermediateToken_ = CZUSD;
        } else if (winningIndex == 1) {
            intermediateToken_ = WBNB;
        } else if (winningIndex < 7) {
            intermediateToken_ = intermediateTokens[winningIndex];
        }
    }

    function getCzusdPairedTokenRate(address _tradingToken)
        public
        view
        returns (uint256 rateWad_)
    {
        address[] memory path2 = new address[](2);

        //Direct swap
        path2[0] = CZUSD;
        path2[1] = _tradingToken;
        rateWad_ = tryGetAmountOut(1 ether, path2);
    }

    function tryGetAmountOut(uint256 amountIn, address[] memory path)
        public
        view
        returns (uint256 amountOut)
    {
        try router.getAmountsOut(amountIn, path) returns (
            uint256[] memory amts
        ) {
            return amts[path.length - 1];
        } catch {}
    }
}
