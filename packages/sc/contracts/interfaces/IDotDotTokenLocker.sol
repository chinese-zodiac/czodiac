// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.4;

interface IDotDotTokenLocker {
    /**
    @notice Deposit tokens into the contract to create a new lock.
    @dev A lock is created for a given number of weeks. Minimum 1, maximum `MAX_LOCK_WEEKS`.
    A user can have more than one lock active at a time. A user's total "lock weight"
    is calculated as the sum of [number of tokens] * [weeks until unlock] for all
    active locks. Fees are distributed porportionally according to a user's lock
    weight as a percentage of the total lock weight. At the start of each new week,
    each lock's weeks until unlock is reduced by 1. Locks that reach 0 week no longer
    receive any weight, and tokens may be withdrawn by calling `initiateExitStream`.
    @param _user Address to create a new lock for (does not have to be the caller)
    @param _amount Amount of tokens to lock. This balance transfered from the caller.
    @param _weeks The number of weeks for the lock.
    */
    function lock(
        address _user,
        uint256 _amount,
        uint256 _weeks
    ) external returns (bool);

    /**
    @notice Extend the length of an existing lock.
    @param _amount Amount of tokens to extend the lock for. When the value given equals
    the total size of the existing lock, the entire lock is moved.
    If the amount is less, then the lock is effectively split into
    two locks, with a portion of the balance extended to the new length
    and the remaining balance at the old length.
    @param _weeks The number of weeks for the lock that is being extended.
    @param _newWeeks The number of weeks to extend the lock until.
    */
    function extendLock(
        uint256 _amount,
        uint256 _weeks,
        uint256 _newWeeks
    ) external returns (bool);

    /**
    @notice Get data on a user's active token locks
    @param _user Address to query data for
    @return lockData dynamic array of [weeks until expiration, balance of lock]
    */
    function getActiveUserLocks(address _user)
        external
        view
        returns (uint256[2][] memory lockData);

    /**
    @notice Create an exit stream, to withdraw tokens in expired locks over 1 week
    */
    function initiateExitStream() external returns (bool);

    /**
    @notice Withdraw tokens from an active or completed exit stream
    */
    function withdrawExitStream() external returns (bool);
}
