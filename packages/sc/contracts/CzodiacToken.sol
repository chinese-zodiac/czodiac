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
░░░░░░░░░░░░░░░░░░░░░█████╗░░█████╗░░█████╗░░█████╗░░█████╗░░█████╗░░█████╗░░█████╗░░█████╗░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░░░░░░░░██╔══██╗██╔══██╗██╔══██╗██╔══██╗██╔══██╗██╔══██╗██╔══██╗██╔══██╗██╔══██╗░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░░░░░░░░╚█████╔╝╚█████╔╝╚█████╔╝╚█████╔╝╚█████╔╝╚█████╔╝╚█████╔╝╚█████╔╝╚█████╔╝░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░░░░░░░░██╔══██╗██╔══██╗██╔══██╗██╔══██╗██╔══██╗██╔══██╗██╔══██╗██╔══██╗██╔══██╗░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░░░░░░░░╚█████╔╝╚█████╔╝╚█████╔╝╚█████╔╝╚█████╔╝╚█████╔╝╚█████╔╝╚█████╔╝╚█████╔╝░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░░░░░░░░░╚════╝░░╚════╝░░╚════╝░░╚════╝░░╚════╝░░╚════╝░░╚════╝░░╚════╝░░╚════╝░░░░░░░░░░░░░░░░░░░
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋░░
░░╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋┏┓╋╋╋╋╋╋╋┏┓╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋░░
░░╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋┏━┳━┫┗┓┏┓┏┳┳━┫┣┳┳┓╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋░░
░░╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋┃╋┃┻┫┏┫┃┗┫┃┃━┫━┫┃┃╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋░░
░░╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋┣┓┣━┻━┛┗━┻━┻━┻┻╋┓┃╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋░░
░░╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋┗━┛╋╋╋╋╋╋╋╋╋╋╋╋┗━┛╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋░░
░░╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋╋░░
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

Authored by Plastic Fingers
Credit to reflect.finance

*/
pragma solidity ^0.8.4;


import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IUniswapV2Pair.sol";

