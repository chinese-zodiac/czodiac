/*
SPDX-License-Identifier: GPL-3.0

░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░██████████████████████████████████████████████████████████████████████████████████████████████████████████░░
░░█░░░░░░░░░░░░░░█░░░░░░░░░░░░░░░░░░█░░░░░░░░░░░░░░█░░░░░░░░░░░░███░░░░░░░░░░█░░░░░░░░░░░░░░█░░░░░░░░░░░░░░█░░
░░█░░▄▀▄▀▄▀▄▀▄▀░░█░░▄▀▄▀▄▀▄▀▄▀▄▀▄▀░░█░░▄▀▄▀▄▀▄▀▄▀░░█░░▄▀▄▀▄▀▄▀░░░░█░░▄▀▄▀▄▀░░█░░▄▀▄▀▄▀▄▀▄▀░░█░░▄▀▄▀▄▀▄▀▄▀░░█░░
░░█░░▄▀░░░░░░░░░░█░░░░░░░░░░░░▄▀▄▀░░█░░▄▀░░░░░░▄▀░░█░░▄▀░░░░▄▀▄▀░░█░░░░▄▀░░░░█░░▄▀░░░░░░▄▀░░█░░▄▀░░░░░░░░░░█░░
░░█░░▄▀░░█████████████████░░░░▄▀░░░░█░░▄▀░░██░░▄▀░░█░░▄▀░░██░░▄▀░░███░░▄▀░░███░░▄▀░░██░░▄▀░░█░░▄▀░░█████████░░
░░█░░▄▀░░███████████████░░░░▄▀░░░░███░░▄▀░░██░░▄▀░░█░░▄▀░░██░░▄▀░░███░░▄▀░░███░░▄▀░░░░░░▄▀░░█░░▄▀░░█████████░░
░░█░░▄▀░░█████████████░░░░▄▀░░░░█████░░▄▀░░██░░▄▀░░█░░▄▀░░██░░▄▀░░███░░▄▀░░███░░▄▀▄▀▄▀▄▀▄▀░░█░░▄▀░░█████████░░
░░█░░▄▀░░███████████░░░░▄▀░░░░███████░░▄▀░░██░░▄▀░░█░░▄▀░░██░░▄▀░░███░░▄▀░░███░░▄▀░░░░░░▄▀░░█░░▄▀░░█████████░░
░░█░░▄▀░░█████████░░░░▄▀░░░░█████████░░▄▀░░██░░▄▀░░█░░▄▀░░██░░▄▀░░███░░▄▀░░███░░▄▀░░██░░▄▀░░█░░▄▀░░█████████░░
░░█░░▄▀░░░░░░░░░░█░░▄▀▄▀░░░░░░░░░░░░█░░▄▀░░░░░░▄▀░░█░░▄▀░░░░▄▀▄▀░░█░░░░▄▀░░░░█░░▄▀░░██░░▄▀░░█░░▄▀░░░░░░░░░░█░░
░░█░░▄▀▄▀▄▀▄▀▄▀░░█░░▄▀▄▀▄▀▄▀▄▀▄▀▄▀░░█░░▄▀▄▀▄▀▄▀▄▀░░█░░▄▀▄▀▄▀▄▀░░░░█░░▄▀▄▀▄▀░░█░░▄▀░░██░░▄▀░░█░░▄▀▄▀▄▀▄▀▄▀░░█░░
░░█░░░░░░░░░░░░░░█░░░░░░░░░░░░░░░░░░█░░░░░░░░░░░░░░█░░░░░░░░░░░░███░░░░░░░░░░█░░░░░░██░░░░░░█░░░░░░░░░░░░░░█░░
░░██████████████████████████████████████████████████████████████████████████████████████████████████████████░░
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░░░░░░█████╗░░░░█████╗░░░░█████╗░░░░█████╗░░░░█████╗░░░░█████╗░░░░█████╗░░░░█████╗░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░░░░░██╔══██╗░░██╔══██╗░░██╔══██╗░░██╔══██╗░░██╔══██╗░░██╔══██╗░░██╔══██╗░░██╔══██╗░░░░░░░░░░░░░░░
░░░░░░░░░░░░░░░░░╚█████╔╝░░╚█████╔╝░░╚█████╔╝░░╚█████╔╝░░╚█████╔╝░░╚█████╔╝░░╚█████╔╝░░╚█████╔╝░░░░░░░░░░░░░░░
░░░░░░░░░░░░░░░░░██╔══██╗░░██╔══██╗░░██╔══██╗░░██╔══██╗░░██╔══██╗░░██╔══██╗░░██╔══██╗░░██╔══██░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░░░░░╚█████╔╝░░╚█████╔╝░░╚█████╔╝░░╚█████╔╝░░╚█████╔╝░░╚█████╔╝░░╚█████╔╝░░╚█████╔╝░░░░░░░░░░░░░░░
░░░░░░░░░░░░░░░░░░╚════╝░░░░╚════╝░░░░╚════╝░░░░╚════╝░░░░╚════╝░░░░╚════╝░░░░╚════╝░░░░╚════╝░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋░░
░░╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋┏┓╋╋╋╋╋╋╋╋╋┏┓╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋░░
░░╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋┏━┳━┫┗┓╋╋┏┓┏┳┳━┫┣┳┳┓╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋░░
░░╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋┃╋┃┻┫┏┫╋╋┃┗┫┃┃━┫━┫┃┃╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋░░
░░╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋┣┓┣━┻━┛╋╋┗━┻━┻━┻┻╋┓┃╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋░░
░░╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋┗━┛╋╋╋╋╋╋╋╋╋╋╋╋╋╋┗━┛╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋░░
░░╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋░░
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

Authored by Plastic Digits
Credit to reflect.finance, split.network, bubbadefi.finance

*/
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IUniswapV2Router02.sol";
import "../interfaces/IUniswapV2Pair.sol";
import "../interfaces/IUniswapV2Factory.sol";

