// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./CZFarm.sol";

contract CZFBuyoutToken is Ownable {
    using SafeERC20 for IERC20;

    uint256 public rateWad;
    CZFarm public czf;
    IERC20 public token;
    uint256 public startEpoch;

    constructor(uint256 _rateWad, CZFarm _czf, IERC20 _token, uint256 _startEpoch) Ownable() {
        rateWad = _rateWad;
        czf = _czf;
        token = _token;
        startEpoch = _startEpoch;
    }

    function swapAll() external {
        swapFor(token.balanceOf(msg.sender),msg.sender);
    }

    function swapFor(uint _wad, address _for) public {
        require(block.timestamp >= startEpoch, "CZFBuyoutToken: Swap not open");
        token.transferFrom(msg.sender, address(this), _wad);
        czf.mint(_for,_wad * rateWad / 1 ether);
    }

    function setRateWad(uint _to) onlyOwner external {
        rateWad = _to;
    }

    function recoverERC20(address tokenAddress) external onlyOwner {
        IERC20(tokenAddress).safeTransfer(
            _msgSender(),
            IERC20(tokenAddress).balanceOf(address(this))
        );
    }
}