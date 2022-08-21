// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

interface IDepxFeeDistributor {
    function feeTokensLength() external returns (uint256);

    function feeTokens(uint256) external returns (address);

    function claim(address _user, address[] calldata _tokens)
        external
        returns (uint256[] memory claimedAmounts);
}
