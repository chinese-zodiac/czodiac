const hre = require("hardhat");
const loadJsonFile = require("load-json-file");
const {
  beltBNB,
  beltBnbPoolId,
  beltFarm,
  BELT,
  czf,
  czDeployer,
} = require("../deployConfig.json");

const {ethers} = hre;
const {parseEther} = ethers.utils;

async function main() {
  const czfToken = await ethers.getContractAt("CZFarm", czf);

  const CZFarmMasterRoutable = await ethers.getContractFactory("CZFarmMasterRoutable");
  const czFarmMasterRoutable = await CZFarmMasterRoutable.deploy(
    czfToken.address,//CZFarm _czf,
    parseEther("0.01"),//uint256 _czfPerBlock,
    11565000//uint256 _startBlock
  );
  await czFarmMasterRoutable.deployed();
  console.log("CZFarmMasterRoutable deployed to:", czFarmMasterRoutable.address);

  //TODO: CZF Vaults should have a unique ERC20 name and symbol
  const CzfBeltVault = await ethers.getContractFactory("CzfBeltVault");
  const czfBeltVault = await CzfBeltVault.deploy(
      beltFarm,
      beltBNB,
      beltBnbPoolId,
      BELT
    );
  await czfBeltVault.deployed();
  console.log("CzfBeltVault (BNB) deployed to:", czfBeltVault.address);

  const CZVaultRouter = await ethers.getContractFactory("CZVaultRouter");
  const czVaultRouter = await CZVaultRouter.deploy();
  await czVaultRouter.deployed();
  console.log("CZVaultRouter deployed to:", czVaultRouter.address);

  console.log("Grant roles");
  await czfToken.grantRole(ethers.utils.id("MINTER_ROLE"),czFarmMasterRoutable.address);
  await czFarmMasterRoutable.setRouter(czVaultRouter.address);
  await czFarmMasterRoutable.add(100, czfBeltVault.address, true);
  await czfBeltVault.setContractSafe(czVaultRouter.address);
  await czfBeltVault.setContractSafe(czFarmMasterRoutable.address);
  await czfBeltVault.setFeeBasis(449);
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
