// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// Credit to Iron Finance
pragma solidity ^0.8.4;

import "./interfaces/IPairOracle.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract UpdateOracles is Ownable {
    IPairOracle[] oracles;

    constructor(IPairOracle[] memory _oracles) Ownable() {
        for(uint256 i; i < _oracles.length; i++){
            oracles.push(_oracles[i]);
        }
    }

    function add(IPairOracle _oracle) onlyOwner public {
        oracles.push(_oracle);
    }

    function set(uint256 _index, IPairOracle _oracle) onlyOwner public {
        oracles[_index] = _oracle;
    }

    function updateAll() public {
        for(uint256 i; i < oracles.length; i++){
            oracles[i].update();
        }
    }
}