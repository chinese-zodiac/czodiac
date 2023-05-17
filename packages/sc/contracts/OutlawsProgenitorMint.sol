// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./OutlawsNft.sol";
import "./Bandit.sol";

contract OutlawsProgenitorMint is AccessControlEnumerable {
    using Counters for Counters.Counter;

    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    OutlawsNft public immutable outlawsNft;
    Bandit public immutable bandit;

    uint256 public maxMinted = 100;
    Counters.Counter internal mintCounter;

    uint256 public basePrice = 50 ether;
    uint256 public incrementPrice = 2 ether;

    constructor(OutlawsNft _outlawsNft, Bandit _bandit) {
        outlawsNft = _outlawsNft;
        bandit = _bandit;
    }

    function mint() external {
        mintFor(msg.sender);
    }

    function mintFor(address _to) public {
        require(mintCounter.current() < maxMinted, "Max minted");
        bandit.burnFrom(msg.sender, getCurrentPrice());
        outlawsNft.mint(_to);
        mintCounter.increment();
    }

    function getMintCounter() external view returns (uint256) {
        return mintCounter.current();
    }

    function getCurrentPrice() public view returns (uint256) {
        return basePrice + incrementPrice * mintCounter.current();
    }

    function setMaxMinted(uint256 _to) external onlyRole(MANAGER_ROLE) {
        maxMinted = _to;
    }
}
