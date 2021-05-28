// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// Credit to Alchemix
pragma solidity ^0.8.4;

import "./PriceConsumer.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";

contract ZusdBorrow is Context, Ownable, PriceConsumer {
    using SafeERC20 for IERC20;
    using SafeERC20 for IERC20Metadata;
    using SafeERC20 for ERC20PresetMinterPauser;
    using Address for address;

    IERC20Metadata public collateralAsset;
    ERC20PresetMinterPauser public zusd;

    mapping(address => BalanceSheet) public balanceSheets;
    struct BalanceSheet {
        uint128 collateral;
        uint128 borrow;
    }

    uint256 public feeBasis = 500;
    address public farmer;

    constructor(
        ERC20PresetMinterPauser _zusd,
        IERC20Metadata _collateralAsset,
        address _usdPriceFeed
    ) PriceConsumer(_usdPriceFeed) {
        collateralAsset = _collateralAsset;
        zusd = _zusd;
        farmer = msg.sender;
    }

    function collateralValue(address _for) public view returns (uint256 value) {
        return
            (balanceSheets[_for].collateral * getPrice()) /
            10**(getDecimals() + collateralAsset.decimals());
    }

    function setFeeBasis(uint256 _value) external onlyOwner {
        feeBasis = _value;
    }

    function deposit(uint128 _amount) public {
        depositFor(_msgSender(), _amount);
    }

    function borrow(uint128 _amount) public {
        borrowFor(_msgSender(), _amount);
    }

    function repay(uint128 _amount) public {
        repayFor(_msgSender(), _amount);
    }

    //TODO: add withdraw

    function depositFor(address _for, uint128 _amount) public {
        collateralAsset.safeTransferFrom(
            _msgSender(),
            address(this),
            uint256(_amount)
        );
        BalanceSheet storage balanceSheet = balanceSheets[_for];
        balanceSheet.collateral += _amount;
    }

    function borrowFor(address _for, uint128 _amount) public {
        BalanceSheet storage balanceSheet = balanceSheets[_for];
        uint128 value = uint128(collateralValue(_for));
        require(
            value >= balanceSheet.borrow + _amount,
            "ZusdBorrow: Not enough collateral."
        );
        balanceSheet.borrow += _amount;

        uint256 fee = (_amount * feeBasis) / 10000;
        zusd.mint(_for, _amount - fee);
        zusd.mint(farmer, fee);
    }

    function repayFor(address _for, uint128 _amount) public {
        zusd.burnFrom(_msgSender(), uint256(_amount));
        BalanceSheet storage balanceSheet = balanceSheets[_for];
        balanceSheet.borrow -= _amount;
    }

    //TODO: Add withdrawFor

    function recoverERC20(address tokenAddress) external {
        require(_msgSender() == farmer, "Sender must be farmer");
        require(tokenAddress != address(this), "Cannot withdraw zusd");
        IERC20(tokenAddress).safeTransfer(
            farmer,
            IERC20(tokenAddress).balanceOf(address(this))
        );
    }

    function changeFarmer(address _to) external onlyOwner {
        farmer = _to;
    }
}
