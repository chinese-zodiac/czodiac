// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// Credit to Frax
pragma solidity ^0.8.4;

import "./interfaces/IPairOracle.sol";
import "./CZFarm.sol";
import "./CZUsd.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract CZUsdBorrowCZF is Ownable, Pausable, AccessControlEnumerable {
    using SafeERC20 for CZFarm;
    using SafeERC20 for CZUsd;

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    //CZUsd contract.
    CZUsd public czusd;
    //CZF contract.
    CZFarm public czf;
    //CZFarm Oracle
    IPairOracle czfBusd;
    //Token wad deposited by account
    mapping(address => uint256) public deposited;
    //CZUSD wad borrowed by account
    mapping(address => uint256) public borrowed;
    //Max borrow in basis points of deposits value.
    uint256 public maxBorrowBasis;
    //Maximum supply of CZUsd permitted.
    uint256 public maxCZUsd;

    constructor(
        CZUsd _czusd,
        CZFarm _czf,
        IPairOracle _czfBusd,
        uint256 _maxBorrowBasis,
        uint256 _maxCZUsd
    ) Ownable() {
        czusd = _czusd;
        czf = _czf;
        czfBusd = _czfBusd;
        maxBorrowBasis = _maxBorrowBasis;
        maxCZUsd = _maxCZUsd;
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(PAUSER_ROLE, _msgSender());
    }

    //Transfers _wad collateral from sender for _for's deposits.
    //Increases deposited[_for] by _wad.
    function deposit(address _for, uint256 _wad) external whenNotPaused {
        czf.transferFrom(msg.sender, address(this), _wad);
        deposited[_for] += _wad;
    }

    //Mints _wad collateral to _to.
    //Increases borrowed[msg.sender] by _wad.
    //Only allows borrow up to maxBorrow
    function borrow(address _to, uint256 _wad) external whenNotPaused {
        czusd.mint(_to, _wad);
        borrowed[msg.sender] += _wad;
        _requireValidBorrowBalance();
    }

    //Burns _wad CZUSD from sender.
    //Reduces borrow[_for] by _wad.
    function repay(address _for, uint256 _wad) external whenNotPaused {
        czusd.burnFrom(msg.sender, _wad);
        borrowed[_for] -= _wad;
    }

    //Returns _wad CZF to _to from sender's deposits.
    //Reverts if final borrow is above maxBorrow.
    function withdraw(address _for, uint256 _wad) external whenNotPaused {
        czf.transfer(_for, _wad);
        deposited[_for] -= _wad;
        _requireValidBorrowBalance();
    }

    //Returns max available borrow for the user.
    //Formula: depositedUsdValue(_for) * maxBorrowBasis / 10000 - borrowed[_for]
    //If borrowing all would cause CZUSD supply to exceed max, then set to maxCZUsd - czusd.totalSupply().
    function maxBorrow(address _for) public view returns (uint256 wad_) {
        wad_ =
            ((depositedUsdValue(_for) * maxBorrowBasis) / 10000) -
            borrowed[_for];
        if (wad_ + czusd.totalSupply() > maxCZUsd)
            wad_ = maxCZUsd - czusd.totalSupply();
    }

    //Returns deposited CZF USD value of _for.
    function depositedUsdValue(address _for)
        public
        view
        returns (uint256 wad_)
    {
        return czfBusd.consultTwap(address(czf), deposited[_for]);
    }

    //OnlyOwner methods for setting variables:
    //setMaxBorrowBasis, setMaxCZUsd
    function setMaxBorrowBasis(uint256 _to) external onlyOwner {
        maxBorrowBasis = _to;
        require(maxBorrowBasis <= 10000, "Cannot set above 10000");
    }

    function setMaxCZUsd(uint256 _to) external onlyOwner {
        maxCZUsd = _to;
    }

    function pause() public {
        require(
            hasRole(PAUSER_ROLE, _msgSender()),
            "CZUsdBorrowCZF: must have pauser role to pause"
        );
        _pause();
    }

    function unpause() public {
        require(
            hasRole(PAUSER_ROLE, _msgSender()),
            "CZUsdBorrowCZF: must have pauser role to unpause"
        );
        _unpause();
    }

    function _requireValidBorrowBalance() internal view {
        require(
            borrowed[msg.sender] <= maxBorrow(msg.sender),
            "CZUsdBorrowCZF: Exceed borow limite"
        );
    }
}
