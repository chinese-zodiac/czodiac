// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
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
    let ownerAddress, buyer1Address, buyer2Address;
    let now;

    before(async function() {
        [ownerAddress, buyer1Address, buyer2Address] = await ethers.getSigners();

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

        const totalSupply = await czodiacToken.totalSupply();

        const LockedSale = await ethers.getContractFactory("LockedSale");
        lockedSale = await LockedSale.deploy(
            now.add(time.duration.days(1)).toNumber(),//uint256 _startTime
            now.add(time.duration.days(3)).toNumber(),//uint256 _endTime,
            parseEther("0.1"),//uint256 _minPurchase,
            parseEther("1.0"),//uint256 _maxPurchase,
            totalSupply.div(2),//uint256 _tokensForSale,
            parseEther("1.5"),//uint256 _maxSaleSize,
            czodiacToken.address//IERC20 _token
        );
        await lockedSale.deployed();
        await czodiacToken.excludeFromReward(lockedSale.address);
        await czodiacToken.excludeFromFee(lockedSale.address);
        await czodiacToken.transfer(lockedSale.address,totalSupply.div(2))
    });
        
    it("Should set the state", async function() {
        const state = await lockedSale.getState();
        const balanceOfSale = await czodiacToken.balanceOf(lockedSale.address);
        expect(state._startTime).to.equal(now.add(time.duration.days(1)).toNumber());
        expect(state._endTime).to.equal(now.add(time.duration.days(3)).toNumber());
        expect(state._minPurchase).to.equal(parseEther("0.1"));
        expect(state._maxPurchase).to.equal(parseEther("1"));
        expect(state._tokensForSale).to.equal(balanceOfSale);
        expect(state._tokensForSale).to.equal(parseEther("4000000000000"));
        expect(state._token).to.equal(czodiacToken.address);
        expect(state._totalBuyers).to.equal(0);
        expect(state._totalPurchases).to.equal(0);
    });

    it("Deposits should revert for non whitelisted buyers", async function() {
        await expect(buyer1Address.sendTransaction({
            to:lockedSale.address,
            value:parseEther("0.5")
        })).to.be.revertedWith("LockedSale: Buyer is not whitelisted");
    });

    it("Deposits should revert before startTime", async function() {
        await lockedSale.whitelist([buyer1Address.address,buyer2Address.address]);
        await expect(buyer1Address.sendTransaction({
            to:lockedSale.address,
            value:parseEther("0.5")
        })).to.be.revertedWith("LockedSale: Sale not yet open.");
    });

    it("Deposits should revert if above max purchase", async function() {
        time.increase(time.duration.days(1));
        await time.advanceBlock();

        await expect(buyer1Address.sendTransaction({
            to:lockedSale.address,
            value:parseEther("1.01")
        })).to.be.revertedWith("LockedSale: Cannot buy more than maxPurchase.");
    });

    it("Deposits should revert if below min purchase", async function() {
        time.increase(time.duration.days(1));
        await time.advanceBlock();

        await expect(buyer1Address.sendTransaction({
            to:lockedSale.address,
            value:parseEther("0.09")
        })).to.be.revertedWith("LockedSale: Cannot buy less than minPurchase.");

        await expect(buyer1Address.sendTransaction({
            to:lockedSale.address
        })).to.be.revertedWith("LockedSale: Cannot buy less than minPurchase.");
    });

    it("Deposits should succeed for whitelisted buyer after opening", async function() {
        
        await buyer1Address.sendTransaction({
            to:lockedSale.address,
            value:parseEther("0.1")
        });
        await buyer2Address.sendTransaction({
            to:lockedSale.address,
            value:parseEther("1")
        });
        await buyer1Address.sendTransaction({
            to:lockedSale.address,
            value:parseEther("0.1")
        });

        expect(await ethers.provider.getBalance(lockedSale.address)).to.equal(parseEther("1.2"));
        expect(await lockedSale.deposits(buyer1Address.address)).to.equal(parseEther("0.2"));
        expect(await lockedSale.deposits(buyer2Address.address)).to.equal(parseEther("1"));
        expect(await lockedSale.totalPurchases()).to.equal(parseEther("1.2"));
        expect(await lockedSale.totalBuyers()).to.equal(2);
        expect(await lockedSale.buyerIndex(buyer1Address.address)).to.equal(0);
        expect(await lockedSale.buyerIndex(buyer2Address.address)).to.equal(1);
        expect(await lockedSale.buyers(0)).to.equal(buyer1Address.address);
        expect(await lockedSale.buyers(1)).to.equal(buyer2Address.address);
    });

    it("Deposits should revert if combined above max purchase", async function() {
        await expect(buyer1Address.sendTransaction({
            to:lockedSale.address,
            value:parseEther("0.9")
        })).to.be.revertedWith("LockedSale: Cannot buy more than maxPurchase.");
    });

    it("Deposits should revert if all combined is above maxPurchase.", async function() {
        await expect(buyer1Address.sendTransaction({
            to:lockedSale.address,
            value:parseEther("0.5")
        })).to.be.revertedWith("LockedSale: Cannot buy more than maxSaleSize.");
    });

    it("Deposits should revert if after sale end", async function() {
        time.increase(time.duration.days(1));
        await time.advanceBlock();

        await expect(buyer1Address.sendTransaction({
            to:lockedSale.address,
            value:parseEther("0.1")
        })).to.be.revertedWith("LockedSale: Sale has closed.");
    });

    it("Withdraw should send bnb to owner for liquidity", async function() {
        const initialBalance = await ownerAddress.getBalance();
        await lockedSale.withdraw();
        const finalBalance = await ownerAddress.getBalance();

        const purchases = await lockedSale.totalPurchases();
        expect(finalBalance.sub(initialBalance)).to.be.within(purchases.sub(parseEther("0.001")),purchases.add(parseEther("0.001")));
    });

    it("Distribute should send tokens to buyers", async function() {
        await lockedSale.distribute(2);
        const buyer1Deposits = await lockedSale.deposits(buyer1Address.address);
        const buyer2Deposits = await lockedSale.deposits(buyer2Address.address);
        const buyer1Tokens = await czodiacToken.balanceOf(buyer1Address.address);
        const buyer2Tokens = await czodiacToken.balanceOf(buyer2Address.address);

        const maxSaleSize = await lockedSale.maxSaleSize();
        const tokensForSale = await lockedSale.tokensForSale();

        expect(buyer1Deposits.mul(tokensForSale).div(maxSaleSize)).to.equal(buyer1Tokens);
        expect(buyer2Deposits.mul(tokensForSale).div(maxSaleSize)).to.equal(buyer2Tokens);
    });
})