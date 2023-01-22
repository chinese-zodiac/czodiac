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
const { parse } = require('@ethersproject/transactions');
const { zeroAddress, czusd, czodiacGnosis, blacklist } = loadJsonFile.sync("./deployConfig.json");

const { expect } = chai;
const { parseEther, formatEther } = ethers.utils;

describe("Cashback_Registry", function () {
    let czusdSc, blacklistSc, cashbackRegistrySc;
    let owner, trader, trader1, trader2, trader3;
    let czusdAdmin;

    before(async function () {
        [owner, trader, trader1, trader2, trader3] = await ethers.getSigners();
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [czodiacGnosis],
        });
        czusdAdmin = await ethers.getSigner(czodiacGnosis);
        czusdSc = await ethers.getContractAt("CZUsd", czusd);
        blacklistSc = await ethers.getContractAt("IBlacklist", blacklist);
    });
    it("Should deploy Cashback_Registry", async function () {
        const Cashback_Registry = await ethers.getContractFactory("Cashback_Registry");
        cashbackRegistrySc = await Cashback_Registry.deploy();

        const czusdAddress = await cashbackRegistrySc.czusd();
        const blacklistAddress = await cashbackRegistrySc.blacklistChecker();
        const accountIdNonce = await cashbackRegistrySc.accountIdNonce();
        const nodeIdNonce = await cashbackRegistrySc.nodeIdNonce();

        const totalWeightAt_TREASURY = await cashbackRegistrySc.totalWeightAtLevel(0);
        const totalWeightAt_DIAMOND = await cashbackRegistrySc.totalWeightAtLevel(1);
        const totalWeightAt_GOLD = await cashbackRegistrySc.totalWeightAtLevel(2);
        const totalWeightAt_SILVER = await cashbackRegistrySc.totalWeightAtLevel(3);
        const totalWeightAt_BRONZE = await cashbackRegistrySc.totalWeightAtLevel(4);
        const totalWeightAt_MEMBER = await cashbackRegistrySc.totalWeightAtLevel(5);

        const levelFeesAt_TREASURY = await cashbackRegistrySc.levelFees(0);
        const levelFeesAt_DIAMOND = await cashbackRegistrySc.levelFees(1);
        const levelFeesAt_GOLD = await cashbackRegistrySc.levelFees(2);
        const levelFeesAt_SILVER = await cashbackRegistrySc.levelFees(3);
        const levelFeesAt_BRONZE = await cashbackRegistrySc.levelFees(4);
        const levelFeesAt_MEMBER = await cashbackRegistrySc.levelFees(5);

        const node1 = await cashbackRegistrySc.getNodeInfo(1);
        const node2 = await cashbackRegistrySc.getNodeInfo(2);
        const node3 = await cashbackRegistrySc.getNodeInfo(3);
        const node4 = await cashbackRegistrySc.getNodeInfo(4);
        const node5 = await cashbackRegistrySc.getNodeInfo(5);
        const node6 = await cashbackRegistrySc.getNodeInfo(6);

        const account1 = await cashbackRegistrySc.getAccountInfo(1);

        const treasuryCodeAccountId = await cashbackRegistrySc.codeToAccountId("TREASURY");
        const ownerAccountId = await cashbackRegistrySc.signerToAccountId(owner.address);

        expect(czusdAddress).to.eq(czusd);
        expect(blacklistAddress).to.eq(blacklist);
        expect(accountIdNonce).to.eq(2);
        expect(nodeIdNonce).to.eq(7);
        expect(totalWeightAt_TREASURY).to.eq(100);
        expect(totalWeightAt_DIAMOND).to.eq(90);
        expect(totalWeightAt_GOLD).to.eq(70);
        expect(totalWeightAt_SILVER).to.eq(50);
        expect(totalWeightAt_BRONZE).to.eq(30);
        expect(totalWeightAt_MEMBER).to.eq(10);

        expect(levelFeesAt_TREASURY).to.eq(ethers.constants.MaxUint256);
        expect(levelFeesAt_DIAMOND).to.eq(parseEther("2500"));
        expect(levelFeesAt_GOLD).to.eq(parseEther("750"));
        expect(levelFeesAt_SILVER).to.eq(parseEther("125"));
        expect(levelFeesAt_BRONZE).to.eq(parseEther("5"));
        expect(levelFeesAt_MEMBER).to.eq(0);


        expect(node1.depth_).to.eq(0);
        expect(node1.accountId_).to.eq(1);
        expect(node1.parentNodeId_).to.eq(0);
        expect(node2.depth_).to.eq(1);
        expect(node2.accountId_).to.eq(1);
        expect(node2.parentNodeId_).to.eq(1);
        expect(node3.depth_).to.eq(2);
        expect(node3.accountId_).to.eq(1);
        expect(node3.parentNodeId_).to.eq(2);
        expect(node4.depth_).to.eq(3);
        expect(node4.accountId_).to.eq(1);
        expect(node4.parentNodeId_).to.eq(3);
        expect(node5.depth_).to.eq(4);
        expect(node5.accountId_).to.eq(1);
        expect(node5.parentNodeId_).to.eq(4);
        expect(node6.depth_).to.eq(5);
        expect(node6.accountId_).to.eq(1);
        expect(node6.parentNodeId_).to.eq(5);

        expect(account1.level_).to.eq(0);
        expect(account1.signer_).to.eq(owner.address);
        expect(account1.referrerAccountId_).to.eq(0);
        expect(account1.code_).to.eq("TREASURY");
        expect(account1.levelNodeIds_[0]).to.eq(1);
        expect(account1.levelNodeIds_[1]).to.eq(2);
        expect(account1.levelNodeIds_[2]).to.eq(3);
        expect(account1.levelNodeIds_[3]).to.eq(4);
        expect(account1.levelNodeIds_[4]).to.eq(5);
        expect(account1.levelNodeIds_[5]).to.eq(6);

        expect(treasuryCodeAccountId).to.eq(1);
        expect(ownerAccountId).to.eq(1);
    });
    it("Should revert tx without proper access", async function () {
        await expect(cashbackRegistrySc.claimCashback(trader1.address)).to.be.revertedWith("CBR: Not Member");
        await expect(cashbackRegistrySc.addCzusdToDistribute(trader1.address, parseEther("1"))).to.be.reverted;
        await expect(cashbackRegistrySc.connect(trader1).becomeMember("")).to.be.revertedWith("CBR: Code Not Registered");
        await expect(cashbackRegistrySc.becomeMember("")).to.be.revertedWith("CBR: Already Registered");
        await expect(cashbackRegistrySc.connect(trader1).upgradeTier()).to.be.revertedWith("CBR: Not Registered");
        await expect(cashbackRegistrySc.upgradeTier()).to.be.revertedWith("CBR: Max Tier");
        await expect(cashbackRegistrySc.connect(trader1).addCzusdToReferrerChain(3, parseEther("1"))).to.be.reverted;
        await expect(cashbackRegistrySc.connect(trader1).setCodeTo("TREASURY")).to.be.revertedWith("CBR: Code Invalid");
        await expect(cashbackRegistrySc.setCodeTo("")).to.be.revertedWith("CBR: Code Invalid");
        await expect(cashbackRegistrySc.connect(trader1).setCodeTo("ABC")).to.be.revertedWith("CBR: Account not registered");
        await expect(cashbackRegistrySc.connect(trader1).setLevelFee(0, 1)).to.be.reverted;
        await expect(cashbackRegistrySc.connect(trader1).setTotalWeightAtLevel(0, 1)).to.be.reverted;
        await expect(cashbackRegistrySc.connect(trader1).setCzusd(trader1.address)).to.be.reverted;
        await expect(cashbackRegistrySc.connect(trader1).setBlacklist(trader1.address)).to.be.reverted;
        await expect(cashbackRegistrySc.connect(trader1).recaptureAccounts([1])).to.be.revertedWith("CBR: Not Member");
    });
    it("Should register new member", async function () {
        await cashbackRegistrySc.connect(trader1).becomeMember("TREASURY");

        const accountIdNonce = await cashbackRegistrySc.accountIdNonce();
        const nodeIdNonce = await cashbackRegistrySc.nodeIdNonce();
        const trader1AccountId = await cashbackRegistrySc.signerToAccountId(trader1.address);

        const account2 = await cashbackRegistrySc.getAccountInfo(2);
        const node7 = await cashbackRegistrySc.getNodeInfo(7);

        const treasuryRefferals = await cashbackRegistrySc.getAccountReferrals(1, 0, 1);

        expect(accountIdNonce).to.eq(3);
        expect(nodeIdNonce).to.eq(8);
        expect(trader1AccountId).to.eq(2);

        expect(account2.level_).to.eq(5);
        expect(account2.signer_).to.eq(trader1.address);
        expect(account2.referrerAccountId_).to.eq(1);
        expect(account2.code_).to.eq("");
        expect(account2.levelNodeIds_[0]).to.eq(0);
        expect(account2.levelNodeIds_[1]).to.eq(0);
        expect(account2.levelNodeIds_[2]).to.eq(0);
        expect(account2.levelNodeIds_[3]).to.eq(0);
        expect(account2.levelNodeIds_[4]).to.eq(0);
        expect(account2.levelNodeIds_[5]).to.eq(7);

        expect(node7.depth_).to.eq(5);
        expect(node7.accountId_).to.eq(2);
        expect(node7.parentNodeId_).to.eq(5); //treasury bronze node id

        expect(treasuryRefferals[0]).to.eq(2);
    });
    it("Should fail upgrade if not enough funds for tier", async function () {
        await expect(cashbackRegistrySc.connect(trader1).upgradeTier()).to.be.reverted;
    });
    it("Should upgrade tier", async function () {
        await czusdSc.connect(czusdAdmin).mint(trader1.address, parseEther("5000"));
        await czusdSc.connect(trader1).approve(cashbackRegistrySc.address, ethers.constants.MaxUint256);

        const initialCBRCzusdBal = await czusdSc.balanceOf(cashbackRegistrySc.address);
        const initialTrader1CzusdBal = await czusdSc.balanceOf(trader1.address);

        await cashbackRegistrySc.connect(trader1).upgradeTierAndSetCode("TRADER1");

        const accountIdNonce = await cashbackRegistrySc.accountIdNonce();
        const nodeIdNonce = await cashbackRegistrySc.nodeIdNonce();

        const account2 = await cashbackRegistrySc.getAccountInfo(2);
        const account1 = await cashbackRegistrySc.getAccountInfo(1);
        const node7 = await cashbackRegistrySc.getNodeInfo(7);
        const node8 = await cashbackRegistrySc.getNodeInfo(8);

        const treasuryRefferals = await cashbackRegistrySc.getAccountReferrals(1, 0, 1);

        const finalCBRCzusdBal = await czusdSc.balanceOf(cashbackRegistrySc.address);
        const finalTrader1CzusdBal = await czusdSc.balanceOf(trader1.address);

        const pendingUpgradeRewardsToOwner = await cashbackRegistrySc.pendingRewards(owner.address);

        expect(accountIdNonce).to.eq(3);
        expect(nodeIdNonce).to.eq(9);

        expect(account2.level_).to.eq(4);
        expect(account2.signer_).to.eq(trader1.address);
        expect(account2.referrerAccountId_).to.eq(1);
        expect(account2.code_).to.eq("TRADER1");
        expect(account2.levelNodeIds_[0]).to.eq(0);
        expect(account2.levelNodeIds_[1]).to.eq(0);
        expect(account2.levelNodeIds_[2]).to.eq(0);
        expect(account2.levelNodeIds_[3]).to.eq(0);
        expect(account2.levelNodeIds_[4]).to.eq(8);
        expect(account2.levelNodeIds_[5]).to.eq(7);
        expect(account2.totalReferrals_).to.eq(0);
        expect(account1.totalReferrals_).to.eq(1);

        expect(node7.depth_).to.eq(5);
        expect(node7.accountId_).to.eq(2);
        expect(node7.parentNodeId_).to.eq(8); //trader1 bronze node id

        expect(node8.depth_).to.eq(4);
        expect(node8.accountId_).to.eq(2);
        expect(node8.parentNodeId_).to.eq(4); //treasury silver node id

        expect(treasuryRefferals[0]).to.eq(2);

        expect(finalCBRCzusdBal.sub(initialCBRCzusdBal)).to.eq(parseEther("5"));
        expect(initialTrader1CzusdBal.sub(finalTrader1CzusdBal)).to.eq(parseEther("5"));
        expect(pendingUpgradeRewardsToOwner).to.be.closeTo(parseEther("5"), parseEther("0.0001"));
    });
    it("Should upgrade tier of second account twice", async function () {
        await czusdSc.connect(czusdAdmin).mint(trader2.address, parseEther("5000"));
        await czusdSc.connect(trader2).approve(cashbackRegistrySc.address, ethers.constants.MaxUint256);
        await cashbackRegistrySc.connect(trader2).becomeMember("TRADER1");

        const initialCBRCzusdBal = await czusdSc.balanceOf(cashbackRegistrySc.address);
        const initialTrader2CzusdBal = await czusdSc.balanceOf(trader2.address);

        await cashbackRegistrySc.connect(trader2).upgradeTierAndSetCode("TRADER2");
        await cashbackRegistrySc.connect(trader2).upgradeTier();

        const accountIdNonce = await cashbackRegistrySc.accountIdNonce();
        const nodeIdNonce = await cashbackRegistrySc.nodeIdNonce();

        const trader1Refferals = await cashbackRegistrySc.getAccountReferrals(2, 0, 1);

        const account3 = await cashbackRegistrySc.getAccountInfo(3);
        const account2 = await cashbackRegistrySc.getAccountInfo(2);
        const account1 = await cashbackRegistrySc.getAccountInfo(1);
        const node9 = await cashbackRegistrySc.getNodeInfo(9);
        const node10 = await cashbackRegistrySc.getNodeInfo(10);
        const node11 = await cashbackRegistrySc.getNodeInfo(11);

        const finalCBRCzusdBal = await czusdSc.balanceOf(cashbackRegistrySc.address);
        const finalTrader2CzusdBal = await czusdSc.balanceOf(trader2.address);

        const pendingUpgradeRewardsToOwner = await cashbackRegistrySc.pendingRewards(owner.address);
        const pendingUpgradeRewardsToTrader1 = await cashbackRegistrySc.pendingRewards(trader1.address);
        const pendingUpgradeRewardsToTrader2 = await cashbackRegistrySc.pendingRewards(trader2.address);

        expect(accountIdNonce).to.eq(4);
        expect(nodeIdNonce).to.eq(12);

        expect(account3.level_).to.eq(3);
        expect(account3.signer_).to.eq(trader2.address);
        expect(account3.referrerAccountId_).to.eq(2);
        expect(account3.code_).to.eq("TRADER2");
        expect(account3.levelNodeIds_[0]).to.eq(0);
        expect(account3.levelNodeIds_[1]).to.eq(0);
        expect(account3.levelNodeIds_[2]).to.eq(0);
        expect(account3.levelNodeIds_[3]).to.eq(11);
        expect(account3.levelNodeIds_[4]).to.eq(10);
        expect(account3.levelNodeIds_[5]).to.eq(9);
        expect(account3.totalReferrals_).to.eq(0);
        expect(account2.totalReferrals_).to.eq(1);
        expect(account1.totalReferrals_).to.eq(1);

        expect(node9.depth_).to.eq(5);
        expect(node9.accountId_).to.eq(3);
        expect(node9.parentNodeId_).to.eq(10);

        expect(node10.depth_).to.eq(4);
        expect(node10.accountId_).to.eq(3);
        expect(node10.parentNodeId_).to.eq(11);

        expect(node11.depth_).to.eq(3);
        expect(node11.accountId_).to.eq(3);
        expect(node11.parentNodeId_).to.eq(3); //TREASURY gold node

        expect(trader1Refferals[0]).to.eq(3);

        expect(finalCBRCzusdBal.sub(initialCBRCzusdBal)).to.eq(parseEther("130"));
        expect(initialTrader2CzusdBal.sub(finalTrader2CzusdBal)).to.eq(parseEther("130"));

        expect(pendingUpgradeRewardsToTrader2).to.eq(0);
        expect(pendingUpgradeRewardsToTrader1).to.be.closeTo(parseEther("1.1111"), parseEther("0.00002"));
        expect(pendingUpgradeRewardsToOwner).to.be.closeTo(parseEther("133.8888"), parseEther("0.0001"));

    });
});