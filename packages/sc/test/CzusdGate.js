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
const { zeroAddress, czf, czusd, lrt, czodiacNft, czred, busd, czodiacGnosis } = loadJsonFile.sync("./deployConfig.json");

const { expect } = chai;
const { parseEther, formatEther } = ethers.utils;

describe("CzusdGate", function () {
    let czusdSc, busdSc, czusdGate, blacklist;
    let owner, trader, trader1, trader2, trader3;
    let czusdAdmin;

    before(async function () {
        [owner, trader, trader1, trader2, trader3] = await ethers.getSigners();
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [czodiacGnosis],
        });
        czusdAdmin = await ethers.getSigner(czodiacGnosis);
        czusdSc = await ethers.getContractAt("CZUsd", czusd);
        busdSc = await ethers.getContractAt("IERC20", busd);
    });
    it("Should deploy CzusdGate", async function () {
        const Blacklist = await ethers.getContractFactory("BlacklistBasic");
        blacklist = await Blacklist.deploy();
        await blacklist.deployed();
        const CzusdGate = await ethers.getContractFactory("CzusdGate");
        czusdGate = await CzusdGate.deploy(blacklist.address);
        await czusdGate.deployed();
        const now = await time.latest();

        const czusdAddress = await czusdGate.czusd();
        const busdAdddress = await czusdGate.busd();
        const feePublicBps = await czusdGate.feePublicBps();
        const feeBoostBps = await czusdGate.feeBoostBps();
        const dailyOutLimitPublic = await czusdGate.dailyOutLimitPublic();
        const dailyOutLimitBoost = await czusdGate.dailyOutLimitBoost();
        const dailyOutResetTimestamp = await czusdGate.dailyOutResetTimestamp();
        const blacklistChecker = await czusdGate.blacklistChecker();

        expect(czusdAddress).to.eq(czusd);
        expect(busdAdddress).to.eq(busd);
        expect(feePublicBps).to.eq(186);
        expect(feeBoostBps).to.eq(0);
        expect(dailyOutLimitPublic).to.eq(parseEther("500"));
        expect(dailyOutLimitBoost).to.eq(parseEther("2500"));
        expect(dailyOutResetTimestamp).to.eq(now.toString());
        expect(blacklistChecker).to.eq(blacklist.address);
    });
    it("Should revert resetDailyOutCurrent if less than 1 days passed", async function () {
        await expect(czusdGate.resetDailyOutCurrent()).to.be.revertedWith("CzusdGate: Not enough time passed");
    });
    it("Should reset timestamp after 1 days passed", async function () {
        await time.increase(time.duration.days(1));
        await time.advanceBlock();
        await czusdGate.resetDailyOutCurrent();
        const now = await time.latest();
        const dailyOutResetTimestamp = await czusdGate.dailyOutResetTimestamp();
        expect(dailyOutResetTimestamp).to.eq(now.toString());
    });
    it("Should deposit BUSD to get CZUSD with fee if not boost eligible", async function () {
        await czusdSc.connect(czusdAdmin).transfer(czusdGate.address, parseEther("1000"));

        const initialCzusd = await czusdSc.balanceOf(czusdAdmin.address);
        const initialBusd = await busdSc.balanceOf(czusdAdmin.address);
        const swapWad = parseEther("100");
        const feeWad = swapWad.mul(186).div(10000);
        await busdSc.connect(czusdAdmin).approve(czusdGate.address, parseEther("1000"));
        await czusdGate.connect(czusdAdmin).busdIn(swapWad, czusdAdmin.address);
        const finalCzusd = await czusdSc.balanceOf(czusdAdmin.address);
        const finalBusd = await busdSc.balanceOf(czusdAdmin.address);
        const gateBusdBal = await busdSc.balanceOf(czusdGate.address);

        const dailyOutCurrent = await czusdGate.dailyOutCurrent();

        expect(gateBusdBal).to.eq(swapWad);
        expect(finalCzusd.sub(initialCzusd)).to.eq(swapWad.sub(feeWad));
        expect(initialBusd.sub(finalBusd)).to.eq(swapWad);
        expect(dailyOutCurrent).to.eq(swapWad.mul(-1));
    });
    it("Should deposit CZUSD to get BUSD with fee if not boost eligible", async function () {

        const initialCzusd = await czusdSc.balanceOf(czusdAdmin.address);
        const initialBusd = await busdSc.balanceOf(czusdAdmin.address);
        const swapWad = parseEther("10");
        const feeWad = swapWad.mul(186).div(10000);
        await czusdSc.connect(czusdAdmin).approve(czusdGate.address, parseEther("1000"));
        await czusdGate.connect(czusdAdmin).busdOut(swapWad, czusdAdmin.address);
        const finalCzusd = await czusdSc.balanceOf(czusdAdmin.address);
        const finalBusd = await busdSc.balanceOf(czusdAdmin.address);
        const gateBusdBal = await busdSc.balanceOf(czusdGate.address);

        const dailyOutCurrent = await czusdGate.dailyOutCurrent();

        expect(gateBusdBal).to.eq(parseEther("90.186"));
        expect(finalBusd.sub(initialBusd)).to.eq(swapWad.sub(feeWad));
        expect(initialCzusd.sub(finalCzusd)).to.eq(swapWad);
        expect(dailyOutCurrent).to.eq(gateBusdBal.mul(-1));
    });
    it("Should revert busdOut/In if not enough tokens", async function () {
        await expect(czusdGate.connect(czusdAdmin).busdOut(parseEther("10000"), czusdAdmin.address)).to.be.reverted;
        await expect(czusdGate.connect(czusdAdmin).busdIn(parseEther("10000"), czusdAdmin.address)).to.be.reverted;
    });
    it("Should revert busdOut if over daily limit", async function () {
        await busdSc.connect(czusdAdmin).transfer(czusdGate.address, parseEther("5000"));
        await expect(czusdGate.connect(czusdAdmin).busdOut(parseEther("650"), czusdAdmin.address)).to.be.revertedWith("CzusdGate: Daily out exceeded");
    });

});