const hre = require("hardhat");
const loadJsonFile = require("load-json-file");

const { ethers } = hre;
const { parseEther } = ethers.utils;


async function main() {

    const DddVoter = await ethers.getContractFactory("DddVoter");
    const dddVoter = await DddVoter.deploy();
    await dddVoter.deployed();
    console.log("DddVoter deployed to:", dddVoter.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
