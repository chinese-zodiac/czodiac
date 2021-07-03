// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// Credit to Alchemix
pragma solidity ^0.8.4;

import "./interfaces/IPairOracle.sol";
import "./PriceConsumer.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";

contract CZUsdBorrow is Context, Ownable, PriceConsumer {
    using SafeERC20 for IERC20;
    using SafeERC20 for IERC20Metadata;
    using SafeERC20 for ERC20PresetMinterPauser;
    using Address for address;

    IERC20Metadata public collateralAsset;
    ERC20PresetMinterPauser public czusd;
    ERC20PresetMinterPauser public czfarm;
    IPairOracle public czfarmCzusdOracle;
    address public strategy;

    uint public liquidationDelay;
    uint public czFarmMultiplier;
    uint public globalBorrowLimit;

    mapping(address => BalanceSheet) public balanceSheets;
    struct BalanceSheet {
        uint collateral;
        uint czfarm;
        uint borrow;
        uint128 seizeTime;
    }

    uint public totalCollateral;
    uint public totalCzfarm;
    uint public totalBorrow;

    constructor(
        ERC20PresetMinterPauser _czusd,
        ERC20PresetMinterPauser _czfarm,
        IERC20Metadata _collateralAsset,
        IPairOracle _czfarmCzusdOracle,
        address _linkUsdPriceFeed,
        address _strategy,
        uint _liquidationDelay,
        uint _czFarmMultiplier,
        uint _globalBorrowLimit
    ) PriceConsumer(_linkUsdPriceFeed) {
        collateralAsset = _collateralAsset;
        czusd = _czusd;
        czfarm = _czfarm;
        czfarmCzusdOracle = _czfarmCzusdOracle;
        liquidationDelay = _liquidationDelay;
        czFarmMultiplier = _czFarmMultiplier;
        globalBorrowLimit = _globalBorrowLimit;
        setStrategy(_strategy);
    }

    function baseCollateralUsdWad(address _for) public view returns (uint256 value) {
        return (balanceSheets[_for].collateral * getPrice()) / 10**getDecimals();
    }

    function czFarmUsdWad(address _for) public view returns (uint256 value) {
        uint czfarmWad = balanceSheets[_for].czfarm;
        return Math.min(
            czfarmCzusdOracle.consultPair(address(czfarm),czfarmWad),
            czfarmCzusdOracle.consultTwap(address(czfarm),czfarmWad)
        );
    }

    function totalCollateralUsdWad(address _for) public view returns (uint256 value) {
        return czFarmUsdWad(_for) + baseCollateralUsdWad(_for);
    }

    function maxBorrowFromCZFarmMultiplier(address _for) public view returns (uint256 value) {
        return czFarmUsdWad(_for) * czFarmMultiplier;
    }

    function maxBorrow(address _for) public view returns (uint256 value) {
        return Math.min(
            totalCollateralUsdWad(_for),
            maxBorrowFromCZFarmMultiplier(_for)
        );
    }

    function isInGoodStanding(address _for) public view returns (bool hasGoodStanding) {
        return maxBorrow(_for) < balanceSheets[_for].borrow;
    }

    function deposit(uint _amount) public {
        depositFor(_msgSender(), _amount);
    }

    function depositCZFarm(uint _amount) public {
        depositCZFarmFor(_msgSender(), _amount);
    }

    function borrow(uint _amount) public {
        czfarmCzusdOracle.update();
        BalanceSheet storage balanceSheet = balanceSheets[_msgSender()];
        balanceSheet.borrow += _amount;
        czusd.mint(_msgSender(), _amount);
        totalBorrow += _amount;
        require(totalBorrow < globalBorrowLimit, "Borrow exceeds global limit");
        require(isInGoodStanding(_msgSender()), "Account not in good standing.");
    }

    function repay(uint _amount) public {
        repayFor(_msgSender(), _amount);
    }

    function withdraw(uint _amount) public {
        czfarmCzusdOracle.update();
        BalanceSheet storage balanceSheet = balanceSheets[_msgSender()];
        collateralAsset.safeTransferFrom(
            address(strategy),
            _msgSender(),
            uint256(_amount)
        );
        balanceSheet.collateral -= _amount;
        totalCollateral -= _amount;
        require(isInGoodStanding(_msgSender()), "Account not in good standing.");
    }

    function withdrawCZFarm(uint _amount) public {
        czfarmCzusdOracle.update();
        BalanceSheet storage balanceSheet = balanceSheets[_msgSender()];
        czfarm.safeTransferFrom(
            address(strategy),
            _msgSender(),
            uint256(_amount)
        );
        balanceSheet.czfarm -= _amount;
        totalCzfarm -= _amount;
        require(isInGoodStanding(_msgSender()), "Account not in good standing.");
    }

    function depositFor(address _for, uint _amount) public {
        czfarmCzusdOracle.update();
        collateralAsset.safeTransferFrom(
            _msgSender(),
            address(strategy),
            uint256(_amount)
        );
        BalanceSheet storage balanceSheet = balanceSheets[_for];
        balanceSheet.collateral += _amount;
        totalCollateral += _amount;
    }

    function depositCZFarmFor(address _for, uint _amount) public {
        czfarmCzusdOracle.update();
        czfarm.safeTransferFrom(
            _msgSender(),
            address(strategy),
            uint256(_amount)
        );
        BalanceSheet storage balanceSheet = balanceSheets[_for];
        balanceSheet.czfarm += _amount;
        totalCzfarm += _amount;
    }

    function repayFor(address _for, uint _amount) public {
        czfarmCzusdOracle.update();
        czusd.burnFrom(_msgSender(), _amount);
        BalanceSheet storage balanceSheet = balanceSheets[_for];
        balanceSheet.borrow -= _amount;
        totalBorrow -= _amount;
    }
    
    function seizeStart(address[] calldata _for) external onlyOwner {
        czfarmCzusdOracle.update();
        for(uint i; i<_for.length; i++){
            address acc = _for[i];
            BalanceSheet storage balanceSheet = balanceSheets[acc];
            require(!isInGoodStanding(acc), "Cannot seize account in good standing");
            balanceSheet.seizeTime = uint128(block.timestamp + liquidationDelay);
        }
    }

    function seizeCancel(address[] calldata _for) external onlyOwner {
        for(uint i; i<_for.length; i++){
            address acc = _for[i];
            BalanceSheet storage balanceSheet = balanceSheets[acc];
            balanceSheet.seizeTime = 0;
        }
    }

    function seize(address[] calldata _for) external onlyOwner {
        czfarmCzusdOracle.update();
        for(uint i; i<_for.length; i++){
            address acc = _for[i];
            BalanceSheet storage balanceSheet = balanceSheets[acc];
            require(0 < balanceSheet.seizeTime, "Must have warned user");
            require(!isInGoodStanding(acc), "Cannot seize account in good standing");
            require(block.timestamp >= balanceSheet.seizeTime, "Must be past seize time");
            totalBorrow -= balanceSheet.borrow;
            totalCzfarm -= balanceSheet.czfarm;
            totalCollateral -= balanceSheet.collateral;
            balanceSheet.seizeTime = 0;
            balanceSheet.collateral = 0;
            balanceSheet.czfarm = 0;
            balanceSheet.borrow = 0;
        }
    }

    function recoverERC20(address tokenAddress) external onlyOwner {
        IERC20(tokenAddress).safeTransfer(
            _msgSender(),
            IERC20(tokenAddress).balanceOf(address(this))
        );
    }

    function setStrategy(address _to) public onlyOwner {
        czfarm.approve(strategy,0);
        czusd.approve(strategy,0);
        strategy = _to;
        czfarm.approve(strategy,~uint(0));
        czusd.approve(strategy,~uint(0));
    }

    function setCzFarmMultiplier(uint _to) public onlyOwner {
        czFarmMultiplier = _to;
    }

    function setLiquidationDelay(uint _to) public onlyOwner {
        liquidationDelay = _to;
    }

    function setGlobalBorrowLimit(uint _to) public onlyOwner {
        globalBorrowLimit = _to;
    }
}
