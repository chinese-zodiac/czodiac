const hre = require("hardhat");
const loadJsonFile = require("load-json-file");

const { ethers } = hre;
const { parseEther } = ethers.utils;


async function main() {

  const BurnPool = await ethers.getContractFactory("BurnPool");
  const poolCzusdSc = await BurnPool.deploy();
  await poolCzusdSc.deployed();
  console.log("poolCzusdSc deployed to:", poolCzusdSc.address);
  const poolCzfSc = await BurnPool.deploy();
  await poolCzfSc.deployed();
  console.log("poolCzfSc deployed to:", poolCzfSc.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
