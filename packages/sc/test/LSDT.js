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
    console.log("Got deployer");

    ustsd = await ethers.getContractAt("JsonNftTemplate",SilverDollarNfts);
    ustsdOracle = await ethers.getContractAt("SilverDollarTypePriceSheet",SilverDollarTypePriceSheet);
    czusdSc = await ethers.getContractAt("CZUsd", czusd);
    pcsRouter = await ethers.getContractAt("IAmmRouter02", pancakeswapRouter);
    ustsdReserves = await ethers.getContractAt("CzUstsdReserves", CzUstsdReserves);
    console.log("Got contracts");

    const VRFCoordinatorV2Mock = await ethers.getContractFactory("VRFCoordinatorV2Mock");
    vrfCoordinatorMock = await VRFCoordinatorV2Mock.deploy(parseEther("0.005"),5000000000*27); //27 LINK = 1 BNB, BSC gas price of 5 gwei
    await vrfCoordinatorMock.deployed();
    await vrfCoordinatorMock.createSubscription();
    subscriptionId = 1; //First subscription is always 1
    await vrfCoordinatorMock.fundSubscription(subscriptionId,parseEther("100"));
    console.log("Deployed vrfCoordinatorMock");

    const IterableArrayWithoutDuplicateKeys = await ethers.getContractFactory('IterableArrayWithoutDuplicateKeys');
    const iterableArrayWithoutDuplicateKeys = await IterableArrayWithoutDuplicateKeys.deploy();
    await iterableArrayWithoutDuplicateKeys.deployed();
    console.log("Deployed IterableArrayWithoutDuplicateKeys");

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
    console.log("Deployed LSDT");

    const lsdtCzusdPair_address = await lsdt.ammCzusdPair();
    const lsdtRewards_address = await lsdt.rewardDistributor();
    lsdtCzusdPair = await ethers.getContractAt("IAmmPair", lsdtCzusdPair_address);
    lsdtRewards = await ethers.getContractAt("LSDTRewards", lsdtRewards_address);
    console.log("Got new contracts");

    await czusdSc.connect(deployer).mint(owner.address,BASE_CZUSD_LP);
    await lsdt.approve(pcsRouter.address,ethers.constants.MaxUint256);
    await czusdSc.approve(pcsRouter.address,ethers.constants.MaxUint256);
    console.log("Approved for liquidity");
    await pcsRouter.addLiquidity(
      czusdSc.address,
      lsdt.address,
      BASE_CZUSD_LP,
      parseEther("10000"),
      0,
      0,
      lsdt.address,
      ethers.constants.MaxUint256
    );
    console.log("Added liquidity");
    await czusdSc
    .connect(deployer)
    .grantRole(ethers.utils.id("MINTER_ROLE"), lsdt.address);
  });
  it("Should deploy lsdt", async function () {
    const pairCzusdBal = await czusdSc.balanceOf(lsdtCzusdPair.address);
    const pairLsdtBal = await lsdt.balanceOf(lsdtCzusdPair.address);
    const baseCzusdLocked = await lsdt.baseCzusdLocked();
    const totalUstsdRewarded = await lsdt.totalUstsdRewarded();
    const totalCzusdSpent = await lsdt.totalCzusdSpent();
    const totalTickets = await lsdt.totalTickets();
    const addressTickets = await lsdt.addressTickets(owner.address);
    const lastUstsdRewardEpoch = await lsdt.lastUstsdRewardEpoch();
    const ownerHasWon = await lsdt.addressHasWon(owner.address);
    const pairHasWon = await lsdt.addressHasWon(lsdtCzusdPair.address);
    const ownerIsExempt = await lsdt.isExempt(owner.address);
    const pairIsExempt = await lsdt.isExempt(lsdtCzusdPair.address);
    expect(pairCzusdBal).to.eq(BASE_CZUSD_LP);
    expect(pairLsdtBal).to.eq(parseEther("10000"));
    expect(baseCzusdLocked).to.eq(BASE_CZUSD_LP);
    expect(totalUstsdRewarded).to.eq(0);
    expect(totalCzusdSpent).to.eq(0);
    expect(addressTickets).to.eq(0);
    expect(lastUstsdRewardEpoch).to.be.gt(1600000000);
    expect(lastUstsdRewardEpoch).to.be.lt(2000000000);
    expect(totalTickets).to.eq(0);
    expect(ownerHasWon).to.be.true;
    expect(pairHasWon).to.be.true;
    expect(ownerIsExempt).to.be.true;
    expect(pairIsExempt).to.be.false;
  });
  it("Should burn 8% and tax 2% on buy and get tickets", async function () {
    console.log("Minting and approving czusd...");
    await czusdSc.connect(deployer).mint(trader.address,parseEther("10000"));
    await czusdSc.connect(trader).approve(pcsRouter.address,ethers.constants.MaxUint256);
    console.log("Buying LSDT on pcs...");
    await pcsRouter.connect(trader).swapExactTokensForTokensSupportingFeeOnTransferTokens(
        parseEther("100"),
        0,
        [czusdSc.address,lsdt.address],
        trader.address,
        ethers.constants.MaxUint256
    );
    console.log("Collecting data from view methods...");
    const traderBal = await lsdt.balanceOf(trader.address);
    const totalSupply = await lsdt.totalSupply();
    const lockedCzusd = await lsdt.lockedCzusd();
    const traderTickets = await lsdt.addressTickets(trader.address);
    const totalTickets = await lsdt.totalTickets();
    const ustsdToReward = await lsdt.ustsdToReward();
    const checkUpkeepVrf = await lsdt.checkUpkeep(checkDataVrf);
    const checkUpkeepMint = await lsdt.checkUpkeep(checkDataMint);
    const rewardDistributorBal = await lsdt.balanceOf(lsdtRewards.address);
    const getWinner1 = await lsdt.getWinner(0);
    const getWinner2 = await lsdt.getWinner(1);
    const getWinner3 = await lsdt.getWinner(87);
    const getWinner4 = await lsdt.getWinner(88);
    const getWinner5 = await lsdt.getWinner(89);
    const getWinner6 = await lsdt.getWinner(10000);
    expect(traderBal).to.be.closeTo(parseEther("88.8"),parseEther("0.1"));
    expect(totalSupply).to.be.closeTo(parseEther("9992.1"),parseEther("0.1"));
    expect(lockedCzusd).to.be.closeTo(parseEther("10008.3"),parseEther("0.1"));
    expect(traderTickets).to.eq(88);
    expect(totalTickets).to.eq(88);
    expect(ustsdToReward).to.eq(0);
    expect(checkUpkeepVrf[0]).to.be.false;
    expect(checkUpkeepMint[0]).to.be.false;
    expect(rewardDistributorBal).to.be.closeTo(parseEther("2.0"),parseEther("0.1"));
    expect(getWinner1.toUpperCase()).to.eq(trader.address.toUpperCase());
    expect(getWinner2.toUpperCase()).to.eq(trader.address.toUpperCase());
    expect(getWinner3.toUpperCase()).to.eq(trader.address.toUpperCase());
    expect(getWinner4.toUpperCase()).to.eq(trader.address.toUpperCase());
    expect(getWinner5.toUpperCase()).to.eq(trader.address.toUpperCase());
    expect(getWinner6.toUpperCase()).to.eq(trader.address.toUpperCase());
  });
  it("Should grant max of 200 tickets", async function () {
    await pcsRouter.connect(trader).swapExactTokensForTokensSupportingFeeOnTransferTokens(
        parseEther("3000"),
        0,
        [czusdSc.address,lsdt.address],
        trader.address,
        ethers.constants.MaxUint256
    );
    const traderTickets = await lsdt.addressTickets(trader.address);
    const totalTickets = await lsdt.totalTickets();
    const lockedCzusd = await lsdt.lockedCzusd();
    const ustsdToReward = await lsdt.ustsdToReward();
    const checkUpkeepVrf = await lsdt.checkUpkeep(checkDataVrf);
    const checkUpkeepMint = await lsdt.checkUpkeep(checkDataMint);
    const getWinner1 = await lsdt.getWinner(1);
    const getWinner2 = await lsdt.getWinner(89);
    expect(lockedCzusd).to.be.closeTo(parseEther("10203.2"),parseEther("0.1"));
    expect(traderTickets).to.eq(200);
    expect(totalTickets).to.eq(200);
    expect(ustsdToReward).to.eq(2);
    expect(checkUpkeepVrf[0]).to.be.false;
    expect(checkUpkeepMint[0]).to.be.false;
    expect(getWinner1.toUpperCase()).to.eq(trader.address.toUpperCase());
    expect(getWinner2.toUpperCase()).to.eq(trader.address.toUpperCase());
    await expect(lsdt.performUpkeep(checkDataVrf)).to.be.reverted;
    await expect(lsdt.performUpkeep(checkDataMint)).to.be.reverted;
  });
  it("Should enable vrf after 12 hours", async function () {
    await time.increase(time.duration.hours(12));
    await time.advanceBlock();
    const checkUpkeepVrf = await lsdt.checkUpkeep(checkDataVrf);
    const checkUpkeepMint = await lsdt.checkUpkeep(checkDataMint);
    expect(checkUpkeepVrf[0]).to.be.true;
    expect(checkUpkeepMint[0]).to.be.false;
    await expect(lsdt.performUpkeep(checkDataMint)).to.be.reverted;
  });
  it("Should get random words", async function () {
    const vrfGasEsimation = await lsdt.estimateGas.performUpkeep(checkDataVrf);
    await lsdt.performUpkeep(checkDataVrf);
    const requestId = await lsdt.vrfRequestId();
    const checkUpkeepMintInitial = await lsdt.checkUpkeep(checkDataMint);
    await vrfCoordinatorMock.fulfillRandomWords(requestId,lsdt.address);
    const randomWord = await lsdt.randomWord();
    const checkUpkeepVrf = await lsdt.checkUpkeep(checkDataVrf);
    const checkUpkeepMintFinal = await lsdt.checkUpkeep(checkDataMint);
    expect(vrfGasEsimation.toNumber()).to.eq(136377);
    expect(randomWord).to.not.eq(0);
    expect(checkUpkeepVrf[0]).to.be.false;
    expect(checkUpkeepMintInitial[0]).to.be.false;
    expect(checkUpkeepMintFinal[0]).to.be.true;
  });
  it("Should send NFT to winner", async function () {
    const nftBalReservesInitial = await ustsd.balanceOf(CzUstsdReserves);
    await lsdt.performUpkeep(checkDataMint);
    const nftBalReservesFinal = await ustsd.balanceOf(CzUstsdReserves);
    const totalCzusdSpent = await lsdt.totalCzusdSpent();
    const currentTime = (await time.latest()).toNumber();
    const nftBal = await ustsd.balanceOf(trader.address);
    const lastUstsdRewardEpoch = await lsdt.lastUstsdRewardEpoch();
    const checkUpkeepVrf = await lsdt.checkUpkeep(checkDataVrf);
    const checkUpkeepMint = await lsdt.checkUpkeep(checkDataMint);
    const ustsdToReward = await lsdt.ustsdToReward();
    const traderTickets = await lsdt.addressTickets(trader.address);
    const totalTickets = await lsdt.totalTickets();
    const traderHasWon = await lsdt.addressHasWon(trader.address);
    expect(nftBal).to.eq(1);
    expect(checkUpkeepVrf[0]).to.be.false;
    expect(ustsdToReward).to.eq(1);
    expect(checkUpkeepMint[0]).to.be.false;
    expect(lastUstsdRewardEpoch).to.equal(currentTime);
    expect(traderTickets).to.eq(0);
    expect(totalTickets).to.eq(0);
    expect(nftBalReservesInitial.sub(nftBalReservesFinal)).to.eq(1);
    expect(totalCzusdSpent).to.be.gt(parseEther("30"));
    expect(totalCzusdSpent).to.be.lt(parseEther("200"));
    expect(totalCzusdSpent).to.be.eq(parseEther("52.99"));
    expect(traderHasWon).to.be.true;
  });
});