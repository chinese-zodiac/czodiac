const hre = require("hardhat");
const loadJsonFile = require("load-json-file");

const {ethers} = hre;
const { parseEther } = ethers.utils;
const {
  ellipsisV2Czusd3psPool,
  czvPegV3
} = require("../deployConfig.json");
const { zeroAddress, czDeployer, czf, czusd, lrt, czodiacNft, } = loadJsonFile.sync("./deployConfig.json");



async function main() {
    
  const czfSc = await ethers.getContractAt("CZFarm", czf);
  const czusdSc = await ethers.getContractAt("CZUsd", czusd);
  const lrtSc = await ethers.getContractAt("IERC20", lrt);
  const czodiacNftSc = await ethers.getContractAt("IERC721", czodiacNft);

  const CZFarmPoolNftSlottableTaxFree = await ethers.getContractFactory("CZFarmPoolNftSlottableTaxFree");
  
  console.log("deploying..")
  const pool = await CZFarmPoolNftSlottableTaxFree.deploy();
  await pool.deployed();
  console.log("CZFarmPoolNftSlottableTaxFree deployed to:", pool.address);

  console.log("waiting 15 seconds...");
  await delay(15000);
  console.log("initializing...");

  await pool.initialize(
    czf,//ERC20Burnable _stakedToken,
    czusd,//IERC20 _rewardToken,
    0,//uint256 _rewardPerSecond,
    1661673600,//uint256 _timestampStart,
    1661673600+90*86400,//uint256 _timestampEnd,
    1498,//uint256 _withdrawFeeBasis,
    lrt,//IERC20 _whitelistToken,
    parseEther("0"),//uint256 _whitelistWad,
    zeroAddress,//IERC721 _slottableNftTaxFree,
    30*86400,//uint256 _nftLockPeriod,
    czDeployer//address _admin
  );

  console.log("granting permissions...")

  await czfSc.setContractSafe(pool.address);
  await czusdSc.mint(pool.address,parseEther(" "));

  console.log("waiting 15 seconds...");
  await delay(15000);
  console.log("updating rps...");

  await pool.czfarmUpdateRewardPerSecond()
}

function delay(ms) {
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