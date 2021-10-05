// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// Credit to Wex/WaultSwap, Synthetix
//This variant can have an approved router, set by owner, which can deposit/withdraw on behalf of users to reduce the number of required tx.
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./CZFarm.sol";

contract CZFarmMasterRoutable is Ownable {
    using SafeMath for uint256;

    struct UserInfo {
        uint256 amount;
        uint256 rewardDebt;
        uint256 pendingRewards;
    }

    struct PoolInfo {
        IERC20 lpToken;
        uint256 allocPoint;
        uint256 lastRewardBlock;
        uint256 accCzfPerShare;
    }

    CZFarm public czf;
    uint256 public czfPerBlock;

    PoolInfo[] public poolInfo;
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;
    uint256 public totalAllocPoint = 0;
    uint256 public startBlock;

    address public router;

    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event Claim(address indexed user, uint256 indexed pid, uint256 amount);
    event EmergencyWithdraw(
        address indexed user,
        uint256 indexed pid,
        uint256 amount
    );

    constructor(
        CZFarm _czf,
        uint256 _czfPerBlock,
        uint256 _startBlock
    ) {
        czf = _czf;
        czfPerBlock = _czfPerBlock;
        startBlock = _startBlock;
    }

    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }

    function getMultiplier(uint256 _from, uint256 _to)
        public
        pure
        returns (uint256)
    {
        return _to.sub(_from);
    }

    function add(
        uint256 _allocPoint,
        IERC20 _lpToken,
        bool _withUpdate
    ) public onlyOwner {
        if (_withUpdate) {
            massUpdatePools();
        }
        uint256 lastRewardBlock = block.number > startBlock
            ? block.number
            : startBlock;
        totalAllocPoint = totalAllocPoint.add(_allocPoint);
        poolInfo.push(
            PoolInfo({
                lpToken: _lpToken,
                allocPoint: _allocPoint,
                lastRewardBlock: lastRewardBlock,
                accCzfPerShare: 0
            })
        );
    }

    function set(
        uint256 _pid,
        uint256 _allocPoint,
        bool _withUpdate
    ) public onlyOwner {
        if (_withUpdate) {
            massUpdatePools();
        }
        totalAllocPoint = totalAllocPoint.sub(poolInfo[_pid].allocPoint).add(
            _allocPoint
        );
        poolInfo[_pid].allocPoint = _allocPoint;
    }

    function pendingCzf(uint256 _pid, address _user)
        external
        view
        returns (uint256)
    {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_user];
        uint256 accCzfPerShare = pool.accCzfPerShare;
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        if (block.number > pool.lastRewardBlock && lpSupply != 0) {
            uint256 multiplier = getMultiplier(
                pool.lastRewardBlock,
                block.number
            );
            uint256 czfReward = multiplier
                .mul(czfPerBlock)
                .mul(pool.allocPoint)
                .div(totalAllocPoint);
            accCzfPerShare = accCzfPerShare.add(
                czfReward.mul(1e12).div(lpSupply)
            );
        }
        return
            user.amount.mul(accCzfPerShare).div(1e12).sub(user.rewardDebt).add(
                user.pendingRewards
            );
    }

    function massUpdatePools() public {
        uint256 length = poolInfo.length;
        for (uint256 pid = 0; pid < length; ++pid) {
            updatePool(pid);
        }
    }

    function updatePool(uint256 _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        if (block.number <= pool.lastRewardBlock) {
            return;
        }
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        if (lpSupply == 0) {
            pool.lastRewardBlock = block.number;
            return;
        }
        uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
        uint256 czfReward = multiplier
            .mul(czfPerBlock)
            .mul(pool.allocPoint)
            .div(totalAllocPoint);
        czf.mint(address(this), czfReward);
        pool.accCzfPerShare = pool.accCzfPerShare.add(
            czfReward.mul(1e12).div(lpSupply)
        );
        pool.lastRewardBlock = block.number;
    }

    function deposit(
        uint256 _pid,
        uint256 _amount,
        bool _withdrawRewards
    ) public {
        _deposit(_pid, _amount, _withdrawRewards, msg.sender, msg.sender);
    }

    function depositRoutable(
        uint256 _pid,
        uint256 _amount,
        bool _withdrawRewards,
        address _account,
        address _assetSender
    ) public {
        require(msg.sender == router);
        _deposit(_pid, _amount, _withdrawRewards, _account, _assetSender);
    }

    function _deposit(
        uint256 _pid,
        uint256 _amount,
        bool _withdrawRewards,
        address _account,
        address _assetSender
    ) internal {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_account];

        console.log("CZFarmMasterRoutable deposit", _account);

        updatePool(_pid);
        if (user.amount > 0) {
            uint256 pending = user
                .amount
                .mul(pool.accCzfPerShare)
                .div(1e12)
                .sub(user.rewardDebt);

            if (pending > 0) {
                user.pendingRewards = user.pendingRewards.add(pending);

                if (_withdrawRewards) {
                    safeCzfTransfer(_account, user.pendingRewards);
                    emit Claim(_account, _pid, user.pendingRewards);
                    user.pendingRewards = 0;
                }
            }
        }
        if (_amount > 0) {
            require(
                pool.lpToken.transferFrom(
                    address(_assetSender),
                    address(this),
                    _amount
                ),
                "CZFarmMaster: Transfer failed"
            );
            user.amount = user.amount.add(_amount);
        }
        user.rewardDebt = user.amount.mul(pool.accCzfPerShare).div(1e12);
        emit Deposit(_account, _pid, _amount);
    }

    function withdraw(
        uint256 _pid,
        uint256 _amount,
        bool _withdrawRewards
    ) public {
        _withdraw(_pid, _amount, _withdrawRewards, msg.sender, msg.sender);
    }

    function withdrawRoutable(
        uint256 _pid,
        uint256 _amount,
        bool _withdrawRewards,
        address _account,
        address _assetReceiver
    ) public {
        require(msg.sender == router);
        _withdraw(_pid, _amount, _withdrawRewards, _account, _assetReceiver);
    }

    function _withdraw(
        uint256 _pid,
        uint256 _amount,
        bool _withdrawRewards,
        address _account,
        address _assetReceiver
    ) internal {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_account];

        console.log("withdraw amount", user.amount, _amount);
        require(user.amount >= _amount, "CZFarmMaster: balance too low");
        updatePool(_pid);
        uint256 pending = user.amount.mul(pool.accCzfPerShare).div(1e12).sub(
            user.rewardDebt
        );
        if (pending > 0) {
            user.pendingRewards = user.pendingRewards.add(pending);

            if (_withdrawRewards) {
                safeCzfTransfer(_account, user.pendingRewards);
                emit Claim(_account, _pid, user.pendingRewards);
                user.pendingRewards = 0;
            }
        }
        if (_amount > 0) {
            user.amount = user.amount.sub(_amount);
            require(
                pool.lpToken.transfer(_assetReceiver, _amount),
                "CZFarmMaster: Transfer failed"
            );
        }
        user.rewardDebt = user.amount.mul(pool.accCzfPerShare).div(1e12);
        emit Withdraw(_account, _pid, _amount);
    }

    function emergencyWithdraw(uint256 _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        require(
            pool.lpToken.transfer(address(msg.sender), user.amount),
            "CZFarmMaster: Transfer failed"
        );
        emit EmergencyWithdraw(msg.sender, _pid, user.amount);
        user.amount = 0;
        user.rewardDebt = 0;
        user.pendingRewards = 0;
    }

    function claim(uint256 _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        updatePool(_pid);
        uint256 pending = user.amount.mul(pool.accCzfPerShare).div(1e12).sub(
            user.rewardDebt
        );
        if (pending > 0 || user.pendingRewards > 0) {
            user.pendingRewards = user.pendingRewards.add(pending);
            safeCzfTransfer(msg.sender, user.pendingRewards);
            emit Claim(msg.sender, _pid, user.pendingRewards);
            user.pendingRewards = 0;
        }
        user.rewardDebt = user.amount.mul(pool.accCzfPerShare).div(1e12);
    }

    function safeCzfTransfer(address _to, uint256 _amount) internal {
        uint256 czfBal = czf.balanceOf(address(this));
        if (_amount > czfBal) {
            czf.transfer(_to, czfBal);
        } else {
            czf.transfer(_to, _amount);
        }
    }

    function setCzfPerBlock(uint256 _czfPerBlock) public onlyOwner {
        require(_czfPerBlock > 0, "CZFarmMaster: czfPerBlock cannot be 0");
        czfPerBlock = _czfPerBlock;
    }

    function setRouter(address _router) public onlyOwner {
        router = _router;
    }
}
