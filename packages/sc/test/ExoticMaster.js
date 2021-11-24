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

describe("ExoticMaster", function() {
  let czfSc;
  let owner, trader, trader1, trader2, trader3, treasury;
  let deployer;
  let exoticMaster;

  let vestPeriod = 31557600; // 1 year
  let ffBasis = 500; // 5%
  let aprBasis = 10*10000; // 10000%
  let baseEmissionRate = parseEther("500");

  before(async function() {
    [owner, trader, trader1, trader2, trader3, treasury] = await ethers.getSigners();
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [czDeployer],
    });
    deployer = await ethers.getSigner(czDeployer);
    czfSc = await ethers.getContractAt("CZFarm", czf);
    const ExoticMaster = await ethers.getContractFactory("ExoticMaster");
    exoticMaster = await ExoticMaster.deploy(
      czf, //CZFarm _czf
      baseEmissionRate, //uint112 _baseEmissionRate
      treasury.address //address _treasury
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
});