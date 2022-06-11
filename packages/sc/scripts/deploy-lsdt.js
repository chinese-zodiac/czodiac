const hre = require("hardhat");
const loadJsonFile = require("load-json-file");
const {
    czDeployer,
    ellipsisCzusd3psPool,
    czvPegV2,
    busd,
    czusd,
    SilverDollarTypePriceSheet,
    SilverDollarNfts,
    CzUstsdReserves,
    pancakeswapFactory
} = require("../deployConfig.json");

const {ethers} = hre;
const {parseEther} = ethers.utils;

const LINK_TOKEN = "0x84b9B910527Ad5C03A9Ca831909E21e236EA7b06";
const GWEI_KEY_HASH = "0x114f3da0a805b6a67d6e9cd2ec746f7028f1b7376365af575cfea3550dd1aa04";
const VRF_COORDINATOR = "0xc587d9053cd1118f25F645F9E08BB98c9712A4EE";
const SUBSCRIPTION_ID = "73";
const BASE_CZUSD_LP = parseEther("10000");

async function main() {
  const czusdSc = await ethers.getContractAt("CZUsd", czusd);

  console.log("Deploying...");

  const IterableArrayWithoutDuplicateKeys = await ethers.getContractFactory('IterableArrayWithoutDuplicateKeys');
  const iterableArrayWithoutDuplicateKeys = await IterableArrayWithoutDuplicateKeys.deploy();
  await iterableArrayWithoutDuplicateKeys.deployed();
  console.log("Deployed IterableArrayWithoutDuplicateKeys");

  const LSDT = await ethers.getContractFactory("LSDT",{
      libraries: {
        IterableArrayWithoutDuplicateKeys: iterableArrayWithoutDuplicateKeys.address,
      },
    });
  const lsdt = await LSDT.deploy(
        SUBSCRIPTION_ID,//uint64 _subscriptionId,
        VRF_COORDINATOR,//address _vrfCoordinator,
        LINK_TOKEN,//address _link,
        GWEI_KEY_HASH,//bytes32 _gweiKeyHash,
        CzUstsdReserves,//CzUstsdReserves _czustsdReserves,
        SilverDollarNfts,//JsonNftTemplate _ustsdNft,
        pancakeswapFactory,//IAmmFactory _factory,
        czusdSc.address,//CZUsd _czusd,
        BASE_CZUSD_LP//uint256 _baseCzusdLocked
    );
    await lsdt.deployed();
  console.log("lsdt",lsdt.address);

  console.log("Completed deployment");

  console.log("Setting mint role..")
  await czusdSc.grantRole(ethers.utils.id("MINTER_ROLE"), lsdt.address);
  console.log("Set roles")

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
