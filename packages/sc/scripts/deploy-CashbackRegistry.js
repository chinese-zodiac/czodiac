const hre = require("hardhat");
const loadJsonFile = require("load-json-file");
const {
  czf,
} = require("../deployConfig.json");

const {ethers} = hre;
const {parseEther} = ethers.utils;

async function main() {

  const Cashback_Registry = await ethers.getContractFactory("Cashback_Registry");
  const cashback_Registry = await Cashback_Registry.deploy();
  await cashback_Registry.deployed();
  console.log("Cashback_Registry deployed to:", cashback_Registry.address);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });