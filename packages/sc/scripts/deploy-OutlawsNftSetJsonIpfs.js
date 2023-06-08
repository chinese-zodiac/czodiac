const hre = require("hardhat");
const loadJsonFile = require("load-json-file");

const { ethers } = hre;
const { parseEther } = ethers.utils;


async function main() {

  const OutlawsNftSetJsonIpfs = await ethers.getContractFactory("OutlawsNftSetJsonIpfs");
  const outlawsNftSetJsonIpfs = await OutlawsNftSetJsonIpfs.deploy();
  await outlawsNftSetJsonIpfs.deployed();
  console.log("OutlawsNftSetJsonIpfs deployed to:", outlawsNftSetJsonIpfs.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
