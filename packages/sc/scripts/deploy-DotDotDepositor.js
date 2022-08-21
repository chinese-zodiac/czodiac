const hre = require("hardhat");
const loadJsonFile = require("load-json-file");
const { lsdt } = loadJsonFile.sync("./deployConfig.json");

const {ethers} = hre;
const { parseEther } = ethers.utils;

async function main() {

  const DotDotDepositor = await ethers.getContractFactory("DotDotDepositor");
  const dotDotDepositor = await DotDotDepositor.deploy();
  await dotDotDepositor.deployed();
  console.log("DotDotDepositor deployed to:", dotDotDepositor.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });