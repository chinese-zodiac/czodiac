const hre = require("hardhat");
const loadJsonFile = require("load-json-file");
const {
  czf,
} = require("../deployConfig.json");

const { ethers } = hre;
const { parseEther } = ethers.utils;

async function main() {

  const Cashback_Registry_Referral_Levels = await ethers.getContractFactory("Cashback_Registry_Referral_Levels");
  const cashback_Registry_Referral_Levels = await Cashback_Registry_Referral_Levels.deploy();
  await cashback_Registry_Referral_Levels.deployed();
  console.log("Cashback_Registry_Referral_Levels deployed to:", cashback_Registry_Referral_Levels.address);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });