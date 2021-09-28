// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./interfaces/ICZVault.sol";
import "./CZFarmMasterRoutable.sol";

contract CZVaultRouter is Context, Ownable {
    using SafeERC20 for IERC20;

    function depositAndStake(
        CZFarmMasterRoutable _master,
        uint256 _pid,
        uint256 _wad
    ) external {
        (IERC20 vaultAddress, , , ) = _master.poolInfo(_pid);
        ICZVault vault = ICZVault(address(vaultAddress));
        vault.deposit(address(this), _wad);
        _master.depositRoutable(_pid, _wad, true, msg.sender, address(this));
    }

    function withdrawAndUnstake(
        CZFarmMasterRoutable _master,
        uint256 _pid,
        uint256 _wad
    ) external {
        (IERC20 vaultAddress, , , ) = _master.poolInfo(_pid);
        ICZVault vault = ICZVault(address(vaultAddress));
        _master.withdrawRoutable(_pid, _wad, true, msg.sender, address(this));
        vault.withdraw(msg.sender, vault.asset().balanceOf(address(this)));
    }
}
