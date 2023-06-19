const hre = require("hardhat");
const loadJsonFile = require("load-json-file");
const { lsdt } = loadJsonFile.sync("./deployConfig.json");

const { ethers } = hre;
const { parseEther } = ethers.utils;

async function main() {
  const CzusdGateV2 = await ethers.getContractFactory("CzusdGateV2");
  const czusdGateV2 = await CzusdGateV2.deploy();
  await czusdGateV2.deployed();
  console.log("CzusdGateV2 deployed to:", czusdGateV2.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });