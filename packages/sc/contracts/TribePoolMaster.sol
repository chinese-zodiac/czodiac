// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./TribePool.sol";
import "./TribePoolStakeWrapperToken.sol";
import "./CZUsd.sol";
import "./CZFarm.sol";
import "./libs/IterableArrayWithoutDuplicateKeys.sol";

//import "hardhat/console.sol";

contract TribePoolMaster is AccessControlEnumerable {
    using IterableArrayWithoutDuplicateKeys for IterableArrayWithoutDuplicateKeys.Map;
    using SafeERC20 for IERC20;

    bytes32 public constant MANAGER_SETTINGS = keccak256("MANAGER_SETTINGS");
    bytes32 public constant MANAGER_POOLS = keccak256("MANAGER_POOLS");

    uint256 public czusdPerSecond;

    CZUsd public czusd = CZUsd(0xE68b79e51bf826534Ff37AA9CeE71a3842ee9c70);
    CZFarm public czf = CZFarm(0x7c1608C004F20c3520f70b924E2BfeF092dA0043);

    IterableArrayWithoutDuplicateKeys.Map tribePools;
    mapping(address => uint256) public weights;
    uint256 public totalWeight;

    uint256 public lastUpdate;

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        lastUpdate = block.timestamp;
    }

    function setCzusdPerSecond(uint256 _to)
        external
        onlyRole(MANAGER_SETTINGS)
    {
        updatePools();
        lastUpdate = block.timestamp;
        czusdPerSecond = _to;
    }

    function updatePools() public {
        if (lastUpdate == block.timestamp) return;
        if (czusdPerSecond == 0) {
            lastUpdate = block.timestamp;
            return;
        }

        czusd.mint(
            address(this),
            czusdPerSecond * (block.timestamp - lastUpdate)
        );
        for (uint256 i = 0; i < tribePools.size(); i++) {
            address pool = tribePools.getKeyAtIndex(i);
            if (weights[pool] != 0) {
                uint256 rewardsWad = (((block.timestamp - lastUpdate) *
                    weights[pool]) * czusdPerSecond) / totalWeight;
                TribePool(pool).addRewards(rewardsWad);
            }
        }
        lastUpdate = block.timestamp;
    }

    function getIsTribePool(address _address) public view returns (bool) {
        return tribePools.getIndexOfKey(_address) != -1;
    }

    function getTribePoolAddress(uint256 _pid) public view returns (address) {
        return tribePools.getKeyAtIndex(_pid);
    }

    function getTribePoolCount() public view returns (uint256) {
        return tribePools.size();
    }

    function addTribePool(
        ERC20 _tribeToken,
        bool _isLrtWhitelist,
        uint256 _weight,
        address _owner
    ) public onlyRole(MANAGER_POOLS) {
        updatePools();
        TribePoolStakeWrapperToken poolWrapper = new TribePoolStakeWrapperToken(
            string(abi.encodePacked("CZF Staked in ", _tribeToken.name())), //string memory _name,
            string(abi.encodePacked("cz-", _tribeToken.symbol())), //string memory _symbol,
            address(_tribeToken), //address _tribeToken,
            _isLrtWhitelist, //bool _isLrtWhitelist
            _owner
        );
        address newPool = address(poolWrapper.pool());
        czf.setContractSafe(address(poolWrapper));
        czusd.setContractSafe(newPool);
        tribePools.add(newPool);
        weights[newPool] = _weight;
        totalWeight += _weight;
    }

    function removeTribePool(address _pool) external onlyRole(MANAGER_POOLS) {
        updatePools();
        totalWeight -= weights[_pool];
        weights[_pool] = 0;
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
        updatePools();
        totalWeight -= weights[_pool];
        weights[_pool] = _weight;
        totalWeight += _weight;
    }
}
