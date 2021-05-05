// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Fingers
// If you read this, know that I love you even if your mom doesnt <3
const chai = require('chai');
const { solidity } = require("ethereum-waffle");
chai.use(solidity);

const { ethers, config } = require('hardhat');
const { time } = require("@openzeppelin/test-helpers");
const { toNum, toBN } = require("./utils/bignumberConverter");

const loadJsonFile = require("load-json-file");
const { uniswapRouterAddress, zeroAddress } = loadJsonFile.sync("./deployConfig.json");

const { expect } = chai;
const { parseEther } = ethers.utils;

describe("CZodiacToken", function() {

  let czodiacToken1, czodiacToken2, czodiacToken3;
  let uniswapPair;
  let ownerAddress, traderAddress, transferAddress;

  before(async function() {
    [ownerAddress, traderAddress, transferAddress1, transferAddress2] = await ethers.getSigners();

    await time.advanceBlock();
    const now = await time.latest()

    const CZodiacToken = await ethers.getContractFactory("CZodiacToken");
    czodiacToken1 = await CZodiacToken.deploy(
      uniswapRouterAddress, // IUniswapV2Router02 _uniswapV2Router
      zeroAddress,// IERC20 _prevCzodiac
      "01czodiac", //string memory _name
      "01c", //string memory _symbol
      now.add(time.duration.days(25)).toNumber(),//uint256 _swapStartTimestamp
      now.add(time.duration.days(30)).toNumber()//uint256 _swapEndTimestamp
    );
    await czodiacToken1.deployed();
    uniswapPair = await czodiacToken1.uniswapV2Pair();
  });
  it("Should correctly distribute the token", async function() {
    const totalSupply = await czodiacToken1.totalSupply();
    const contractBalance = await czodiacToken1.balanceOf(czodiacToken1.address);
    const ownerBalance = await czodiacToken1.balanceOf(ownerAddress.address);
    expect(contractBalance).to.equal(0, "Contract should hold 0 tokens.");
    expect(ownerBalance).to.equal(totalSupply, "Owner should hold full supply.");
    expect(totalSupply).to.equal(parseEther("8000000000000"),"Total supply should be 8 trillion * 10**18.");
  });
  it("Should not send rewards until fees enabled", async function() {
    const amountToTransfer = parseEther("1000000000000");
    await czodiacToken1.transfer(transferAddress1.address,amountToTransfer);
    await czodiacToken1.connect(transferAddress1).transfer(transferAddress2.address,amountToTransfer);
    await czodiacToken1.connect(transferAddress2).transfer(ownerAddress.address,amountToTransfer);
    const ownerBalance = await czodiacToken1.balanceOf(ownerAddress.address);
    const transfer1Balance = await czodiacToken1.balanceOf(transferAddress1.address);
    const transfer2Balance = await czodiacToken1.balanceOf(transferAddress2.address);
    const totalSupply = await czodiacToken1.totalSupply();
    expect(totalSupply).to.equal(parseEther("8000000000000"),"Total supply should be 8 trillion * 10**18.");
    expect(ownerBalance).to.equal(totalSupply, "Owner should hold full supply.");
    expect(transfer1Balance).to.equal(0, "Transfer1 address should hold 0 tokens.");
    expect(transfer2Balance).to.equal(0, "Transfer2 address should hold 0 tokens.");
  });
  it("Should send rewards & burn on transfer to non fee exempt", async function() {
    await czodiacToken1.setGlobalRewardsEnabled(true);
    const amountToTransfer = parseEther("1000000000000");
    await czodiacToken1.transfer(transferAddress1.address,amountToTransfer);
    await czodiacToken1.connect(transferAddress1).transfer(transferAddress2.address,amountToTransfer.div("2"));
    const totalSupply = await czodiacToken1.totalSupply();
    const contractBalance = await czodiacToken1.balanceOf(czodiacToken1.address);
    const ownerBalance = await czodiacToken1.balanceOf(ownerAddress.address);
    const transfer1Balance = await czodiacToken1.balanceOf(transferAddress1.address);
    const transfer2Balance = await czodiacToken1.balanceOf(transferAddress2.address);

    const initialTotalSupply = parseEther("8000000000000")
    const totalTax = amountToTransfer.div("2").mul("200").div("10000");
    const holderRewards = amountToTransfer.div("2").mul("100").div("10000");
    const lpRewards = amountToTransfer.div("2").mul("50").div("10000");
    const burnAmount = amountToTransfer.div("2").mul("30").div("10000");
    const devRewards = amountToTransfer.div("2").mul("20").div("10000");
    const receivedAmount =  amountToTransfer.div("2").sub(totalTax);

    const transfer1HolderRewards = holderRewards.mul(amountToTransfer.div("2")).div(amountToTransfer.div("2").add(receivedAmount));
    const transfer2HolderRewards = holderRewards.mul(receivedAmount).div(amountToTransfer.div("2").add(receivedAmount));

    expect(contractBalance).to.equal(0, "Contract should hold 0 tokens.");
    expect(ownerBalance).to.equal(initialTotalSupply.sub(amountToTransfer).add(devRewards), "Owner should hold full supply minus transfer amount plus dev rewards.");
    expect(totalSupply).to.equal(initialTotalSupply.sub(burnAmount),"Total supply should be 8 trillion minus 0.3% burn.");  
    expect(transfer1Balance).to.equal(amountToTransfer.div("2").add(transfer1HolderRewards), "Transfer1 account should have half the transfer amount plus its portion of the 0.5% reward.");
    expect(transfer2Balance).to.equal(receivedAmount.add(transfer2HolderRewards), "Transfer2 account should have half the transfer amount minus 2% fees plus its portion of the 0.5% holder reward.");
  });
});
