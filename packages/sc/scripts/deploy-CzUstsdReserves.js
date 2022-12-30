const hre = require("hardhat");
const loadJsonFile = require("load-json-file");
const {
  czDeployer,
  ellipsisCzusd3psPool,
  czvPegV2,
  busd,
  czusd,
  SilverDollarTypePriceSheet,
  SilverDollarNfts
} = require("../deployConfig.json");

const { ethers } = hre;
const { parseEther } = ethers.utils;

async function main() {
  let czusdSc = await ethers.getContractAt("CZUsd", czusd);

  console.log("Deploying...");

  const CzUstsdReserves = await ethers.getContractFactory("CzUstsdReservesWithBlacklist");
  const czUstsdReservesSc = await CzUstsdReserves.deploy();
  console.log("czUstsdReservesSc", czUstsdReservesSc.address);

  console.log("Completed deployment");

  console.log("Setting safe..")
  await czusdSc.setContractSafe(czUstsdReservesSc.address);
  console.log("Safe set")

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
