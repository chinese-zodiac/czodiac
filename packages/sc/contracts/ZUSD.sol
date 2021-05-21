// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// Automatically increases ZUSD balance by ZUSD rewards.
// Rewards are updated every 6-7 days based on the ZUSD balance of this contract.
// Credit to Synthetix
pragma solidity ^0.8.4;

import "./Checkpoints.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract ZUSD is Context, ERC20PresetMinterPauser, Ownable {
    using Checkpoints for Checkpoints.Checkpoint[];
    using SafeERC20 for IERC20;
    using SafeMath for uint256;
    using Address for address;

    IERC20 private busd;
    //Rewards
    uint256 public periodFinish = 0;
    uint256 public rewardRate = 0;
    uint256 public rewardsDuration = 7 days;
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;
    mapping(address => uint256) public userRewardPerTokenPaid;
    bool public isRewardsEnabled;

    //Withdraws
    mapping(address => Withdraws) private userWithdraws;
    struct Withdraws {
        uint256 request;
        uint256 fill;
    }

    event WithdrawRequest(address user, uint256 amount);
    event UpdateRewardPerSecond(uint256 valueWad, uint256 period);
    event RewardAdded(uint256 reward);

    constructor(
        string memory _name,
        string memory _symbol,
        IERC20 _busd
    ) ERC20PresetMinterPauser(_name, _symbol) Ownable() {}

    function deposit(uint256 _wadBusd) external {
        _mint(_msgSender(), _wadBusd);
        busd.transferFrom(_msgSender(), address(this), _wadBusd);
    }

    function withdrawRequest(uint256 _wadZusd) external {
        require(_wadZusd >= 10 ether, "Must request a minimum of 10 zusd");
        _burn(_msgSender(), _wadZusd);
        Withdraws storage withdraws = userWithdraws[_msgSender()];
        withdraws.request = withdraws.request.add(_wadZusd);
        emit WithdrawRequest(_msgSender(), _wadZusd);
    }

    function fillRequests(address[] calldata _fors) external {
        for (uint16 i; i < _fors.length; i++) {
            _fillRequest(_fors[i]);
        }
    }

    function setIsRewardsEnabled(bool _val) external onlyOwner {
        isRewardsEnabled = _val;
    }

    function balanceOf(address account) public view override returns (uint256) {
        return super.balanceOf(account).add(_earned(account));
    }

    function recoverERC20(address tokenAddress, uint256 tokenAmount)
        external
        onlyOwner
    {
        require(tokenAddress != address(this), "Cannot withdraw zusd");
        IERC20(tokenAddress).safeTransfer(owner(), tokenAmount);
    }

    function notifyRewardAmount() public {
        _updateReward(address(0));
        if (block.timestamp < periodFinish.sub(1 days) || periodFinish == 0) {
            //Only can update rewards on last day of 3 day period.
            return;
        }
        uint256 reward = balanceOf(address(this)).div(2);
        if (reward < 1000 ether) {
            // Not enough reward to distribute
            return;
        }
        if (block.timestamp >= periodFinish) {
            rewardRate = reward.div(rewardsDuration);
        } else {
            uint256 remaining = periodFinish.sub(block.timestamp);
            uint256 leftover = remaining.mul(rewardRate);
            rewardRate = reward.add(leftover).div(rewardsDuration);
        }

        // Ensure the provided reward amount is not more than the balance in the contract.
        // This keeps the reward rate in the right range, preventing overflows due to
        // very high values of rewardRate in the earned and rewardsPerToken functions;
        // Reward + leftover must be less than 2^256 / 10^18 to avoid overflow.
        uint256 balance = balanceOf(address(this));
        require(
            rewardRate <= balance.div(rewardsDuration),
            "Provided reward too high"
        );

        lastUpdateTime = block.timestamp;
        periodFinish = block.timestamp.add(rewardsDuration);
        emit RewardAdded(reward);
    }

    function _updateReward(address account) internal returns (uint256 reward) {
        rewardPerTokenStored = _rewardPerToken();
        lastUpdateTime = _lastTimeRewardApplicable();
        if (account != address(0)) {
            reward = _earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        if (reward > 0) {
            transfer(_msgSender(), reward);
        }
    }

    function _earned(address account) internal view returns (uint256) {
        return
            super
                .balanceOf(account)
                .mul(_rewardPerToken().sub(userRewardPerTokenPaid[account]))
                .div(1e18);
    }

    function _rewardPerToken() internal view returns (uint256) {
        if (totalSupply() == 0) {
            return rewardPerTokenStored;
        }
        return
            rewardPerTokenStored.add(
                _lastTimeRewardApplicable()
                    .sub(lastUpdateTime)
                    .mul(rewardRate)
                    .mul(1e18)
                    .div(totalSupply())
            );
    }

    function _lastTimeRewardApplicable() internal view returns (uint256) {
        return Math.min(block.timestamp, periodFinish);
    }

    function _fillRequest(address _for) internal {
        Withdraws storage withdraws = userWithdraws[_for];
        uint256 amount = withdraws.request.sub(withdraws.fill);
        withdraws.fill = amount;
        busd.transferFrom(_msgSender(), _for, amount);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256
    ) internal override {
        if (isRewardsEnabled) {
            if (block.timestamp > periodFinish.sub(1 days)) {
                notifyRewardAmount();
            }
            _updateReward(from);
            _updateReward(to);
        }
    }
}
