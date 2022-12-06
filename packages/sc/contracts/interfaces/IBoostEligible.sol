// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.4;

interface IBoostEligible {
    function isBoostEligible(address) external returns (bool);
}
