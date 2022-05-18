const hre = require("hardhat");
const loadJsonFile = require("load-json-file");
const {
  czf,
} = require("../deployConfig.json");

const {ethers} = hre;
const {parseEther} = ethers.utils;

async function main() {
  const czfToken = await ethers.getContractAt("CZFarm", czf);

  const ChronoPoolService = await ethers.getContractFactory("ChronoPoolService");
  const chronoPoolService = await ChronoPoolService.deploy(
    czfToken.address, //CZFarm _czf
    parseEther("4800") //uint112 _baseEmissionRate
    //NOTE: Updated to 30000
  );
  await chronoPoolService.deployed();
  console.log("ChronoPoolService deployed to:", chronoPoolService.address);

  
  console.log("Grant roles");
  await czfToken.grantRole("0x0000000000000000000000000000000000000000000000000000000000000000",chronoPoolService.address);
  await czfToken.setContractSafe(chronoPoolService.address);
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