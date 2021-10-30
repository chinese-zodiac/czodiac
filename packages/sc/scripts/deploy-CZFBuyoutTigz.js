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

  /*const CZFBuyoutToken = await ethers.getContractFactory("CZFBuyoutToken");
  const czFBuyoutToken = await CZFBuyoutToken.deploy(
    parseEther("44"), //uint256 _rateWad,
    czfToken.address, //CZFarm _czf,
    tigzToken.address,//IERC20 _token
    1635984000 //startEpoch
  );
  await czFBuyoutToken.deployed();
  console.log("CZFBuyoutToken (TIGZ) deployed to:", czFBuyoutToken.address);*/

  czFBuyoutToken = {
    address: "0xD3505D328e5f0ecF191A5Fd0d04d18B645e4158c"
  }


  console.log("Grant roles");
  await czfToken.grantRole(ethers.utils.id("MINTER_ROLE"),czFBuyoutToken.address);
  await tigzToken.setNextCzodiac(czFBuyoutToken.address);
  await tigzToken.excludeFromReward(czFBuyoutToken.address);
  await tigzToken.excludeFromFee(czFBuyoutToken.address);
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
