// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// Set as owner of LSDT to fix upkeeps
pragma solidity ^0.8.4;

import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IAmmRouter02.sol";
import "./interfaces/IDotDot.sol";
import "./interfaces/IDepxFeeDistributor.sol";

contract DotDotDepositor is KeeperCompatibleInterface, Ownable {
    using SafeERC20 for IERC20;

    IAmmRouter02 public router =
        IAmmRouter02(0x10ED43C718714eb63d5aA57B78B54704E256024E);

    address public czusdLp = 0x73A7A74627f5A4fcD6d7EEF8E023865C4a84CfE8;
    address public treasury = 0x745A676C5c472b50B50e18D4b59e9AeEEc597046;
    uint256 public dddTriggerLevel = 20000 ether;
    IDotDot public dotdot = IDotDot(0x8189F0afdBf8fE6a9e13c69bA35528ac6abeB1af);

    address public ddd = 0x84c97300a190676a19D1E13115629A11f8482Bd1;
    address public epx = 0xAf41054C1487b0e5E2B9250C0332eCBCe6CE9d71;
    IDepxFeeDistributor public depxFeeDistributor =
        IDepxFeeDistributor(0xd4F7b4BC46e6e499D35335D270fd094979D815A0);
    address public wbnb = 0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c;
    address public busd = 0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56;

    function executeOnDotDot(bytes memory abiSignatureEncoded)
        external
        onlyOwner
    {
        (bool success, bytes memory returndata) = address(dotdot).call(
            abiSignatureEncoded
        );
    }

    function executeOnDepxFeeDistributor(bytes memory abiSignatureEncoded)
        external
        onlyOwner
    {
        (bool success, bytes memory returndata) = address(depxFeeDistributor)
            .call(abiSignatureEncoded);
    }

    function claimDepxFees(uint256 _start, uint256 _count) public {
        address[] memory tokens = new address[](_count);
        for (uint256 i = _start; i < _start + _count; i++) {
            if (i == 0) {
                tokens[i] = ddd;
            } else if (i == 1) {
                tokens[i] = epx;
            } else {
                tokens[i] = depxFeeDistributor.feeTokens(i - 2);
            }
        }
        depxFeeDistributor.claim(address(this), tokens);

        for (uint256 i = _start; i < _start + _count; i++) {
            IERC20(tokens[i]).transfer(
                treasury,
                IERC20(tokens[i]).balanceOf(address(this))
            );
        }
    }

    function claimAllDepxFees() external {
        claimDepxFees(0, depxFeeDistributor.feeTokensLength() + 2);
    }

    function depositedBalance() public view returns (uint256) {
        return dotdot.userBalances(address(this), czusdLp);
    }

    function claimableDdd() public view returns (uint256) {
        address[] memory tokens = new address[](1);
        tokens[0] = czusdLp;
        return dotdot.claimable(address(this), tokens)[0].ddd;
    }

    function claim() public {
        address[] memory tokens = new address[](1);
        tokens[0] = czusdLp;
        dotdot.claim(address(this), tokens, type(uint256).max);

        uint256 amountToSell = IERC20(ddd).balanceOf(address(this));
        address[] memory path = new address[](3);
        path[0] = ddd;
        path[1] = wbnb;
        path[2] = busd;
        IERC20(ddd).approve(address(router), amountToSell);
        router.swapExactTokensForTokens(
            amountToSell,
            0,
            path,
            treasury,
            block.timestamp
        );
    }

    function depositAll() public {
        uint256 amount = IERC20(czusdLp).balanceOf(address(this));
        deposit(amount);
    }

    function deposit(uint256 _wad) public {
        IERC20(czusdLp).approve(address(dotdot), _wad);
        dotdot.deposit(address(this), czusdLp, _wad);
    }

    function withdraw() external onlyOwner {
        dotdot.withdraw(treasury, czusdLp, depositedBalance());
    }

    function checkUpkeep(bytes calldata)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory)
    {
        upkeepNeeded = claimableDdd() >= dddTriggerLevel;
    }

    function performUpkeep(bytes calldata) external override {
        claim();
    }

    function recoverERC20(address tokenAddress) external onlyOwner {
        IERC20(tokenAddress).transfer(
            _msgSender(),
            IERC20(tokenAddress).balanceOf(address(this))
        );
    }

    function setDddTriggerLevel(uint256 _to) external onlyOwner {
        dddTriggerLevel = _to;
    }
}
