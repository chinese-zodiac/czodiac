const hre = require("hardhat");
const loadJsonFile = require("load-json-file");

const { ethers } = hre;
const { parseEther } = ethers.utils;

const { zeroAddress, czblue, czusd, tribePoolMaster, czodiacGnosis } = loadJsonFile.sync("./deployConfig.json");

async function main() {

    const czBlueSc = await ethers.getContractAt("CZBlue", czblue);

    const CZBlueMasterRoutable = await ethers.getContractFactory("CZBlueMasterRoutable");
    master = await CZBlueMasterRoutable.deploy(1681290000);
    await master.deployed();
    console.log("CZBlueMasterRoutable deployed to:", master.address);

    await czBlueSc.grantRole(ethers.utils.id("MINTER_ROLE"), master.address);
    console.log("MINTER_ROLE assigned");
    await czBlueSc.setIsExempt(master.address, true);
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
