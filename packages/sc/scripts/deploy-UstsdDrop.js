const hre = require("hardhat");
const loadJsonFile = require("load-json-file");
const { lsdt } = loadJsonFile.sync("./deployConfig.json");

const { ethers } = hre;
const { parseEther } = ethers.utils;

async function main() {

  const UstsdDrop = await ethers.getContractFactory("UstsdDrop");
  const ustsdDrop = await UstsdDrop.deploy();
  await ustsdDrop.deployed();
  console.log("UstsdDrop deployed to:", ustsdDrop.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });