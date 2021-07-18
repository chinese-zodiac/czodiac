const hre = require("hardhat");
const loadJsonFile = require("load-json-file");
const { tigerZodiac } = loadJsonFile.sync("./deployConfig.json");

const {ethers} = hre;
const {parseEther} = ethers.utils;

async function main() {
  const CZodiacToken = await ethers.getContractFactory("CZodiacToken");
  const tigz = CZodiacToken.attach(tigerZodiac);

  const TigerHPToken = await ethers.getContractFactory("TigerHuntPoints");
  const tighp = await TigerHPToken.deploy();
  await tighp.deployed();
  console.log("TigerHPToken deployed to:", tighp.address);

  const TigerHunt = await ethers.getContractFactory("TigerHunt");
  const tighunt = await TigerHunt.deploy(
      tigerZodiac, //IERC20 _tigz,
      //oxZodiac, //IERC20 _oxz,
      tighp.address//ERC20PresetMinterPauser _tigerHP
  );
  await tighunt.deployed();
  console.log("TigerHunt deployed to:", tighunt.address);
  
  console.log("Exclude Tiger Hunt...");
  await tigz.excludeFromReward(tighunt.address);
  await tigz.excludeFromFee(tighunt.address);

  console.log("Grant tighp roles");
  await tighp.grantRole(mintroleHash,tighunt.address);
  await tighp.setContractSafe(tighunt.address);
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
