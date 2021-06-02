// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract ZUSD is Context, ERC20PresetMinterPauser, Ownable {
    using SafeERC20 for IERC20;
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
    mapping(uint256 => Withdraws) private userWithdraws;
    struct Withdraws {
        uint256 request;
        address requester;
        bool isFilled;
    }
    uint256 public totalWithdraws;
    uint256 public totalWithdrawsFilled;

    //Farmer
    address public farmer;

    event WithdrawRequest(address user, uint256 id, uint256 amount);
    event FillRequest(uint256 id);
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
        busd.safeTransferFrom(_msgSender(), farmer, _wadBusd);
    }

    function withdrawRequest(uint256 _wadZusd) external {
        require(
            _wadZusd >= 10 ether,
            "CZUsd: Must request a minimum of 10 zusd"
        );
        _burn(_msgSender(), _wadZusd);
        Withdraws storage withdraws = userWithdraws[totalWithdraws];
        withdraws.request = _wadZusd;
        withdraws.requester = _msgSender();
        totalWithdraws++;
        emit WithdrawRequest(_msgSender(), totalWithdraws - 1, _wadZusd);
    }

    function fillAllRequests() external {
        fillRequests(totalWithdraws - totalWithdrawsFilled);
    }

    function fillRequests(uint256 count) public {
        for (uint256 i; i < count; i++) {
            _fillRequest(i + totalWithdrawsFilled);
        }
    }

    function fillSpecificRequest(uint256 _id) external {
        _fillRequest(_id);
    }

    function recoverERC20(address tokenAddress) external onlyOwner {
        IERC20(tokenAddress).safeTransfer(
            owner(),
            IERC20(tokenAddress).balanceOf(address(this))
        );
    }

    function totalBusdWithdrawsRequested() public view {
        uint256 total;
        for (uint256 i; i < totalWithdrawsFilled + totalWithdraws; i++) {
            total += userWithdraws[i].request;
        }
    }

    function _fillRequest(uint256 _id) internal {
        Withdraws storage withdraws = userWithdraws[_id];
        require(withdraws.isFilled == false, "CZUsd: Request already filled");
        withdraws.isFilled == true;
        busd.safeTransferFrom(
            _msgSender(),
            withdraws.requester,
            withdraws.request
        );
        totalWithdrawsFilled++;
        emit FillRequest(_id);
    }
}
