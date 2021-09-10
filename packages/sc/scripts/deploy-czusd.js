const hre = require("hardhat");
const loadJsonFile = require("load-json-file");

const {ethers} = hre;
const { parseEther } = ethers.utils;


async function main() {

  const CZUsd = await ethers.getContractFactory("CZUsd");
  const czusd = await CZUsd.deploy();
  await czusd.deployed();
  console.log("CZUsd deployed to:", czusd.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