contract CzodiacToken is Context, IERC20, Ownable {
    using SafeMath for uint256;
    using Address for address;

    mapping (address => uint256) private rOwned;
    mapping (address => uint256) private tOwned;
    mapping (address => mapping (address => uint256)) private allowances;

    mapping (address => bool) public isExcluded;
    address[] private excluded;

    address private pair;
    IERC20 private prevCzodiac;
   
    uint256 private constant MAX = ~uint256(0);
    uint256 private tTotal = 10 * 10**6 ;
    uint256 private rTotal;
    uint256 private tFeeTotal;

    string public name;
    string public symbol;
    uint8 public constant decimals = 9;

    uint8 private hdBasisTax = 50;
    uint8 private lpBasisTax = 30;
    uint8 private dvBasisTax = 20;

    uint32 private swapBasisRate = 80000;

    constructor (string memory _name, string memory _symbol, uint256 _totalSupply, IERC20 _prevCzodiac) {
        name = _name;
        symbol = _symbol;
        tTotal = _totalSupply * 10**9;
        rTotal = (MAX - (MAX % tTotal));
        _prevCzodiac = prevCzodiac;
        rOwned[address(this)] = rTotal;
        emit Transfer(address(0), _msgSender(), tTotal);
        excludeAccount(address(this));
        excludeAccount(address(0));
    }

    function swap() public {
        if(address(prevCzodiac) != address(0)){
            uint256 amountToSwap = balanceOf(_msgSender());
            prevCzodiac.transferFrom(_msgSender(),address(0), amountToSwap);
            _transfer(address(this), _msgSender(), _divBasisPoints(amountToSwap,swapBasisRate));
        } else {
            // initial distribution
            //Transfer half to vitalik, he is our god
            _transfer(address(this), address(0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B), 4000000000*10**9 );
            //Transfer remainder for initial liquidity sale & lock.
            _transfer(address(this), owner(), 4000000000*10**9 );
            
        }
    }

    function totalSupply() public view override returns (uint256) {
        return tTotal;
    }

    function balanceOf(address account) public view override returns (uint256) {
        if (isExcluded[account]) return tOwned[account];
        return tokenFromReflection(rOwned[account]);
    }

    function transfer(address recipient, uint256 amount) public override returns (bool) {
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    function allowance(address owner, address spender) public view override returns (uint256) {
        return allowances[owner][spender];
    }

    function approve(address spender, uint256 amount) public override returns (bool) {
        _approve(_msgSender(), spender, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
        _transfer(sender, recipient, amount);
        _approve(sender, _msgSender(), allowances[sender][_msgSender()].sub(amount, "ERC20: transfer amount exceeds allowance"));
        return true;
    }

    function increaseAllowance(address spender, uint256 addedValue) public virtual returns (bool) {
        _approve(_msgSender(), spender, allowances[_msgSender()][spender].add(addedValue));
        return true;
    }

    function decreaseAllowance(address spender, uint256 subtractedValue) public virtual returns (bool) {
        _approve(_msgSender(), spender, allowances[_msgSender()][spender].sub(subtractedValue, "ERC20: decreased allowance below zero"));
        return true;
    }

    function totalFees() public view returns (uint256) {
        return tFeeTotal;
    }

    function reflect(uint256 tAmount) public {
        address sender = _msgSender();
        require(!isExcluded[sender], "Excluded addresses cannot call this function");
        (uint256 rAmount,,,,) = _getValues(tAmount);
        rOwned[sender] = rOwned[sender].sub(rAmount);
        rTotal = rTotal.sub(rAmount);
        tFeeTotal = tFeeTotal.add(tAmount);
    }

    function reflectionFromToken(uint256 tAmount, bool deductTransferFee) public view returns(uint256) {
        require(tAmount <= tTotal, "Amount must be less than supply");
        if (!deductTransferFee) {
            (uint256 rAmount,,,,) = _getValues(tAmount);
            return rAmount;
        } else {
            (,uint256 rTransferAmount,,,) = _getValues(tAmount);
            return rTransferAmount;
        }
    }

    function tokenFromReflection(uint256 rAmount) public view returns(uint256) {
        require(rAmount <= rTotal, "Amount must be less than total reflections");
        uint256 currentRate =  _getRate();
        return rAmount.div(currentRate);
    }

    function excludeAccount(address account) public onlyOwner() {
        require(!isExcluded[account], "Account is already excluded");
        if(rOwned[account] > 0) {
            tOwned[account] = tokenFromReflection(rOwned[account]);
        }
        isExcluded[account] = true;
        excluded.push(account);
    }

    function includeAccount(address account) external onlyOwner() {
        require(isExcluded[account], "Account is already excluded");
        for (uint256 i = 0; i < excluded.length; i++) {
            if (excluded[i] == account) {
                excluded[i] = excluded[excluded.length - 1];
                tOwned[account] = 0;
                isExcluded[account] = false;
                excluded.pop();
                break;
            }
        }
    }

    function _approve(address owner, address spender, uint256 amount) private {
        require(owner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _transfer(address sender, address recipient, uint256 amount) private {
        require(amount > 0, "Transfer amount must be greater than zero");
        if (isExcluded[sender] && !isExcluded[recipient]) {
            _transferFromExcluded(sender, recipient, amount);
        } else if (!isExcluded[sender] && isExcluded[recipient]) {
            _transferToExcluded(sender, recipient, amount);
        } else if (!isExcluded[sender] && !isExcluded[recipient]) {
            _transferStandard(sender, recipient, amount);
        } else if (isExcluded[sender] && isExcluded[recipient]) {
            _transferBothExcluded(sender, recipient, amount);
        } else {
            _transferStandard(sender, recipient, amount);
        }
    }

    function _transferStandard(address sender, address recipient, uint256 tAmount) private {
        (uint256 rAmount, uint256 rTransferAmount, uint256 rFee, uint256 tTransferAmount, uint256 tFee) = _getValues(tAmount);
        rOwned[sender] = rOwned[sender].sub(rAmount);
        rOwned[recipient] = rOwned[recipient].add(rTransferAmount);       
        _reflectFee(rFee, tFee);
        emit Transfer(sender, recipient, tTransferAmount);
    }

    function _transferToExcluded(address sender, address recipient, uint256 tAmount) private {
        (uint256 rAmount, uint256 rTransferAmount, uint256 rFee, uint256 tTransferAmount, uint256 tFee) = _getValues(tAmount);
        rOwned[sender] = rOwned[sender].sub(rAmount);
        tOwned[recipient] = tOwned[recipient].add(tTransferAmount);
        rOwned[recipient] = rOwned[recipient].add(rTransferAmount);           
        _reflectFee(rFee, tFee);
        emit Transfer(sender, recipient, tTransferAmount);
    }

    function _transferFromExcluded(address sender, address recipient, uint256 tAmount) private {
        (uint256 rAmount, uint256 rTransferAmount, uint256 rFee, uint256 tTransferAmount, uint256 tFee) = _getValues(tAmount);
        tOwned[sender] = tOwned[sender].sub(tAmount);
        rOwned[sender] = rOwned[sender].sub(rAmount);
        rOwned[recipient] = rOwned[recipient].add(rTransferAmount);   
        _reflectFee(rFee, tFee);
        emit Transfer(sender, recipient, tTransferAmount);
    }

    function _transferBothExcluded(address sender, address recipient, uint256 tAmount) private {
        (uint256 rAmount, uint256 rTransferAmount, uint256 rFee, uint256 tTransferAmount, uint256 tFee) = _getValues(tAmount);
        tOwned[sender] = tOwned[sender].sub(tAmount);
        rOwned[sender] = rOwned[sender].sub(rAmount);
        tOwned[recipient] = tOwned[recipient].add(tTransferAmount);
        rOwned[recipient] = rOwned[recipient].add(rTransferAmount);        
        _reflectFee(rFee, tFee);
        emit Transfer(sender, recipient, tTransferAmount);
    }

    function _reflectFee(uint256 rFee, uint256 tFee) private {
        rTotal = rTotal.sub(rFee);
        tFeeTotal = tFeeTotal.add(tFee);
    }

    function _getValues(uint256 tAmount) private view returns (uint256, uint256, uint256, uint256, uint256) {
        (uint256 tTransferAmount, uint256 tFee) = _getTValues(tAmount);
        uint256 currentRate =  _getRate();
        (uint256 rAmount, uint256 rTransferAmount, uint256 rFee) = _getRValues(tAmount, tFee, currentRate);
        return (rAmount, rTransferAmount, rFee, tTransferAmount, tFee);
    }

    function _getTValues(uint256 tAmount) private pure returns (uint256, uint256) {
        //TODO: split fee between holders, liquidity pool, and devs.
        uint256 tFee = tAmount.div(100);
        uint256 tTransferAmount = tAmount.sub(tFee);
        return (tTransferAmount, tFee);
    }

    function _getRValues(uint256 tAmount, uint256 tFee, uint256 currentRate) private pure returns (uint256, uint256, uint256) {
        uint256 rAmount = tAmount.mul(currentRate);
        uint256 rFee = tFee.mul(currentRate);
        uint256 rTransferAmount = rAmount.sub(rFee);
        return (rAmount, rTransferAmount, rFee);
    }

    function _getRate() private view returns(uint256) {
        (uint256 rSupply, uint256 tSupply) = _getCurrentSupply();
        return rSupply.div(tSupply);
    }

    function _mulBasisPoints(uint _amount, uint _basisPoints) private pure returns(uint256) {
        return _amount.mul(_basisPoints).div(10000);
    }

    function _divBasisPoints(uint _amount, uint _basisPoints) private pure returns(uint256) {
        return _amount.mul(10000).div(_basisPoints);
    }

    function _getCurrentSupply() private view returns(uint256, uint256) {
        uint256 rSupply = rTotal;
        uint256 tSupply = tTotal;      
        for (uint256 i = 0; i < excluded.length; i++) {
            if (rOwned[excluded[i]] > rSupply || tOwned[excluded[i]] > tSupply) return (rTotal, tTotal);
            rSupply = rSupply.sub(rOwned[excluded[i]]);
            tSupply = tSupply.sub(tOwned[excluded[i]]);
        }
        if (rSupply < rTotal.div(tTotal)) return (rTotal, tTotal);
        return (rSupply, tSupply);
    }
}