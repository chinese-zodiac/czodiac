const hre = require("hardhat");
const loadJsonFile = require("load-json-file");

const { ethers } = hre;
const { parseEther } = ethers.utils;

const { zeroAddress, bandit, czusd, tribePoolMaster, czodiacGnosis } = loadJsonFile.sync("./deployConfig.json");

async function main() {

    const banditSc = await ethers.getContractAt("Bandit", bandit);

    const BanditMasterRoutable = await ethers.getContractFactory("BanditMasterRoutable");
    master = await BanditMasterRoutable.deploy(1683600000);
    await master.deployed();
    console.log("BanditMasterRoutable deployed to:", master.address);

    await banditSc.grantRole(ethers.utils.id("MINTER_ROLE"), master.address);
    console.log("MINTER_ROLE assigned");
    await banditSc.setIsExempt(master.address, true);
    console.log("setIsExempt ");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
