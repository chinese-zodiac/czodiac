const hre = require("hardhat");
const loadJsonFile = require("load-json-file");

const {ethers} = hre;
const { parseEther } = ethers.utils;

const czusdAddress = "0xE68b79e51bf826534Ff37AA9CeE71a3842ee9c70";
const czfAddress = "0x7c1608C004F20c3520f70b924E2BfeF092dA0043";
const czfBusdOracleAddress = "0x27ce3f6478c35f333659997ec6903c1b67153678";
const maxBorrowBasis = 7500;
const maxCzusd = parseEther("35000");


async function main() {

  const CZUsdBorrowCZF = await ethers.getContractFactory("CZUsdBorrowCZF");
  const czusdBorrowCzf = await CZUsdBorrowCZF.deploy(
    czusdAddress,
    czfAddress,
    czfBusdOracleAddress,
    maxBorrowBasis,
    maxCzusd
  );
  await czusdBorrowCzf.deployed();
  console.log("CZUsdBorrowCZF deployed to:", czusdBorrowCzf.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });