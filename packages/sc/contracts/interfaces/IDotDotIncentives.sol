// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.4;

interface IDotDotIncentives {
    /**
    @notice Claim an available fee or bribe.
    @dev Incentives are claimable up to the end of the previous week. Incentives earned more
    than one week ago are released immediately, those from the previous week are streamed.
    @param _user Address to claim for
    @param _lpToken LP token that was voted on to earn the incentive. Set to address(0)
    to claim general fees for all token lockers.
    @param _tokens Array of tokens to claim
    @return claimedAmounts Array of amounts claimed
    */
    function claim(
        address _user,
        address _lpToken,
        address[] calldata _tokens
    ) external returns (uint256[] memory claimedAmounts);
}
