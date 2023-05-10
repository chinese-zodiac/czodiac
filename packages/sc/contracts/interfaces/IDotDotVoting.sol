// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.4;

interface IDotDotVoting {
    /**
    @notice Get the amount of unused votes for for the current week being voted on
    @param _user Address to query
    @return uint Amount of unused votes
    */
    function availableVotes(address _user) external view returns (uint256);

    /**
    @notice Allocate votes toward LP tokens to receive emissions in the following week
    @dev Voting works identically to
    @param _tokens List of addresses of LP tokens to vote for
    @param _votes Votes to allocate to `_tokens`. Values are additive, they do
    not include previous votes. For example, if you have already
    allocated 100 votes and wish to allocate a total of 300,
    the vote amount should be given as 200.
    */
    function vote(address[] calldata _tokens, uint256[] memory _votes) external;
}
