// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetFixedSupply.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";
import "./libs/AmmLibrary.sol";
import "./interfaces/IAmmFactory.sol";
import "./interfaces/IAmmPair.sol";
import "./CZUsd.sol";

contract CZRed is
    ERC20PresetFixedSupply,
    KeeperCompatibleInterface,
    Ownable,
    AccessControlEnumerable
{
    bytes32 public constant SAFE_GRANTER_ROLE = keccak256("SAFE_GRANTER_ROLE");
    using SafeERC20 for IERC20;
    IAmmPair public ammCzusdPair;
    CZUsd public czusd = CZUsd(0xE68b79e51bf826534Ff37AA9CeE71a3842ee9c70);
    uint256 public baseCzusdLocked;
    uint256 public totalCzusdSpent;
    uint256 public lockedCzusdTriggerLevel = 100 ether;
    uint256 public czusdSanityLevel = 1000 ether;
    uint256 public lastUpkeepEpoch;
    uint256 public upkeepPeriod = 24 hours;

    uint256 public burnBps = 900;
    uint256 public taxBps = 100;
    mapping(address => bool) public isExempt;
    address public taxDistributor;
    address public burnpayDistributor;

    mapping(address => bool) safeContracts;

    bool public tradingOpen;

    constructor()
        ERC20PresetFixedSupply("CZRed", "CZR", 450000 ether, msg.sender)
        Ownable()
    {
        setLastUpkeepEpoch(block.timestamp);
        setBaseCzusdLocked(50000 ether);
        setBurnpayDistributor(msg.sender);
        setTaxDistributor(msg.sender);
        setIsExempt(msg.sender, true);

        setAmmPair(
            IAmmPair(
                IAmmFactory(0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73)
                    .createPair(address(this), address(czusd))
            )
        );

        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(SAFE_GRANTER_ROLE, _msgSender());
    }

    function setLastUpkeepEpoch(uint256 _to) public onlyOwner {
        lastUpkeepEpoch = _to;
    }

    function setBurnBps(uint256 _to) public onlyOwner {
        burnBps = _to;
    }

    function setTaxBps(uint256 _to) public onlyOwner {
        taxBps = _to;
    }

    function setTotalCzusdSpent(uint256 _to) public onlyOwner {
        totalCzusdSpent = _to;
    }

    function setIsExempt(address _for, bool _to) public onlyOwner {
        isExempt[_for] = _to;
    }

    function setBaseCzusdLocked(uint256 _to) public onlyOwner {
        baseCzusdLocked = _to;
    }

    function setUpkeepPeriod(uint256 _to) public onlyOwner {
        upkeepPeriod = _to;
    }

    function setBurnpayDistributor(address _to) public onlyOwner {
        setIsExempt(_to, true);
        burnpayDistributor = _to;
    }

    function setTaxDistributor(address _to) public onlyOwner {
        setIsExempt(_to, true);
        taxDistributor = _to;
    }

    function setLockedCzusdTriggerLevel(uint256 _to) public onlyOwner {
        lockedCzusdTriggerLevel = _to;
    }

    function setCzusdSanityLevel(uint256 _to) public onlyOwner {
        czusdSanityLevel = _to;
    }

    function setAmmPair(IAmmPair _to) public onlyOwner {
        ammCzusdPair = _to;
    }

    function setOpenTrading(bool _to) external onlyOwner {
        tradingOpen = _to;
    }

    function lockedCzusd() public view returns (uint256 lockedCzusd_) {
        bool czusdIsToken0 = ammCzusdPair.token0() == address(czusd);
        (uint112 reserve0, uint112 reserve1, ) = ammCzusdPair.getReserves();
        uint256 lockedLP = ammCzusdPair.balanceOf(address(this));
        uint256 totalLP = ammCzusdPair.totalSupply();

        uint256 lockedLpCzusdBal = ((czusdIsToken0 ? reserve0 : reserve1) *
            lockedLP) / totalLP;
        uint256 lockedLpTokenBal = ((czusdIsToken0 ? reserve1 : reserve0) *
            lockedLP) / totalLP;

        if (lockedLpTokenBal == totalSupply()) {
            lockedCzusd_ = lockedLpCzusdBal;
        } else {
            lockedCzusd_ =
                lockedLpCzusdBal -
                (
                    AmmLibrary.getAmountOut(
                        totalSupply() - lockedLpTokenBal,
                        lockedLpTokenBal,
                        lockedLpCzusdBal
                    )
                );
        }
    }

    function recoverERC20(address tokenAddress) external onlyOwner {
        IERC20(tokenAddress).safeTransfer(
            _msgSender(),
            IERC20(tokenAddress).balanceOf(address(this))
        );
    }

    function availableWadToSend() public view returns (uint256) {
        return lockedCzusd() - baseCzusdLocked - totalCzusdSpent;
    }

    function isOverTriggerLevel() public view returns (bool) {
        return lockedCzusdTriggerLevel <= availableWadToSend();
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

    function burn(uint256 amount) public virtual override {
        _burn(_msgSender(), amount);
    }

    function setContractSafe(address _for)
        external
        onlyRole(SAFE_GRANTER_ROLE)
    {
        safeContracts[_for] = true;
    }

    function setContractUnsafe(address _for)
        external
        onlyRole(SAFE_GRANTER_ROLE)
    {
        safeContracts[_for] = false;
    }

    //KEEPER CHAINLINK
    function checkUpkeep(bytes calldata checkData)
        public
        view
        override
        returns (bool upkeepNeeded, bytes memory)
    {
        upkeepNeeded =
            isOverTriggerLevel() &&
            (block.timestamp > (upkeepPeriod + lastUpkeepEpoch));
    }

    function performUpkeep(bytes calldata) external override {
        uint256 wadToSend = availableWadToSend();
        require(wadToSend > 0, "CZR: Not enough wad to distribute");
        require(wadToSend < czusdSanityLevel, "CZR: Send above sanity check");
        require(
            (block.timestamp > (upkeepPeriod + lastUpkeepEpoch)),
            "CZR: Last upkeep to soon"
        );
        totalCzusdSpent += wadToSend;
        czusd.mint(burnpayDistributor, wadToSend);
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

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal override {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");

        //Handle burn
        if (
            //No tax for exempt
            isExempt[sender] ||
            isExempt[recipient] ||
            //No tax if not a trade
            (sender != address(ammCzusdPair) &&
                recipient != address(ammCzusdPair))
        ) {
            super._transfer(sender, recipient, amount);
        } else {
            require(tradingOpen, "CZR: Not open");
            uint256 totalFeeWad = (amount * (burnBps + taxBps)) / 10000;
            uint256 burnAmount = (amount * burnBps) / 10000;
            if (burnAmount > 0) super._burn(sender, burnAmount);
            if (totalFeeWad - burnAmount > 0) {
                super._transfer(
                    sender,
                    taxDistributor,
                    totalFeeWad - burnAmount
                );
            }
            super._transfer(sender, recipient, amount - totalFeeWad);
        }
    }
}
