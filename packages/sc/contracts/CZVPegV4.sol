// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.4;
//import "hardhat/console.sol";

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./interfaces/IAmmRouter01.sol";
import "./interfaces/IAmmPair.sol";
import "./interfaces/ICurve.sol";
import "./CZUsd.sol";
import "./libs/Babylonian.sol";

contract CZVPegV3 is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    enum PEG_STATUS {
        under,
        over,
        on
    }

    IERC20 public busd = IERC20(0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56);
    CZUsd public czusd = CZUsd(0xE68b79e51bf826534Ff37AA9CeE71a3842ee9c70);
    ICurve public czusdBusdPairEps =
        ICurve(0x4d9508257Af7442827951f30dbFe3ee2a04ADCeE);
    IAmmRouter01 public router =
        IAmmRouter01(0x10ED43C718714eb63d5aA57B78B54704E256024E);
    IAmmPair public czusdBusdPair =
        IAmmPair(0xd7C6Fc00FAe64cb7D242186BFD21e31C5b175671);
    address public treasury = 0x745A676C5c472b50B50e18D4b59e9AeEEc597046;

    uint256 public minUniswapDelta = 100 ether;
    uint256 public minEllipsisDelta = 1000 ether;
    uint256 public maxEllipsisDelta = 10000 ether;
    uint256 public feeBasisUniswap = 25;
    uint256 public constant goldenRatio = 1618033999749;
    uint256 public constant precision = 1000000000000;

    function repeg(uint8 _ellipsisMaxIter) external whenNotPaused {
        (
            uint256 ellipsisUsd,
            PEG_STATUS ellipsisPegStatus
        ) = getEllipsisRepegWad(_ellipsisMaxIter);
        (
            uint256 pancakeswapUsd,
            PEG_STATUS pancakeswapPegStatus
        ) = getPancakeswapRepegWad();
        uint256 requiredCzusd;
        uint256 requiredBusd;
        if (ellipsisPegStatus == PEG_STATUS.over) {
            requiredCzusd += ellipsisUsd;
        }
        if (ellipsisPegStatus == PEG_STATUS.under) {
            requiredBusd += ellipsisUsd;
        }
        if (pancakeswapPegStatus == PEG_STATUS.over) {
            requiredCzusd += pancakeswapUsd;
        }
        if (pancakeswapPegStatus == PEG_STATUS.under) {
            requiredBusd += pancakeswapUsd;
        }
        if (requiredCzusd > 0) czusd.mint(address(this), requiredCzusd);
        if (requiredBusd > 0)
            busd.transferFrom(treasury, address(this), requiredBusd);
    }

    function getLpWadsPancakeswap()
        public
        view
        returns (uint256 lpCzusdWad_, uint256 lpBusdWad_)
    {
        lpCzusdWad_ = czusd.balanceOf(address(czusdBusdPair));
        lpBusdWad_ = busd.balanceOf(address(czusdBusdPair));
    }

    function getEllipsisRepegWad(uint8 _maxIter)
        public
        view
        returns (uint256 usdWad_, PEG_STATUS pegStatus_)
    {
        pegStatus_ = getEllipsisPegStatus();
        if (pegStatus_ == PEG_STATUS.over) {
            return (getEllipsisMaxProfitInput(0, 1, _maxIter), pegStatus_);
        }
        if (pegStatus_ == PEG_STATUS.under) {
            return (getEllipsisMaxProfitInput(1, 0, _maxIter), pegStatus_);
        }
        if (pegStatus_ == PEG_STATUS.on) {
            return (0, pegStatus_);
        }
    }

    function getEllipsisMaxProfitInput(
        uint8 _i,
        uint8 _j,
        uint8 _maxIter
    ) public view returns (uint256 wad_) {
        //search by golden ratio
        uint256 a = minEllipsisDelta;
        uint256 b = maxEllipsisDelta;
        uint256 c = b - (((b - a) * precision) / goldenRatio);
        uint256 d = a + (((b - a) * precision) / goldenRatio);
        uint256 iter = 0;
        while (b - a > 0 && iter < _maxIter) {
            int256 fc = getEllipsisProfit(_i, _j, c);
            int256 fd = getEllipsisProfit(_i, _j, d);
            if (fc > fd) {
                b = d;
            } else {
                a = c;
            }
            c = b - (((b - a) * precision) / goldenRatio);
            d = a + (((b - a) * precision) / goldenRatio);
            iter++;
        }
        return a;
    }

    function getEllipsisPegStatus() public view returns (PEG_STATUS pegStatus) {
        uint256 dyOver = czusdBusdPairEps.get_dy(0, 1, minEllipsisDelta);
        uint256 dyUnder = czusdBusdPairEps.get_dy(1, 0, minEllipsisDelta);
        if (dyOver > minEllipsisDelta) return PEG_STATUS.over;
        if (dyUnder > minEllipsisDelta) return PEG_STATUS.under;
        return PEG_STATUS.on;
    }

    function getEllipsisProfit(
        uint8 i,
        uint8 j,
        uint256 _delta
    ) public view returns (int256 _profit) {
        uint256 dyOver = czusdBusdPairEps.get_dy(
            int128(int8(i)),
            int128(int8(j)),
            _delta
        );
        return (int256(dyOver) - int256(_delta));
    }

    function getPancakeswapPegStatus()
        public
        view
        returns (PEG_STATUS pegStatus_)
    {
        (uint256 lpCzusdWad, uint256 lpBusdWad) = getLpWadsPancakeswap();
        if (lpBusdWad < lpCzusdWad) {
            if (lpBusdWad < lpCzusdWad + minUniswapDelta) {
                pegStatus_ = PEG_STATUS.on;
            } else {
                pegStatus_ = PEG_STATUS.under;
            }
        } else if (lpCzusdWad < lpBusdWad) {
            if (lpCzusdWad < lpBusdWad + minUniswapDelta) {
                pegStatus_ = PEG_STATUS.on;
            } else {
                pegStatus_ = PEG_STATUS.over;
            }
        } else {
            pegStatus_ = PEG_STATUS.on;
        }
    }

    function getPancakeswapRepegWad()
        public
        view
        returns (uint256 usdWad_, PEG_STATUS pegStatus_)
    {
        pegStatus_ = getPancakeswapPegStatus();
        if (pegStatus_ == PEG_STATUS.on) {
            return (0, pegStatus_);
        }
        (uint256 lpCzusdWad, uint256 lpBusdWad) = getLpWadsPancakeswap();
        if (pegStatus_ == PEG_STATUS.over) {
            return (
                ((Babylonian.sqrt(lpCzusdWad * lpBusdWad) - lpCzusdWad) *
                    20000) / (20000 - feeBasisUniswap),
                pegStatus_
            );
        }
        if (pegStatus_ == PEG_STATUS.under) {
            return (
                ((Babylonian.sqrt(lpCzusdWad * lpBusdWad) - lpBusdWad) *
                    20000) / (20000 - feeBasisUniswap),
                pegStatus_
            );
        }
    }

    function _correctOverPegUniswap(uint256 _czusdWadToSell) internal {
        address[] memory path = new address[](2);
        path[0] = address(czusd);
        path[1] = address(busd);
        czusd.approve(address(router), _czusdWadToSell);
        router.swapExactTokensForTokens(
            _czusdWadToSell,
            _czusdWadToSell,
            path,
            treasury,
            block.timestamp
        );
    }

    function _correctUnderPegUniswap(uint256 _busdWadToSell) internal {
        address[] memory path = new address[](2);
        path[0] = address(busd);
        path[1] = address(czusd);
        busd.approve(address(router), _busdWadToSell);
        router.swapExactTokensForTokens(
            _busdWadToSell,
            _busdWadToSell,
            path,
            treasury,
            block.timestamp
        );
    }

    function _correctOverPegEllipsis(uint256 _czusdWadToSell) internal {
        czusd.approve(address(czusdBusdPairEps), _czusdWadToSell);
        czusdBusdPairEps.exchange(0, 1, _czusdWadToSell, _czusdWadToSell);
    }

    function _correctUnderPegEllipsis(uint256 _busdWadToSell) internal {
        busd.approve(address(czusdBusdPairEps), _busdWadToSell);
        czusdBusdPairEps.exchange(1, 0, _busdWadToSell, _busdWadToSell);
    }

    function recoverERC20(address tokenAddress) external onlyOwner {
        IERC20(tokenAddress).safeTransfer(
            treasury,
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
}
