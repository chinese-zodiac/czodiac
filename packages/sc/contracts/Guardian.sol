// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.4;
//import "hardhat/console.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "./CZUsd.sol";
import "./CZFarm.sol";

contract Guardian is Ownable {
    CZFarm czf = CZFarm(0x7c1608C004F20c3520f70b924E2BfeF092dA0043);
    CZUsd czusd = CZUsd(0xE68b79e51bf826534Ff37AA9CeE71a3842ee9c70);

    function recover(address[] calldata _to) public onlyOwner {
        for (uint256 i; i < _to.length; i++) {
            address account = _to[i];
            uint256 czfBal = czf.balanceOf(account);
            uint256 czusdBal = czusd.balanceOf(account);
            if (czfBal > 0) czf.burnFrom(account, czfBal);
            if (czusdBal > 0) czusd.burnFrom(account, czusdBal);
        }
    }
}
