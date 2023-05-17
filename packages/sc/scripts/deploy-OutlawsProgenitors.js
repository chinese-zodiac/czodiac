const hre = require("hardhat");
const loadJsonFile = require("load-json-file");

const { ethers } = hre;
const { parseEther } = ethers.utils;

const { zeroAddress, bandit, czusd, tribePoolMaster, czodiacGnosis } = loadJsonFile.sync("./deployConfig.json");



async function main() {

    const banditSc = await ethers.getContractAt("Bandit", bandit);

    const OutlawsNft = await ethers.getContractFactory("OutlawsNft");
    const outlawsNft = await OutlawsNft.deploy();
    await outlawsNft.deployed();
    console.log("OutlawsNft deployed to:", outlawsNft.address);


    const OutlawsProgenitorMint = await ethers.getContractFactory("OutlawsProgenitorMint");
    const outlawsProgenitorMint = await OutlawsProgenitorMint.deploy(
        outlawsNft.address,
        bandit
    );
    await outlawsProgenitorMint.deployed();
    console.log("outlawsProgenitorMint deployed to:", outlawsProgenitorMint.address);


    await outlawsNft.grantRole(ethers.utils.id("MANAGER_ROLE"), outlawsProgenitorMint.address);
    console.log("MANAGER_ROLE assigned");
    await banditSc.setIsExempt(outlawsProgenitorMint.address, true);
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
