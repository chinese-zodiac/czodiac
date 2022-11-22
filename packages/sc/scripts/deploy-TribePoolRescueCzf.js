const hre = require("hardhat");
const loadJsonFile = require("load-json-file");
const { uniswapRouterAddress, zeroAddress, luckyAddress } = loadJsonFile.sync("./deployConfig.json");

const { ethers } = hre;
const { parseEther } = ethers.utils;


async function main() {

  const TribePoolRescueCzf = await ethers.getContractFactory("TribePoolRescueCzf");
  const tribePoolRescueCzf = await TribePoolRescueCzf.deploy();
  await tribePoolRescueCzf.deployed();
  console.log("TribePoolRescueCzf deployed to:", tribePoolRescueCzf.address);
  //TODO: Update deployment
  //Must set tribePoolRescueCzf as safe for czf
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });