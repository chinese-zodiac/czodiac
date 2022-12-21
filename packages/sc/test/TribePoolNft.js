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
const { zeroAddress, czodiacNft, czred, czodiacGnosis, czDeployer, czusd
} = loadJsonFile.sync("./deployConfig.json");

const { expect } = chai;
const { parseEther, formatEther } = ethers.utils;

describe("TribePoolNft", function () {
    let czodiacNftSc, czredSc, czusdSc, tribePoolNftSc;

    let czusdAdmin, deployer, owner, trader, trader1, trader2, trader3;

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
        await trader.sendTransaction({
            to: czodiacGnosis,
            value: ethers.utils.parseEther("1.0")
        })
        trader.sendTransaction({
            to: czDeployer,
            value: ethers.utils.parseEther("1.0")
        });

        czodiacNftSc = await ethers.getContractAt("IERC721Enumerable", czodiacNft);
        czredSc = await ethers.getContractAt("CZRed", czred);
        czusdSc = await ethers.getContractAt("CZUsd", czusd);

        const IterableUintArrayWithoutDuplicateKeys = await ethers.getContractFactory('IterableUintArrayWithoutDuplicateKeys');
        const iterableUintArrayWithoutDuplicateKeys = await IterableUintArrayWithoutDuplicateKeys.deploy();
        await iterableUintArrayWithoutDuplicateKeys.deployed();
        console.log("Deployed iterableUintArrayWithoutDuplicateKeys");

        const TribePoolNftSc = await ethers.getContractFactory("TribePoolNft", {
            libraries: {
                IterableUintArrayWithoutDuplicateKeys: iterableUintArrayWithoutDuplicateKeys.address,
            },
        });
        tribePoolNftSc = await TribePoolNftSc.deploy();
        await tribePoolNftSc.deployed();
        console.log("Deployed TribePoolNftSc");
        await czusdSc.connect(czusdAdmin).setContractSafe(tribePoolNftSc.address);
    });
    it("Should deploy TribePoolNft", async function () {
        const totalStaked = await tribePoolNftSc.totalStaked();
        const stakedNft = await tribePoolNftSc.stakedNft();
        const tribeToken = await tribePoolNftSc.tribeToken();
        expect(totalStaked).to.eq(0);
        expect(stakedNft).to.eq(czodiacNft);
        expect(tribeToken).to.eq(czred);
    });
    it("Should stake Nft", async function () {
        await czodiacNftSc.connect(deployer).setApprovalForAll(tribePoolNftSc.address, true);
        await tribePoolNftSc.connect(deployer).deposit([1, 3]);
        const totalStaked = await tribePoolNftSc.totalStaked();
        const stakedBal = await tribePoolNftSc.stakedBal(deployer.address);
        const idOwner = await tribePoolNftSc.idOwner(3);
        const depositedIdForAccountAtIndex = await tribePoolNftSc.getDepositedIdForAccountAtIndex(deployer.address, 1);
        expect(totalStaked).to.eq(2);
        expect(stakedBal).to.eq(2);
        expect(idOwner).to.eq(deployer.address);
        expect(depositedIdForAccountAtIndex).to.eq(3);
    });
    it("Should withdraw Nft", async function () {
        console.log("Attempting withdraw")
        await tribePoolNftSc.connect(deployer).withdraw([1]);
        console.log("withdraw success")
        const totalStaked = await tribePoolNftSc.totalStaked();
        const stakedBal = await tribePoolNftSc.stakedBal(deployer.address);
        const idOwner = await tribePoolNftSc.idOwner(3);
        const depositedIdForAccountAtIndex0 = await tribePoolNftSc.getDepositedIdForAccountAtIndex(deployer.address, 0);
        expect(totalStaked).to.eq(1);
        expect(stakedBal).to.eq(1);
        expect(idOwner).to.eq(deployer.address);
        expect(depositedIdForAccountAtIndex0).to.eq(3);
    });
});