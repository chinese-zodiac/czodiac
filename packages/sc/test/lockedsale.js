// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digital
// If you read this, know that I love you even if your mom doesnt <3
const chai = require('chai');
const { solidity } = require("ethereum-waffle");
chai.use(solidity);

const { ethers, config } = require('hardhat');
const { time } = require("@openzeppelin/test-helpers");
const { toNum, toBN } = require("./utils/bignumberConverter");

const loadJsonFile = require("load-json-file");
const { uniswapRouterAddress, zeroAddress } = loadJsonFile.sync("./deployConfig.json");

const { expect } = chai;
const { parseEther } = ethers.utils;

describe("LockedSale", function() {
    let czodiacToken, lockedSale;
    let uniswapPairAddress;
    let ownerAddress, traderAddress;
    let now;

    before(async function() {
        [ownerAddress, traderAddress] = await ethers.getSigners();

        const CZodiacToken = await ethers.getContractFactory("CZodiacToken");
        czodiacToken = await CZodiacToken.deploy(
        uniswapRouterAddress, // IUniswapV2Router02 _uniswapV2Router
        zeroAddress,// IERC20 _prevCzodiac
        "01czodiac", //string memory _name
        "01c", //string memory _symbol
        0,//uint256 _swapStartTimestamp
        0//uint256 _swapEndTimestamp
        );
        await czodiacToken.deployed();
        uniswapPairAddress = await czodiacToken.uniswapV2Pair();

        await time.advanceBlock();
        now = await time.latest();

        const LockedSale = await ethers.getContractFactory("LockedSale");
        lockedSale = await LockedSale.deploy(
            now.add(time.duration.days(1)).toNumber(),//uint256 _startTime
            now.add(time.duration.days(3)).toNumber(),//uint256 _endTime,
            now.add(time.duration.days(10)).toNumber(),//uint256 _unlockTimestamp,
            parseEther("0.1"),//uint256 _minPurchase,
            parseEther("1.0"),//uint256 _maxPurchase,
            (await czodiacToken.totalSupply()).div(2),//uint256 _tokensForSale,
            parseEther("100"),//uint256 _maxSaleSize,
            czodiacToken.address//IERC20 _token
        );
        await lockedSale.deployed();
    });
        
    it("Should set the state", async function() {
        const state = await lockedSale.getState();
        expect(state._minPurchase).to.equal(parseEther("0.1"));
    });
})