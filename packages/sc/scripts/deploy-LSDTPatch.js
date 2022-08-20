const hre = require("hardhat");
const loadJsonFile = require("load-json-file");
const { lsdt } = loadJsonFile.sync("./deployConfig.json");

const {ethers} = hre;
const { parseEther } = ethers.utils;

async function main() {

  const LSDTPatch = await ethers.getContractFactory("LSDTPatch");
  const lsdtPatch = await LSDTPatch.deploy(lsdt);
  await lsdtPatch.deployed();
  console.log("LSDTPatch deployed to:", lsdtPatch.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });