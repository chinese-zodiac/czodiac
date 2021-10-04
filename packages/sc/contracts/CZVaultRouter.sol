// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.4;

import "hardhat/console.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./interfaces/ICZVault.sol";
import "./interfaces/IBeltMultiStrategyToken.sol";
import "./CZFarmMasterRoutable.sol";

contract CZVaultRouter is ReentrancyGuard {
    using SafeERC20 for IERC20;

    function depositAndStake(
        CZFarmMasterRoutable _master,
        uint256 _pid,
        uint256 _wad
    ) external {
        (IERC20 vaultAddress, , , ) = _master.poolInfo(_pid);
        ICZVault vault = ICZVault(address(vaultAddress));
        vault.asset().transferFrom(msg.sender, address(this), _wad);
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

    function depositAndStakeBeltBNB(CZFarmMasterRoutable _master, uint256 _pid)
        external
        payable
    {

        console.log("depositAndStakeBeltBNB start", _pid);
        
        (IERC20 vaultAddress, , , ) = _master.poolInfo(_pid);

        console.log("CZVaultRouter poolInfo", address(vaultAddress));

        ICZVault vault = ICZVault(address(vaultAddress));

        console.log("CZVaultRouter before depositBNB", address(vault.asset()));

        IBeltMultiStrategyToken(address(vault.asset())).depositBNB{
            value: msg.value
        }(0);
        console.log("DepositBNB done", msg.value);

        uint256 _beltWad = vault.asset().balanceOf(address(this));

        vault.asset().approve(address(vault), _beltWad);

        console.log("beltBNB", _beltWad);

        vault.deposit(address(this), _beltWad);

        console.log("vault deposit done");

        _master.depositRoutable(
            _pid,
            _beltWad,
            true,
            msg.sender,
            address(this)
        );
    }

    function withdrawAndUnstakeBeltBNB(
        CZFarmMasterRoutable _master,
        uint256 _pid,
        uint256 _wad
    ) external nonReentrant {
        (IERC20 vaultAddress, , , ) = _master.poolInfo(_pid);
        ICZVault vault = ICZVault(address(vaultAddress));
        _master.withdrawRoutable(_pid, _wad, true, msg.sender, address(this));
        vault.withdraw(address(this), vault.asset().balanceOf(address(this)));
        IBeltMultiStrategyToken(address(vault.asset())).withdrawBNB(_wad, 0);
        (bool sent, ) = msg.sender.call{value: address(this).balance}("");
        require(sent, "CZVaultRouter: Transfer failed");
    }

    function depositAndStakeBeltToken(
        CZFarmMasterRoutable _master,
        uint256 _pid,
        uint256 _wad
    ) external {
        (IERC20 vaultAddress, , , ) = _master.poolInfo(_pid);
        ICZVault vault = ICZVault(address(vaultAddress));
        IBeltMultiStrategyToken(address(vault.asset())).deposit(_wad, 0);
        uint256 _beltWad = vault.asset().balanceOf(address(this));
        vault.deposit(address(this), _beltWad);
        _master.depositRoutable(
            _pid,
            _beltWad,
            true,
            msg.sender,
            address(this)
        );
    }

    function withdrawAndUnstakeBeltToken(
        CZFarmMasterRoutable _master,
        uint256 _pid,
        uint256 _wad
    ) external {
        (IERC20 vaultAddress, , , ) = _master.poolInfo(_pid);
        ICZVault vault = ICZVault(address(vaultAddress));
        _master.withdrawRoutable(_pid, _wad, true, msg.sender, address(this));
        vault.withdraw(address(this), vault.asset().balanceOf(address(this)));
        IBeltMultiStrategyToken stratToken = IBeltMultiStrategyToken(
            address(vault.asset())
        );
        stratToken.withdraw(_wad, 0);
        IERC20 token = IERC20(stratToken.token());
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }
}
