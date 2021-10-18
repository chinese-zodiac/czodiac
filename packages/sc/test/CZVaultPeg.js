const chai = require("chai");
const { solidity } = require("ethereum-waffle");
const { BigNumber } = require("@ethersproject/bignumber");
const { ethers, config } = require("hardhat");
const { time } = require("@openzeppelin/test-helpers");


const {
  czDeployer,
  uniswapRouterAddress,
  zeroAddress,
  BELT,
  beltFarm,
  czf,
  Belt4LP,
  Belt4,
  busd,
  belt4BeltPoolId
} = require("../deployConfig.json");

const { expect } = chai;
const { parseEther, formatEther, parseUnits } = ethers.utils;

chai.use(solidity);

describe("CzVaultPeg", function() {
  let czBusdVaultSc, czBusdVaultPegSc, pcsRouterSc, busdSc, czfSc;
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
    pcsRouterSc = await ethers.getContractAt("IAmmRouter01", uniswapRouterAddress);

    const CzfBeltVault = await ethers.getContractFactory("CzfBeltVault");
    czfBeltVault = await CzfBeltVault.deploy(
      beltFarm,
      Belt4LP,
      belt4BeltPoolId,
      BELT
    );

    const CZVaultPeg = await ethers.getContractFactory("CZVaultPeg");
    czVaultPeg = await CZVaultPeg.deploy(
      
    );
    await czVaultPeg.deployed();
  })

})