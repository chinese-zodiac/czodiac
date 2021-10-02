// SPDX-License-Identifier: GPL-3.0

const chai = require("chai");
const { solidity } = require("ethereum-waffle");
chai.use(solidity);

const { ethers, config } = require("hardhat");
const { time } = require("@openzeppelin/test-helpers");
// const { toNum, toBN } = require("./utils/bignumberConverter");

const { beltBNB, beltBnbPoolId, beltFarm, BELT, czf, czDeployer } = require("../deployConfig.json");

const { expect } = chai;
const { parseEther, formatEther, parseUnits } = ethers.utils;


describe("CzVaultRouter", function () {
  let czfBeltVault;
  let czVaultRouter;
  let czFarmMasterRoutable;
  let czfContract
  let beltContract;
  let beltBNBContract;
  let beltFarmContract;
  let owner, trader, trader1, trader2, trader3;
  let deployer;

  before(async function () {
    [owner, trader, trader1, trader2, trader3] = await ethers.getSigners();

    await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [czDeployer],
        });
    deployer = await ethers.getSigner(czDeployer);

    czfContract = await ethers.getContractAt(
      "CZFarm",
      czf
    );

    const CzfBeltVault = await ethers.getContractFactory("CzfBeltVault");
    czfBeltVault = await CzfBeltVault.deploy(beltFarm, beltBNB, beltBnbPoolId, BELT);

    const CZVaultRouter = await ethers.getContractFactory("CZVaultRouter");
    czVaultRouter = await CZVaultRouter.deploy();

    await time.advanceBlock();
    const latestBlock = await time.latestBlock();

    console.log(latestBlock);

    const CZFarmMasterRoutable = await ethers.getContractFactory("CZFarmMasterRoutable");
    czFarmMasterRoutable = await CZFarmMasterRoutable.deploy(czf,parseEther("100"),latestBlock+1);

    await czFarmMasterRoutable.setRouter(czVaultRouter.address);
    await czFarmMasterRoutable.add(
        100,
        czfBeltVault.address,
        true
    );
    await czfBeltVault.setContractSafe(czVaultRouter.address);
    await czfBeltVault.setContractSafe(czFarmMasterRoutable.address);
    await czfContract.connect(deployer).grantRole(ethers.utils.id("MINTER_ROLE"),czFarmMasterRoutable.address);
  });

  describe("Deploy success", function () {
    it("Should have deployed the contracts", async function() {
      expect(czfContract.address).to.eq(czf);
    })
  })

})