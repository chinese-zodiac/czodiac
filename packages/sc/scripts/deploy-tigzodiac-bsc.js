const hre = require("hardhat");
const loadJsonFile = require("load-json-file");
const { oxZodiac, autoFarm, disperseApp, zeroAddress, luckyAddress } = loadJsonFile.sync("./deployConfig.json");

const {ethers} = hre;
const {parseEther} = ethers.utils;


async function main() {
  const CZodiacToken = await ethers.getContractFactory("CZodiacToken");

  const PrevZodiac = await hre.ethers.getContractFactory("CZodiacToken");
  const prevZodiac = OxzToken.attach(oxZodiac);

  const cZodiacToken = await CZodiacToken.deploy(
    autoFarm.address,//autofoarm,
    prevZodiac.address,//Prev czodiac for swapping
    "TigerZodiac",//Name
    "TigZ",//Symbol
    1624528500, //Swap start
    1625219700 //Swap end
  );
  await cZodiacToken.deployed();
  console.log("CZodiacToken deployed to:", cZodiacToken.address);

  console.log("Set nextZodiac on pervious zodiac")
  await prevZodiac.setNextCzodiac(cZodiacToken.address);
  
  console.log("Exclude Lucky Address...");
  await cZodiacToken.excludeFromReward(luckyAddress);
  await cZodiacToken.excludeFromFee(luckyAddress);
  console.log("Exclude Disperse App...");
  await cZodiacToken.excludeFromReward(disperseApp);
  await cZodiacToken.excludeFromFee(disperseApp);
  console.log("Swap Lucky Address...");
  await cZodiacToken.excludeFromReward(luckyAddress);
  await cZodiacToken.excludeFromFee(luckyAddress);
  console.log("Complete.")
  console.log("TODO: Swap luckyAddress, Create & Exclude liq pools, then enable global rewards.")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