contract CZodiacToken is Context, IERC20, Ownable {
    using SafeMath for uint256;
    using Address for address;

    struct TValues {
        uint256 tTransferAmount;
        uint256 tHolderReward;
        uint256 tBurn;
        uint256 tLpReward;
        uint256 tDevReward;
    }

    struct RValues {
        uint256 rate;
        uint256 rAmount;
        uint256 rTransferAmount;
        uint256 tTransferAmount;
        uint256 rFee;
        uint256 tFee;
        uint256 rBurn;
        uint256 rLpReward;
        uint256 rDevReward;
    }

    mapping(address => uint256) private _rOwned;
    mapping(address => uint256) private _tOwned;
    mapping(address => mapping(address => uint256)) private _allowances;

    mapping(address => bool) private _isExcludedFromFee;

    mapping(address => bool) private _isExcluded;
    address[] private _excluded;

    uint256 private constant MAX = ~uint256(0);
    uint256 private _tTotal;
    uint256 private _rTotal;

    string public name;
    string public symbol;
    uint8 public constant decimals = 18;

    bool public globalRewardsEnabled;

    //01.00%
    uint256 private constant _holderRewardBasis = 100;

    //00.30%
    uint256 private constant _burnBasis = 30;

    //00.50%
    uint256 private constant _lpRewardBasis = 50;

    //00.20%
    uint256 private constant _devRewardBasis = 20;

    uint256 private constant _swapBasisRate = 80000;

    //tracks the total amount of token rewarded to liquidity providers
    uint256 public totalLiquidityProviderRewards;

    address public immutable uniswapV2Pair;
    IERC20 public immutable prevCzodiac;
    IERC20 public nextCzodiac;

    uint256 public immutable swapStartTimestamp;
    uint256 public immutable swapEndTimestamp;

    event HolderRewardsEvent(uint256 tokenAmount);
    event LPRewardsEvent(uint256 tokenAmount);
    event DevRewardsEvent(uint256 tokenAmount);
    event BurnEvent(uint256 tokenAmount);
    event Creation(
        IUniswapV2Router02 _uniswapV2Router,
        IERC20 _prevCzodiac,
        string _name,
        string _symbol,
        uint256 _totalSupply,
        uint256 _swapStartTimestamp,
        uint256 _swapEndTimestamp
    );
    event Swap(address _swapper, uint256 _amountToBurn, uint256 _amountToMint);

    constructor(
        IUniswapV2Router02 _uniswapV2Router,
        IERC20 _prevCzodiac,
        string memory _name,
        string memory _symbol,
        uint256 _swapStartTimestamp,
        uint256 _swapEndTimestamp
    ) {
        name = _name;
        symbol = _symbol;
        prevCzodiac = _prevCzodiac;
        swapStartTimestamp = _swapStartTimestamp;
        swapEndTimestamp = _swapEndTimestamp;

        if (address(_prevCzodiac) == address(0)) {
            _tTotal = 8 * 10**12 * 10**18;
            _rTotal = (MAX - (MAX % _tTotal));
            _rOwned[_msgSender()] = _rTotal;
        } else {
            _tTotal = _prevCzodiac.totalSupply().mul(10000).div(_swapBasisRate);
            _rTotal = (MAX - (MAX % _tTotal));
            _rOwned[address(this)] = _rTotal;
        }

        // Create a uniswap pair for this new token
        address _uniswapV2Pair =
            IUniswapV2Factory(_uniswapV2Router.factory()).createPair(
                address(this),
                _uniswapV2Router.WETH()
            );
        uniswapV2Pair = _uniswapV2Pair;

        //WARNING: Rewards will be sent to the LP pool from the lpRewards! These can be taken by anyone.
        // Do not enable global rewards until the liquidity has been added.
        globalRewardsEnabled = false;

        //exclude owner, contract, burn address from fee & rewards
        _isExcludedFromFee[owner()] = true;
        _isExcludedFromFee[address(this)] = true;
        _isExcludedFromFee[address(0)] = true;

        excludeFromReward(owner());
        excludeFromReward(address(this));
        excludeFromReward(address(0));
        excludeFromReward(_uniswapV2Pair);

        emit Creation(
            _uniswapV2Router,
            _prevCzodiac,
            _name,
            _symbol,
            _tTotal,
            _swapStartTimestamp,
            _swapEndTimestamp
        );
    }

    function swapFor(address[] calldata swappers) external onlyOwner {
        for (uint16 i; i < swappers.length; i++) {
            _swap(swappers[i]);
        }
    }

    function swap() external {
        _swap(_msgSender());
    }

    function totalSupply() public view override returns (uint256) {
        return _tTotal;
    }

    function balanceOf(address account) public view override returns (uint256) {
        if (_isExcluded[account]) return _tOwned[account];
        return tokenFromReflection(_rOwned[account]);
    }

    function transfer(address recipient, uint256 amount)
        public
        override
        returns (bool)
    {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    function allowance(address owner, address spender)
        public
        view
        override
        returns (uint256)
    {
        return _allowances[owner][spender];
    }

    function approve(address spender, uint256 amount)
        public
        override
        returns (bool)
    {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public override returns (bool) {
        _transfer(sender, recipient, amount);
        if (_msgSender() != address(nextCzodiac))
            _approve(
                sender,
                _msgSender(),
                _allowances[sender][_msgSender()].sub(
                    amount,
                    "ERC20: transfer amount exceeds allowance"
                )
            );
        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue)
        public
        virtual
        returns (bool)
    {
        _approve(
            _msgSender(),
            spender,
            _allowances[_msgSender()][spender].add(addedValue)
        );
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue)
        public
        virtual
        returns (bool)
    {
        _approve(
            _msgSender(),
            spender,
            _allowances[_msgSender()][spender].sub(
                subtractedValue,
                "ERC20: decreased allowance below zero"
            )
        );
        return true;
    }

    function isExcludedFromReward(address account) public view returns (bool) {
        return _isExcluded[account];
    }

    function deliver(uint256 tAmount) public {
        address sender = _msgSender();
        require(
            !_isExcluded[sender],
            "Excluded addresses cannot call this function"
        );
        (, RValues memory values) = _getValues(tAmount, true);
        _rOwned[sender] = _rOwned[sender].sub(values.rAmount);
        _rTotal = _rTotal.sub(values.rAmount);
        emit HolderRewardsEvent(tAmount);
    }

    function reflectionFromToken(uint256 tAmount, bool deductTransferFee)
        public
        view
        returns (uint256)
    {
        require(tAmount <= _tTotal, "Amount must be less than supply");
        (, RValues memory values) = _getValues(tAmount, true);
        if (!deductTransferFee) {
            return values.rAmount;
        } else {
            return values.rTransferAmount;
        }
    }

    function tokenFromReflection(uint256 rAmount)
        public
        view
        returns (uint256)
    {
        require(
            rAmount <= _rTotal,
            "Amount must be less than total reflections"
        );
        uint256 currentRate = _getRate();
        return rAmount.div(currentRate);
    }

    function excludeFromReward(address account) public onlyOwner() {
        require(!_isExcluded[account], "Account is already excluded");
        if (_rOwned[account] > 0) {
            _tOwned[account] = tokenFromReflection(_rOwned[account]);
        }
        _isExcluded[account] = true;
        _excluded.push(account);
    }

    function includeInReward(address account) external onlyOwner() {
        require(_isExcluded[account], "Account is already excluded");
        for (uint256 i = 0; i < _excluded.length; i++) {
            if (_excluded[i] == account) {
                _excluded[i] = _excluded[_excluded.length - 1];
                _tOwned[account] = 0;
                _isExcluded[account] = false;
                _excluded.pop();
                break;
            }
        }
    }

    function _approve(
        address owner,
        address spender,
        uint256 amount
    ) private {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _transfer(
        address from,
        address to,
        uint256 amount
    ) private {
        require(amount > 0, "Transfer amount must be greater than zero");

        //indicates if fee should be deducted from transfer
        bool takeFee = true;

        // if global fees disabled, or if any account belongs to _isExcludedFromFee account then remove the fee
        if (
            _isExcludedFromFee[from] ||
            _isExcludedFromFee[to] ||
            !globalRewardsEnabled
        ) {
            takeFee = false;
        }

        //transfer amount, it will take tax, burn, liquidity fee
        _tokenTransfer(from, to, amount, takeFee);
    }

    //this method is responsible for taking all fee, if takeFee is true
    function _tokenTransfer(
        address sender,
        address recipient,
        uint256 amount,
        bool takeFee
    ) private {
        if (_isExcluded[sender] && !_isExcluded[recipient]) {
            _transferFromExcluded(sender, recipient, amount, takeFee);
        } else if (!_isExcluded[sender] && _isExcluded[recipient]) {
            _transferToExcluded(sender, recipient, amount, takeFee);
        } else if (!_isExcluded[sender] && !_isExcluded[recipient]) {
            _transferStandard(sender, recipient, amount, takeFee);
        } else if (_isExcluded[sender] && _isExcluded[recipient]) {
            _transferBothExcluded(sender, recipient, amount, takeFee);
        } else {
            _transferStandard(sender, recipient, amount, takeFee);
        }
    }

    function _transferStandard(
        address sender,
        address recipient,
        uint256 tAmount,
        bool takeFee
    ) private {
        (TValues memory tValues, RValues memory rValues) =
            _getValues(tAmount, takeFee);
        _rOwned[sender] = _rOwned[sender].sub(rValues.rAmount);
        _rOwned[recipient] = _rOwned[recipient].add(rValues.rTransferAmount);
        _takeLpAndDevRewards(tValues.tLpReward, tValues.tDevReward);
        _reflectFee(
            rValues.rFee,
            rValues.rBurn,
            tValues.tHolderReward,
            tValues.tBurn
        );
        emit Transfer(sender, recipient, tValues.tTransferAmount);
    }

    function _transferToExcluded(
        address sender,
        address recipient,
        uint256 tAmount,
        bool takeFee
    ) private {
        (TValues memory tValues, RValues memory rValues) =
            _getValues(tAmount, takeFee);
        _rOwned[sender] = _rOwned[sender].sub(rValues.rAmount);
        _tOwned[recipient] = _tOwned[recipient].add(tValues.tTransferAmount);
        _rOwned[recipient] = _rOwned[recipient].add(rValues.rTransferAmount);
        _takeLpAndDevRewards(tValues.tLpReward, tValues.tDevReward);
        _reflectFee(
            rValues.rFee,
            rValues.rBurn,
            tValues.tHolderReward,
            tValues.tBurn
        );
        emit Transfer(sender, recipient, tValues.tTransferAmount);
    }

    function _transferFromExcluded(
        address sender,
        address recipient,
        uint256 tAmount,
        bool takeFee
    ) private {
        (TValues memory tValues, RValues memory rValues) =
            _getValues(tAmount, takeFee);
        _tOwned[sender] = _tOwned[sender].sub(tAmount);
        _rOwned[sender] = _rOwned[sender].sub(rValues.rAmount);
        _rOwned[recipient] = _rOwned[recipient].add(rValues.rTransferAmount);
        _takeLpAndDevRewards(tValues.tLpReward, tValues.tDevReward);
        _reflectFee(
            rValues.rFee,
            rValues.rBurn,
            tValues.tHolderReward,
            tValues.tBurn
        );
        emit Transfer(sender, recipient, tValues.tTransferAmount);
    }

    function _transferBothExcluded(
        address sender,
        address recipient,
        uint256 tAmount,
        bool takeFee
    ) private {
        (TValues memory tValues, RValues memory rValues) =
            _getValues(tAmount, takeFee);
        _tOwned[sender] = _tOwned[sender].sub(tAmount);
        _rOwned[sender] = _rOwned[sender].sub(rValues.rAmount);
        _tOwned[recipient] = _tOwned[recipient].add(tValues.tTransferAmount);
        _rOwned[recipient] = _rOwned[recipient].add(rValues.rTransferAmount);
        _takeLpAndDevRewards(tValues.tLpReward, tValues.tDevReward);
        _reflectFee(
            rValues.rFee,
            rValues.rBurn,
            tValues.tHolderReward,
            tValues.tBurn
        );
        emit Transfer(sender, recipient, tValues.tTransferAmount);
    }

    function _reflectFee(
        uint256 rFee,
        uint256 rBurn,
        uint256 tFee,
        uint256 tBurn
    ) private {
        _rTotal = _rTotal.sub(rFee).sub(rBurn);
        _tTotal = _tTotal.sub(tBurn);
        emit HolderRewardsEvent(tFee);
        emit BurnEvent(tBurn);
    }

    function _getValues(uint256 tAmount, bool takeFee)
        private
        view
        returns (TValues memory tValues, RValues memory rValues)
    {
        tValues = _getTValues(tAmount, takeFee);
        rValues = _getRValues(tAmount, tValues);
    }

    function _getTValues(uint256 tAmount, bool takeFee)
        private
        pure
        returns (TValues memory values)
    {
        values.tHolderReward = takeFee ? calculateHolderReward(tAmount) : 0;
        values.tBurn = takeFee ? calculateBurn(tAmount) : 0;
        values.tLpReward = takeFee ? calculateLpReward(tAmount) : 0;
        values.tDevReward = takeFee ? calculateDevReward(tAmount) : 0;
        values.tTransferAmount = tAmount
            .sub(values.tHolderReward)
            .sub(values.tBurn)
            .sub(values.tLpReward)
            .sub(values.tDevReward);
    }

    function _getRValues(uint256 tAmount, TValues memory tValues)
        private
        view
        returns (RValues memory values)
    {
        values.rate = _getRate();
        values.rAmount = tAmount.mul(values.rate);
        values.rFee = tValues.tHolderReward.mul(values.rate);
        values.rBurn = tValues.tBurn.mul(values.rate);
        values.rLpReward = tValues.tLpReward.mul(values.rate);
        values.rDevReward = tValues.tDevReward.mul(values.rate);
        values.rTransferAmount = values
            .rAmount
            .sub(values.rFee)
            .sub(values.rBurn)
            .sub(values.rLpReward)
            .sub(values.rDevReward);
    }

    function _getRate() private view returns (uint256) {
        (uint256 rSupply, uint256 tSupply) = _getCurrentSupply();
        return rSupply.div(tSupply);
    }

    function _getCurrentSupply() private view returns (uint256, uint256) {
        uint256 rSupply = _rTotal;
        uint256 tSupply = _tTotal;
        for (uint256 i = 0; i < _excluded.length; i++) {
            if (
                _rOwned[_excluded[i]] > rSupply ||
                _tOwned[_excluded[i]] > tSupply
            ) return (_rTotal, _tTotal);
            rSupply = rSupply.sub(_rOwned[_excluded[i]]);
            tSupply = tSupply.sub(_tOwned[_excluded[i]]);
        }
        if (rSupply < _rTotal.div(_tTotal)) return (_rTotal, _tTotal);
        return (rSupply, tSupply);
    }

    function _takeLpAndDevRewards(uint256 tLiquidity, uint256 tDevRewards)
        private
    {
        uint256 currentRate = _getRate();

        //take lp providers reward
        uint256 rLiquidity = tLiquidity.mul(currentRate);
        uint256 initialLPTokens = balanceOf(address(uniswapV2Pair));
        _rOwned[address(uniswapV2Pair)] = _rOwned[address(uniswapV2Pair)].add(
            rLiquidity
        );
        if (_isExcluded[address(uniswapV2Pair)])
            _tOwned[address(uniswapV2Pair)] = _tOwned[address(uniswapV2Pair)]
                .add(tLiquidity);
        IUniswapV2Pair(uniswapV2Pair).sync();
        uint256 finalLPTokens = balanceOf(address(uniswapV2Pair));
        emit LPRewardsEvent(finalLPTokens.sub(initialLPTokens));

        //take dev rewards
        uint256 rDevRewards = tDevRewards.mul(currentRate);
        uint256 initialDevTokens = balanceOf(owner());
        _rOwned[owner()] = _rOwned[owner()].add(rDevRewards);
        if (_isExcluded[owner()])
            _tOwned[owner()] = _tOwned[owner()].add(tDevRewards);
        uint256 finalDevTokens = balanceOf(owner());
        emit DevRewardsEvent(finalDevTokens.sub(initialDevTokens));
    }

    function _swap(address swapper) private {
        require(
            address(prevCzodiac) != address(0),
            "CzodiacToken: No previous czodiac"
        );
        require(
            block.timestamp >= swapStartTimestamp,
            "CzodiacToken: Swap not yet open"
        );
        require(
            block.timestamp <= swapEndTimestamp,
            "CzodiacToken: Swap closed"
        );
        uint256 amountToBurn = prevCzodiac.balanceOf(swapper);
        require(
            amountToBurn > 0,
            "CzodiacToken: No tokens to swap from previous contract"
        );
        uint256 amountToMint = amountToBurn.mul(10000).div(_swapBasisRate);
        prevCzodiac.transferFrom(swapper, address(this), amountToBurn);
        _transfer(address(this), swapper, amountToMint);
        emit Swap(swapper, amountToBurn, amountToMint);
    }

    function calculateHolderReward(uint256 _amount)
        private
        pure
        returns (uint256)
    {
        return _amount.mul(_holderRewardBasis).div(10**4);
    }

    function calculateBurn(uint256 _amount) private pure returns (uint256) {
        return _amount.mul(_burnBasis).div(10**4);
    }

    function calculateLpReward(uint256 _amount) private pure returns (uint256) {
        return _amount.mul(_lpRewardBasis).div(10**4);
    }

    function calculateDevReward(uint256 _amount)
        private
        pure
        returns (uint256)
    {
        return _amount.mul(_devRewardBasis).div(10**4);
    }

    function isExcludedFromFee(address account) public view returns (bool) {
        return _isExcludedFromFee[account];
    }

    function excludeFromFee(address account) external onlyOwner {
        _isExcludedFromFee[account] = true;
    }

    function includeInFee(address account) external onlyOwner {
        _isExcludedFromFee[account] = false;
    }

    function setNextCzodiac(IERC20 _nextCzodiac) external onlyOwner {
        _isExcludedFromFee[address(_nextCzodiac)];
        nextCzodiac = _nextCzodiac;
    }

    function setGlobalRewardsEnabled(bool _globalRewardsEnabled)
        external
        onlyOwner
    {
        globalRewardsEnabled = _globalRewardsEnabled;
    }

    function withdrawToken(IERC20 _token) external onlyOwner {
        _token.transfer(owner(), _token.balanceOf(address(this)));
    }
}
