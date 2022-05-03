const hre = require("hardhat");
const loadJsonFile = require("load-json-file");

const {ethers} = hre;
const { parseEther } = ethers.utils;
const {
  ellipsisV2Czusd3psPool,
  czvPegV3
} = require("../deployConfig.json");


async function main() {

  const CZFarmPoolWithFeeWhitelisting = await ethers.getContractFactory("CZFarmPoolWithFeeWhitelisting");
  const pool = await CZFarmPoolWithFeeWhitelisting.deploy();
  await pool.deployed();
  console.log("CZFarmPoolWithFeeWhitelisting deployed to:", pool.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });