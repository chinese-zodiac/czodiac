// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./interfaces/ICZVault.sol";
import "./interfaces/IBeltLP.sol";
import "./interfaces/IAmmRouter01.sol";
import "./interfaces/IAmmPair.sol";
import "./CZUsd.sol";
import "./CZFarm.sol";
import "./CZFarmMasterRoutable.sol";
import "./libs/Babylonian.sol";

contract CZVaultPeg is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    IBeltLP public belt4LP;
    IERC20 public belt4;
    IERC20 public busd;
    ICZVault public vault;
    CZUsd public czusd;
    CZFarm public czf;
    IAmmRouter01 public router;
    IAmmPair public czusdBusdPair;

    uint256 public maxDelta;

    uint128 public constant busdIndex = 3;

    uint256 public netBusd;

    uint256 public lastUpdate;
    uint256 public delaySeconds;
    uint256 public rewardMultiplier;

    constructor(
        IBeltLP _belt4LP,
        IERC20 _belt4,
        IERC20 _busd,
        ICZVault _vault,
        CZUsd _czusd,
        IAmmRouter01 _router,
        IAmmPair _czusdBusdPair,
        uint256 _maxDelta,
        CZFarm _czf,
        uint256 _delaySeconds,
        uint256 _rewardMultiplier
    ) {
        belt4LP = _belt4LP;
        belt4 = _belt4;
        busd = _busd;
        vault = _vault;
        czusd = _czusd;
        router = _router;
        czusdBusdPair = _czusdBusdPair;
        maxDelta = _maxDelta;
        lastUpdate = block.timestamp;
        czf = _czf;
        delaySeconds = _delaySeconds;
        rewardMultiplier = _rewardMultiplier;
    }

    function repeg() external whenNotPaused {
        czusdBusdPair.sync();
        uint256 lpCzusdWad = czusd.balanceOf(address(czusdBusdPair));
        uint256 lpBusdWad = busd.balanceOf(address(czusdBusdPair));
        uint256 delta;
        if (lpCzusdWad == lpBusdWad) return;
        if (lpCzusdWad < lpBusdWad) {
            //less CZUSD means CZUSD is too expensive
            delta = _correctOverPeg(lpCzusdWad, lpBusdWad);
        } else {
            //more CZUSD means CZUSD is too cheap
            delta = _correctUnderPeg(lpCzusdWad, lpBusdWad);
        }
        uint256 czfToMint = block.timestamp > lastUpdate + delaySeconds
            ? delta * rewardMultiplier
            : (delta * rewardMultiplier * (block.timestamp - lastUpdate)) /
                delaySeconds;
        czf.mint(msg.sender, czfToMint);
    }

    function _correctOverPeg(uint256 _lpCzusdWad, uint256 _lpBusdWad)
        internal
        returns (uint256 delta_)
    {
        require(_lpCzusdWad < _lpBusdWad, "CZVaultPeg: Not over peg");
        delta_ = Babylonian.sqrt(_lpCzusdWad * _lpBusdWad) - _lpCzusdWad;
        if (delta_ > maxDelta) delta_ = maxDelta;
        czusd.mint(address(this), delta_);
        address[] memory path = new address[](2);
        path[0] = address(czusd);
        path[1] = address(busd);
        router.swapExactTokensForTokens(
            delta_,
            0,
            path,
            address(this),
            block.timestamp
        );
        _depositBusd();
    }

    function _correctUnderPeg(uint256 _lpCzusdWad, uint256 _lpBusdWad)
        internal
        returns (uint256 delta_)
    {
        require(_lpCzusdWad > _lpBusdWad, "CZVaultPeg: Not under peg");
        delta_ = Babylonian.sqrt(_lpCzusdWad * _lpBusdWad) - _lpBusdWad;
        if (delta_ > maxDelta) delta_ = maxDelta;
        _withdrawBusd(delta_);
        address[] memory path = new address[](2);
        path[0] = address(busd);
        path[1] = address(czusd);
        router.swapExactTokensForTokens(
            delta_,
            0,
            path,
            address(this),
            block.timestamp
        );
        czusd.burn(czusd.balanceOf(address(this)));
    }

    function _depositBusd() internal {
        uint256[4] memory uamounts;
        uamounts[busdIndex] = busd.balanceOf(address(this));
        busd.approve(address(belt4LP), uamounts[busdIndex]);
        belt4LP.add_liquidity(uamounts, 0);
        uint256 _belt4Wad = belt4.balanceOf(address(this));
        belt4.approve(address(vault), _belt4Wad);
        vault.deposit(address(this), _belt4Wad);
        netBusd += uamounts[busdIndex];
    }

    function _withdrawBusd(uint256 _wad) internal {
        uint256 busdBeforeWithdraw = busd.balanceOf(address(this));
        belt4.approve(address(belt4LP), ~uint256(0));
        belt4LP.remove_liquidity_one_coin(_wad, int128(busdIndex), ~uint256(0));
        netBusd -= (busd.balanceOf(address(this)) - busdBeforeWithdraw);
    }

    function recoverERC20(address tokenAddress) external onlyOwner {
        IERC20(tokenAddress).safeTransfer(
            _msgSender(),
            IERC20(tokenAddress).balanceOf(address(this))
        );
    }

    function setPaused(bool _to) external onlyOwner {
        if (_to) {
            _pause();
        } else {
            _unpause();
        }
    }

    function setMaxDelta(uint256 _to) external onlyOwner {
        maxDelta = _to;
    }

    function setDelaySeconds(uint256 _to) external onlyOwner {
        delaySeconds = _to;
    }

    function setRewardMultiplier(uint256 _to) external onlyOwner {
        rewardMultiplier = _to;
    }
}
