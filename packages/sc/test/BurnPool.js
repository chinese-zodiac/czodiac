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
const { parse } = require('@ethersproject/transactions');
const { zeroAddress, czDeployer, czf, czusd, lrt, czodiacNft, czred, czodiacGnosis } = loadJsonFile.sync("./deployConfig.json");

const { expect } = chai;
const { parseEther, formatEther } = ethers.utils;

describe("BurnPool", function () {
    let czfSc, czusdSc, czredSc, poolCzusdSc, poolCzfSc;
    let owner, trader, trader1, trader2, trader3;
    let czusdAdmin, deployer;

    before(async function () {
        [owner, trader, trader1, trader2, trader3] = await ethers.getSigners();
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [czodiacGnosis],
        });
        czusdAdmin = await ethers.getSigner(czodiacGnosis);
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [czDeployer],
        });
        deployer = await ethers.getSigner(czDeployer);

        czfSc = await ethers.getContractAt("CZFarm", czf);
        czusdSc = await ethers.getContractAt("CZUsd", czusd);
        czredSc = await ethers.getContractAt("CZRed", czred);
    });
    it("Should deploy BurnPool", async function () {
        const BurnPool = await ethers.getContractFactory("BurnPool");
        poolCzusdSc = await BurnPool.connect(deployer).deploy();
        await poolCzusdSc.deployed();
        poolCzfSc = await BurnPool.connect(deployer).deploy();
        await poolCzfSc.deployed();
        const poolCzusdTotalShares = await poolCzusdSc.totalShares();
        const poolCzfTotalShares = await poolCzfSc.totalShares();
        expect(poolCzusdTotalShares).to.eq(0);
        expect(poolCzfTotalShares).to.eq(0);
    });
    it("Should initialize burnpool", async function () {
        await czfSc.connect(czusdAdmin).setContractSafe(poolCzfSc.address);
        await czusdSc.connect(czusdAdmin).setContractSafe(poolCzusdSc.address);
        await czredSc.connect(deployer).approve(poolCzfSc.address, parseEther("200000"));
        await czredSc.connect(deployer).approve(poolCzusdSc.address, parseEther("200000"));
        await czredSc.connect(deployer).setIsExempt(poolCzfSc.address, true);
        await czredSc.connect(deployer).setIsExempt(poolCzusdSc.address, true);
        await time.advanceBlock();
        const now = await time.latest();

        await poolCzfSc.connect(deployer).initialize(
            czf,//IERC20 _stakedToken,
            czred,//IERC20 _rewardToken,
            parseEther("200000"),//uint256 _rewardsWad,
            now.add(time.duration.days(1)).toNumber(),//uint256 _timestampStart,
            90 * 86400,//uint256 _durationSeconds,
            deployer.address//address _admin
        );

        await poolCzusdSc.connect(deployer).initialize(
            czusd,//IERC20 _stakedToken,
            czred,//IERC20 _rewardToken,
            parseEther("200000"),//uint256 _rewardsWad,
            now.add(time.duration.days(1)).toNumber(),//uint256 _timestampStart,
            90 * 86400,//uint256 _durationSeconds,
            deployer.address//address _admin
        );

        const poolCzfTimestampStart = await poolCzfSc.timestampStart();
        const poolCzfTimestampEnd = await poolCzfSc.timestampEnd();
        const poolCzfTimestampLast = await poolCzfSc.timestampLast();
        const poolCzfRps = await poolCzfSc.rewardPerSecond();
        const poolCzfRewardToken = await poolCzfSc.rewardToken();
        const poolCzfStakedToken = await poolCzfSc.stakedToken();
        const poolCzfTotalShares = await poolCzfSc.totalShares();
        const poolCzfBoostBps = await poolCzfSc.boostBps();

        const poolCzusdTimestampStart = await poolCzusdSc.timestampStart();
        const poolCzusdTimestampEnd = await poolCzusdSc.timestampEnd();
        const poolCzusdTimestampLast = await poolCzusdSc.timestampLast();
        const poolCzusdRps = await poolCzusdSc.rewardPerSecond();
        const poolCzusdRewardToken = await poolCzusdSc.rewardToken();
        const poolCzusdStakedToken = await poolCzusdSc.stakedToken();
        const poolCzusdTotalShares = await poolCzusdSc.totalShares();
        const poolCzusdBoostBps = await poolCzusdSc.boostBps();

        expect(poolCzfTimestampStart).to.eq(now.add(time.duration.days(1)).toNumber());
        expect(poolCzfTimestampEnd).to.eq(now.add(time.duration.days(91)).toNumber());
        expect(poolCzfTimestampLast).to.eq(poolCzfTimestampStart);
        expect(poolCzfRps).to.eq(parseEther("200000").div(90 * 86400));
        expect(poolCzfRewardToken).to.eq(czred);
        expect(poolCzfStakedToken).to.eq(czf);
        expect(poolCzfTotalShares).to.eq(0);
        expect(poolCzfBoostBps.div(10000)).to.eq(5);

        expect(poolCzusdTimestampStart).to.eq(now.add(time.duration.days(1)).toNumber());
        expect(poolCzusdTimestampEnd).to.eq(now.add(time.duration.days(91)).toNumber());
        expect(poolCzusdTimestampLast).to.eq(poolCzusdTimestampStart);
        expect(poolCzusdRps).to.eq(parseEther("200000").div(90 * 86400));
        expect(poolCzusdRewardToken).to.eq(czred);
        expect(poolCzusdStakedToken).to.eq(czusd);
        expect(poolCzusdTotalShares).to.eq(0);
        expect(poolCzusdBoostBps.div(10000)).to.eq(5);
    })
    it("Should have 5x boost when eligible only", async function () {
        await czusdSc.connect(czusdAdmin).mint(trader.address, parseEther("100"));
        await poolCzusdSc.connect(trader).deposit(parseEther("100"));
        const traderInfo = await poolCzusdSc.userInfo(trader.address);

        await poolCzusdSc.connect(deployer).setIsBoostEligibeToTrue([trader1.address]);

        await czusdSc.connect(czusdAdmin).mint(trader1.address, parseEther("100"));
        await poolCzusdSc.connect(trader1).deposit(parseEther("100"));
        const trader1Info = await poolCzusdSc.userInfo(trader1.address);

        const poolCzusdTotalShares = await poolCzusdSc.totalShares();

        expect(traderInfo.shares).to.eq(parseEther("100"));
        expect(trader1Info.shares).to.eq(parseEther("500"));
        expect(poolCzusdTotalShares).to.eq(parseEther("600"));
    });
    it("Should send pending rewards", async function () {
        await time.increase(time.duration.days(2));
        await time.advanceBlock();
        const now = await time.latest();
        const poolCzusdTimestampStart = await poolCzusdSc.timestampStart();
        const poolCzusdRps = await poolCzusdSc.rewardPerSecond();

        const pendingTrader = await poolCzusdSc.pendingReward(trader.address);
        const pendingTrader1 = await poolCzusdSc.pendingReward(trader1.address);
        const poolCzusdTotalShares = await poolCzusdSc.totalShares();
        const traderInfo = await poolCzusdSc.userInfo(trader.address);
        const trader1Info = await poolCzusdSc.userInfo(trader1.address);

        await poolCzusdSc.connect(trader).claim();
        await poolCzusdSc.connect(trader1).claim();

        const czrBalTrader = await czredSc.balanceOf(trader.address);
        const czrBalTrader1 = await czredSc.balanceOf(trader1.address);

        const deltaSeconds = now.toNumber() - poolCzusdTimestampStart.toNumber();
        console.log(deltaSeconds);

        expect(poolCzusdRps).to.be.gt(0);
        expect(pendingTrader).to.be.closeTo(poolCzusdRps.mul(deltaSeconds).mul(traderInfo.shares).div(poolCzusdTotalShares), parseEther("1"));
        expect(pendingTrader1).to.be.closeTo(poolCzusdRps.mul(deltaSeconds).mul(trader1Info.shares).div(poolCzusdTotalShares), parseEther("1"));
        expect(czrBalTrader).to.be.closeTo(pendingTrader, parseEther("1"));
        expect(czrBalTrader1).to.be.closeTo(pendingTrader1, parseEther("1"));

    });

});