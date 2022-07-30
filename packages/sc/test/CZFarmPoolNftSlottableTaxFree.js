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
const { zeroAddress, czDeployer, czf, czusd, lrt, czodiacNft } = loadJsonFile.sync("./deployConfig.json");

const { expect } = chai;
const { parseEther, formatEther } = ethers.utils;

describe("CZFarmPoolNftSlottableTaxFree", function() {
  let czfSc, czusdSc, lrtSc, czodiacNftSc, poolSc;
  let owner, trader, trader1, trader2, trader3;
  let deployer;

  let period = 90*86400; // 90 days
  let feeBasis = 500; // 5%

  before(async function() {
    [owner, trader, trader1, trader2, trader3] = await ethers.getSigners();
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [czDeployer],
    });
    deployer = await ethers.getSigner(czDeployer);
    
    czfSc = await ethers.getContractAt("CZFarm", czf);
    czusdSc = await ethers.getContractAt("CZUsd", czusd);
    lrtSc = await ethers.getContractAt("IERC20", lrt);
    czodiacNftSc = await ethers.getContractAt("IERC721", czodiacNft);

    const CZFarmPoolNftSlottableTaxFree = await ethers.getContractFactory("CZFarmPoolNftSlottableTaxFree");
    poolSc = await CZFarmPoolNftSlottableTaxFree.deploy();
    await poolSc.deployed();

    await time.advanceBlock();
    const now = await time.latest();

    await poolSc.initialize(
      czusd,//ERC20Burnable _stakedToken,
      czf,//IERC20 _rewardToken,
      0,//uint256 _rewardPerSecond,
      now.toString(),//uint256 _timestampStart,
      now.add(time.duration.days(90)).toNumber(),//uint256 _timestampEnd,
      feeBasis,//uint256 _withdrawFeeBasis,
      lrt,//IERC20 _whitelistToken,
      0,//uint256 _whitelistWad,
      czodiacNft,//IERC721 _slottableNftTaxFree,
      30*86400,//uint256 _nftLockPeriod,
      deployer.address//address _admin
    );

    await czusdSc.connect(deployer).setContractSafe(poolSc.address);
    await czfSc.connect(deployer).mint(poolSc.address,parseEther("1000000000"));
    await poolSc.connect(deployer).czfarmUpdateRewardPerSecond();


  });
  describe("NFT Slotting", function() {
    it("Should slot NFT", async function() {
      await czodiacNftSc.connect(deployer).setApprovalForAll(poolSc.address,true);
      await poolSc.connect(deployer).slotNft(czodiacNft,51);
      const now = await time.latest();
      let poolNftBal = await czodiacNftSc.balanceOf(poolSc.address);
      let {id_,timestamp_} = await poolSc.getSlottedNft(deployer.address, czodiacNftSc.address);
      await expect(poolSc.connect(deployer).slotNft(czodiacNft,52)).to.be.reverted;
      await expect(poolSc.slotNft(czodiacNft,1)).to.be.reverted;
      expect(poolNftBal).to.eq(1);
      expect(id_).to.eq(51);
      expect(timestamp_).to.eq(now.toNumber());
    });
    it("Should revert unslot NFT before 30 days pass", async function() {
      await expect(poolSc.connect(deployer).slotNft(czodiacNft,47)).to.be.revertedWith("CZ: NFT already slotted");
      await expect(poolSc.connect(deployer).unslotNft(czodiacNft)).to.be.revertedWith("CZ: NFT Locked");
      await expect(poolSc.unslotNft(czodiacNft)).to.be.revertedWith("CZ: No NFT Slotted");
    });
    it("Should make pool tax free when slotted only", async function() {
      const deployerInitialCzusdBal = await czusdSc.balanceOf(deployer.address);
      await czusdSc.connect(deployer).mint(deployer.address,parseEther("100"));
      await poolSc.connect(deployer).deposit(parseEther("100"));
      await poolSc.connect(deployer).withdraw(parseEther("100"));
      const deployerFinalCzusdBal = await czusdSc.balanceOf(deployer.address);
      
      const ownerInitialCzusdBal = await czusdSc.balanceOf(owner.address);
      await czusdSc.connect(deployer).mint(owner.address,parseEther("100"));
      await poolSc.deposit(parseEther("100"));
      await poolSc.withdraw(parseEther("100"));
      const ownerFinalCzusdBal = await czusdSc.balanceOf(owner.address);

      expect(ownerFinalCzusdBal).to.eq(ownerInitialCzusdBal.add(parseEther("95")));
      expect(deployerFinalCzusdBal).to.eq(deployerInitialCzusdBal.add(parseEther("100")));
    });
    it("Should unslot NFT after period", async function() {
      await time.increase(time.duration.days(30));
      await time.advanceBlock();
      await poolSc.connect(deployer).unslotNft(czodiacNft);
      let poolNftBal = await czodiacNftSc.balanceOf(poolSc.address);
      let {id_,timestamp_} = await poolSc.getSlottedNft(deployer.address, czodiacNftSc.address);
      const deployerInitialCzusdBal = await czusdSc.balanceOf(deployer.address);
      await czusdSc.connect(deployer).mint(deployer.address,parseEther("100"));
      await poolSc.connect(deployer).deposit(parseEther("100"));
      await poolSc.connect(deployer).withdraw(parseEther("100"));
      const deployerFinalCzusdBal = await czusdSc.balanceOf(deployer.address);
      expect(poolNftBal).to.eq(0);
      expect(id_).to.eq(0);
      expect(timestamp_).to.eq(0);
      expect(deployerFinalCzusdBal).to.eq(deployerInitialCzusdBal.add(parseEther("95")));
    });
  });


});