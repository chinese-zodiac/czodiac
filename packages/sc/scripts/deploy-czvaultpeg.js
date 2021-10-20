const hre = require("hardhat");
const loadJsonFile = require("load-json-file");
const {
  czDeployer,
  pancakeswapRouter,
  zeroAddress,
  BELT,
  beltFarm,
  czf,
  Belt4LP,
  Belt4,
  busd,
  belt4BeltPoolId,
  czusd,
  czusdBusdPairPCS,
  pcsFeeBasis
} = require("../deployConfig.json");

const {ethers} = hre;
const {parseEther} = ethers.utils;

async function main() {
  czfSc = await ethers.getContractAt("CZFarm", czf);
  czusdSc = await ethers.getContractAt("CZUsd", czusd);

  /*const CzfBeltVault = await ethers.getContractFactory("CzfBeltVault");
    czfBeltVault = await CzfBeltVault.deploy(
      beltFarm,
      Belt4,
      belt4BeltPoolId,
      BELT,
      "CzVault4Belt",
      "CZV4BELT"
    );
  await czfBeltVault.deployed();
  console.log("CzfBeltVault (4belt) deployed to:", czfBeltVault.address);*/
  czfBeltVault =  await ethers.getContractAt("CzfBeltVault", "0xceE0C6a66df916991F3C730108CF8672157380b7")

  const CZVaultPeg = await ethers.getContractFactory("CZVaultPeg");
    czVaultPeg = await CZVaultPeg.deploy(
      Belt4LP,
      Belt4,
      busd,
      czfBeltVault.address,
      czusd,
      pancakeswapRouter,
      czusdBusdPairPCS,
      parseEther("1000"),
      czf,
      3600,
      10,
      pcsFeeBasis
    );
    await czVaultPeg.deployed();
  await czVaultPeg.deployed();
  console.log("CZVaultPeg deployed to:", czVaultPeg.address);


  console.log("Grant roles");
  await czfSc
    .grantRole(ethers.utils.id("MINTER_ROLE"), czVaultPeg.address);
  await czusdSc
    .grantRole(ethers.utils.id("MINTER_ROLE"), czVaultPeg.address);
  await czusdSc
    .setContractSafe(czVaultPeg.address);
  await czVaultPeg
      .setWithdrawBusdMultiplierBasis(500);
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
