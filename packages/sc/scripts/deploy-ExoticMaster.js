const hre = require("hardhat");
const loadJsonFile = require("load-json-file");
const {
  czf,
} = require("../deployConfig.json");

const {ethers} = hre;
const {parseEther} = ethers.utils;

async function main() {
  let fastForwardLock = 86400;
  
  const czfToken = await ethers.getContractAt("CZFarm", czf);

  const Treasury = await ethers.getContractFactory("Treasury");
  const treasury = await Treasury.deploy();
  await treasury.deployed();
  console.log("Treasury deployed to:", treasury.address);

  const ExoticMaster = await ethers.getContractFactory("ExoticMaster");
  const exoticMaster = await ExoticMaster.deploy(
      czf, //CZFarm _czf
      treasury.address, //address _treasury
      fastForwardLock  //uint32 _fastForwardLockPeriod
  );
  await exoticMaster.deployed();
  console.log("ExoticMaster deployed to:", exoticMaster.address);

  
  console.log("Grant roles");
  await czfToken.grantRole("0x0000000000000000000000000000000000000000000000000000000000000000",exoticMaster.address);
  await czfToken.setContractSafe(exoticMaster.address);
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