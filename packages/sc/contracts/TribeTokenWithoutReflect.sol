// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./interfaces/IAmmRouter02.sol";
import "./interfaces/IAmmFactory.sol";
import "./CZusdHolder.sol";

contract TribeTokenWithoutReflect is ERC20, AccessControlEnumerable {
    using SafeERC20 for IERC20;
    bytes32 public constant PROJECT_OWNER = keccak256("PROJECT_OWNER");
    bytes32 public constant CZODIAC_ADMIN = keccak256("CZODIAC_ADMIN");
    uint256 public constant BASIS = 10000;

    uint256 public constant MAX_TOTAL_SELL_TAX = BASIS / 4;

    IAmmRouter02 public router;
    CZusdHolder public czusdHolder;
    address public primaryAmmPair;
    address public CZUSD;
    address public projectWallet;
    address public lpSafe;

    uint256 public swapTokensAtAmount;

    uint16 public liquidityFee;
    uint16 public projectFee;
    uint16 public burnFee;
    uint16 public totalFees;

    mapping(address => bool) public isExcludedFromFees;

    mapping(address => bool) public isBlacklisted;

    mapping(address => bool) public isAmmPair;

    bool private swapping;

    event GasForProcessingUpdated(
        uint256 indexed newValue,
        uint256 indexed oldValue
    );

    event SwapAndLiquify(
        uint256 tokensSwapped,
        uint256 ethReceived,
        uint256 tokensIntoLiqudity
    );

    event SendDividends(uint256 tokensSwapped, uint256 amount);

    event ProcessedDividendTracker(
        uint256 iterations,
        uint256 claims,
        uint256 lastProcessedIndex,
        bool indexed automatic,
        uint256 gas,
        address indexed processor
    );

    constructor(
        string memory _symbol,
        string memory _name,
        address _czusd,
        address _czodiacAdmin,
        address _projectWallet,
        address _lpSafe,
        uint256 _totalSupply,
        IAmmRouter02 _router,
        uint256 _swapTokensAtAmountBasis,
        uint16 _liquidityFee,
        uint16 _projectFee,
        uint16 _burnFee
    ) ERC20(_name, _symbol) {
        CZUSD = _czusd;

        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(PROJECT_OWNER, _msgSender());
        _setupRole(CZODIAC_ADMIN, _msgSender());

        setRouter(_router);
        setLiquidityFee(_liquidityFee);
        setProjectFee(_projectFee);
        setBurnFee(_burnFee);
        setProjectWallet(_projectWallet);
        setLpSafe(_lpSafe);

        setSwapTokensAtAmount(
            (_totalSupply * _swapTokensAtAmountBasis) / BASIS
        );

        setIsExcludeFromFees(_czodiacAdmin, true);
        setIsExcludeFromFees(projectWallet, true);
        setIsExcludeFromFees(address(this), true);

        _mint(_czodiacAdmin, _totalSupply);
        grantRole(DEFAULT_ADMIN_ROLE, _czodiacAdmin);
        grantRole(CZODIAC_ADMIN, _czodiacAdmin);
        grantRole(PROJECT_OWNER, _czodiacAdmin);
        grantRole(PROJECT_OWNER, projectWallet);
        revokeRole(CZODIAC_ADMIN, _msgSender());
        revokeRole(PROJECT_OWNER, _msgSender());
        revokeRole(DEFAULT_ADMIN_ROLE, _msgSender());

        bytes memory bytecode = abi.encodePacked(
            type(CZusdHolder).creationCode,
            abi.encode()
        );
        bytes32 salt = keccak256(
            abi.encodePacked(address(this), block.timestamp)
        );
        address czusdHolderAddress;
        assembly {
            czusdHolderAddress := create2(
                0,
                add(bytecode, 32),
                mload(bytecode),
                salt
            )
        }
        czusdHolder = CZusdHolder(czusdHolderAddress);
    }

    function setRouter(IAmmRouter02 newAddress) public onlyRole(CZODIAC_ADMIN) {
        router = newAddress;
        address _primaryAmmPair = IAmmFactory(router.factory()).createPair(
            address(this),
            CZUSD
        );
        primaryAmmPair = _primaryAmmPair;
        setIAmmPair(_primaryAmmPair, true);
    }

    function setIsExcludeFromFees(address account, bool excluded)
        public
        onlyRole(PROJECT_OWNER)
    {
        isExcludedFromFees[account] = excluded;
    }

    function setSwapTokensAtAmount(uint256 _swapTokensAtAmount)
        public
        onlyRole(CZODIAC_ADMIN)
    {
        swapTokensAtAmount = _swapTokensAtAmount;
    }

    function setProjectWallet(address wallet) public onlyRole(PROJECT_OWNER) {
        projectWallet = wallet;
    }

    function setLpSafe(address to) public onlyRole(CZODIAC_ADMIN) {
        lpSafe = to;
    }

    function setLiquidityFee(uint16 _value) public onlyRole(PROJECT_OWNER) {
        liquidityFee = _value;
        updateFees();
    }

    function setProjectFee(uint16 _value) public onlyRole(PROJECT_OWNER) {
        projectFee = _value;
        updateFees();
    }

    function setBurnFee(uint16 _value) public onlyRole(PROJECT_OWNER) {
        burnFee = _value;
        updateFees();
    }

    function setBlacklist(address account, bool value)
        external
        onlyRole(PROJECT_OWNER)
    {
        isBlacklisted[account] = value;
    }

    function setIAmmPair(address pair, bool value)
        public
        onlyRole(CZODIAC_ADMIN)
    {
        isAmmPair[pair] = value;
    }

    function updateFees() private {
        totalFees = liquidityFee + projectFee;
        require(
            totalFees + burnFee <= MAX_TOTAL_SELL_TAX,
            "TRIBE: Cannot set tax above 25%"
        );
    }

    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        require(
            !isBlacklisted[from] && !isBlacklisted[to],
            "TRIBE: Blacklisted"
        );

        if (amount == 0) {
            super._transfer(from, to, 0);
            return;
        }

        uint256 contractTokenBalance = balanceOf(address(this));
        bool canSwap = contractTokenBalance >= swapTokensAtAmount;

        if (
            canSwap &&
            !swapping &&
            !isAmmPair[from] &&
            !isExcludedFromFees[from] &&
            !isExcludedFromFees[to]
        ) {
            swapping = true;

            uint256 projectTokens = (contractTokenBalance * projectFee) /
                totalFees;
            uint256 contractBalance = IERC20(CZUSD).balanceOf(address(this));
            swapTokensForCZUSD(projectTokens);
            uint256 newBalance = IERC20(CZUSD).balanceOf(address(this)) -
                contractBalance;
            IERC20(CZUSD).transfer(projectWallet, newBalance);

            uint256 swapTokens = balanceOf(address(this));
            swapAndLiquify(swapTokens);

            swapping = false;
        }

        bool takeFee = !swapping;

        // if any account belongs to _isExcludedFromFee account then remove the fee
        if (isExcludedFromFees[from] || isExcludedFromFees[to]) {
            takeFee = false;
        }

        if (takeFee) {
            uint256 fees = (amount * totalFees) / BASIS;

            if (isAmmPair[to]) {
                uint256 burnAmount = (amount * burnFee) / BASIS;
                _burn(from, burnAmount);
                amount -= burnAmount;
            }
            amount -= fees;
            super._transfer(from, address(this), fees);
        }

        super._transfer(from, to, amount);
    }

    function swapAndLiquify(uint256 tokens) private {
        // split the contract balance into halves
        uint256 half = tokens / 2;
        uint256 otherHalf = tokens - half;

        // capture the contract's current CZUSD balance.
        // this is so that we can capture exactly the amount of CZUSD that the
        // swap creates, and not make the liquidity event include any CZUSD that
        // has been manually sent to the contract
        uint256 initialBalance = IERC20(CZUSD).balanceOf(address(this));

        // swap tokens for CZUSD
        swapTokensForCZUSD(half); // <- this breaks the CZUSD -> DAMP swap when swap+liquify is triggered

        // how much CZUSD did we just swap into?
        uint256 newBalance = IERC20(CZUSD).balanceOf(address(this)) -
            initialBalance;

        // add liquidity to amm
        addLiquidity(otherHalf, newBalance);

        emit SwapAndLiquify(half, newBalance, otherHalf);
    }

    function swapTokensForCZUSD(uint256 tokenAmount) private {
        address[] memory path = new address[](2);
        path[0] = address(this);
        path[1] = CZUSD;

        _approve(address(this), address(router), tokenAmount);

        // make the swap
        router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
            tokenAmount,
            0,
            path,
            address(czusdHolder),
            block.timestamp
        );
        //Uniswap router reverts when swaping tokens with the _to destination of the token contract
        //So fetch the tokens from the dividendtracker
        czusdHolder.fetchCZUSD();
    }

    function addLiquidity(uint256 tokenAmount, uint256 czusdAmount) private {
        // approve token transfer to cover all possible scenarios
        _approve(address(this), address(router), tokenAmount);
        IERC20(CZUSD).approve(address(router), czusdAmount);

        // add the liquidity
        router.addLiquidity(
            address(this),
            address(CZUSD),
            tokenAmount,
            czusdAmount,
            0, // slippage unavoidable
            0, // slippage unavoidable
            lpSafe,
            block.timestamp
        );
    }
}
