pragma solidity 0.8.4;

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
Credit to OpenZeppelin, reflect.finance, split.network, bubbadefi.finance, uniswapv2, olive.cash, pancakeswap,
iron.finance, Wex/WaultSwap, Yearn, minime, Alchemix, Compound, and of course my friends at d0rg plus everyone
else who released the truly open source code used in this project.

*/

// File @openzeppelin/contracts/token/ERC20/IERC20.sol@v4.3.2

//pragma solidity ^0.8.0;

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    /**
     * @dev Returns the amount of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves `amount` tokens from the caller's account to `recipient`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address recipient, uint256 amount)
        external
        returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender)
        external
        view
        returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `sender` to `recipient` using the
     * allowance mechanism. `amount` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

// File contracts/interfaces/IBeltMultiStrategyToken.sol

//
// Authored by Plastic Digits
// Credit to Belt
//pragma solidity ^0.8.4;
interface IBeltMultiStrategyToken is IERC20 {
    function token() external view returns (address);

    function deposit(uint256 _amount, uint256 _minShares) external;

    function depositBNB(uint256 _minShares) external payable;

    function withdraw(uint256 _shares, uint256 _minAmount) external;

    function withdrawBNB(uint256 _shares, uint256 _minAmount) external;

    function getPricePerFullShare() external view returns (uint256);

    function sharesToAmount(uint256 _shares) external view returns (uint256);
}

// File contracts/BeltPricePerShareLast.sol

//
// Authored by Plastic Digits
//pragma solidity ^0.8.4;
contract BeltPriceShareLast {
    mapping(IBeltMultiStrategyToken => uint256) public pricePerFullShareLast;
    mapping(IBeltMultiStrategyToken => uint256) public updateTimeLast;
    mapping(IBeltMultiStrategyToken => uint256) public pricePerFullShareRecent;
    mapping(IBeltMultiStrategyToken => uint256) public updateTimeRecent;
    uint256 public delaySeconds;

    constructor(uint256 _delaySeconds) {
        delaySeconds = _delaySeconds;
    }

    function start(IBeltMultiStrategyToken _strategyToken) external {
        require(
            updateTimeLast[_strategyToken] == 0,
            "BeltPriceShareLast: Token already started"
        );
        pricePerFullShareLast[_strategyToken] = _strategyToken
            .getPricePerFullShare();
        updateTimeLast[_strategyToken] = block.timestamp;
        pricePerFullShareRecent[_strategyToken] = _strategyToken
            .getPricePerFullShare();
        updateTimeRecent[_strategyToken] = block.timestamp;
    }

    function update(IBeltMultiStrategyToken _strategyToken) external {
        if (block.timestamp < updateTimeRecent[_strategyToken] + delaySeconds)
            return;
        updateTimeLast[_strategyToken] = updateTimeRecent[_strategyToken];
        pricePerFullShareLast[_strategyToken] = pricePerFullShareRecent[
            _strategyToken
        ];
        updateTimeRecent[_strategyToken] = block.timestamp;
        pricePerFullShareRecent[_strategyToken] = _strategyToken
            .getPricePerFullShare();
    }
}
