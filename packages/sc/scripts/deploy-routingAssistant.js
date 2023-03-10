const hre = require("hardhat");
const loadJsonFile = require("load-json-file");

const { ethers } = hre;
const { parseEther } = ethers.utils;


async function main() {

  const RoutingAssistant = await ethers.getContractFactory("RoutingAssistant");
  const routingAssistant = await RoutingAssistant.deploy();
  await routingAssistant.deployed();
  console.log("RoutingAssistant deployed to:", routingAssistant.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
