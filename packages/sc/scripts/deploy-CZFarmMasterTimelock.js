const hre = require("hardhat");
const loadJsonFile = require("load-json-file");
const { uniswapRouterAddress, zeroAddress, luckyAddress } = loadJsonFile.sync("./deployConfig.json");

const {ethers} = hre;
const { parseEther } = ethers.utils;


async function main() {
  const CZFarmMasterTimelock = await ethers.getContractFactory("CZFarmMasterTimelock");
  const czFarmMasterTimelock = await CZFarmMasterTimelock.deploy();
  await czFarmMasterTimelock.deployed();
  console.log("CZFarmMasterTimelock deployed to:", czFarmMasterTimelock.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  })