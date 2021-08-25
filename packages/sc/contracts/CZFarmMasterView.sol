// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// Credit to Wex/WaultSwap, Synthetix
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "./interfaces/IAmmPair.sol";
import "./CZFarmMaster.sol";

contract CZFarmMasterView {
    using SafeMath for uint256;

    CZFarmMaster public czFarmMaster;
    IERC20 public czFarm;

    constructor(CZFarmMaster _czFarmMaster, IERC20 _czFarm) {
        czFarmMaster = _czFarmMaster;
        czFarm = _czFarm;
    }

    function poolLength() public view returns (uint256 poolLength_) {
        return czFarmMaster.poolLength();
    }

    function totalAllocPoint() public view returns (uint256 totalAllocPoint_) {
        return czFarmMaster.totalAllocPoint();
    }

    function startBlock() public view returns (uint256 startBlock_) {
        return czFarmMaster.startBlock();
    }

    function poolInfo(uint256 _pid)
        public
        view
        returns (
            IERC20 lpToken_,
            uint256 allocPoint_,
            uint256 lastRewardBlock_,
            uint256 accCzfPerShare_
        )
    {
        return czFarmMaster.poolInfo(_pid);
    }

    function userInfo(uint256 _pid, address _account)
        public
        view
        returns (
            uint256 amount_,
            uint256 rewardDebt_,
            uint256 pendingRewards_
        )
    {
        return czFarmMaster.userInfo(_pid, _account);
    }

    function pendingCzf(uint256 _pid, address _account)
        public
        view
        returns (uint256 pendingCzf_)
    {
        return czFarmMaster.pendingCzf(_pid, _account);
    }

    function lpCzfBalance(IAmmPair _lp) public view returns (uint256 _wad) {
        return czFarm.balanceOf(address(_lp));
    }

    function lpTotalSupply(IAmmPair _lp) public view returns (uint256 _wad) {
        return _lp.totalSupply();
    }

    function czFarmMasterLPBalance(IAmmPair _lp)
        public
        view
        returns (uint256 _wad)
    {
        return userLPBalance(_lp, address(czFarmMaster));
    }

    function userLPBalance(IAmmPair _lp, address _user)
        public
        view
        returns (uint256 _wad)
    {
        return _lp.balanceOf(_user);
    }

    function userLPAllowance(IAmmPair _lp, address _user)
        public
        view
        returns (uint256 _wad)
    {
        return _lp.allowance(_user, address(czFarmMaster));
    }

    function lpTokens(IAmmPair _lp)
        public
        view
        returns (address token0, address token1)
    {
        return (_lp.token0(), _lp.token1());
    }

    function tokenSymbol(IERC20Metadata _token)
        public
        view
        returns (string memory symbol_)
    {
        return _token.symbol();
    }
}
