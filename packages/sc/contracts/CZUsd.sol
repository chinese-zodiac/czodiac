// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";

contract CZUsd is Context, ERC20PresetMinterPauser, Ownable {
    using Address for address;

    IERC20 private busd;

    //Backing
    uint256 totalBusdBacking;

    //Withdraws
    mapping(uint256 => Withdraws) private userWithdraws;
    struct Withdraws {
        uint256 request;
        address requester;
        bool isFilled;
    }
    uint256 public totalWithdraws;

    //BUSD Farmer
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
        require(busd.transferFrom(_msgSender(), farmer, _wadBusd),"CZUsd: busd transfer failed");
        _mint(_msgSender(), _wadBusd);
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
        if(busd.balanceOf(address(this)) >= _wadZusd)
            _fillRequest(totalWithdraws - 1, address(this));
    }

    function fillAllRequests() external {
        fillRequests(0,totalWithdraws);
    }

    function fillRequests(uint256 start, uint256 finish) public {
        for (uint256 i; i < finish-start; i++) {
            _fillRequest(i + start,_msgSender());
        }
    }

    function fillSpecificRequest(uint256 _id) external {
        _fillRequest(_id,_msgSender());
    }

    function recoverERC20(address tokenAddress) external onlyOwner {
        require(IERC20(tokenAddress).transfer(
            owner(),
            IERC20(tokenAddress).balanceOf(address(this))
        ),"CZUsd: Recover failed.");
    }

    function setTotalBusdBacking(uint256 _wad) external {
        require(_msgSender() == farmer, "CZUsd: Sender must be farmer");
        totalBusdBacking = _wad;
    }

    function setFarmer(address _farmer) external {
        require(_msgSender() == farmer || _msgSender() == owner(), "CZUsd: Sender must be farmer");
        farmer = _farmer;
    }

    function totalBusdWithdrawsRequested() public view {
        uint256 total;
        for (uint256 i; i < totalWithdraws; i++) {
            if(!userWithdraws[i].isFilled)
                total += userWithdraws[i].request;
        }
    }

    function _fillRequest(uint256 _id, address _by) internal {
        Withdraws storage withdraws = userWithdraws[_id];
        if(withdraws.isFilled == true) return;
        withdraws.isFilled = true;
        require(busd.transferFrom(_by, withdraws.requester, withdraws.request),"CZUsd: busd transfer failed");
        emit FillRequest(_id);
    }
}
