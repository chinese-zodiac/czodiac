// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "./ChronoVesting.sol";
import "./CZFarm.sol";

contract ChronoPoolService is AccessControlEnumerable {
    bytes32 public constant POOL_LORD = keccak256("POOL_LORD");

    CZFarm public czf;
    struct ChronoPool {
        uint32 rateBasis;
        ChronoVesting chronoVesting;
    }
    ChronoPool[] public chronoPools;

    constructor(CZFarm _czf) {
        _setupRole(POOL_LORD, _msgSender());
        czf = _czf;
    }

    function addChronoPool(
        IERC20 _asset,
        uint32 _ffBasis,
        uint32 _vestPeriod,
        uint32 _apr
    ) external onlyRole(POOL_LORD) returns (uint256 pid_) {
        bytes memory bytecode = type(ChronoVesting).creationCode;
        bytes32 salt = keccak256(
            abi.encodePacked(_asset, _ffBasis, _vestPeriod)
        );
        address chronoVesting;
        assembly {
            chronoVesting := create2(
                0,
                add(bytecode, 32),
                mload(bytecode),
                salt
            )
        }
        pid_ = chronoPools.length;
        chronoPools.push(
            ChronoPool({
                rateBasis: ((_apr * 365 days) / _vestPeriod),
                chronoVesting: ChronoVesting(chronoVesting)
            })
        );
    }

    function setChronoPool(
        uint256 _pid,
        uint32 _ffBasis,
        uint32 _apr
    ) external onlyRole(POOL_LORD) {
        ChronoPool storage pool = chronoPools[_pid];
        ChronoVesting vest = pool.chronoVesting;
        uint32 vestPeriod = vest.vestPeriod();
        vest.setEarlyExitBasis(_ffBasis);
        pool.rateBasis = ((_apr * 365 days) / vestPeriod);
    }
}
