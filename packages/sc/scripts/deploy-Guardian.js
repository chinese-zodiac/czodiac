const hre = require("hardhat");
const loadJsonFile = require("load-json-file");

const {ethers} = hre;
const { parseEther } = ethers.utils;


async function main() {

  const Guardian = await ethers.getContractFactory("Guardian");
  const guardian = await Guardian.deploy();
  await guardian.deployed();
  console.log("Guardian deployed to:", guardian.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
