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
  describe("AddVest", function() {
    before(async function(){
      await czfSc.connect(deployer).mint(owner.address,parseEther("1"));
      await czfSc.approve(chronoVestingSc.address,parseEther("1"));
      await chronoVestingSc.addVest(owner.address,parseEther("1"));
    });
    it("Should increase account emission rate", async function() {
      const emissionRate = await chronoVestingSc.getAccountEmissionRate(owner.address);
      expect(emissionRate).to.eq(parseEther("1").div(vestPeriod));
    });
    it("Should increase overall emission rate", async function() {
      const emissionRate = await chronoVestingSc.totalEmissionRate();
      expect(emissionRate).to.eq(parseEther("1").div(vestPeriod));
    });
    it("Should increase total rewards wad", async function() {
      const totalRewardsWad = await chronoVestingSc.totalRewardsWad();
      expect(totalRewardsWad).to.eq(parseEther("1"));
    });
    it("Should increase account balance", async function() {
      const balanceOf = await chronoVestingSc.balanceOf(owner.address);
      expect(balanceOf).to.eq(parseEther("1"));
    });
    it("Should increase account balance with second add", async function() {
      await czfSc.connect(deployer).mint(owner.address,parseEther("1"));
      await czfSc.approve(chronoVestingSc.address,parseEther("1"));
      await chronoVestingSc.addVest(owner.address,parseEther("1"));
      const balanceOf = await chronoVestingSc.balanceOf(owner.address);
      expect(balanceOf).to.be.closeTo(parseEther("2"),parseEther("0.00001"));
    });
    it("Should increase account emission rate with second add", async function() {
      const emissionRate = await chronoVestingSc.getAccountEmissionRate(owner.address);
      expect(emissionRate).to.eq(parseEther("2").div(vestPeriod));
    });
    it("Should increase account balance with third add", async function() {
      await czfSc.connect(deployer).mint(owner.address,parseEther("1"));
      await czfSc.approve(chronoVestingSc.address,parseEther("1"));
      await chronoVestingSc.addVest(owner.address,parseEther("1"));
      const balanceOf = await chronoVestingSc.balanceOf(owner.address);
      expect(balanceOf).to.be.closeTo(parseEther("3"),parseEther("0.00001"));
    });
    it("Should increase account emission rate with third add", async function() {
      const emissionRate = await chronoVestingSc.getAccountEmissionRate(owner.address);
      expect(emissionRate).to.eq(parseEther("3").div(vestPeriod));
    });
  });
});
