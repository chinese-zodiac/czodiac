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

  const OxzToken = await hre.ethers.getContractFactory("CZodiacToken");
  const oxzToken = OxzToken.attach(oxzAddress);
  //TODO: Update deployment
}