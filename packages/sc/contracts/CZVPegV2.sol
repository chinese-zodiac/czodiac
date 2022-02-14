// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.4;
//import "hardhat/console.sol";

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./interfaces/ICZVault.sol";
import "./interfaces/IBeltLP.sol";
import "./interfaces/IAmmRouter01.sol";
import "./interfaces/IAmmPair.sol";
import "./interfaces/ICurve.sol";
import "./interfaces/IMetaPool.sol";
import "./CZUsd.sol";
import "./CZFarm.sol";
import "./CZFarmMasterRoutable.sol";
import "./libs/Babylonian.sol";

contract CZVPegV2 is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    IBeltLP public belt4LP;
    IERC20 public belt4;
    IERC20 public busd;
    ICZVault public vault;
    CZUsd public czusd;
    CZFarm public czf;
    ICurve public basePool;
    IERC20 public basePoolToken;
    IMetaPool public metaPool;
    IAmmRouter01 public router;
    IAmmPair public czusdBusdPair;

    uint128 public constant busdBeltFarmIndex = 3;
    int128 public constant busdMetaPoolIndex = 1;

    uint256 public busdAutoDepositLevel = 10000 ether;
    uint256 public minUniswapDelta = 10 ether;

    uint256 public withdrawBusdMultiplierBasis;
    uint256 public feeBasisUniswap;

    constructor(
        IBeltLP _belt4LP,
        IERC20 _belt4,
        IERC20 _busd,
        ICZVault _vault,
        CZUsd _czusd,
        ICurve _basePool,
        IERC20 _basePoolToken,
        IMetaPool _metaPool,
        CZFarm _czf,
        IAmmRouter01 _router,
        IAmmPair _czusdBusdPair,
        uint256 _feeBasisUniswap
    ) {
        belt4LP = _belt4LP;
        belt4 = _belt4;
        busd = _busd;
        vault = _vault;
        czusd = _czusd;
        basePool = _basePool;
        basePoolToken = _basePoolToken;
        metaPool = _metaPool;
        czf = _czf;
        router = _router;
        czusdBusdPair = _czusdBusdPair;
        feeBasisUniswap = _feeBasisUniswap;
    }

    function repeg(uint256 _usdEllipsis, bool isOverPeg)
        external
        whenNotPaused
    {
        if (isOverPeg) {
            _repegDown(_usdEllipsis);
        } else {
            _repegUp(_usdEllipsis);
        }
        if (busd.balanceOf(address(this)) > busdAutoDepositLevel) {
            _depositBusd();
        }
        czusd.burn(czusd.balanceOf(address(this)));
    }

    function _repegDown(uint256 _usdEllipsis) internal {
        uint256 usdUniswap = _getOverPegUniswapDelta();
        uint256 czusdWadToMint = _usdEllipsis + usdUniswap;
        if (czusdWadToMint == 0) return;
        czusd.mint(address(this), czusdWadToMint);
        if (usdUniswap > 0) {
            _correctOverPegUniswap(usdUniswap);
        }
        if (_usdEllipsis > 0) {
            _correctOverPegEllipsis(_usdEllipsis);
        }
    }

    function _repegUp(uint256 _usdEllipsis) internal {
        uint256 usdUniswap = _getUnderPegUniswapDelta();
        uint256 busdRequired = usdUniswap + _usdEllipsis;
        uint256 busdBalance = busd.balanceOf(address(this));
        if (busdBalance < busdRequired) {
            _withdrawBusd(busdRequired - busdBalance);
        }
        busdBalance = busd.balanceOf(address(this));
        if (usdUniswap > busdBalance) usdUniswap = busdBalance;
        if (usdUniswap > 0) {
            _correctUnderPegUniswap(usdUniswap);
        }
        busdBalance = busd.balanceOf(address(this));
        if (_usdEllipsis > busdBalance) _usdEllipsis = busdBalance;
        if (_usdEllipsis > 0) {
            _correctUnderPegEllipsis(_usdEllipsis);
        }
    }

    function getLpWadsEllipsis()
        public
        view
        returns (uint256 lpCzusdWad_, uint256 lpUsdWad_)
    {
        uint256 virtualPrice = basePool.get_virtual_price();
        lpCzusdWad_ = czusd.balanceOf(address(metaPool));
        lpUsdWad_ =
            (basePoolToken.balanceOf(address(metaPool)) * virtualPrice) /
            1 ether;
    }

    function getLpWadsPancakeswap()
        public
        view
        returns (uint256 lpCzusdWad_, uint256 lpBusdWad_)
    {
        lpCzusdWad_ = czusd.balanceOf(address(czusdBusdPair));
        lpBusdWad_ = busd.balanceOf(address(czusdBusdPair));
    }

    function _correctOverPegEllipsis(uint256 _czusdWadToSell) internal {
        (uint256 lpCzusdWad, uint256 lpBusdWad) = getLpWadsEllipsis();
        require(lpCzusdWad < lpBusdWad, "CZVPeg: Wrong Repeg Direction");
        czusd.approve(address(metaPool), _czusdWadToSell);
        metaPool.exchange_underlying(
            0,
            busdMetaPoolIndex,
            _czusdWadToSell,
            _czusdWadToSell
        );
        (lpCzusdWad, lpBusdWad) = getLpWadsEllipsis();
        require(lpCzusdWad <= lpBusdWad, "CZVPeg: Overcorrection");
    }

    function _correctUnderPegEllipsis(uint256 _busdWadToSell) internal {
        (uint256 lpCzusdWad, uint256 lpBusdWad) = getLpWadsEllipsis();
        require(lpCzusdWad > lpBusdWad, "CZVPeg: Wrong Repeg Direction");

        require(
            busd.balanceOf(address(this)) >= _busdWadToSell,
            "CZVPeg: Not enough BUSD"
        );

        busd.approve(address(metaPool), _busdWadToSell);
        metaPool.exchange_underlying(
            busdMetaPoolIndex,
            0,
            _busdWadToSell,
            _busdWadToSell
        );

        (lpCzusdWad, lpBusdWad) = getLpWadsEllipsis();
        require(lpCzusdWad >= lpBusdWad, "CZVPeg: Overcorrection");
    }

    function _getOverPegUniswapDelta() internal view returns (uint256 delta_) {
        (uint256 lpCzusdWad, uint256 lpBusdWad) = getLpWadsPancakeswap();
        if (lpCzusdWad >= lpBusdWad) return 0;
        if (lpBusdWad - lpCzusdWad < minUniswapDelta) return 0; //Ignore repeg if delta too small.
        //This delta calculation adjusts the czusd to sell for the fees,
        //divide correct amount by 1-fee/2, since using bassis points use 20000
        //Rounding errors mean this will never be perfect, but overcorections are prevented.
        delta_ =
            ((Babylonian.sqrt(lpCzusdWad * lpBusdWad) - lpCzusdWad) * 20000) /
            (20000 - feeBasisUniswap);
        (lpCzusdWad, lpBusdWad) = getLpWadsPancakeswap();
        require(lpCzusdWad <= lpBusdWad, "CZVPeg: Overcorrection");
    }

    function _getUnderPegUniswapDelta() internal view returns (uint256 delta_) {
        (uint256 lpCzusdWad, uint256 lpBusdWad) = getLpWadsPancakeswap();
        if (lpCzusdWad <= lpBusdWad) return 0;
        if (lpCzusdWad - lpBusdWad < minUniswapDelta) return 0; //Ignore repeg if delta too small.
        //This delta calculation adjusts the busd to sell for the fees,
        //divide correct amount by 1-fee/2, since using bassis points use 20000
        //Rounding errors mean this will never be perfect, but overcorections are prevented.
        delta_ =
            ((Babylonian.sqrt(lpCzusdWad * lpBusdWad) - lpBusdWad) * 20000) /
            (20000 - feeBasisUniswap);
        (lpCzusdWad, lpBusdWad) = getLpWadsPancakeswap();
        require(lpCzusdWad >= lpBusdWad, "CZVPeg: Overcorrection");
    }

    function _correctOverPegUniswap(uint256 _czusdWadToSell) internal {
        address[] memory path = new address[](2);
        path[0] = address(czusd);
        path[1] = address(busd);
        czusd.approve(address(router), _czusdWadToSell);
        uint256 amountOut = router.getAmountsOut(_czusdWadToSell, path)[1];
        if (amountOut < _czusdWadToSell) return;
        router.swapExactTokensForTokens(
            _czusdWadToSell,
            _czusdWadToSell,
            path,
            address(this),
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
            address(this),
            block.timestamp
        );
    }

    function _depositBusd() internal {
        uint256[4] memory uamounts;
        uamounts[busdBeltFarmIndex] = busd.balanceOf(address(this));
        busd.approve(address(belt4LP), uamounts[busdBeltFarmIndex]);
        belt4LP.add_liquidity(uamounts, 0);
        uint256 belt4Wad = belt4.balanceOf(address(this));
        belt4.approve(address(vault), belt4Wad);
        vault.deposit(address(this), belt4Wad);
    }

    function depositBusd() external whenNotPaused {
        _depositBusd();
    }

    function _withdrawBusd(uint256 _wad) internal {
        uint256 vaultBal = vault.balanceOf(address(this));
        if (vaultBal == 0) return;
        uint256 withdrawRequest = (_wad *
            (10000 + withdrawBusdMultiplierBasis)) / 10000;
        uint256 withdrawAmount = vaultBal < withdrawRequest
            ? vaultBal
            : withdrawRequest;
        vault.withdraw(address(this), withdrawAmount);

        uint256 belt4Bal = belt4.balanceOf(address(this));
        belt4.approve(address(belt4LP), belt4Bal);
        belt4LP.remove_liquidity_one_coin(
            belt4Bal,
            int128(busdBeltFarmIndex),
            0
        );
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

    function setWithdrawBusdMultiplierBasis(uint256 _to) external onlyOwner {
        withdrawBusdMultiplierBasis = _to;
    }

    function setBusdAutoDepositLevel(uint256 _to) external onlyOwner {
        busdAutoDepositLevel = _to;
    }

    function setMinUniswapDelta(uint256 _to) external onlyOwner {
        minUniswapDelta = _to;
    }
}
