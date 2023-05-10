const hre = require("hardhat");
const loadJsonFile = require("load-json-file");
const {
  czusd,
} = require("../deployConfig.json");

const { ethers } = hre;
const { parseEther } = ethers.utils;
const ITERABLE_MAPPING = "0xd0fD79156dCd8D3cF81C4c95C4d65e784B1365c0";

async function main() {
  const czusdToken = await ethers.getContractAt("CZUsd", czusd);

  console.log("Deploying iterablearray lib");
  const IterableMapping = await ethers.getContractFactory('IterableMapping')
  const iterableMapping = await IterableMapping.deploy()
  await iterableMapping.deployed();
  console.log("IterableMapping deployed to:", iterableMapping.address);

  const TeamPayV3 = await ethers.getContractFactory("TeamPayV3", {
    libraries: {
      IterableMapping: iterableMapping.address,
    },
  });
  const teamPayV3 = await TeamPayV3.deploy(
    czusd
  );
  await teamPayV3.deployed();
  console.log("TeamPayV3 deployed to:", teamPayV3.address);


  console.log("Grant roles");
  await czusdToken.grantRole("0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6", teamPayV3.address);
  console.log("Complete");

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });