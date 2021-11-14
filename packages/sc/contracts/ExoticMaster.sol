// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// Credit to Olympus DAO
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./ExoticVesting.sol";

contract ExoticMaster {
    using SafeERC20 for IERC20;

    uint16 maxPurchaseBasis;
    uint16 minusFactor;
    uint16 hourlyIncreaseBasis;

    IERC20 asset;
    ExoticVesting exoticVesting;
    address treasury;

    struct Farm {
        uint224 startPriceWad;
        uint32 lastPurchaseEpoch;
        IERC20 lp;
    }

    Farm[] farms;

    function deposit(
        address _for,
        uint256 _id,
        uint256 _lpWad,
        uint256 _minPrice
    ) external {
        Farm storage farm = farms[_id];
        require(
            address(0) != address(farm.lp),
            "ExoticMaster: Farm does not exist."
        );

        uint256 price = getPrice(_id);
        require(
            price < _minPrice,
            "ExoticMaster: Price decreased below min price."
        );
        uint256 rewardAmt = (price * _lpWad) / 1 ether;
        uint256 assetTotal = asset.balanceOf(address(this));
        require(
            (rewardAmt * maxPurchaseBasis) / 10000 <= assetTotal,
            "ExoticMaster: Deposit too large"
        );

        farm.lastPurchaseEpoch = uint32(block.timestamp);
        farm.startPriceWad = uint224(
            price * ((assetTotal - rewardAmt * minusFactor) / assetTotal)
        );

        farm.lp.transferFrom(msg.sender, treasury, _lpWad);
        exoticVesting.addVest(
            _for,
            uint112(rewardAmt),
            uint32(block.timestamp),
            uint32(365 days)
        );
    }

    function getPrice(uint256 _id) public view returns (uint256) {
        Farm storage farm = farms[_id];
        return
            farm.startPriceWad *
            (((block.timestamp - farm.lastPurchaseEpoch) *
                (10000 + hourlyIncreaseBasis)) / (1 hours * 10000));
    }

    //TODO: owner methods to change variables, add farms, constructor
}
