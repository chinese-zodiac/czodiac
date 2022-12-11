// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./TribePool.sol";
import "./TribePoolStakeWrapperToken.sol";
import "./interfaces/IBlacklist.sol";
import "./CZUsd.sol";
import "./CZRed.sol";
import "./libs/IterableArrayWithoutDuplicateKeys.sol";

//import "hardhat/console.sol";

contract TribePoolMaster is AccessControlEnumerable, IBlacklist {
    using IterableArrayWithoutDuplicateKeys for IterableArrayWithoutDuplicateKeys.Map;
    using SafeERC20 for IERC20;
    using Strings for uint256;

    bytes32 public constant MANAGER_POOLS = keccak256("MANAGER_POOLS");

    CZUsd public czusd = CZUsd(0xE68b79e51bf826534Ff37AA9CeE71a3842ee9c70);
    CZRed public czr = CZRed(0x5cd0c2C744caF04cda258Efc6558A3Ed3defE97b);

    IterableArrayWithoutDuplicateKeys.Map tribePools;
    mapping(address => uint256) public weights;
    uint256 public totalWeight;

    IBlacklist public blacklistChecker =
        IBlacklist(0x8D82235e48Eeb0c5Deb41988864d14928B485bac);

    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function isBlacklisted(address _for) external override returns (bool) {
        return blacklistChecker.isBlacklisted(_for);
    }

    function addRewardsWithCzusd(uint256 _czusdWad) external {
        czusd.transferFrom(msg.sender, address(this), _czusdWad);
        for (uint256 i = 0; i < tribePools.size(); i++) {
            address pool = tribePools.getKeyAtIndex(i);
            if (weights[pool] != 0) {
                uint256 rewardsWad = (_czusdWad * weights[pool]) / totalWeight;
                TribePool(pool).addRewardsWithCzusd(rewardsWad);
            }
        }
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
        string memory poolWrapperName = string(
            abi.encodePacked(
                "wCZR-",
                tribePools.size().toString(),
                "-",
                _tribeToken.symbol()
            )
        );
        TribePoolStakeWrapperToken poolWrapper = new TribePoolStakeWrapperToken(
            poolWrapperName, //string memory _name,
            poolWrapperName, //string memory _symbol,
            address(_tribeToken), //address _tribeToken,
            _isLrtWhitelist, //bool _isLrtWhitelist
            _owner,
            address(this)
        );
        address newPool = address(poolWrapper.pool());
        czr.setContractSafe(address(poolWrapper));
        czusd.setContractSafe(newPool);
        tribePools.add(newPool);
        weights[newPool] = _weight;
        totalWeight += _weight;
    }

    function removeTribePool(address _pool) external onlyRole(MANAGER_POOLS) {
        totalWeight -= weights[_pool];
        weights[_pool] = 0;
        tribePools.remove(_pool);
    }

    function setTribePoolWeight(address _pool, uint256 _weight)
        public
        onlyRole(MANAGER_POOLS)
    {
        require(getIsTribePool(_pool) == true);
        totalWeight -= weights[_pool];
        weights[_pool] = _weight;
        totalWeight += _weight;
    }

    function setBlacklistChecker(IBlacklist _to)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        blacklistChecker = _to;
    }

    /**
     * @notice It allows the admin to recover wrong tokens sent to the contract
     * @param _tokenAddress: the address of the token to withdraw
     * @param _tokenAmount: the number of tokens to withdraw
     * @dev This function is only callable by admin.
     */
    function recoverWrongTokens(address _tokenAddress, uint256 _tokenAmount)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        IERC20(_tokenAddress).safeTransfer(address(msg.sender), _tokenAmount);
    }
}
