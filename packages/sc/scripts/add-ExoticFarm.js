const hre = require("hardhat");
const loadJsonFile = require("load-json-file");
const {
  exoticMasterAddr
} = require("../deployConfig.json");

const {ethers} = hre;
const {parseEther} = ethers.utils;

const lpAddr = "0xAAC96d00C566571bafdfa3B8440Bdc3cDB223Ad0";
const eRate = parseEther("1000");
const farms = [
  {
    ffBasis:7500,
    vestPeriod:604800,
    apr:30000
  },
  {
    ffBasis:3000,
    vestPeriod:7776000,
    apr:50000
  },
  {
    ffBasis:500,
    vestPeriod:31536000,
    apr:100000
  }
]

async function main() {
  let fastForwardLock = 86400;
  
  const exoticMaster = await ethers.getContractAt("ExoticMaster", exoticMasterAddr);

  console.log("Add LP...");
  await exoticMaster.setLpBaseEmissionRate(lpAddr,eRate);
  await delay(5000);
  console.log("Add farms (",farms.length,")...");
  for(let i=0;i<farms.length;i++) {
    let farm = farms[i];
    console.log("Adding farm ",i,farm.vestPeriod,"...");
    await exoticMaster.addExoticFarm(
      farm.ffBasis,
      farm.vestPeriod,
      farm.apr,
      lpAddr
    );
    await delay(5000);
  }
  console.log("Complete.");

}

function delay(ms) {
  console.log("waiting ",ms/1000,"s");
  return new Promise(resolve => setTimeout(resolve, ms));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });