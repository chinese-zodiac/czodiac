// SPDX-License-Identifier: GPL-3.0

const chai = require("chai");
const { solidity } = require("ethereum-waffle");
chai.use(solidity);

const { ethers, config } = require("hardhat");
const { time } = require("@openzeppelin/test-helpers");
// const { toNum, toBN } = require("./utils/bignumberConverter");

const { beltBNB, beltBnbPoolId, beltFarm, BELT } = require("../deployConfig.json");

const { expect } = chai;
const { parseEther, formatEther, parseUnits } = ethers.utils;

describe("CzfBeltVault", function () {
  let czfBeltVault;
  let beltContract;
  let beltBNBContract;
  let beltFarmContract;
  let owner, trader, trader1, trader2, trader3;

  const depositToCzfBeltVault = async (signer, bnbAmount, portion = 2) => {
    await beltBNBContract.connect(signer).depositBNB(0, {
      value: bnbAmount,
    });

    const beltBNBBalance = await beltBNBContract.balanceOf(signer.address);
    const depositAmount = beltBNBBalance.div(portion);

    await beltBNBContract
      .connect(signer)
      .approve(czfBeltVault.address, beltBNBBalance);

    expect(
      await czfBeltVault.connect(signer).deposit(signer.address, depositAmount)
    )
      .to.emit(czfBeltVault, "Deposit")
      .withArgs(signer.address, beltBnbPoolId, depositAmount);

    expect(await czfBeltVault.balanceOf(signer.address)).to.eq(
      depositAmount,
      "The correct amount of CzfBeltVault is deposited"
    );

    return {
      beltBNBBalance,
      depositAmount,
    };
  };

  before(async function () {
    [owner, trader, trader1, trader2, trader3] = await ethers.getSigners();

    const CzfBeltVault = await ethers.getContractFactory("CzfBeltVault");
    czfBeltVault = await CzfBeltVault.deploy(beltFarm, beltBNB, beltBnbPoolId, BELT);

    await czfBeltVault.deployed();

    beltBNBContract = await ethers.getContractAt(
      "IBeltMultiStrategyToken",
      beltBNB
    );

    beltContract = await ethers.getContractAt("IERC20", BELT);
  });

  describe("Deposit", function () {
    // it("Should correctly deposit the token", async function () {
    //   // make sure the quantity of beltBNB deposited/withdrawn is equal to the amount of CzfBeltVault minted/burned. Also make sure that _for receives the tokens while the msg.sender sends/burns the tokens.
    //   // First, you need to import the IBeltMultiStrategyToken I linked earlier - here it is again in case you missed it.
    //   // Then, you connect to it using ethers with the addrss on the BSC chain.
    //   // Next, you deposit BNB into that contract by calling the depositBNB method.
    //   // That will get you the beltBNB BEP20 tokens you need for the tests - then its just a matter of using .balanceOf to check the beltBNB and BELT balances. You should also carefully consider edge cases (people sending invalid values, 0 values, calling from accounts that dont hold any tokens) and check that the contract behaves correct and reverts.
    //   const { depositAmount, beltBNBBalance } = await depositToCzfBeltVault(trader, parseEther("1"), 2);
    //   expect(await beltBNBContract.balanceOf(trader.address)).to.eq(
    //     beltBNBBalance.sub(depositAmount),
    //     "The remaining amount is correct"
    //   );
    // });
  });

  describe("Withdraw", function () {
    // it("Should withdraw the requested amount correctly", async function () {
    //   const { depositAmount, beltBNBBalance } = await depositToCzfBeltVault(trader1, parseEther("1"), 2);
    //   expect(await beltBNBContract.balanceOf(trader1.address)).to.eq(
    //     beltBNBBalance.sub(depositAmount),
    //     "The remaining amount is correct"
    //   );
    //   const withdrawAmount = depositAmount.div(2);
    //   expect(
    //     await czfBeltVault
    //       .connect(trader1)
    //       .withdraw(trader1.address, withdrawAmount)
    //   )
    //     .to.emit(czfBeltVault, "Withdraw")
    //     .withArgs(trader1.address, beltBnbPoolId, withdrawAmount);
    //   expect(await czfBeltVault.balanceOf(trader1.address)).to.eq(
    //     depositAmount.sub(withdrawAmount),
    //     "The correct amount of CzfBeltVault is withdrawn"
    //   );
    //   expect(await beltBNBContract.balanceOf(trader1.address)).to.eq(
    //     beltBNBBalance.sub(depositAmount).add(withdrawAmount),
    //     "The amount of beltBNB is correct"
    //   );
    // });
    // it("Should reject when withdrawing the insufficient amount", async function () {
    //   const { depositAmount, beltBNBBalance } = await depositToCzfBeltVault(trader2, parseEther("1"), 2);
    //   expect(
    //     await czfBeltVault
    //       .connect(trader2)
    //       .withdraw(trader2.address, depositAmount.add(parseEther("0.1")))
    //   )
    //     .to.be.revertedWith("ERC20: burn amount exceeds balance");
    // });
  });

  describe("Harvest", function () {
    it("Should harvest the correct amount of BELT", async function () {
      await depositToCzfBeltVault(trader3, parseEther("1"), 3);

      const expectedBELT = parseUnits("49336184774", "wei");

      await czfBeltVault.connect(owner).harvest(trader3.address);

      expect(await beltContract.balanceOf(trader3.address)).to.eq(
        expectedBELT,
        "The amount of BELT is correct"
      );
    });
  });
});
