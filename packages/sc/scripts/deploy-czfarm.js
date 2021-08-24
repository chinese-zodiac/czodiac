const hre = require("hardhat");
const loadJsonFile = require("load-json-file");

const {ethers} = hre;
const {parseEther} = ethers.utils;

async function main() {
  const CZFarm = await ethers.getContractFactory("CZFarm");
  const CZFarmMaster = await ethers.getContractFactory("CZFarmMaster");
  const CZFarmPoolFactory = await ethers.getContractFactory("CZFarmPoolFactory");

  const czFarm = await CZFarm.deploy();
  await czFarm.deployed();
  console.log("CZFarm deployed to:", czFarm.address);

  const czFarmMaster = await CZFarmMaster.deploy(
    czFarm.address,//CZFarm _czf,
    parseEther("288"),//uint256 _czfPerBlock,
    10400000//uint256 _startBlock
  );
  await czFarmMaster.deployed();
  console.log("CZFarmMaster deployed to:", czFarmMaster.address);

  const czFarmPoolFactory = await CZFarmPoolFactory.deploy(
    czFarm.address
  );
  await czFarmPoolFactory.deployed();
  console.log("CZFarmPoolFactory deployed to:", czFarmPoolFactory.address);

  console.log("Grant roles");
  await czFarm.grantRole(ethers.utils.id("MINTER_ROLE"),czFarmMaster.address);
  await czFarm.grantRole(ethers.utils.id("SAFE_GRANTER_ROLE"),czFarmPoolFactory.address);
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
