// SPDX-License-Identifier: GPL-3.0

const chai = require("chai");
const { solidity } = require("ethereum-waffle");
chai.use(solidity);

const { ethers, config } = require("hardhat");
const { time } = require("@openzeppelin/test-helpers");
// const { toNum, toBN } = require("./utils/bignumberConverter");

const { beltBNB, beltBnbPoolId, beltFarm, BELT, czDeployer } = require("../deployConfig.json");

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

describe("CZVaultRouter", function () {
  let czfBeltVault;
  let czVaultRouter;
  let cZFarmMasterRoutable;
  let beltContract;
  let beltBNBContract;
  let beltFarmContract;
  let deployer, owner, trader, trader1, trader2, trader3;
  let _startBlock = 0;
  const _czfPerBlock = 100;
  const _allocPoint = 5;

  const depositBeltBNB = async (signer, bnbAmount) => {
    await beltBNBContract.connect(signer).depositBNB(0, {
      value: bnbAmount,
    });

    const beltBNBBalance = await beltBNBContract.balanceOf(signer.address);

    return {
      beltBNBBalance,
    };
  };

  before(async function () {
    [owner, lpTokener, trader1, trader2, trader3] = await ethers.getSigners();
    _startBlock = owner.provider.getBlockNumber();

    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [czDeployer],
    })
    deployer = await ethers.getSigner(czDeployer)

    const CZFarmMasterRoutable = await ethers.getContractFactory("CZFarmMasterRoutable");
    cZFarmMasterRoutable = await CZFarmMasterRoutable.deploy(
      deployer,
      _startBlock,
      _czfPerBlock,
    );
    await cZFarmMasterRoutable.deployed();

    const CZVaultRouter = await ethers.getContractFactory("CZVaultRouter");
    czVaultRouter = await CZVaultRouter.deploy();
    await czVaultRouter.deployed();

    const CzfBeltVault = await ethers.getContractFactory("CzfBeltVault");
    czfBeltVault = await CzfBeltVault.deploy(beltFarm, beltBNB, beltBnbPoolId, BELT);
    await czfBeltVault.deployed();

    
    await czfBeltVault.connect(owner).setContractSafe(czVaultRouter.address);
    await cZFarmMasterRoutable.connect(owner).setRouter(czVaultRouter.address);

    await czfBeltVault.attach(lpTokener.address);
    await cZFarmMasterRoutable.connect(owner).add(_allocPoint, lpTokener.address, true);
  });

  describe("depositAndStakeBeltBNB", function () {
    it("Should correctly deposit the token", async function () {
      const bnbAmount = parseEther("1");
      const depositAmount = bnbAmount.div(2);

      await depositBeltBNB(trader1, bnbAmount);
      await czVaultRouter.connect(trader1).depositAndStakeBeltBNB(cZFarmMasterRoutable, beltBnbPoolId, {
        value: depositAmount,
      });
    });
  });
});
