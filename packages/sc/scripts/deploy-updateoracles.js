const hre = require("hardhat");
const loadJsonFile = require("load-json-file");

const {ethers} = hre;
const { parseEther } = ethers.utils;

const oracles = [
    "0x27ce3f6478c35f333659997ec6903c1b67153678",
    "0x7a9Bb0c5Aa35bf8ccf8B5BBeD07a79Ddb3708232",
    "0x53C95Ecfde2ED3a8438cFF4F365cf06a07199551",
    "0x741b0D9Bf195e7bE74DE138B7B5F7e7328d65f12",
    "0x1D5D8bF7345D3cB611Dd4A98Fa5F7159Cb6d1451"
]

async function main() {

  const UpdateOracles = await ethers.getContractFactory("UpdateOracles");
  const updateOracles = await UpdateOracles.deploy(oracles);
  await updateOracles.deployed();
  console.log("UpdateOracles deployed to:", updateOracles.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });