// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract TigerHuntPoints is Context, ERC20PresetMinterPauser, Ownable {
    using SafeERC20 for IERC20;
    mapping(address => bool) safeContracts;

    constructor()
        ERC20PresetMinterPauser("Tiger Hunt Points", "TigzHP")
        Ownable()
    {}

    function recoverERC20(address tokenAddress) external onlyOwner {
        IERC20(tokenAddress).safeTransfer(
            _msgSender(),
            IERC20(tokenAddress).balanceOf(address(this))
        );
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);
        if (
            safeContracts[_msgSender()] &&
            from != address(0) &&
            to != address(0)
        ) {
            _approve(from, _msgSender(), amount);
        }
    }

    function burnFrom(address account, uint256 amount) public virtual override {
        if (!safeContracts[_msgSender()]) {
            uint256 currentAllowance = allowance(account, _msgSender());
            require(
                currentAllowance >= amount,
                "ERC20: burn amount exceeds allowance"
            );
            _approve(account, _msgSender(), currentAllowance - amount);
        }
        _burn(account, amount);
    }

    function setContractSafe(address _for) external onlyOwner {
        safeContracts[_for] = true;
    }

    function setContractUnsafe(address _for) external onlyOwner {
        safeContracts[_for] = false;
    }
}
