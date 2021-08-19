// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// Credit to Olive.cash
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./CZFarmPool.sol";

contract CZFarmPoolFactory is Ownable {
    using SafeERC20 for IERC20;

    event NewCZFarmPool(address indexed pool);

    IERC20 public czfarm;

    constructor(IERC20 _czfarm) Ownable() {
        czfarm = _czfarm;
    }

    function createPool(
        IERC20 token,
        IERC20 reward,
        uint256 rewardPerSecond,
        uint256 startTimestamp,
        uint256 endTimestamp
    ) public {
        bytes memory bytecode = type(CZFarmPool).creationCode;
        bytes32 salt = keccak256(
            abi.encodePacked(token, reward, block.timestamp)
        );
        address pool;

        assembly {
            pool := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }

        CZFarmPool(pool).initialize(
            token,
            reward,
            rewardPerSecond,
            startTimestamp,
            endTimestamp,
            owner()
        );

        emit NewCZFarmPool(address(pool));
    }

    function makeNewFull(
        IERC20 reward,
        uint256 durationSeconds,
        uint256 rewardAmount
    ) public {
        // start after 7 days
        uint256 startBlock = block.timestamp + 1 weeks;
        uint256 endBlock = startBlock + durationSeconds;
        uint256 rewardPerSecond = rewardAmount / durationSeconds;
        createPool(czfarm, reward, rewardPerSecond, startBlock, endBlock);
    }

    function makeNewRequiresRewardPerSecondRecalc(IERC20 reward) external {
        makeNewFull(reward, 30 days, 100 ether);
    }
}
