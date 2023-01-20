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

    })

});