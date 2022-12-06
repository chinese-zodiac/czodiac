// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IBlacklist.sol";

contract BlacklistBasic is IBlacklist, Ownable {
    mapping(address => bool) public override isBlacklisted;

    function setIsBoostEligibeToTrue(address[] calldata _accounts)
        external
        onlyOwner
    {
        for (uint256 i = 0; i < _accounts.length; i++) {
            isBlacklisted[_accounts[i]] = true;
        }
    }

    function setIsBoostEligibeToFalse(address[] calldata _accounts)
        external
        onlyOwner
    {
        for (uint256 i = 0; i < _accounts.length; i++) {
            isBlacklisted[_accounts[i]] = false;
        }
    }

    function recoverERC20(address tokenAddress) external onlyOwner {
        IERC20(tokenAddress).transfer(
            _msgSender(),
            IERC20(tokenAddress).balanceOf(address(this))
        );
    }
}
