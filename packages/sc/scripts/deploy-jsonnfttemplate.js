const hre = require("hardhat");
const loadJsonFile = require("load-json-file");
const {
  tigerZodiac,
  czf,
  czDeployer,
} = require("../deployConfig.json");

const { ethers } = hre;
const { parseEther } = ethers.utils;

async function main() {

  const JsonNftTemplate = await ethers.getContractFactory("JsonNftTemplate");
  const jsonNftTemplate = await JsonNftTemplate.deploy(
    "Silver Rupee NFT",
    "SRNFT"
  );
  await jsonNftTemplate.deployed();
  console.log("JsonNftTemplate deployed to:", jsonNftTemplate.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
