//FILE: ./test CZBlueMasterRoutable.js
const chai = require('chai');
const { solidity } = require("ethereum-waffle");
chai.use(solidity);
const { expect } = chai;
const { ethers } = require("hardhat");
const { time } = require("@openzeppelin/test-helpers");
const { parseEther, formatEther } = ethers.utils;
const loadJsonFile = require("load-json-file");
const { zeroAddress, czblue, czusd, tribePoolMaster, czodiacGnosis } = loadJsonFile.sync("./deployConfig.json");
const czusdCzbLpAddress = "0x90b275a373E8D1e89f6870Dd0aC52252C4fFDF1D";
const czblueMinterAddress = "0x70e1cB759996a1527eD1801B169621C18a9f38F9"

describe("CZBlueMasterRoutable", function () {
    let czBlueSc, czusdSc, master, lpTokenSc, blacklistCheckerSc;
    let owner, treasury, czblueMinter, user1, user2;
    let startTimestamp;
    const czBluePoolId = 0;
    const lpTokenPoolId = 1;
    const depositTaxBasis = 100;
    const withdrawTaxBasis = 150;

    before(async function () {
        [owner, router, user1, user2] = await ethers.getSigners();
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [czodiacGnosis],
        });
        treasury = await ethers.getSigner(czodiacGnosis);
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [czblueMinterAddress],
        });
        czblueMinter = await ethers.getSigner(czblueMinterAddress);

        await time.advanceBlock();
        startTimestamp = (await time.latest()).toNumber() +
            time.duration.days(1).toNumber();

        czBlueSc = await ethers.getContractAt("CZBlue", czblue);
        czusdSc = await ethers.getContractAt("CZUsd", czusd);
        lpTokenSc = await ethers.getContractAt("IERC20", czusdCzbLpAddress);
        blacklistCheckerSc = await ethers.getContractAt("IBlacklist", tribePoolMaster);

        const CZBlueMasterRoutable = await ethers.getContractFactory("CZBlueMasterRoutable");
        master = await CZBlueMasterRoutable.deploy(startTimestamp);
        await czBlueSc.connect(czblueMinter).grantRole(ethers.utils.id("MINTER_ROLE"), master.address);
    });

    describe("Deployment", function () {
        it("Should set the correct initial values", async function () {
            const czBlueAddress = await master.czb();
            const blacklistCheckerAddress = await master.blacklistChecker();
            const treasuryAddress = await master.treasury();

            expect(czBlueAddress).to.equal(czBlueSc.address);
            expect(blacklistCheckerAddress).to.equal(blacklistCheckerSc.address);
            expect(treasuryAddress).to.equal(treasury.address);
            const czbPerSecond = await master.czbPerSecond();
            const totalAllocPoint = await master.totalAllocPoint();
            const baseAprBasis = await master.baseAprBasis();

            expect(czbPerSecond).to.equal(0);
            expect(totalAllocPoint).to.equal(0);
            expect(baseAprBasis).to.equal(25000);
        });
    });

    describe("New czBlue and lpToken pools", async function () {
        before(async function () {
            await master.add(1000, depositTaxBasis, withdrawTaxBasis, czBlueSc.address, true);
            await master.add(500, depositTaxBasis, withdrawTaxBasis, lpTokenSc.address, true);
            await czBlueSc.connect(user1).approve(master.address, ethers.constants.MaxUint256);
            await czBlueSc.connect(user2).approve(master.address, ethers.constants.MaxUint256);
            await czBlueSc.connect(czblueMinter).mint(user1.address, parseEther("100"));
            await czBlueSc.connect(czblueMinter).mint(user2.address, parseEther("100"));
        })
        it("Should create 2 new pools with correct initial values: czBlue and lpToken", async function () {
            const czBluePool = await master.poolInfo(czBluePoolId);
            const lpTokenPool = await master.poolInfo(lpTokenPoolId);

            const poolLength = await master.poolLength();

            expect(czBluePool.allocPoint).to.equal(1000);
            expect(czBluePool.lpToken).to.equal(czBlueSc.address);
            expect(czBluePool.lastRewardTimestamp).to.equal(startTimestamp);
            expect(czBluePool.accCzbPerShare).to.equal(0);
            expect(czBluePool.depositTaxBasis).to.equal(depositTaxBasis);
            expect(czBluePool.withdrawTaxBasis).to.equal(withdrawTaxBasis);
            expect(czBluePool.totalDeposit).to.equal(0);

            expect(lpTokenPool.allocPoint).to.equal(500);
            expect(lpTokenPool.lpToken).to.equal(lpTokenSc.address);
            expect(lpTokenPool.lastRewardTimestamp).to.equal(startTimestamp);
            expect(lpTokenPool.accCzbPerShare).to.equal(0);
            expect(lpTokenPool.depositTaxBasis).to.equal(depositTaxBasis);
            expect(lpTokenPool.withdrawTaxBasis).to.equal(withdrawTaxBasis);
            expect(lpTokenPool.totalDeposit).to.equal(0);

            expect(poolLength).to.equal(2);
        });

        it("Should update czbPerSecond based on stake in czBlue pool (_pid 0)", async function () {
            await master.connect(user1).deposit(czBluePoolId, parseEther("1"), false);
            await master.connect(user2).deposit(czBluePoolId, parseEther("2"), false);

            const czBluePool = await master.poolInfo(czBluePoolId);
            const userInfo1 = await master.userInfo(czBluePoolId, user1.address);
            const userInfo2 = await master.userInfo(czBluePoolId, user2.address);

            const userPending1 = await master.pendingCzb(czBluePoolId, user1.address);
            const userPending2 = await master.pendingCzb(czBluePoolId, user2.address);

            const czbPerSecond = await master.czbPerSecond();

            expect(czBluePool.totalDeposit).to.equal(parseEther("2.97"));
            expect(czbPerSecond).to.eq(parseEther("2.97").mul(25000).div(10000).div(86400 * 365.25));
            expect(czbPerSecond.mul(86400 * 365.25)).to.be.closeTo(parseEther("7.425"), parseEther("0.00000001"))
            expect(userInfo1.amount).to.equal(parseEther("0.99"));
            expect(userInfo2.amount).to.equal(parseEther("1.98"));
            expect(userPending1).to.equal(parseEther("0"));
            expect(userPending2).to.equal(parseEther("0"));
        });
    });

    describe("Reward payout after pool starts sending rewards", function () {
        before(async function () {
            await time.increaseTo(startTimestamp);
        });
        it("Should update pending rewards correctly", async function () {
            await time.increase(time.duration.days(1));

            const userPending1 = await master.pendingCzb(czBluePoolId, user1.address);
            const userPending2 = await master.pendingCzb(czBluePoolId, user2.address);

            const expectedReward1 = parseEther("0.99").mul(25000).div(10000).div(86400 * 365.25).mul(1000).div(1500);
            const expectedReward2 = parseEther("1.98").mul(25000).div(10000).div(86400 * 365.25).mul(1000).div(1500);

            expect(userPending1).to.be.closeTo(expectedReward1.mul(time.duration.days(1).toNumber()), parseEther("0.000001"));
            expect(userPending2).to.be.closeTo(expectedReward2.mul(time.duration.days(1).toNumber()), parseEther("0.000001"));
        });
        it("Should claim rewards and update user balances", async function () {
            const user1BalanceBefore = await czBlueSc.balanceOf(user1.address);
            const user2BalanceBefore = await czBlueSc.balanceOf(user2.address);

            await master.connect(user1).claim(czBluePoolId);
            await master.connect(user2).claim(czBluePoolId);

            const user1BalanceAfter = await czBlueSc.balanceOf(user1.address);
            const user2BalanceAfter = await czBlueSc.balanceOf(user2.address);

            const userPending1 = await master.pendingCzb(czBluePoolId, user1.address);
            const userPending2 = await master.pendingCzb(czBluePoolId, user2.address);

            const expectedReward1 = parseEther("0.99").mul(25000).div(10000).div(86400 * 365.25).mul(1000).div(1500);
            const expectedReward2 = parseEther("1.98").mul(25000).div(10000).div(86400 * 365.25).mul(1000).div(1500);

            expect(userPending1).to.be.closeTo(parseEther("0"), parseEther("0.000001"));
            expect(userPending2).to.be.closeTo(parseEther("0"), parseEther("0.000001"));
            expect(user1BalanceAfter.sub(user1BalanceBefore)).to.be.closeTo(expectedReward1.mul(time.duration.days(1).toNumber()), parseEther("0.0001"));
            expect(user2BalanceAfter.sub(user2BalanceBefore)).to.be.closeTo(expectedReward2.mul(time.duration.days(1).toNumber()), parseEther("0.0001"));
        });
        it("Should update rewards after more deposit", async function () {
            await time.increase(time.duration.days(1));

            await czBlueSc.connect(czblueMinter).mint(user1.address, parseEther("10"));
            await master.connect(user1).deposit(czBluePoolId, parseEther("10"), true);

            const userInfo1 = await master.userInfo(czBluePoolId, user1.address);
            const userPending1 = await master.pendingCzb(czBluePoolId, user1.address);
            const userPending2 = await master.pendingCzb(czBluePoolId, user2.address);

            const czbPerSecond = await master.czbPerSecond();

            const expectedReward2 = parseEther("1.98").mul(25000).div(10000).div(86400 * 365.25).mul(1000).div(1500);

            expect(userInfo1.amount).to.equal(parseEther("10.89"));
            expect(userPending1).to.be.closeTo(parseEther("0"), parseEther("0.000001"));
            expect(userPending2).to.be.closeTo(expectedReward2.mul(time.duration.days(1).toNumber()), parseEther("0.000001"));
            expect(czbPerSecond).to.eq(parseEther("12.87").mul(25000).div(10000).div(86400 * 365.25));
            expect(czbPerSecond.mul(86400 * 365.25)).to.be.closeTo(parseEther("32.175"), parseEther("0.000001"));
        });
        it("Should distribute rewards correctly after more deposit", async function () {
            await time.increase(time.duration.days(1));

            const userPending1 = await master.pendingCzb(czBluePoolId, user1.address);
            const userPending2 = await master.pendingCzb(czBluePoolId, user2.address);

            const expectedReward1 = parseEther("10.89").mul(25000).div(10000).div(86400 * 365.25).mul(1000).div(1500);
            const expectedReward2 = parseEther("1.98").mul(25000).div(10000).div(86400 * 365.25).mul(1000).div(1500);

            expect(userPending1).to.be.closeTo(expectedReward1.mul(time.duration.days(1).toNumber()), parseEther("0.00001"));
            expect(userPending2).to.be.closeTo(expectedReward2.mul(time.duration.days(2).toNumber()), parseEther("0.00001"));
        });
    });
});