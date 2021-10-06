// SPDX-License-Identifier: GPL-3.0

const chai = require("chai");
const { solidity } = require("ethereum-waffle");
chai.use(solidity);

const { ethers, config } = require("hardhat");
const { time } = require("@openzeppelin/test-helpers");
// const { toNum, toBN } = require("./utils/bignumberConverter");

const {
  beltBNB,
  beltBnbPoolId,
  beltFarm,
  BELT,
  czf,
  czDeployer,
} = require("../deployConfig.json");
const { BigNumber } = require("@ethersproject/bignumber");

const { expect } = chai;
const { parseEther, formatEther, parseUnits } = ethers.utils;

/*
SETUP
- Deploy the CZFarmMasterRoutable, CZfBeltVault, CZVaultRouter
- Call czBeltVault.setContractSafe(address(czVaultRouter)) and CZFarmMasterRoutable.setRouter(address(czVaultRouter))
- Add a new czfBeltVault token farm to czFarmRoutable (the lpToken should be the czBeltVault token, even tho czbeltvault is not an lp token it will still work)

TASKS to TEST (for BNB only, later we will need to test the other methods)
- CZVaultRouter.depositAndStakeBeltBNB 
— Decreases the BNB balance of sender
— Increases the beltBNB balance of czVaultRouter
— Increases the czfBeltVault balance of czFarmMasterRoutable
— Increases the czFarmMasterRoutable(pid,sender) amount.
- CZVaultRouter.withdrawAndStakeBeltBNB 
— Opposite of depositAndStakeBeltBNB
— Should increase CZF holdings of sender.
*/

describe("CzVaultRouter", function() {
  let czfBeltVault;
  let czVaultRouter;
  let czFarmMasterRoutable;
  let czfContract;
  let beltContract;
  let beltBNBContract;
  let beltFarmContract;
  let owner, trader, trader1, trader2, trader3;
  let deployer;
  let czfStartBlock, czfPerBlock = parseEther("100");

  before(async function() {
    [owner, trader, trader1, trader2, trader3] = await ethers.getSigners();

    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [czDeployer],
    });
    deployer = await ethers.getSigner(czDeployer);

    czfContract = await ethers.getContractAt("CZFarm", czf);

    beltBNBContract = await ethers.getContractAt(
      "IBeltMultiStrategyToken",
      beltBNB
    );

    const CzfBeltVault = await ethers.getContractFactory("CzfBeltVault");
    czfBeltVault = await CzfBeltVault.deploy(
      beltFarm,
      beltBNB,
      beltBnbPoolId,
      BELT
    );

    const CZVaultRouter = await ethers.getContractFactory("CZVaultRouter");
    czVaultRouter = await CZVaultRouter.deploy();
    await czVaultRouter.deployed();

    await time.advanceBlock();
    const latestBlock = await time.latestBlock();
    czfStartBlock = Number(latestBlock.toString());
    // console.log("latest block before deploy", latestBlock.toString());

    const CZFarmMasterRoutable = await ethers.getContractFactory(
      "CZFarmMasterRoutable"
    );
    czFarmMasterRoutable = await CZFarmMasterRoutable.deploy(
      czf,
      czfPerBlock,
      latestBlock.toString() //Since openzeppelin time uses a different BigNumber library
    );

    await czFarmMasterRoutable.deployed();

    await czFarmMasterRoutable.setRouter(czVaultRouter.address);
    await czFarmMasterRoutable.add(100, czfBeltVault.address, true);
    await czfBeltVault.setContractSafe(czVaultRouter.address);
    await czfBeltVault.setContractSafe(czFarmMasterRoutable.address);
    await czfContract
      .connect(deployer)
      .grantRole(ethers.utils.id("MINTER_ROLE"), czFarmMasterRoutable.address);
    await czfBeltVault.setFeeBasis(449);
  });

  describe("Deploy success", function() {
    it("Should have deployed the contracts", async function() {
      expect(czfContract.address).to.eq(czf);
    });
  });

  describe("Deposit and withdraw", function() {
    it("Should deposit correctly", async function() {
      const initialBNBBalance = await trader.provider.getBalance(
        trader.address
      );
      const depositBNBAmount = parseEther("10");
      await czVaultRouter
        .connect(trader)
        .depositAndStakeBeltBNB(czFarmMasterRoutable.address, 0, {
          value: depositBNBAmount,
        });

      const remainingBNBAmount = await trader.provider.getBalance(
        trader.address
      );

      // Think of gas fees spent on the transaction
      expect(
        initialBNBBalance
          .sub(depositBNBAmount)
          .sub(remainingBNBAmount)
      ).to.be.closeTo(BigNumber.from(0),parseEther("0.01"));
      expect(
        await czfBeltVault.balanceOf(czFarmMasterRoutable.address)
      ).to.be.gt(0);

      await time.advanceBlock();
      const pendingCzfAmount = await czFarmMasterRoutable.pendingCzf(
        0,
        trader.address
      );

      expect(pendingCzfAmount).to.closeTo(parseEther("100"),10000000);

      // const userInfo = await czFarmMasterRoutable.userInfo(0, trader.address);
      // console.log({ userInfo });

      // TODO: This line is failing, but it's not clear why.
      // console.log('czfFarm balance', await czfContract.balanceOf(trader.address));
    });

    it("Should withdraw correctly", async function() {
      const initialBNBBalance = await trader.provider.getBalance(
        trader.address
      );

      const withdrawAmount = (
        await czFarmMasterRoutable.userInfo(0, trader.address)
      ).amount;

      await czVaultRouter
        .connect(trader)
        .withdrawAndUnstakeBeltBNB(
          czFarmMasterRoutable.address,
          0,
          withdrawAmount
        );

      // const totalBNBAmount = await trader.provider.getBalance(trader.address);

      // console.log({ totalBNBAmount, withdrawAmount, initialBNBBalance });

      const pendingCzfAmount = await czFarmMasterRoutable.pendingCzf(
        0,
        trader.address
      );

      expect(pendingCzfAmount).to.eq(0);

      const czfAmount = await czfContract.balanceOf(trader.address);

      // console.log({ czfAmount, czfPerBlock });

      expect(czfAmount).to.be.closeTo(czfPerBlock.mul(2), 10000000);
    });
  });
});
