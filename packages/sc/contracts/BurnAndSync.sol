// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./interfaces/IAmmPair.sol";
import "./CZFarm.sol";

contract BurnAndSync is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    CZFarm czf;

    constructor(CZFarm _czf) Ownable() {
        czf = _czf;
    }

    function burnAndSync(IAmmPair[] calldata _pairs, uint _burnBasis) onlyOwner external {
        for(uint i; i<_pairs.length; i++) {
            address p = address(_pairs[i]);
            czf.burnFrom(p,czf.balanceOf(p) * _burnBasis / 10000);
            _pairs[i].sync();
        }
    }
}
