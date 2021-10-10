const hre = require("hardhat");
const loadJsonFile = require("load-json-file");

const {ethers} = hre;
const { parseEther } = ethers.utils;


async function main() {

  const BeltPriceShareLast = await ethers.getContractFactory("BeltPriceShareLast");
  const beltPriceShareLast = await BeltPriceShareLast.deploy(86400);
  await beltPriceShareLast.deployed();
  console.log("BeltPriceShareLast deployed to:", beltPriceShareLast.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
