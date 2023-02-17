const hre = require("hardhat");
const loadJsonFile = require("load-json-file");
const { lsdt } = loadJsonFile.sync("./deployConfig.json");

const { ethers } = hre;
const { parseEther } = ethers.utils;

async function main() {
  const ScorchPegV5 = await ethers.getContractFactory("ScorchPegV5");
  const scorchPegV5 = await ScorchPegV5.deploy();
  await scorchPegV5.deployed();
  console.log("ScorchPegV5 deployed to:", scorchPegV5.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });