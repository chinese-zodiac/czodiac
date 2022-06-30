const hre = require("hardhat");
const loadJsonFile = require("load-json-file");
const {
  czf,
} = require("../deployConfig.json");

const {ethers} = hre;
const {parseEther} = ethers.utils;

async function main() {
  const CZFarmMasterRoutable = await ethers.getContractFactory("CZFarmMasterRoutable");
  const czfToken = await ethers.getContractAt("CZFarm", czf);
  const czFarmMasterRoutable = await CZFarmMasterRoutable.deploy(
    czfToken.address,//CZFarm _czf,
    parseEther("1"),//uint256 _czfPerBlock,
    19130000//uint256 _startBlock
  );
  await czFarmMasterRoutable.deployed();
  console.log("CZFarmMasterRoutable deployed to:", czFarmMasterRoutable.address);


  console.log("Grant roles");
  await czfToken.grantRole(ethers.utils.id("MINTER_ROLE"),czFarmMasterRoutable.address);
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
