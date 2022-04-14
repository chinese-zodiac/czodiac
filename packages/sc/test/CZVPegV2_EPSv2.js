const chai = require("chai");
const { solidity } = require("ethereum-waffle");
const { BigNumber } = require("@ethersproject/bignumber");
const { ethers, config } = require("hardhat");
const { time } = require("@openzeppelin/test-helpers");
const { gssBnAsync } = require("./utils/goldenSearch");


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
  pcsFeeBasis,
  ellipsisV2BasePool,
  ellipsisV2BasePoolToken,
  ellipsisV2Czusd3psPool,
  ellipsisV2Czusd3psPoolToken
} = require("../deployConfig.json");
const { parse } = require("@ethersproject/transactions");

const { expect } = chai;
const { parseEther, formatEther, parseUnits } = ethers.utils;

chai.use(solidity);

describe("CZVPegV2", function() {
  let czBusdVaultSc, czBusdVaultPegSc, czfBeltVault, pcsRouterSc, czusdBusdPairPCSSc, busdSc, czfSc, czusdSc, ellipsisCzusd3psPoolSc, czvPegV2;
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
    czusdBusdPairPCSSc = await ethers.getContractAt("IAmmPair", czusdBusdPairPCS);
    ellipsisCzusd3psPoolSc = await ethers.getContractAt("IMetaPool", ellipsisV2Czusd3psPool);

    czfBeltVault = await ethers.getContractAt("CzfBeltVault", "0xceE0C6a66df916991F3C730108CF8672157380b7");

    const CZVPegV2 = await ethers.getContractFactory("CZVPegV2");
    czvPegV2 = await CZVPegV2.deploy(
      Belt4LP,
      Belt4,
      busd,
      czfBeltVault.address,
      czusd,
      ellipsisV2BasePool,
      ellipsisV2BasePoolToken,
      ellipsisV2Czusd3psPool,
      czf,
      pancakeswapRouter,
      czusdBusdPairPCS,
      pcsFeeBasis
    );
    await czvPegV2.deployed();

    await czusdSc
    .connect(deployer)
    .grantRole(ethers.utils.id("MINTER_ROLE"), czvPegV2.address);

    await czvPegV2.setIsRestrictedToOwner(false);
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
    it("Should balance uniswap when over peg", async function() {
      //burn supply so over peg
      const czusdBalInitial =  await czusdSc.balanceOf(czusdBusdPairPCS);
      console.log("burning");
      await czusdSc.connect(deployer).burnFrom(czusdBusdPairPCS,czusdBalInitial.mul(500).div(10000));
      console.log("sync");
      await czusdBusdPairPCSSc.sync();
      console.log("repeg");
      await czvPegV2.repeg(0, true);

      const busdBal = await busdSc.balanceOf(czusdBusdPairPCS);
      const czusdBal = await czusdSc.balanceOf(czusdBusdPairPCS);
      console.log("busd",formatEther(busdBal),"czusd",formatEther(czusdBal));
      expect(busdBal).to.be.closeTo(czusdBal, parseEther("0.01"));
    });
    it("Should balance uniswap when under peg", async function() {
      //mint supply so under peg
      const czusdBalInitial =  await czusdSc.balanceOf(czusdBusdPairPCS);
      console.log("burning");
      await czusdSc.connect(deployer).mint(czusdBusdPairPCS,czusdBalInitial.mul(500).div(10000));
      console.log("sync");
      await czusdBusdPairPCSSc.sync();
      console.log("repeg");
      await czvPegV2.repeg(0, false);

      const busdBal = await busdSc.balanceOf(czusdBusdPairPCS);
      const czusdBal = await czusdSc.balanceOf(czusdBusdPairPCS);
      console.log("busd",formatEther(busdBal),"czusd",formatEther(czusdBal));
      expect(busdBal).to.be.closeTo(czusdBal, parseEther("0.01"));
    });
    it("Should balance Ellipsis when under peg", async function() {
      //Mint and sell CZUSD to make under peg
      console.log("minting and selling...");
      await czusdSc.connect(deployer).mint(owner.address,parseEther("100"));
      await czusdSc.approve(ellipsisCzusd3psPoolSc.address,parseEther("100"));
      await ellipsisCzusd3psPoolSc.exchange_underlying(0,1,parseEther("100"),0);
      const initialPrice = await ellipsisCzusd3psPoolSc.get_dy_underlying(1,0,parseEther("1"));
      console.log("initialPrice",formatEther(initialPrice));

      console.log("calculating busd to sell...");

      let max10sExponent = 1;
      while (true) {
        let dx = parseEther(max10sExponent.toString())
        let dy = await ellipsisCzusd3psPoolSc.get_dy_underlying(1,0,dx);
        if(dy.lt(dx)) break;
        max10sExponent = max10sExponent*10;
      }
      //The goal is to find the minimum of this function.
      let f = async (dx) => {
        return (
          (await ellipsisCzusd3psPoolSc.get_dy_underlying(1,0,dx))
          .sub(dx)
          .mul(-1)); //multiply by negative one so the minimum is our maximum profit
      }
      let dx;
      if(max10sExponent > 100) {
        dx = await gssBnAsync(f,parseEther("1"),parseEther(max10sExponent.toString()),parseEther("10"),100);
      } else {
        dx = 0;
      }
      console.log("result",formatEther(dx));
      await czvPegV2.repeg(dx, false);

      const finalPrice = await ellipsisCzusd3psPoolSc.get_dy_underlying(1,0,parseEther("1"));
      console.log("finalpriace",formatEther(finalPrice));
      expect(finalPrice).to.be.closeTo(parseEther("1.0001"),parseEther("0.0001"));
    });
    it("Should balance Ellipsis when over peg", async function() {
      //Mint and sell CZUSD to make under peg
      console.log("buy czusd to overpeg...");
      const busdBal = await busdSc.balanceOf(owner.address);
      await busdSc.approve(ellipsisCzusd3psPoolSc.address,busdBal);
      await ellipsisCzusd3psPoolSc.exchange_underlying(1,0,busdBal,0);
      const initialPrice = await ellipsisCzusd3psPoolSc.get_dy_underlying(0,1,parseEther("1"));
      console.log("initialPrice",formatEther(initialPrice));

      let max10sExponent = 1;
      while (true) {
        let dx = parseEther(max10sExponent.toString())
        let dy = await ellipsisCzusd3psPoolSc.get_dy_underlying(0,1,dx);
        if(dy.lt(dx)) break;
        max10sExponent = max10sExponent*10;
      }
      //The goal is to find the minimum of this function.
      let f = async (dx) => {
        return (
          (await ellipsisCzusd3psPoolSc.get_dy_underlying(0,1,dx))
          .sub(dx)
          .mul(-1)); //multiply by negative one so the minimum is our maximum profit
      }
      let dx;
      if(max10sExponent > 100) {
        dx = await gssBnAsync(f,parseEther("1"),parseEther(max10sExponent.toString()),parseEther("10"),100);
      } else {
        dx = 0;
      }
      console.log("result",formatEther(dx));
      await czvPegV2.repeg(dx, true);

      const finalPrice = await ellipsisCzusd3psPoolSc.get_dy_underlying(0,1,parseEther("1"));
      console.log("finalpriace",formatEther(finalPrice));
      expect(finalPrice).to.be.closeTo(parseEther("1.0001"),parseEther("0.0001"));
    });
    it("Should revert if too much passed", async function() {
      await expect(czvPegV2.repeg(parseEther("1000"), true)).to.be.revertedWith("CZVPeg: Wrong Repeg Direction");
      await expect(czvPegV2.repeg(parseEther("1000"), false)).to.be.reverted;
    });
  });

})