// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetFixedSupply.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract CZDaoToken is Context, Ownable, ERC20PresetFixedSupply {
    using SafeERC20 for IERC20;

    uint256 public constant FEE_BASIS = 49; //Multiplied by two, half is burned half to rewards
    address public farmMaster;
    mapping(address => bool) public taxExempt;

    constructor()
        ERC20PresetFixedSupply("CZDao", "CZD", 10000000 ether, msg.sender)
        Ownable()
    {}

    function recoverERC20(address tokenAddress) external onlyOwner {
        IERC20(tokenAddress).safeTransfer(
            _msgSender(),
            IERC20(tokenAddress).balanceOf(address(this))
        );
    }

    function setFarmMaster(address _to) external onlyOwner {
        farmMaster = _to;
    }

    function setTaxExempt(address _for, bool _to) external onlyOwner {
        taxExempt[_for] = _to;
    }

    function transfer(address recipient, uint256 amount)
        public
        virtual
        override
        returns (bool)
    {
        _transferWithTax(_msgSender(), recipient, amount);
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public virtual override returns (bool) {
        _transferWithTax(sender, recipient, amount);

        uint256 currentAllowance = allowance(sender, _msgSender());
        require(
            currentAllowance >= amount,
            "ERC20: transfer amount exceeds allowance"
        );
        unchecked {
            _approve(sender, _msgSender(), currentAllowance - amount);
        }

        return true;
    }

    function _transferWithTax(
        address sender,
        address recipient,
        uint256 amount
    ) internal {
        if (taxExempt[sender] || taxExempt[recipient]) {
            _transfer(_msgSender(), recipient, amount);
        } else {
            uint256 feeAmount = (amount * FEE_BASIS) / 10000;
            uint256 postFeeAmount = amount - feeAmount * 2;
            _transfer(_msgSender(), recipient, postFeeAmount);
            _transfer(_msgSender(), farmMaster, feeAmount);
            _burn(_msgSender(), feeAmount);
        }
    }
}
