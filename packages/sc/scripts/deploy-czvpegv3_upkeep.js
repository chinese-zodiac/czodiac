const hre = require("hardhat");
const loadJsonFile = require("load-json-file");

const {ethers} = hre;
const { parseEther } = ethers.utils;
const {
  ellipsisV2Czusd3psPool,
  czvPegV3
} = require("../deployConfig.json");


async function main() {

  const CZVPegV3_Upkeep = await ethers.getContractFactory("CZVPegV3_Upkeep");
  const upkeep = await CZVPegV3_Upkeep.deploy(
    ellipsisV2Czusd3psPool,
    czvPegV3
  );
  await upkeep.deployed();
  console.log("CZVPegV3_Upkeep deployed to:", upkeep.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });