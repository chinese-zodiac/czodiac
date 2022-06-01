// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digital
// If you read this, know that I love you even if your mom doesnt <3
const chai = require('chai');
const { solidity } = require("ethereum-waffle");
chai.use(solidity);

const { ethers, config } = require('hardhat');
const { time } = require("@openzeppelin/test-helpers");
const { toNum, toBN } = require("./utils/bignumberConverter");

const loadJsonFile = require("load-json-file");
const { czDeployer, SilverDollarNfts, SilverDollarTypePriceSheet, CzUstsdReserves, czusd, pancakeswapFactory, pancakeswapRouter } = loadJsonFile.sync("./deployConfig.json");

const { expect } = chai;
const { parseEther, formatEther, defaultAbiCoder } = ethers.utils;

const LINK_TOKEN = "0x84b9B910527Ad5C03A9Ca831909E21e236EA7b06";
const GWEI_KEY_HASH = "0x114f3da0a805b6a67d6e9cd2ec746f7028f1b7376365af575cfea3550dd1aa04";

const BASE_CZUSD_LP = parseEther("10000");

const checkDataVrf = defaultAbiCoder.encode(["uint8"],[0]);
const checkDataMint = defaultAbiCoder.encode(["uint8"],[1]);


describe("LSDT", function () {
  let owner, trader, trader1, trader2, trader3;
  let deployer;
  let ustsd, pcsRouter, czusdSc, lsdtCzusdPair, vrfCoordinatorMock, subscriptionId, lsdt, lsdtRewards, ustsdOracle, ustsdReserves;
  before(async function() {
    [owner, trader, trader1, trader2, trader3] = await ethers.getSigners();
    await hre.network.provider.request({ 
      method: "hardhat_impersonateAccount",
      params: [czDeployer]
    });
    deployer = await ethers.getSigner(czDeployer);

    ustsd = await ethers.getContractAt("JsonNftTemplate",SilverDollarNfts);
    ustsdOracle = await ethers.getContractAt("SilverDollarTypePriceSheet",SilverDollarTypePriceSheet);
    czusdSc = await ethers.getContractAt("CZUsd", czusd);
    pcsRouter = await ethers.getContractAt("IAmmRouter02", pancakeswapRouter);
    ustsdReserves = await ethers.getContractAt("CzUstsdReserves", CzUstsdReserves);

    const VRFCoordinatorV2Mock = await ethers.getContractFactory("VRFCoordinatorV2Mock");
    vrfCoordinatorMock = await VRFCoordinatorV2Mock.deploy(parseEther("0.005"),5000000000*27); //27 LINK = 1 BNB, BSC gas price of 5 gwei
    await vrfCoordinatorMock.deployed();
    await vrfCoordinatorMock.createSubscription();
    subscriptionId = 1; //First subscription is always 1
    await vrfCoordinatorMock.fundSubscription(subscriptionId,parseEther("100"));

    const IterableArrayWithoutDuplicateKeys = await ethers.getContractFactory('IterableArrayWithoutDuplicateKeys');
    const iterableArrayWithoutDuplicateKeys = await IterableArrayWithoutDuplicateKeys.deploy();
    await iterableArrayWithoutDuplicateKeys.deployed();

    const LSDT = await ethers.getContractFactory("LSDT",{
      libraries: {
        IterableArrayWithoutDuplicateKeys: iterableArrayWithoutDuplicateKeys.address,
      },
    });
    lsdt = await LSDT.deploy(
        subscriptionId,//uint64 _subscriptionId,
        vrfCoordinatorMock.address,//address _vrfCoordinator,
        LINK_TOKEN,//address _link,
        GWEI_KEY_HASH,//bytes32 _gweiKeyHash,
        ustsdReserves.address,//CzUstsdReserves _czustsdReserves,
        ustsd.address,//JsonNftTemplate _ustsdNft,
        pancakeswapFactory,//IAmmFactory _factory,
        czusdSc.address,//CZUsd _czusd,
        BASE_CZUSD_LP//uint256 _baseCzusdLocked
    );
    await lsdt.deployed();

    const lsdtCzusdPair_address = await lsdt.ammCzusdPair();
    const lsdtRewards_address = await lsdt.rewardDistributor();
    lsdtCzusdPair = await ethers.getContractAt("IAmmPair", lsdtCzusdPair_address);
    lsdtRewards = await ethers.getContractAt("LSDTRewards", lsdtRewards_address);
  });
  it("Should deploy lsdt", async function () {
    const ustsdToReward = await lsdt.ustsdToReward();
    const baseCzusdLocked = await lsdt.baseCzusdLocked();
    const totalUstsdRewarded = await lsdt.totalUstsdRewarded();
    const totalCzusdSpent = await lsdt.totalCzusdSpent();
    const totalTickets = await lsdt.totalTickets();
    const addressTickets = await lsdt.addressTickets(owner.address);
    const lastUstsdRewardEpoch = await lsdt.lastUstsdRewardEpoch();
    expect(ustsdToReward).to.eq(0);
    expect(baseCzusdLocked).to.eq(BASE_CZUSD_LP);
    expect(totalUstsdRewarded).to.eq(0);
    expect(totalCzusdSpent).to.eq(0);
    expect(addressTickets).to.eq(0);
    expect(lastUstsdRewardEpoch).to.eq(0);
    expect(totalTickets).to.eq(0);
  });
});