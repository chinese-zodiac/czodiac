// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// Credit to Wex/WaultSwap, Synthetix
//This variant can have an approved router, set by owner, which can deposit/withdraw on behalf of users to reduce the number of required tx.
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./CZBlue.sol";

contract CZBlueMasterRoutable is Ownable {
    using SafeMath for uint256;

    struct UserInfo {
        uint256 amount;
        uint256 rewardDebt;
        uint256 pendingRewards;
    }

    struct PoolInfo {
        IERC20 lpToken;
        uint16 depositTaxBasis;
        uint16 withdrawTaxBasis;
        uint32 allocPoint;
        uint256 lastRewardBlock;
        uint256 accCzbPerShare;
    }

    CZBlue public czb;
    uint256 public czbPerBlock;

    PoolInfo[] public poolInfo;
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;
    uint32 public totalAllocPoint = 0;
    uint256 public startBlock;

    address public router;
    address public treasury =
        address(0x745A676C5c472b50B50e18D4b59e9AeEEc597046);

    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
    event Claim(address indexed user, uint256 indexed pid, uint256 amount);
    event EmergencyWithdraw(
        address indexed user,
        uint256 indexed pid,
        uint256 amount
    );

    constructor(
        CZBlue _czb,
        uint256 _czbPerBlock,
        uint256 _startBlock
    ) {
        czb = _czb;
        czbPerBlock = _czbPerBlock;
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
        return _to - _from;
    }

    function add(
        uint32 _allocPoint,
        uint16 _depositTaxBasis,
        uint16 _withdrawTaxBasis,
        IERC20 _lpToken,
        bool _withUpdate
    ) public onlyOwner {
        if (_withUpdate) {
            massUpdatePools();
        }
        uint256 lastRewardBlock = block.number > startBlock
            ? block.number
            : startBlock;
        totalAllocPoint = totalAllocPoint + _allocPoint;
        poolInfo.push(
            PoolInfo({
                lpToken: _lpToken,
                depositTaxBasis: _depositTaxBasis,
                withdrawTaxBasis: _withdrawTaxBasis,
                allocPoint: _allocPoint,
                lastRewardBlock: lastRewardBlock,
                accCzbPerShare: 0
            })
        );
    }

    function set(
        uint256 _pid,
        uint32 _allocPoint,
        uint16 _depositTaxBasis,
        uint16 _withdrawTaxBasis,
        bool _withUpdate
    ) public onlyOwner {
        if (_withUpdate) {
            massUpdatePools();
        }
        totalAllocPoint =
            totalAllocPoint -
            poolInfo[_pid].allocPoint +
            _allocPoint;
        poolInfo[_pid].allocPoint = _allocPoint;
        poolInfo[_pid].depositTaxBasis = _depositTaxBasis;
        poolInfo[_pid].withdrawTaxBasis = _withdrawTaxBasis;
    }

    function pendingCzb(uint256 _pid, address _user)
        external
        view
        returns (uint256)
    {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_user];
        uint256 accCzbPerShare = pool.accCzbPerShare;
        uint256 lpSupply = pool.lpToken.balanceOf(address(this));
        if (block.number > pool.lastRewardBlock && lpSupply != 0) {
            uint256 multiplier = getMultiplier(
                pool.lastRewardBlock,
                block.number
            );
            uint256 czbReward = (multiplier * czbPerBlock * pool.allocPoint) /
                totalAllocPoint;
            accCzbPerShare = (accCzbPerShare + czbReward * 1e12) / lpSupply;
        }
        return
            ((user.amount * accCzbPerShare) / 1e12) -
            user.rewardDebt +
            user.pendingRewards;
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
        uint256 czbReward = (multiplier * czbPerBlock * pool.allocPoint) /
            totalAllocPoint;

        czb.mint(address(this), czbReward);

        pool.accCzbPerShare =
            (pool.accCzbPerShare + czbReward * 1e12) /
            lpSupply;
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

        updatePool(_pid);
        if (user.amount > 0) {
            uint256 pending = ((user.amount * pool.accCzbPerShare) / 1e12) -
                user.rewardDebt;

            if (pending > 0) {
                user.pendingRewards = user.pendingRewards + pending;

                if (_withdrawRewards) {
                    safeCzbTransfer(_account, user.pendingRewards);
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
                "CZBlueMaster: Transfer failed"
            );
            user.amount = user.amount + _amount;
        }
        user.rewardDebt = (user.amount * pool.accCzbPerShare) / 1e12;
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

        require(user.amount >= _amount, "CZBlueMaster: balance too low");
        updatePool(_pid);
        uint256 pending = ((user.amount * pool.accCzbPerShare) / 1e12) -
            user.rewardDebt;
        if (pending > 0) {
            user.pendingRewards = user.pendingRewards + pending;

            if (_withdrawRewards) {
                safeCzbTransfer(_account, user.pendingRewards);
                emit Claim(_account, _pid, user.pendingRewards);
                user.pendingRewards = 0;
            }
        }
        if (_amount > 0) {
            user.amount = user.amount - _amount;
            require(
                pool.lpToken.transfer(_assetReceiver, _amount),
                "CZBlueMaster: Transfer failed"
            );
        }
        user.rewardDebt = (user.amount * pool.accCzbPerShare) / 1e12;
        emit Withdraw(_account, _pid, _amount);
    }

    function emergencyWithdraw(uint256 _pid) public {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][msg.sender];
        require(
            pool.lpToken.transfer(address(msg.sender), user.amount),
            "CZBlueMaster: Transfer failed"
        );
        emit EmergencyWithdraw(msg.sender, _pid, user.amount);
        user.amount = 0;
        user.rewardDebt = 0;
        user.pendingRewards = 0;
    }

    function claim(uint256 _pid) public {
        _claim(_pid, msg.sender);
    }

    function claimRoutabale(address _for, uint256 _pid) public {
        require(msg.sender == router);
        _claim(_pid, _for);
    }

    function _claim(uint256 _pid, address _for) internal {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_for];
        updatePool(_pid);
        uint256 pending = (user.amount * pool.accCzbPerShare) /
            1e12 -
            user.rewardDebt;
        if (pending > 0 || user.pendingRewards > 0) {
            user.pendingRewards = user.pendingRewards + pending;
            safeCzbTransfer(_for, user.pendingRewards);
            emit Claim(_for, _pid, user.pendingRewards);
            user.pendingRewards = 0;
        }
        user.rewardDebt = (user.amount * pool.accCzbPerShare) / 1e12;
    }

    function safeCzbTransfer(address _to, uint256 _amount) internal {
        uint256 czbBal = czb.balanceOf(address(this));
        if (_amount > czbBal) {
            czb.transfer(_to, czbBal);
        } else {
            czb.transfer(_to, _amount);
        }
    }

    function setCzbPerBlock(uint256 _czbPerBlock) public onlyOwner {
        require(_czbPerBlock > 0, "CZBlueMaster: czbPerBlock cannot be 0");
        czbPerBlock = _czbPerBlock;
    }

    function setRouter(address _router) public onlyOwner {
        router = _router;
    }
}
