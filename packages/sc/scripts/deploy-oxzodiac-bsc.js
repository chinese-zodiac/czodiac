const hre = require("hardhat");
const loadJsonFile = require("load-json-file");
const { uniswapRouterAddress, zeroAddress, luckyAddress } = loadJsonFile.sync("./deployConfig.json");

const {ethers} = hre;
const { parseEther } = ethers.utils;


async function main() {

  const AutoFarm = await ethers.getContractFactory("AutoFarm");
  const autoFarm = await AutoFarm.deploy();
  await autoFarm.deployed();
  console.log("AutoFarm deployed to:", autoFarm.address);

  const CZodiacToken = await ethers.getContractFactory("CZodiacToken");

  const cZodiacToken = await CZodiacToken.deploy(
    autoFarm.address,//IUniswapV2Router02 _uniswapV2Router,
    zeroAddress,//Prev czodiac for swapping
    "OxZodiac",//Name
    "OxZ",//Symbol
    0, //Swap start
    0 //Swap end
  );
  await cZodiacToken.deployed();
  console.log("CZodiacToken deployed to:", cZodiacToken.address);

  const totalSupply = await cZodiacToken.totalSupply();

  const LockedSale = await hre.ethers.getContractFactory("LockedSale");
  const lockedSale = await LockedSale.deploy(
    1621504800 - 150,//uint256 _startTime,
    1621677600,//uint256 _endTime,
    parseEther("0.1"),//uint256 _minPurchase,
    parseEther("3"),//uint256 _maxPurchase,
    totalSupply.div(4),//uint256 _tokensForSale,
    parseEther("100"),//uint256 _maxSaleSize,
    cZodiacToken.address//IERC20 _token
  );
  await lockedSale.deployed();
  console.log("LockedSale deployed to:", lockedSale.address);
  console.log("Autofarm...");
  await autoFarm.setCzodiac(cZodiacToken.address);
  console.log("Locked address...");
  await cZodiacToken.excludeFromReward(lockedSale.address);
  await cZodiacToken.excludeFromFee(lockedSale.address);
  await cZodiacToken.transfer(lockedSale.address,totalSupply.div(4))
  console.log("Lucky Address...");
  await cZodiacToken.excludeFromReward(luckyAddress);
  await cZodiacToken.excludeFromFee(luckyAddress);
  await cZodiacToken.transfer(luckyAddress,totalSupply.div(2))
  console.log("Complete.")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
