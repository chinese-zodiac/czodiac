const hre = require("hardhat");
const loadJsonFile = require("load-json-file");
const {
  czf,
} = require("../deployConfig.json");

const {ethers} = hre;
const {parseEther} = ethers.utils;

async function main() {
  const czfToken = await ethers.getContractAt("CZFarm", czf);

  const LossCompensation = await ethers.getContractFactory("LossCompensation");
  const lossCompensation = await LossCompensation.deploy(
    czfToken.address, //CZFarm _czf
    31536000,//uint32 _vestPeriod,
    1000//uint32 _ffBasis

  );
  await lossCompensation.deployed();
  console.log("LossCompensation deployed to:", lossCompensation.address);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });