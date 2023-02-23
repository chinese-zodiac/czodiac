const hre = require("hardhat");
const loadJsonFile = require("load-json-file");
const {
  czf,
} = require("../deployConfig.json");

const {ethers} = hre;
const {parseEther} = ethers.utils;

async function main() {

  const CzusdNotes = await ethers.getContractFactory("CzusdNotes");
  const czusdNotes = await CzusdNotes.deploy();
  await czusdNotes.deployed();
  console.log("CzusdNotes deployed to:", czusdNotes.address);
  //Must grant CzusdNotes safe permissions on czusd

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });