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
const { zeroAddress, czf, czusd, lrt, lsdt, oneBadRabbit, dgod, czodiacGnosis

} = loadJsonFile.sync("./deployConfig.json");

const { expect } = chai;
const { parseEther, formatEther } = ethers.utils;

const ITERABLE_ARRAY = "0x4222FFCf286610476B7b5101d55E72436e4a6065";

describe("TribePoolMaster", function () {
    let czfSc, czusdSc, badRabNftSc,
        lrtSc, lsdtSc, dgodSc,
        lrtPoolSc, lsdtPoolSc, dgodPoolSc,
        lrtPoolWrapperSc, lsdtPoolWrapperSc, dgodPoolWrapperSc,
        tribePoolMasterSc;

    let czusdAdmin, owner, trader, trader1, trader2, trader3;

    before(async function () {
        [owner, trader, trader1, trader2, trader3] = await ethers.getSigners();
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [czodiacGnosis],
        });
        czusdAdmin = await ethers.getSigner(czodiacGnosis);

        czfSc = await ethers.getContractAt("CZFarm", czf);
        czusdSc = await ethers.getContractAt("CZUsd", czusd);
        badRabNftSc = await ethers.getContractAt("IERC721", oneBadRabbit);
        lrtSc = await ethers.getContractAt("IERC20", lrt);
        lsdtSc = await ethers.getContractAt("IERC20", lsdt);
        dgodSc = await ethers.getContractAt("IERC20", dgod);
    });
    it("Should deploy TribePoolMaster", async function () {
        const TribePoolMaster = await ethers.getContractFactory("TribePoolMaster", {
            libraries: {
                IterableArrayWithoutDuplicateKeys: ITERABLE_ARRAY
            }
        });
        tribePoolMasterSc = await TribePoolMaster.deploy();
        await tribePoolMasterSc.deployed();
        const masterCzusd = await tribePoolMasterSc.czusd();
        const totalWeight = await tribePoolMasterSc.totalWeight();
        expect(totalWeight).to.eq(0);
        expect(masterCzusd).to.eq(czusd);
    });
});