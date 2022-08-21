const chai = require("chai");
const { solidity } = require("ethereum-waffle");
const { BigNumber } = require("@ethersproject/bignumber");
const { ethers, config } = require("hardhat");
const { time } = require("@openzeppelin/test-helpers");
const { gssBnAsync } = require("./utils/goldenSearch");

const {
  czDeployer,gnosisTreasury,busd
} = require("../deployConfig.json");
const { parse } = require("@ethersproject/transactions");

const { expect } = chai;
const { parseEther, formatEther, parseUnits } = ethers.utils;

chai.use(solidity);

const BUSDCZUSD_LP = "0x73A7A74627f5A4fcD6d7EEF8E023865C4a84CfE8";
const DOTDOT_ADDRESS = "0x8189F0afdBf8fE6a9e13c69bA35528ac6abeB1af";
const DDD_ADDRESS = "0x84c97300a190676a19D1E13115629A11f8482Bd1";

describe("DotDotDepositor",function() {
  let owner, deployer, treasury;
  let dotDotDepositorSc, dotdotSc, dddSc, busdSc;
  before(async function() {
    [owner] = await ethers.getSigners();
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [czDeployer],
    });
    deployer = await ethers.getSigner(czDeployer);
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [gnosisTreasury],
    });
    treasury = await ethers.getSigner(gnosisTreasury);

    const DotDotDepositor = await ethers.getContractFactory("DotDotDepositor");
    dotDotDepositorSc = await DotDotDepositor.deploy();
    await dotDotDepositorSc.deployed();
    
    dotdotSc = await ethers.getContractAt("IDotDot", DOTDOT_ADDRESS);
    dddSc = await ethers.getContractAt("IERC20", DDD_ADDRESS);
    busdSc = await ethers.getContractAt("IERC20", busd);
  });
  it("Should transfer busdczusd dotdot stake",async function(){
    const treasuryBal = await dotdotSc.userBalances(treasury.address,BUSDCZUSD_LP);
    await dotdotSc.connect(treasury).withdraw(dotDotDepositorSc.address,BUSDCZUSD_LP,treasuryBal);
    await dotDotDepositorSc.depositAll();
    const depositorBal = await dotdotSc.userBalances(dotDotDepositorSc.address,BUSDCZUSD_LP);
    expect(treasuryBal).to.eq(depositorBal);
  });
  it("Should claim rewards after time passes",async function(){
    time.increase(time.duration.days(1));
    await time.advanceBlock();
    const busdInitial = await busdSc.balanceOf(treasury.address);
    const claimableDdd = await dotDotDepositorSc.claimableDdd();
    console.log(formatEther(claimableDdd));
    await dotDotDepositorSc.claim();
    const claimableDddFinal = await dotDotDepositorSc.claimableDdd();
    console.log(formatEther(claimableDddFinal));
    const busdFinal = await busdSc.balanceOf(treasury.address);
    console.log(formatEther(busdFinal),formatEther(busdInitial));
    expect(busdFinal.sub(busdInitial)).to.be.closeTo(parseEther("178"),parseEther("1"));
    expect(claimableDddFinal).to.eq(0);
  });
  it("Should transfer busdczusd dotdot stake",async function(){
    const depositorBal = await dotdotSc.userBalances(dotDotDepositorSc.address,BUSDCZUSD_LP);
    await dotDotDepositorSc.withdraw();
    await dotdotSc.connect(treasury).deposit(treasury.address,BUSDCZUSD_LP,depositorBal);   
    const treasuryBal = await dotdotSc.userBalances(treasury.address,BUSDCZUSD_LP);
    expect(treasuryBal).to.eq(depositorBal);
  });
})