const hre = require("hardhat");
const loadJsonFile = require("load-json-file");
const {
  czf,
} = require("../deployConfig.json");

const {ethers} = hre;
const {parseEther} = ethers.utils;

async function main() {
  const czfToken = await ethers.getContractAt("CZFarm", czf);

  const StimFarmFactory = await ethers.getContractFactory("StimFarmFactory");
  const stimFarmFactory = await StimFarmFactory.deploy(
    czfToken.address,//CZFarm _czf,
  );
  await stimFarmFactory.deployed();
  console.log("StimFarmFactory deployed to:", stimFarmFactory.address);

  
  console.log("Grant roles");
  await czfToken.grantRole("0x0000000000000000000000000000000000000000000000000000000000000000",stimFarmFactory.address);
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