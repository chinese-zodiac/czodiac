const hre = require("hardhat");
const loadJsonFile = require("load-json-file");

const { ethers } = hre;
const { parseEther } = ethers.utils;


async function main() {

  const CZRed = await ethers.getContractFactory("CZRed");
  const czred = await CZRed.deploy();
  await czred.deployed();
  console.log("CZRed deployed to:", czred.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
