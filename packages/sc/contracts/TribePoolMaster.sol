// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./TribePool.sol";
import "./CZUsd.sol";
import "./libs/IterableArrayWithoutDuplicateKeys.sol";

contract TribePoolMaster is AccessControlEnumerable {
    using IterableArrayWithoutDuplicateKeys for IterableArrayWithoutDuplicateKeys.Map;
    using SafeERC20 for IERC20;

    bytes32 public constant MANAGER_SETTINGS = keccak256("MANAGER_SETTINGS");
    bytes32 public constant MANAGER_POOLS = keccak256("MANAGER_POOLS");

    uint256 public czusdPerSecond;

    CZUsd public czusd = CZUsd(0xE68b79e51bf826534Ff37AA9CeE71a3842ee9c70);

    IterableArrayWithoutDuplicateKeys.Map tribePools;
    mapping(address => uint256) public weights;
    uint256 public totalWeight;

    mapping(address => uint256) public lastUpdate;

    function setCzusdPerSecond(uint256 _to)
        external
        onlyRole(MANAGER_SETTINGS)
    {
        updateAllPools();
        czusdPerSecond = _to;
    }

    function updateAllPools() public {
        _updateCountPools(0, tribePools.size());
    }

    function _updateCountPools(uint256 _start, uint256 _count) internal {
        for (uint256 i = _start; i < _start + _count; i++) {
            _updatePool(tribePools.getKeyAtIndex(i));
        }
    }

    function _updatePool(address _pool) internal {
        if (lastUpdate[_pool] == block.timestamp) return;
        if (lastUpdate[_pool] == 0) {
            lastUpdate[_pool] = block.timestamp;
            return;
        }
        lastUpdate[_pool] = block.timestamp;
        if (weights[_pool] == 0) return;

        uint256 wad = ((block.timestamp - lastUpdate[_pool]) * weights[_pool]) /
            totalWeight;
        czusd.mint(_pool, wad);
        TribePool(_pool).addPendingRewards();
    }

    function getIsTribePool(address _address) public view returns (bool) {
        return tribePools.getIndexOfKey(_address) != -1;
    }

    function addTribePool(address _pool, uint256 _weight)
        public
        onlyRole(MANAGER_POOLS)
    {
        updateAllPools();
        tribePools.add(_pool);
        weights[_pool] = _weight;
        totalWeight += _weight;
        lastUpdate[_pool] = block.timestamp;
    }

    function removeTribePool(address _pool) external onlyRole(MANAGER_POOLS) {
        updateAllPools();
        totalWeight -= weights[_pool];
        weights[_pool] = 0;
        lastUpdate[_pool] = 0;
        tribePools.remove(_pool);
    }

    function setTribePoolWeight(address _pool, uint256 _weight)
        public
        onlyRole(MANAGER_POOLS)
    {
        require(
            getIsTribePool(_pool) == true,
            "TribePoolMaster: Not tribe pool"
        );
        updateAllPools();
        weights[_pool] = _weight;
        totalWeight += _weight;
    }
}
