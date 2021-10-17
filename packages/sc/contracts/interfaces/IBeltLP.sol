// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// Credit to Belt
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IBeltLP {
    function underlying_coins(int128 i) external view returns (address);

    function add_liquidity(uint256[4] memory uamounts, uint256 min_mint_amount)
        external;

    function remove_liquidity(uint256 _amount, uint256[4] memory min_amounts)
        external;

    function remove_liquidity_one_coin(
        uint256 _token_amount,
        int128 i,
        uint256 min_uamount
    ) external;
}
