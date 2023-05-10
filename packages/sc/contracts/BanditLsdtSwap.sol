// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Bandit.sol";
import "./LSDT.sol";

contract BanditLsdtSwap is Ownable {
    uint256 public swapRateBasis = 150000;

    uint256 public openTimestamp = 1683334800;
    uint256 public closeTimestamp = 1683507600;

    LSDT public lsdt = LSDT(0xAa83Bb1Be2a74AaA8795a8887054919A0Ea96BFA);
    Bandit public bandit = Bandit(0x2a10CFe2300e5DF9417F7bEe99ef1e81228F0Ac7);

    function burnLsdtForBandit(uint256 _wad, address _to) external {
        require(
            msg.sender == owner() ||
                (block.timestamp >= openTimestamp &&
                    block.timestamp <= closeTimestamp),
            "BanditLsdtSwap: Swap closed"
        );
        lsdt.burnFrom(msg.sender, _wad);
        bandit.mint(_to, (_wad * swapRateBasis) / 10000);
    }

    function setOpenTimestamp(uint256 _to) external onlyOwner {
        openTimestamp = _to;
    }

    function setCloseTimestamp(uint256 _to) external onlyOwner {
        closeTimestamp = _to;
    }

    function setSwapRateBasis(uint256 _to) external onlyOwner {
        swapRateBasis = _to;
    }
}
