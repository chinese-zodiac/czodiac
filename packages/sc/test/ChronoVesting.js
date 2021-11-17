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

describe("ChronoVesting", function() {

  let czfSc;
  let owner, trader, trader1, trader2, trader3;
  let deployer;
  let chronoVestingSc;

  let vestPeriod = 31557600; // 1 year
  let ffBasis = 500; // 5%

  before(async function() {
    [owner, trader, trader1, trader2, trader3] = await ethers.getSigners();
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [czDeployer],
    });
    deployer = await ethers.getSigner(czDeployer);
    czfSc = await ethers.getContractAt("CZFarm", czf);
    const ChronoVesting = await ethers.getContractFactory("ChronoVesting");
    chronoVestingSc = await ChronoVesting.deploy(
      czf, //IERC20 _asset,
      ffBasis, //uint32 _ffBasis,
      vestPeriod //uint32 _vestPeriod
    );
  });
  describe("Deploy success", function() {
    it("Should have deployed the contracts", async function() {
      const vestPeriod = chronoVestingSc.vestPeriod();
      expect(vestPeriod).to.eq(vestPeriod);
    });
  });
});
