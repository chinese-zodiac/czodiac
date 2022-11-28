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
const { zeroAddress, czDeployer, czf, czusd, lrt, czodiacNft, czred, czodiacGnosis } = loadJsonFile.sync("./deployConfig.json");

const { expect } = chai;
const { parseEther, formatEther } = ethers.utils;

describe("BurnPool", function () {
    let czfSc, czusdSc, czredSc, poolCzusdSc, poolCzfSc;
    let owner, trader, trader1, trader2, trader3;
    let czusdAdmin, deployer;

    before(async function () {
        [owner, trader, trader1, trader2, trader3] = await ethers.getSigners();
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [czodiacGnosis],
        });
        czusdAdmin = await ethers.getSigner(czodiacGnosis);
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [czDeployer],
        });
        deployer = await ethers.getSigner(czDeployer);

        czfSc = await ethers.getContractAt("CZFarm", czf);
        czusdSc = await ethers.getContractAt("CZUsd", czusd);
        czredSc = await ethers.getContractAt("CZRed", czred);
    });
    it("Should deploy BurnPool", async function () {
        const BurnPool = await ethers.getContractFactory("BurnPool");
        poolCzusdSc = await BurnPool.deploy();
        await poolCzusdSc.deployed();
        poolCzfSc = await BurnPool.deploy();
        await poolCzfSc.deployed();
        const poolCzusdTotalShares = await poolCzusdSc.totalShares();
        const poolCzfTotalShares = await poolCzfSc.totalShares();
        expect(poolCzusdTotalShares).to.eq(0);
        expect(poolCzfTotalShares).to.eq(0);
    });

});