const hre = require("hardhat");
const loadJsonFile = require("load-json-file");
const {
    tigerZodiac,
  czf,
  czDeployer,
} = require("../deployConfig.json");

const {ethers} = hre;
const {parseEther} = ethers.utils;

async function main() {
  const czfToken = await ethers.getContractAt("CZFarm", czf);
  const tigzToken = await ethers.getContractAt("CZodiacToken", tigerZodiac);

  const BurnAndSync = await ethers.getContractFactory("BurnAndSync");
  const burnAndSync = await BurnAndSync.deploy(
    czfToken.address, //CZFarm _czf,
  );
  await burnAndSync.deployed();
  console.log("BurnAndSync deployed to:", burnAndSync.address);


  console.log("Grant roles");
  await czfToken.setContractSafe(burnAndSync.address);
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
