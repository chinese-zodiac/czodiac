const chai = require("chai");
const { solidity } = require("ethereum-waffle");
const { BigNumber } = require("@ethersproject/bignumber");
const { ethers, config } = require("hardhat");
const { time } = require("@openzeppelin/test-helpers");


const {
  czDeployer,
  pancakeswapRouter,
  zeroAddress,
  BELT,
  beltFarm,
  czf,
  Belt4LP,
  Belt4,
  busd,
  belt4BeltPoolId,
  czusd,
  czusdBusdPairPCS,
  pcsFeeBasis
} = require("../deployConfig.json");

const { expect } = chai;
const { parseEther, formatEther, parseUnits } = ethers.utils;

chai.use(solidity);

describe("CzVaultPeg", function() {
  let czBusdVaultSc, czBusdVaultPegSc, pcsRouterSc, busdSc, czfSc, czusdSc;
  let owner, trader, trader1, trader2, trader3;
  let deployer;

  before(async function() {
    [owner, trader, trader1, trader2, trader3] = await ethers.getSigners();
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [czDeployer],
    });
    deployer = await ethers.getSigner(czDeployer);

    czfSc = await ethers.getContractAt("CZFarm", czf);
    busdSc = await ethers.getContractAt("IERC20", busd);
    czusdSc = await ethers.getContractAt("CZUsd", czusd);
    pcsRouterSc = await ethers.getContractAt("IAmmRouter01", pancakeswapRouter);

    const CzfBeltVault = await ethers.getContractFactory("CzfBeltVault");
    czfBeltVault = await CzfBeltVault.deploy(
      beltFarm,
      Belt4,
      belt4BeltPoolId,
      BELT,
      "CzVault4Belt",
      "CZV4BELT"
    );

    const CZVaultPeg = await ethers.getContractFactory("CZVaultPeg");
    czVaultPeg = await CZVaultPeg.deploy(
      Belt4LP,
      Belt4,
      busd,
      czfBeltVault.address,
      czusd,
      pancakeswapRouter,
      czusdBusdPairPCS,
      parseEther("1000"),
      czf,
      3600,
      10,
      pcsFeeBasis
    );
    await czVaultPeg.deployed();

    await czfSc
    .connect(deployer)
    .grantRole(ethers.utils.id("MINTER_ROLE"), czVaultPeg.address);
    await czusdSc
    .connect(deployer)
    .grantRole(ethers.utils.id("MINTER_ROLE"), czVaultPeg.address);
    await czusdSc
    .connect(deployer)
    .setContractSafe(czVaultPeg.address);
  });

  describe("Deploy success", function() {
    it("Should have deployed the contracts", async function() {
      const busdBal = await busdSc.balanceOf(czusdBusdPairPCS);
      const czusdBal =  await czusdSc.balanceOf(czusdBusdPairPCS);
      console.log("busd",formatEther(busdBal),"czusd",formatEther(czusdBal));
      expect(czusdSc.address).to.eq(czusd);
    });
  });

  describe("Repeg", function() {
    before(async function() {
      console.log("attempting repeg...");
      await czVaultPeg.repeg();
      console.log("...repeg complete.")
    });
    it("Should set pair to equal amount of busd and czusd", async function() {
      const busdBal = await busdSc.balanceOf(czusdBusdPairPCS);
      const czusdBal = await czusdSc.balanceOf(czusdBusdPairPCS);
      expect(busdBal).eq(czusdBal);
    });
    it("Should mint CZF to repegger", async function() {
      const czfBal = await czfSc.balanceOf(owner.address);
      console.log("czf",formatEther(czfBal));
      expect(czfBal).gt(0);
    });
  });

})