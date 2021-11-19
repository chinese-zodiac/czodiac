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
  let baseEmissionRate = parseEther("1500");

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
    await czfSc.connect(deployer).grantRole(ethers.utils.id("MINTER_ROLE"),chronoPoolService.address);
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
  });
});