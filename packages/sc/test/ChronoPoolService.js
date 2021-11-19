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
const { zeroAddress, czDeployer, czf } = loadJsonFile.sync("./deployConfig.json");

const { expect } = chai;
const { parseEther, formatEther } = ethers.utils;

describe("ChronoPoolService", function() {
  let czfSc;
  let owner, trader, trader1, trader2, trader3;
  let deployer;
  let chronoPoolService;

  let vestPeriod = 31557600; // 1 year
  let ffBasis = 500; // 5%
  let aprBasis = 10*10000; // 10000%
  let baseEmissionRate = parseEther("500");

  before(async function() {
    [owner, trader, trader1, trader2, trader3] = await ethers.getSigners();
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [czDeployer],
    });
    deployer = await ethers.getSigner(czDeployer);
    czfSc = await ethers.getContractAt("CZFarm", czf);
    const ChronoPoolService = await ethers.getContractFactory("ChronoPoolService");
    chronoPoolService = await ChronoPoolService.deploy(
      czf, //CZFarm _czf
      baseEmissionRate //uint112 _baseEmissionRate
    );

    console.log("Grant roles");
    await czfSc.connect(deployer)
      .grantRole(
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        chronoPoolService.address
      );
    await czfSc.connect(deployer).setContractSafe(chronoPoolService.address);
    console.log("Complete");
  });
  describe("Deploy success", function() {
    it("Should have deployed the contracts", async function() {
      const czfAddr = await chronoPoolService.czf();
      expect(czf).to.eq(czfAddr);
    });
  });
  describe("addChronoPool", function() {
    it("Should create a new chrono pool", async function() {
      await chronoPoolService.addChronoPool(
        ffBasis,
        vestPeriod,
        aprBasis
      );
      const {adjustedRateBasis_, vestPeriod_, ffBasis_, poolEmissionRate_} = await chronoPoolService.getChronoPoolInfo(0);
      expect(adjustedRateBasis_).to.be.closeTo(aprBasis,100);
      expect(vestPeriod_).to.eq(vestPeriod);
      expect(ffBasis_).to.eq(ffBasis);
      expect(poolEmissionRate_).to.eq(0);
    });
    it("Should create a second chrono pool", async function() {
      await chronoPoolService.addChronoPool(
        ffBasis,
        vestPeriod,
        aprBasis
      );
      const {adjustedRateBasis_, vestPeriod_, ffBasis_, poolEmissionRate_} = await chronoPoolService.getChronoPoolInfo(1);
      expect(adjustedRateBasis_).to.be.closeTo(aprBasis,100);
      expect(vestPeriod_).to.eq(vestPeriod);
      expect(ffBasis_).to.eq(ffBasis);
      expect(poolEmissionRate_).to.eq(0);
    });
  });
  describe("deposit", function() {
    it("Should add a new vest for account", async function() {
      const depositWad = parseEther("2000000000");
      const expectedTotalVesting = depositWad.mul(aprBasis + 10000).div(10000);
      const expectedEmissionRate = expectedTotalVesting.div(31536000);
      await czfSc.connect(deployer).mint(trader.address,depositWad.add(parseEther("1000")));
      await chronoPoolService.connect(trader).deposit(0,depositWad);
      const {adjustedRateBasis_, vestPeriod_, ffBasis_, poolEmissionRate_} = await chronoPoolService.getChronoPoolInfo(0);
      const {totalVesting_, emissionRate_, updateEpoch_} = await chronoPoolService.getChronoPoolAccountInfo(trader.address,0);
      const latestTime = await time.latest();
      expect(vestPeriod_).to.eq(vestPeriod);
      expect(ffBasis_).to.eq(ffBasis);
      expect(poolEmissionRate_).to.be.closeTo(expectedEmissionRate,parseEther("1"));
      expect(totalVesting_).to.be.closeTo(expectedTotalVesting,depositWad.div(10));
      expect(emissionRate_).to.be.closeTo(expectedEmissionRate,parseEther("1"));
      expect(updateEpoch_).to.eq(latestTime.toNumber());
      expect(adjustedRateBasis_).to.be.closeTo(toBN(aprBasis).mul(baseEmissionRate).div(poolEmissionRate_),100);
      console.log("adjRate",adjustedRateBasis_.toString());
      console.log("er",emissionRate_.toString());
      console.log("vest",totalVesting_.toString());
    });
  });
  describe("reinvest", function() {
    it("Should reinvest at adjustedRateBasis", async function() {
      const adjApr = 71717; // from previous deposit
      const emissionRate = parseEther("696.700636296803305701")//from previous deposit
      const vesting = parseEther("21986200000");//from previous deposit

      const initialTime = (await time.latest()).toNumber();
      await time.increase(time.duration.days(3));

      await chronoPoolService.connect(trader).reinvest(0);
      const {totalVesting_, emissionRate_, updateEpoch_} = await chronoPoolService.getChronoPoolAccountInfo(trader.address,0);
      const finalTime = (await time.latest()).toNumber();

      const duration = finalTime-initialTime
      const expectedClaim = emissionRate.mul(duration);
      const expectedEmissionRate = emissionRate.add(expectedClaim.mul(10000+adjApr).div(10000).div(31536000));
      const expectedTotalVesting = vesting.sub(expectedClaim).add(expectedClaim.mul(10000+adjApr).div(10000));
      
      expect(totalVesting_).to.eq(expectedTotalVesting);
      expect(emissionRate_).to.be.closeTo(expectedEmissionRate,parseEther("0.1"));
      expect(updateEpoch_).to.eq(finalTime);

    });
  });
  describe("fastforward",function(){
    it("Should fastforward account", async function() {
      await chronoPoolService.connect(trader).claimAndFastForwardAll();
      const {adjustedRateBasis_, vestPeriod_, ffBasis_, poolEmissionRate_} = await chronoPoolService.getChronoPoolInfo(0);
      const {totalVesting_, emissionRate_, updateEpoch_} = await chronoPoolService.getChronoPoolAccountInfo(trader.address,0);
      expect(vestPeriod_).to.eq(vestPeriod);
      expect(ffBasis_).to.eq(ffBasis);
      expect(poolEmissionRate_).to.eq(0);
      expect(totalVesting_).to.eq(0);
      expect(emissionRate_).to.eq(0);
      expect(adjustedRateBasis_).to.be.closeTo(aprBasis,100);
    });
  });
});