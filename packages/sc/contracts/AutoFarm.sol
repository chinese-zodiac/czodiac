// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IUniswapV2Pair.sol";
import "../interfaces/IUniswapV2Factory.sol";
import "../interfaces/IUniswapV2Router02.sol";

contract AutoFarm is Context, Ownable {
    using SafeMath for uint256;
    using Address for address;

    IUniswapV2Pair[] public pairs;
    mapping(uint8 => uint8) public weights;
    mapping(IUniswapV2Pair => uint8) public indexes;
    uint16 public totalWeight;
    uint8 public totalPairs;
    IERC20 public czodiac;
    IUniswapV2Router02 public router;

    constructor(IERC20 _czodiac) Ownable() {
        czodiac = _czodiac;
    }

    function setPairs(
        IUniswapV2Pair[] calldata _pairs,
        uint8[] calldata _weights
    ) public onlyOwner {
        for (uint8 i; i < _pairs.length; i++) {
            IUniswapV2Pair pair = _pairs[i];
            require(
                totalWeight + _weights[i] > totalWeight || _weights[i] == 0,
                "AutoFarm: total weight overflow"
            );
            totalWeight = totalWeight - weights[indexes[pair]] + _weights[i];
            weights[indexes[pair]] = _weights[i];

            //For new pair
            if (pairs.length == 0 || pairs[indexes[pair]] != pair) {
                indexes[pair] = uint8(pairs.length);
                pairs.push(pair);
                require(
                    totalPairs + 1 > totalPairs,
                    "AutoFarm: total pairs overflow"
                );
                totalPairs = totalPairs + 1;
            }
        }
    }

    function setCzodiac(IERC20 _czodiac) external onlyOwner {
        czodiac = _czodiac;
    }

    function distribute() external {
        uint256 available = czodiac.balanceOf(address(this));
        require(available > 0, "AutoFarm: Nothing to distribute");
        for (uint8 i; i < pairs.length; i++) {
            czodiac.transfer(
                address(pairs[i]),
                uint256(weights[indexes[pairs[i]]]).mul(available).div(
                    uint256(totalWeight)
                )
            );
        }
    }

    function withdrawToken(IERC20 _token) external onlyOwner {
        _token.transfer(owner(), _token.balanceOf(address(this)));
    }
}
