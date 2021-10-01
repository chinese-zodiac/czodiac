// SPDX-License-Identifier: GPL-3.0
// Authored by Anthony Nguyen
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// This contract allows beltBnb to be exchanged 1:1 for CzfBeltVault.
// BELT rewards harvested will be transferred to a CZF->BELT pool.
// By also adding a CZF/BNB farm to app.czodiac.com, the circle is complete. BELT can be earned and reinvested without causing any dumps on either CZF or BELT and thus being beneficial to both.
/* Useful values:
BSC beltBNB: 0xa8bb71facdd46445644c277f9499dd22f6f0a30c
BSC beltFarm: 0xd4bbc80b9b102b77b21a06cb77e954049605e6c1
BSC BELT: 0xe0e514c71282b6f4e823703a39374cf58dc3ea4f
beltBNB _pid on beltFarm: 6
*/

interface IBeltFarm {
    function deposit(uint256 _pid, uint256 _wantAmt) external;

    function withdraw(uint256 _pid, uint256 _wantAmt) external;
}

contract CzfBeltVault is
    ERC20,
    Ownable,
    ReentrancyGuard,
    AccessControlEnumerable
{
    using SafeERC20 for IERC20;
    bytes32 public constant SAFE_GRANTER_ROLE = keccak256("SAFE_GRANTER_ROLE");
    mapping(address => bool) safeContracts;

    IBeltFarm public beltFarm;
    IERC20 public beltBNB;
    IERC20 public belt;
    uint256 public feeBasis;

    uint256 public beltPoolId;

    event Deposit(address _for, uint256 _pid, uint256 _amt);
    event Withdraw(address _for, uint256 _pid, uint256 _amt);
    event Fee(address _for, uint256 _pid, uint256 _amt);

    constructor(
        address _beltFarm,
        address _beltBNB,
        uint256 _beltPoolId,
        address _belt
    ) ERC20("CzfBeltVault", "CzfBeltVault") Ownable() {
        beltFarm = IBeltFarm(_beltFarm);
        beltBNB = IERC20(_beltBNB);
        belt = IERC20(_belt);
        beltPoolId = _beltPoolId;
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(SAFE_GRANTER_ROLE, msg.sender);
    }

    // 1) Transfers _wad beltBnb from msg.sender
    // 2) Stakes _wad beltBnb to beltFarm
    // 3) Mints _wad of CzfBeltVault to _for
    // NOTE: This contract must be approved for beltBNB first.
    // NOTE: If this fails, double check the pid
    function deposit(address _for, uint256 _wad) external nonReentrant {
        beltBNB.transferFrom(msg.sender, address(this), _wad);

        beltBNB.approve(address(beltFarm), _wad);
        beltFarm.deposit(beltPoolId, _wad);

        _mint(_for, _wad);

        emit Deposit(msg.sender, beltPoolId, _wad);
    }

    //1) Burns _wad CzfBeltVault from msg.sender.
    //2) Unstakes _wad beltBnb from beltFarm
    //3) Transfers _wad beltBNB from self to _for.
    //NOTE: This contract must be approved for CzfBeltVault first.
    function withdraw(address _for, uint256 _wad) external {
        _burn(msg.sender, _wad);

        uint256 fee = (_wad * feeBasis) / 10000;
        uint256 withdrawAmt = _wad - fee;

        beltFarm.withdraw(beltPoolId, withdrawAmt);
        beltBNB.transfer(_for, withdrawAmt);

        emit Withdraw(msg.sender, beltPoolId, withdrawAmt);
        emit Fee(msg.sender, beltPoolId, fee);
    }

    //1) Harvests BELT from beltFarm.
    //2) Transfers all BELT in this contract to _pool
    //NOTE: This can only be called by owner.
    function harvest(address _pool) external onlyOwner {
        beltFarm.withdraw(beltPoolId, 0);

        belt.transfer(_pool, belt.balanceOf(address(this)));
    }

    function updateBeltFarm(address _beltFarm) external onlyOwner {
        beltFarm = IBeltFarm(_beltFarm);
    }

    function updateBeltPoolId(uint256 _beltPoolId) external onlyOwner {
        beltPoolId = _beltPoolId;
    }

    function setFeeBasis(uint256 _feeBasis) external onlyOwner {
        feeBasis = _feeBasis;
        require(feeBasis < 100, "CzfBeltVault: Fee can never be more than 1%");
    }

    //Utility methods & safe contract methods

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

    function setContractSafe(address _for) external {
        require(
            hasRole(SAFE_GRANTER_ROLE, _msgSender()),
            "CZFarm: must have SAFE_GRANTER_ROLE role"
        );
        safeContracts[_for] = true;
    }

    function setContractUnsafe(address _for) external {
        require(
            hasRole(SAFE_GRANTER_ROLE, _msgSender()),
            "CZFarm: must have SAFE_GRANTER_ROLE role"
        );
        safeContracts[_for] = false;
    }
}
