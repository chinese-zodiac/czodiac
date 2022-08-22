const hre = require("hardhat");
const loadJsonFile = require("load-json-file");
const { lsdt } = loadJsonFile.sync("./deployConfig.json");

const {ethers} = hre;
const { parseEther } = ethers.utils;

async function main() {

  const CZVPegV4 = await ethers.getContractFactory("CZVPegV4");
  const czvPegV4 = await CZVPegV4.deploy();
  await czvPegV4.deployed();
  console.log("CZVPegV4 deployed to:", czvPegV4.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });