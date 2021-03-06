// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract LockedSale is Context, Ownable {
    using Address for address;
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    uint256 public startTime;
    uint256 public endTime;
    uint256 public minPurchase;
    uint256 public maxPurchase;
    uint256 public maxSaleSize;
    uint256 public tokensForSale;

    IERC20 token;

    bool public whitelistRequired = true;

    uint256 public totalBuyers;
    uint256 public totalPurchases;

    mapping(address => bool) public _isWhitelisted;
    mapping(address => uint256) public deposits;
    mapping(address => uint256) public buyerIndex;
    address[] public buyers;

    uint256 public distributedCount;

    event SetState(
        uint256 _startTime,
        uint256 _endTime,
        uint256 _minPurchase,
        uint256 _maxPurchase,
        uint256 _tokensForSale,
        IERC20 _token
    );

    event Whitelist(address _buyer);
    event Unwhitelist(address _buyer);
    event Deposit(address _buyer, uint256 _value);

    constructor(
        uint256 _startTime,
        uint256 _endTime,
        uint256 _minPurchase,
        uint256 _maxPurchase,
        uint256 _tokensForSale,
        uint256 _maxSaleSize,
        IERC20 _token
    ) Ownable() {
        setState(
            _startTime,
            _endTime,
            _minPurchase,
            _maxPurchase,
            _tokensForSale,
            _maxSaleSize,
            _token
        );
    }

    receive() external payable {
        _deposit(_msgSender());
    }

    function setState(
        uint256 _startTime,
        uint256 _endTime,
        uint256 _minPurchase,
        uint256 _maxPurchase,
        uint256 _tokensForSale,
        uint256 _maxSaleSize,
        IERC20 _token
    ) public onlyOwner {
        require(_startTime < _endTime, "LockedSale: Start must be before end.");
        require(
            _minPurchase < _maxPurchase,
            "LockedSale: Minimum purchase must be less than or equal to maximum purchase."
        );

        startTime = _startTime;
        endTime = _endTime;
        minPurchase = _minPurchase;
        maxPurchase = _maxPurchase;
        tokensForSale = _tokensForSale;
        maxSaleSize = _maxSaleSize;
        token = _token;

        emit SetState(
            _startTime,
            _endTime,
            _minPurchase,
            _maxPurchase,
            _tokensForSale,
            _token
        );
    }

    function setWhitelistRequired(bool _value) external onlyOwner {
        whitelistRequired = _value;
    }

    function isWhitelisted(address _buyer) public view returns (bool) {
        if (!whitelistRequired) return true;
        return _isWhitelisted[_buyer];
    }

    function getState()
        external
        view
        returns (
            uint256 _startTime,
            uint256 _endTime,
            uint256 _minPurchase,
            uint256 _maxPurchase,
            uint256 _tokensForSale,
            IERC20 _token,
            uint256 _totalBuyers,
            uint256 _totalPurchases
        )
    {
        _startTime = startTime;
        _endTime = endTime;
        _minPurchase = minPurchase;
        _maxPurchase = maxPurchase;
        _tokensForSale = tokensForSale;
        _token = token;
        _totalBuyers = totalBuyers;
        _totalPurchases = totalPurchases;
    }

    function whitelist(address[] calldata _buyers) external onlyOwner {
        for (uint256 i = 0; i < _buyers.length; i++) {
            _isWhitelisted[_buyers[i]] = true;
            emit Whitelist(_buyers[i]);
        }
    }

    function unwhitelist(address[] calldata _buyers) external onlyOwner {
        for (uint256 i = 0; i < _buyers.length; i++) {
            _isWhitelisted[_buyers[i]] = false;
            emit Unwhitelist(_buyers[i]);
        }
    }

    function deposit() external payable {
        _deposit(_msgSender());
    }

    function depositFor(address _buyer) external payable {
        _deposit(_buyer);
    }

    function distribute(uint256 _count) external onlyOwner {
        if (_count.add(distributedCount) > buyers.length) {
            _count = buyers.length.sub(distributedCount);
        }
        uint256 rateWad = tokensForSale.mul(10**18).div(maxSaleSize);
        for (
            uint256 i = distributedCount;
            i < distributedCount.add(_count);
            i++
        ) {
            _distribute(i, rateWad);
        }
        distributedCount = distributedCount.add(_count);
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function withdrawToken(IERC20 _token) external onlyOwner {
        _token.transfer(owner(), _token.balanceOf(address(this)));
    }

    function _distribute(uint256 _index, uint256 _rateWad) internal {
        address account = buyers[_index];
        token.safeTransfer(
            account,
            deposits[account].mul(_rateWad).div(10**18)
        );
    }

    function _deposit(address _buyer) internal {
        require(isWhitelisted(_buyer), "LockedSale: Buyer is not whitelisted");
        require(block.timestamp >= startTime, "LockedSale: Sale not yet open.");
        require(block.timestamp <= endTime, "LockedSale: Sale has closed.");
        require(
            msg.value >= minPurchase && msg.value > 0,
            "LockedSale: Cannot buy less than minPurchase."
        );
        if (deposits[_buyer] == 0) {
            buyers.push(_buyer);
            buyerIndex[_buyer] = totalBuyers;
            totalBuyers = totalBuyers.add(1);
        }
        deposits[_buyer] = deposits[_buyer].add(msg.value);
        totalPurchases = totalPurchases.add(msg.value);
        require(
            deposits[_buyer] <= maxPurchase,
            "LockedSale: Cannot buy more than maxPurchase."
        );
        require(
            totalPurchases <= maxSaleSize,
            "LockedSale: Cannot buy more than maxSaleSize."
        );
        emit Deposit(_buyer, msg.value);
    }
}
