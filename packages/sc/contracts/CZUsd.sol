// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract ZUSD is Context, ERC20PresetMinterPauser, Ownable {
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

    //Farmer
    address public farmer;

    event WithdrawRequest(address user, uint256 amount);
    event UpdateRewardPerSecond(uint256 valueWad, uint256 period);
    event RewardAdded(uint256 reward);

    constructor(
        string memory _name,
        string memory _symbol,
        address _farmer,
        IERC20 _busd
    ) ERC20PresetMinterPauser(_name, _symbol) Ownable() {
        busd = _busd;
        farmer = _farmer;
    }

    function deposit(uint256 _wadBusd) external {
        _mint(_msgSender(), _wadBusd);
        busd.safeTransferFrom(_msgSender(), address(this), _wadBusd);
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

    function recoverERC20(address tokenAddress) external {
        require(_msgSender() == farmer, "Sender must be farmer");
        require(tokenAddress != address(this), "Cannot withdraw zusd");
        IERC20(tokenAddress).safeTransfer(
            farmer,
            IERC20(tokenAddress).balanceOf(address(this))
        );
    }

    function _fillRequest(address _for) internal {
        Withdraws storage withdraws = userWithdraws[_for];
        uint256 amount = withdraws.request.sub(withdraws.fill);
        withdraws.fill = amount;
        busd.safeTransferFrom(_msgSender(), _for, amount);
    }
}
