// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
/*pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./interfaces/IAmmRouter02.sol";
import "./interfaces/IAmmFactory.sol";
import "./TribeDividends.sol";

contract TribeToken is ERC20, AccessControlEnumerable {
    using SafeERC20 for IERC20;
    bytes32 public constant PROJECT_OWNER = keccak256("PROJECT_OWNER");
    bytes32 public constant CZODIAC_ADMIN = keccak256("CZODIAC_ADMIN");
    uint256 public constant BASIS = 10000;

    uint256 public constant MAX_TOTAL_SELL_TAX = BASIS / 4;

    IAmmRouter02 public router;
    address public primaryAmmPair;
    address public CZUSD;
    address public projectWallet;
    address public lpSafe;

    TribeDividends public dividendTracker;

    uint256 public swapTokensAtAmount;

    uint16 public CZUSDRewardsFee;
    uint16 public liquidityFee;
    uint16 public projectFee;
    uint16 public burnFee;
    uint16 public totalFees;

    uint256 public maxSellTransactionAmount;
    uint256 public maxWalletToken;

    // use by default 300,000 gas to process auto-claiming dividends
    uint256 public gasForProcessing = 300000;

    mapping(address => bool) public isExcludedFromFees;
    mapping(address => bool) public isExcludedFromMaxSellTx;
    mapping(address => bool) public isExcludedFromMaxWalletToken;

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
        uint256 _maxSellTransactionAmountBasis,
        uint256 _maxWalletTokenBasis,
        uint256 _swapTokensAtAmountBasis,
        uint16 _CZUSDRewardsFee,
        uint16 _liquidityFee,
        uint16 _projectFee,
        uint16 _burnFee
    ) ERC20(_name, _symbol) {
        CZUSD = _czusd;

        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(PROJECT_OWNER, _msgSender());
        _setupRole(CZODIAC_ADMIN, _msgSender());

        setRouter(_router);
        setCZUSDRewardsFee(_CZUSDRewardsFee);
        setLiquidityFee(_liquidityFee);
        setProjectFee(_projectFee);
        setBurnFee(_burnFee);
        setProjectWallet(_projectWallet);
        setLpSafe(_lpSafe);

        setMaxSellTransactionAmount(
            (_totalSupply * _maxSellTransactionAmountBasis) / BASIS
        );
        setMaxWalletToken((_totalSupply * _maxWalletTokenBasis) / BASIS);
        setSwapTokensAtAmount(
            (_totalSupply * _swapTokensAtAmountBasis) / BASIS
        );

        dividendTracker = new TribeDividends(_symbol, swapTokensAtAmount);

        excludeFromDividends(address(dividendTracker));
        excludeFromDividends(address(this));
        excludeFromDividends(address(0));
        excludeFromDividends(_czodiacAdmin);
        excludeFromDividends(projectWallet);

        setIsExcludeFromFees(_czodiacAdmin, true);
        setIsExcludeFromFees(projectWallet, true);
        setIsExcludeFromFees(address(dividendTracker), true);
        setIsExcludeFromFees(address(this), true);

        setIsExcludeFromMaxSellTx(_czodiacAdmin, true);
        setIsExcludeFromMaxSellTx(address(dividendTracker), true);
        setIsExcludeFromMaxSellTx(address(this), true);

        setIsExcludeFromMaxWalletToken(_czodiacAdmin, true);
        setIsExcludeFromMaxWalletToken(projectWallet, true);
        setIsExcludeFromMaxWalletToken(address(dividendTracker), true);
        setIsExcludeFromMaxWalletToken(primaryAmmPair, true);
        setIsExcludeFromMaxWalletToken(address(this), true);
        setIsExcludeFromMaxWalletToken(address(0), true);

        _mint(_czodiacAdmin, _totalSupply);
        grantRole(DEFAULT_ADMIN_ROLE, _czodiacAdmin);
        grantRole(CZODIAC_ADMIN, _czodiacAdmin);
        grantRole(PROJECT_OWNER, _czodiacAdmin);
        grantRole(PROJECT_OWNER, projectWallet);
        revokeRole(CZODIAC_ADMIN, _msgSender());
        revokeRole(PROJECT_OWNER, _msgSender());
        revokeRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    function setRouter(IAmmRouter02 newAddress) public onlyRole(CZODIAC_ADMIN) {
        router = newAddress;
        address _primaryAmmPair = IAmmFactory(router.factory()).createPair(
            address(this),
            CZUSD
        );
        primaryAmmPair = _primaryAmmPair;
        setIsAmmPair(_primaryAmmPair, true);
    }

    function setIsExcludeFromFees(address account, bool excluded)
        public
        onlyRole(PROJECT_OWNER)
    {
        isExcludedFromFees[account] = excluded;
    }

    function setIsExcludeFromMaxSellTx(address _address, bool value)
        public
        onlyRole(PROJECT_OWNER)
    {
        isExcludedFromMaxSellTx[_address] = value;
    }

    function setIsExcludeFromMaxWalletToken(address _address, bool value)
        public
        onlyRole(PROJECT_OWNER)
    {
        isExcludedFromMaxWalletToken[_address] = value;
    }

    function setSwapTokensAtAmount(uint256 _swapTokensAtAmount)
        public
        onlyRole(CZODIAC_ADMIN)
    {
        swapTokensAtAmount = _swapTokensAtAmount;
    }

    function setMaxWalletToken(uint256 _maxToken)
        public
        onlyRole(PROJECT_OWNER)
    {
        maxWalletToken = _maxToken;
    }

    function setProjectWallet(address wallet) public onlyRole(PROJECT_OWNER) {
        projectWallet = wallet;
    }

    function setLpSafe(address to) public onlyRole(CZODIAC_ADMIN) {
        lpSafe = to;
    }

    function setCZUSDRewardsFee(uint16 _value) public onlyRole(PROJECT_OWNER) {
        CZUSDRewardsFee = _value;
        totalFees = CZUSDRewardsFee + liquidityFee + projectFee;
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

    function setMaxSellTransactionAmount(uint256 _maxSellTxAmountWad)
        public
        onlyRole(CZODIAC_ADMIN)
    {
        maxSellTransactionAmount = _maxSellTxAmountWad;
    }

    function setIsAmmPair(address pair, bool value)
        public
        onlyRole(CZODIAC_ADMIN)
    {
        isAmmPair[pair] = value;
        excludeFromDividends(pair);
        setIsExcludeFromMaxWalletToken(pair, true);
    }

    function setBlacklist(address account, bool value)
        external
        onlyRole(PROJECT_OWNER)
    {
        isBlacklisted[account] = value;
    }

    function setGasForProcessing(uint256 newValue)
        public
        onlyRole(CZODIAC_ADMIN)
    {
        require(
            newValue >= 200000 && newValue <= 800000,
            "DAMP: gasForProcessing must be between 200,000 and 500,000"
        );
        require(
            newValue != gasForProcessing,
            "DAMP: Cannot update gasForProcessing to same value"
        );
        emit GasForProcessingUpdated(newValue, gasForProcessing);
        gasForProcessing = newValue;
    }

    function setClaimWait(uint256 claimWait) external onlyRole(PROJECT_OWNER) {
        dividendTracker.updateClaimWait(claimWait);
    }

    function setIAmmPair(address pair, bool value)
        public
        onlyRole(CZODIAC_ADMIN)
    {
        isAmmPair[pair] = value;
        if (value) {
            excludeFromDividends(pair);
        }
    }

    function updateFees() private {
        totalFees = CZUSDRewardsFee + liquidityFee + projectFee;
        require(
            totalFees + burnFee <= MAX_TOTAL_SELL_TAX,
            "TRIBE: Cannot set tax above 25%"
        );
    }

    function getClaimWait() external view returns (uint256) {
        return dividendTracker.claimWait();
    }

    function getTotalDividendsDistributed() external view returns (uint256) {
        return dividendTracker.totalDividendsDistributed();
    }

    //WARNING: Irreversible
    function excludeFromDividends(address account)
        public
        onlyRole(PROJECT_OWNER)
    {
        dividendTracker.excludeFromDividends(account);
    }

    function withdrawableDividendOf(address account)
        public
        view
        returns (uint256)
    {
        return dividendTracker.withdrawableDividendOf(account);
    }

    function dividendTokenBalanceOf(address account)
        public
        view
        returns (uint256)
    {
        return dividendTracker.balanceOf(account);
    }

    function getAccountDividendsInfo(address account)
        external
        view
        returns (
            address,
            int256,
            int256,
            uint256,
            uint256,
            uint256,
            uint256,
            uint256
        )
    {
        return dividendTracker.getAccount(account);
    }

    function getAccountDividendsInfoAtIndex(uint256 index)
        external
        view
        returns (
            address,
            int256,
            int256,
            uint256,
            uint256,
            uint256,
            uint256,
            uint256
        )
    {
        return dividendTracker.getAccountAtIndex(index);
    }

    function processDividendTracker(uint256 gas) external {
        (
            uint256 iterations,
            uint256 claims,
            uint256 lastProcessedIndex
        ) = dividendTracker.process(gas);
        emit ProcessedDividendTracker(
            iterations,
            claims,
            lastProcessedIndex,
            false,
            gas,
            tx.origin
        );
    }

    function claim() external {
        dividendTracker.processAccount(msg.sender, false);
    }

    function getLastProcessedIndex() external view returns (uint256) {
        return dividendTracker.getLastProcessedIndex();
    }

    function getNumberOfDividendTokenHolders() external view returns (uint256) {
        return dividendTracker.getNumberOfTokenHolders();
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

        if (!isExcludedFromMaxWalletToken[to]) {
            uint256 contractBalanceRecepient = balanceOf(to);
            require(
                contractBalanceRecepient + amount <= maxWalletToken,
                "TRIBE: max wallet"
            );
        }

        if (
            isAmmPair[to] &&
            (!isExcludedFromMaxSellTx[from]) &&
            (!isExcludedFromMaxSellTx[to])
        ) {
            require(amount <= maxSellTransactionAmount, "TRIBE: max sell");
        }

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

            uint256 swapTokens = (contractTokenBalance * liquidityFee) /
                totalFees;
            swapAndLiquify(swapTokens);

            uint256 sellTokens = balanceOf(address(this));
            swapAndSendDividends(sellTokens);

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

        try dividendTracker.setBalance(from, balanceOf(from)) {} catch {}
        try dividendTracker.setBalance(to, balanceOf(to)) {} catch {}

        if (!swapping) {
            uint256 gas = gasForProcessing;

            try dividendTracker.process(gas) returns (
                uint256 iterations,
                uint256 claims,
                uint256 lastProcessedIndex
            ) {
                emit ProcessedDividendTracker(
                    iterations,
                    claims,
                    lastProcessedIndex,
                    true,
                    gas,
                    tx.origin
                );
            } catch {}
        }
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
            address(dividendTracker),
            block.timestamp
        );
        //Uniswap router reverts when swaping tokens with the _to destination of the token contract
        //So fetch the tokens from the dividendtracker
        dividendTracker.fetchCZUSD();
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

    function swapAndSendDividends(uint256 tokens) private {
        swapTokensForCZUSD(tokens);
        uint256 dividends = IERC20(CZUSD).balanceOf(address(this));
        IERC20(CZUSD).transfer(address(dividendTracker), dividends);

        dividendTracker.distributeCZUSDDividends(dividends);
        emit SendDividends(tokens, dividends);
    }
}*/
