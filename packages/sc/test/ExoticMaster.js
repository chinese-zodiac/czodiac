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
const { zeroAddress, czDeployer, czf, lpCzfBnbPcs, pancakeswapRouter } = loadJsonFile.sync("./deployConfig.json");

const { expect } = chai;
const { parseEther, formatEther } = ethers.utils;

describe("ExoticMaster", function() {
  let czfSc;
  let owner, trader, trader1, trader2, trader3, treasury;
  let deployer;
  let exoticMaster;
  let lpSc;
  let pcsRouter;

  let vestPeriod = 31536000; // 1 year
  let ffBasis = 300; // 3%
  let aprBasis = 10*20000; // 20000%
  let baseEmissionRate = parseEther("1500");
  let fastForwardLock = 86400;

  before(async function() {
    [owner, trader, trader1, trader2, trader3, treasury] = await ethers.getSigners();
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [czDeployer],
    });
    deployer = await ethers.getSigner(czDeployer);
    czfSc = await ethers.getContractAt("CZFarm", czf);
    pcsRouter = await ethers.getContractAt("IAmmRouter01", pancakeswapRouter);
    lpSc = await ethers.getContractAt("IAmmPair", lpCzfBnbPcs);

    const ExoticMaster = await ethers.getContractFactory("ExoticMaster");
    exoticMaster = await ExoticMaster.deploy(
      czf, //CZFarm _czf
      treasury.address, //address _treasury
      fastForwardLock  //uint32 _fastForwardLockPeriod
    );

    

    console.log("Grant roles");
    await czfSc.connect(deployer)
      .grantRole(
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        exoticMaster.address
      );
    await czfSc.connect(deployer).setContractSafe(exoticMaster.address);
    console.log("Complete");
  });
  describe("Deploy success", function() {
    it("Should have deployed the contracts", async function() {
      const czfAddr = await exoticMaster.czf();
      expect(czf).to.eq(czfAddr);
    });
  });
  describe("addExoticFarm", function() {
    it("Should create a new exotic farm", async function() {
      await exoticMaster.setLpBaseEmissionRate(lpCzfBnbPcs, baseEmissionRate)
      await exoticMaster.addExoticFarm(
        ffBasis,
        vestPeriod,
        aprBasis,
        lpCzfBnbPcs
      );
      const {adjustedRateBasis_, vestPeriod_, ffBasis_, poolEmissionRate_, baseEmissionRate_, lp_, czfPerLpWad_} = await exoticMaster.getExoticFarmInfo(0);
      expect(adjustedRateBasis_).to.eq(aprBasis);
      expect(vestPeriod_).to.eq(vestPeriod);
      expect(ffBasis_).to.eq(ffBasis);
      expect(poolEmissionRate_).to.eq(0);
      expect(baseEmissionRate_).to.eq(baseEmissionRate);
      expect(lp_).to.eq(lpCzfBnbPcs);
      expect(czfPerLpWad_).to.be.closeTo(parseEther("2933"),parseEther("1"));
    });
    it("Should create a second exotic farm", async function() {
      await exoticMaster.addExoticFarm(
        ffBasis,
        vestPeriod,
        aprBasis,
        lpCzfBnbPcs
      );
      const {adjustedRateBasis_, vestPeriod_, ffBasis_, poolEmissionRate_, baseEmissionRate_, lp_, czfPerLpWad_} = await exoticMaster.getExoticFarmInfo(1);
      expect(adjustedRateBasis_).to.eq(aprBasis);
      expect(vestPeriod_).to.eq(vestPeriod);
      expect(ffBasis_).to.eq(ffBasis);
      expect(poolEmissionRate_).to.eq(0);
      expect(baseEmissionRate_).to.eq(baseEmissionRate);
      expect(lp_).to.eq(lpCzfBnbPcs);
      expect(czfPerLpWad_).to.be.closeTo(parseEther("2933"),parseEther("1"));
    });
  });
  describe("deposit", function() {
    it("Should add a new vest for account", async function() {
      const czfWad = parseEther("20000000");

      const expectedTotalVesting = czfWad.mul(2).mul(aprBasis + 10000).div(10000);
      const expectedEmissionRate = expectedTotalVesting.div(31536000);

      
      await czfSc.connect(deployer).mint(trader.address,czfWad);
      console.log("pscRounter",pcsRouter.address);
      await czfSc.connect(trader).approve(pcsRouter.address,czfWad);
      await pcsRouter.connect(trader).addLiquidityETH(czfSc.address,czfWad,czfWad,0,trader.address,2000000000,{
        value: parseEther("10"),
      });
      const liquidity = await lpSc.balanceOf(trader.address);
      console.log("liquidity",formatEther(liquidity));
      await lpSc.connect(trader).approve(exoticMaster.address,liquidity);
      await exoticMaster.connect(trader).deposit(0,liquidity);
      console.log("Deposit success");

      const {adjustedRateBasis_, vestPeriod_, ffBasis_, poolEmissionRate_, lp_, czfPerLpWad_} = await exoticMaster.getExoticFarmInfo(0);
      const {totalVesting_, emissionRate_, updateEpoch_, fastForwardLockToEpoch_} = await exoticMaster.getExoticFarmAccountInfo(trader.address,0);
      const latestTime = await time.latest();

      console.log("adjRate",adjustedRateBasis_.toString());
      console.log("er",emissionRate_.toString());
      console.log("vest",totalVesting_.toString());
      console.log("fastForwardLockToEpoch_",fastForwardLockToEpoch_.toString());
      console.log("poolEmissionRate_",poolEmissionRate_.toString());

      expect(vestPeriod_).to.eq(vestPeriod);
      expect(ffBasis_).to.eq(ffBasis);
      expect(poolEmissionRate_).to.be.closeTo(expectedEmissionRate,expectedEmissionRate.div(100));
      expect(totalVesting_).to.be.closeTo(expectedTotalVesting,expectedTotalVesting.div(100));
      expect(emissionRate_).to.be.closeTo(expectedEmissionRate,expectedEmissionRate.div(100));
      expect(updateEpoch_).to.eq(latestTime.toNumber());
      expect(fastForwardLockToEpoch_).to.eq(latestTime.toNumber()+fastForwardLock);
      expect(adjustedRateBasis_).to.eq(aprBasis);
    });
  });
});