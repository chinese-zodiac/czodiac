const hre = require("hardhat");
const loadJsonFile = require("load-json-file");
const { lsdt } = loadJsonFile.sync("./deployConfig.json");

const { ethers } = hre;
const { parseEther } = ethers.utils;

async function main() {
  const Blacklist = await ethers.getContractFactory("BlacklistBasic");
  const blacklist = await Blacklist.deploy();
  await blacklist.deployed();
  console.log("Blacklist deployed to:", blacklist.address);
  const CzusdGate = await ethers.getContractFactory("CzusdGate");
  const czusdGate = await CzusdGate.deploy(blacklist.address);
  await czusdGate.deployed();
  console.log("CzusdGate deployed to:", czusdGate.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });