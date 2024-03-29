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
const { zeroAddress, czf, czusd, lrt, lsdt, oneBadRabbit, dgod, czodiacGnosis

} = loadJsonFile.sync("./deployConfig.json");

const { expect } = chai;
const { parseEther, formatEther } = ethers.utils;

const ITERABLE_ARRAY = "0x4222FFCf286610476B7b5101d55E72436e4a6065";

describe("TribePoolMaster", function () {
    let czfSc, czusdSc, badRabNftSc,
        lrtSc, lsdtSc, dgodSc,
        lrtPoolSc, lsdtPoolSc, dgodPoolSc,
        lrtPoolWrapperSc, lsdtPoolWrapperSc, dgodPoolWrapperSc,
        tribePoolMasterSc;

    let czusdAdmin, owner, trader, trader1, trader2, trader3;

    before(async function () {
        [owner, trader, trader1, trader2, trader3] = await ethers.getSigners();
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [czodiacGnosis],
        });
        czusdAdmin = await ethers.getSigner(czodiacGnosis);
        await owner.sendTransaction({
            to: czodiacGnosis,
            value: ethers.utils.parseEther("1.0")
        })

        czfSc = await ethers.getContractAt("CZFarm", czf);
        czusdSc = await ethers.getContractAt("CZUsd", czusd);
        badRabNftSc = await ethers.getContractAt("IERC721", oneBadRabbit);
        lrtSc = await ethers.getContractAt("IERC20", lrt);
        lsdtSc = await ethers.getContractAt("IERC20", lsdt);
        dgodSc = await ethers.getContractAt("IERC20", dgod);
    });
    it("Should deploy TribePoolMaster", async function () {
        const TribePoolMaster = await ethers.getContractFactory("TribePoolMaster", {
            libraries: {
                IterableArrayWithoutDuplicateKeys: ITERABLE_ARRAY
            }
        });
        tribePoolMasterSc = await TribePoolMaster.deploy();
        await tribePoolMasterSc.deployed();
        await czusdSc.connect(czusdAdmin).grantRole(ethers.utils.id("MINTER_ROLE"), tribePoolMasterSc.address);
        await czusdSc.connect(czusdAdmin).grantRole(ethers.utils.id("SAFE_GRANTER_ROLE"), tribePoolMasterSc.address);
        await czfSc.connect(czusdAdmin).grantRole(ethers.utils.id("SAFE_GRANTER_ROLE"), tribePoolMasterSc.address);
        await tribePoolMasterSc.grantRole(ethers.utils.id("MANAGER_SETTINGS"), owner.address);
        await tribePoolMasterSc.grantRole(ethers.utils.id("MANAGER_POOLS"), owner.address);
        const masterCzusd = await tribePoolMasterSc.czusd();
        const totalWeight = await tribePoolMasterSc.totalWeight();
        expect(totalWeight).to.eq(0);
        expect(masterCzusd).to.eq(czusd);
    });
    it("Should create lrt pool", async function () {
        await tribePoolMasterSc.addTribePool(
            lrtSc.address,//IERC20Metadata _tribeToken,
            false,//bool _isLrtWhitelist,
            1000,//uint256 _weight,
            owner.address//address _owner
        );
        const lrtPoolAddress = await tribePoolMasterSc.getTribePoolAddress(0);
        lrtPoolSc = await ethers.getContractAt("TribePool", lrtPoolAddress);
        const lrtPoolWrapperAddress = await lrtPoolSc.stakeWrapperToken();
        lrtPoolWrapperSc = await ethers.getContractAt("TribePoolStakeWrapperToken", lrtPoolWrapperAddress);
        const whitelistWad = await lrtPoolWrapperSc.whitelistWad();
        const withdrawFeeBasis = await lrtPoolWrapperSc.withdrawFeeBasis();
        const tribeToken = await lrtPoolSc.tribeToken();
        expect(whitelistWad).to.eq(0);
        expect(withdrawFeeBasis).to.eq(1498);
        expect(tribeToken).to.eq(lrtSc.address);
    });
    it("Should deposit czf into lrt pool", async function () {
        await czfSc.connect(czusdAdmin).mint(trader.address, parseEther("100"));
        await czfSc.connect(trader).approve(lrtPoolWrapperSc.address, parseEther("100"));
        await lrtPoolWrapperSc.connect(trader).depositFor(trader.address, parseEther("100"));
        const wrapperTraderBal = await lrtPoolWrapperSc.balanceOf(trader.address);
        const stakedTraderBal = await lrtPoolSc.stakedBal(trader.address);
        const czfTraderBal = await czfSc.balanceOf(trader.address);
        const totalStaked = await lrtPoolSc.totalStaked();
        expect(czfTraderBal).to.eq(0);
        expect(stakedTraderBal).to.eq(parseEther("100"));
        expect(wrapperTraderBal).to.eq(parseEther("100"));
        expect(totalStaked).to.eq(parseEther("100"));
    });
    it("Should withdraw czf from lrt pool with fee", async function () {
        await lrtPoolWrapperSc.connect(trader).withdrawTo(trader.address, parseEther("100"));
        const wrapperTraderBal = await lrtPoolWrapperSc.balanceOf(trader.address);
        const stakedTraderBal = await lrtPoolSc.stakedBal(trader.address);
        const czfTraderBal = await czfSc.balanceOf(trader.address);
        const totalStaked = await lrtPoolSc.totalStaked();
        expect(czfTraderBal).to.eq(parseEther("85.02"));
        expect(stakedTraderBal).to.eq(0);
        expect(wrapperTraderBal).to.eq(0);
        expect(totalStaked).to.eq(0);
    });
    it("Should set czusd per second", async function () {
        await tribePoolMasterSc.setCzusdPerSecond(parseEther("250").div(86400));
        const now = (await time.latest()).toNumber();
        const lastUpdate = await tribePoolMasterSc.lastUpdate();
        const czusdPerSecond = await tribePoolMasterSc.czusdPerSecond();
        expect(lastUpdate).to.eq(now);
        expect(parseEther("250").div(86400)).to.eq(czusdPerSecond);
    });
    it("Should send czusd to tribepool to buy lrt", async function () {
        const czusdPerSecond = await tribePoolMasterSc.czusdPerSecond();
        const lastUpdate_initial = await tribePoolMasterSc.lastUpdate();
        const czusdTotalSupply_initial = await czusdSc.totalSupply();
        await time.increase(time.duration.days(1));
        await time.advanceBlock();
        await tribePoolMasterSc.updatePools();
        const lastUpdate_final = await tribePoolMasterSc.lastUpdate();
        const czusdTotalSupply_final = await czusdSc.totalSupply();
        const lrtBal = await lrtSc.balanceOf(lrtPoolSc.address);

        const czusdDelta = czusdTotalSupply_final.sub(czusdTotalSupply_initial);
        const secondsDelta = lastUpdate_final.sub(lastUpdate_initial);

        expect(czusdPerSecond.mul(secondsDelta)).to.eq(czusdDelta);
        expect(czusdDelta).to.be.closeTo(parseEther("250"), parseEther("1"));
        expect(lrtBal).to.be.above(parseEther("10"));
        expect(lrtBal).to.be.below(parseEther("100"));
    });
    it("Should deposit czf into lrt pool second time and earn lrt", async function () {
        await czfSc.connect(czusdAdmin).mint(trader.address, parseEther("100"));
        await czfSc.connect(trader).approve(lrtPoolWrapperSc.address, parseEther("100"));
        await lrtPoolWrapperSc.connect(trader).depositFor(trader.address, parseEther("100"));
        const lrtRewardPerSecond = await lrtPoolSc.rewardPerSecond();
        const timeInitial = (await time.latest()).toNumber();
        const wrapperTraderBal = await lrtPoolWrapperSc.balanceOf(trader.address);
        const stakedTraderBal = await lrtPoolSc.stakedBal(trader.address);
        const czfTraderBal = await czfSc.balanceOf(trader.address);
        const totalStaked = await lrtPoolSc.totalStaked();
        await time.increase(time.duration.days(1));
        const pendingReward = await lrtPoolSc.pendingReward(trader.address);
        await lrtPoolSc.connect(trader).claim();
        const timefinal = (await time.latest()).toNumber();
        const lrtBal = await lrtSc.balanceOf(trader.address);
        const timeDelta = timefinal - timeInitial;

        expect(czfTraderBal).to.eq(parseEther("85.02"));
        expect(stakedTraderBal).to.eq(parseEther("100"));
        expect(wrapperTraderBal).to.eq(parseEther("100"));
        expect(totalStaked).to.eq(parseEther("100"));

        expect(pendingReward).to.be.closeTo(lrtRewardPerSecond.mul(timeDelta), parseEther("0.01"));
        expect(lrtBal).to.be.closeTo(pendingReward, parseEther("1"));
        expect(lrtBal).to.be.above(parseEther("1"));
        expect(lrtBal).to.be.below(parseEther("10"));
    });
    it("Should create new lsdt pool", async function () {
        await tribePoolMasterSc.addTribePool(
            lsdtSc.address,//IERC20Metadata _tribeToken,
            true,//bool _isLrtWhitelist,
            2000,//uint256 _weight,
            owner.address//address _owner
        );
        const lsdtPoolAddress = await tribePoolMasterSc.getTribePoolAddress(1);
        lsdtPoolSc = await ethers.getContractAt("TribePool", lsdtPoolAddress);
        const lsdtPoolWrapperAddress = await lsdtPoolSc.stakeWrapperToken();
        lsdtPoolWrapperSc = await ethers.getContractAt("TribePoolStakeWrapperToken", lsdtPoolWrapperAddress);
        const whitelistWad = await lsdtPoolWrapperSc.whitelistWad();
        const withdrawFeeBasis = await lsdtPoolWrapperSc.withdrawFeeBasis();
        const tribeToken = await lsdtPoolSc.tribeToken();
        expect(whitelistWad).to.eq(parseEther("50"));
        expect(withdrawFeeBasis).to.eq(998);
        expect(tribeToken).to.eq(lsdtSc.address);
    });
    it("Should send czusd to tribepool to buy lrt and lsdt", async function () {
        await tribePoolMasterSc.updatePools();
        const czusdPerSecond = await tribePoolMasterSc.czusdPerSecond();
        const lastUpdate_initial = await tribePoolMasterSc.lastUpdate();
        const czusdTotalSupply_initial = await czusdSc.totalSupply();
        await time.increase(time.duration.days(1));
        await time.advanceBlock();
        await tribePoolMasterSc.updatePools();
        const lastUpdate_final = await tribePoolMasterSc.lastUpdate();
        const czusdTotalSupply_final = await czusdSc.totalSupply();
        const lrtBal = await lrtSc.balanceOf(lrtPoolSc.address);
        const lsdtBal = await lsdtSc.balanceOf(lsdtPoolSc.address);

        const czusdDelta = czusdTotalSupply_final.sub(czusdTotalSupply_initial);
        const secondsDelta = lastUpdate_final.sub(lastUpdate_initial);

        expect(czusdPerSecond.mul(secondsDelta)).to.eq(czusdDelta);
        expect(czusdDelta).to.be.closeTo(parseEther("250"), parseEther("1"));
        expect(lrtBal).to.be.above(parseEther("10"));
        expect(lrtBal).to.be.below(parseEther("100"));
        expect(lsdtBal).to.be.above(parseEther("5"));
        expect(lsdtBal).to.be.below(parseEther("25"));
    });
});