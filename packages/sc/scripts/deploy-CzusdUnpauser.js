const hre = require("hardhat");
const loadJsonFile = require("load-json-file");
const { uniswapRouterAddress, zeroAddress, luckyAddress } = loadJsonFile.sync("./deployConfig.json");

const { ethers } = hre;
const { parseEther } = ethers.utils;


async function main() {

  const CzusdUnpauser = await ethers.getContractFactory("CzusdUnpauser");
  const czusdUnpauser = await CzusdUnpauser.deploy();
  await czusdUnpauser.deployed();
  console.log("CzusdUnpauser deployed to:", czusdUnpauser.address);
  //TODO: Update deployment
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });