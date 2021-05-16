const hre = require("hardhat");
const loadJsonFile = require("load-json-file");
const { uniswapRouterAddress, zeroAddress } = loadJsonFile.sync("./deployConfig.json");

const {ethers} = hre;
const { parseEther } = ethers.utils;


async function main() {

  const CZodiacToken = await ethers.getContractFactory("CZodiacToken");

  const cZodiacToken = await CZodiacToken.deploy(
    uniswapRouterAddress,//IUniswapV2Router02 _uniswapV2Router,
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
    1621288800 - 150,//uint256 _startTime,
    1621461600,//uint256 _endTime,
    parseEther("0.1"),//uint256 _minPurchase,
    parseEther("3"),//uint256 _maxPurchase,
    totalSupply.div(4),//uint256 _tokensForSale,
    parseEther("100"),//uint256 _maxSaleSize,
    cZodiacToken.address//IERC20 _token
  );
  await lockedSale.deployed();
  console.log("LockedSale deployed to:", lockedSale.address);
  console.log("Calling methods...");

  await cZodiacToken.excludeFromReward(lockedSale.address);
  await cZodiacToken.excludeFromFee(lockedSale.address);
  await cZodiacToken.transfer(lockedSale.address,totalSupply.div(4))
  console.log("complete")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
