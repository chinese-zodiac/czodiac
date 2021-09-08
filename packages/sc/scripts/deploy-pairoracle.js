const hre = require("hardhat");
const loadJsonFile = require("load-json-file");

const {ethers} = hre;
const { parseEther } = ethers.utils;

const lpTokenAddress = "0xAAC96d00C566571bafdfa3B8440Bdc3cDB223Ad0";


async function main() {

  const PairOracle = await ethers.getContractFactory("PairOracle");
  const pairOracle = await PairOracle.deploy(lpTokenAddress);
  await pairOracle.deployed();
  console.log("PairOracle deployed to:", pairOracle.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });