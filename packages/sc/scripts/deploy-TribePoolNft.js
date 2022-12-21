const hre = require("hardhat");
const loadJsonFile = require("load-json-file");

const { ethers } = hre;
const { parseEther } = ethers.utils;

const { zeroAddress, czodiacNft, czred, czodiacGnosis, czDeployer, czusd
} = loadJsonFile.sync("./deployConfig.json");


async function main() {

    const IterableUintArrayWithoutDuplicateKeys = await ethers.getContractFactory('IterableUintArrayWithoutDuplicateKeys');
    const iterableUintArrayWithoutDuplicateKeys = await IterableUintArrayWithoutDuplicateKeys.deploy();
    await iterableUintArrayWithoutDuplicateKeys.deployed();
    console.log("Deployed iterableUintArrayWithoutDuplicateKeys to:", iterableUintArrayWithoutDuplicateKeys.address);


    const TribePoolNftSc = await ethers.getContractFactory("TribePoolNft", {
        libraries: {
            IterableUintArrayWithoutDuplicateKeys: iterableUintArrayWithoutDuplicateKeys.address,
        },
    });
    const tribePoolNft = await TribePoolNftSc.deploy();
    console.log("Deployed TribePoolNft to:", tribePoolNft.address);

}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });