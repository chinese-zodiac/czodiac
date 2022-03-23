const chai = require("chai");
const { solidity } = require("ethereum-waffle");
const { BigNumber } = require("@ethersproject/bignumber");
const { ethers, config } = require("hardhat");
const { time } = require("@openzeppelin/test-helpers");
const {
    czDeployer,
    ellipsisCzusd3psPool,
    czvPegV2,
    busd,
    czusd,
    SilverDollarTypePriceSheet,
    SilverDollarNfts
  } = require("../deployConfig.json");

  const { expect } = chai;
  const { parseEther, formatEther, parseUnits } = ethers.utils;
  chai.use(solidity);
  
  const czusdMinterAddr = "0x66992127b42249eFBA6101C1Fe1696E1E2Df09B1";
  const rcWalletAddr = "0xfC74a37FFF6EA97fF555e5ff996193e12a464431";
  

  describe("CzUstsdReserves", function() {
    let ellipsisCzusd3psPoolSc, czvPegV2Sc, busdSc, czusdSc, ustsdPriceSc, ustsdSc;
    let owner, trader, trader1, trader2, trader3;
    let deployer, czusdMinter;
    let czUstsdReservesSc;

    before(async function() {
        [owner, trader, trader1, trader2, trader3] = await ethers.getSigners();
        await hre.network.provider.request({
          method: "hardhat_impersonateAccount",
          params: [czDeployer],
        });
        deployer = await ethers.getSigner(czDeployer);
        await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [czusdMinterAddr],
        });
        czusdMinter = await ethers.getSigner(czusdMinterAddr);

        await owner.sendTransaction({
            to:deployer.address,
            value: parseEther("5")
        });
        await owner.sendTransaction({
            to:czusdMinter.address,
            value: parseEther("5")
        });

        busdSc = await ethers.getContractAt("IERC20", busd);
        czusdSc = await ethers.getContractAt("CZUsd", czusd);
        ellipsisCzusd3psPoolSc = await ethers.getContractAt("IMetaPool", ellipsisCzusd3psPool);
        ustsdPriceSc = await ethers.getContractAt("SilverDollarTypePriceSheet", SilverDollarTypePriceSheet);
        ustsdSc = await ethers.getContractAt("JsonNftTemplate", SilverDollarNfts);

        const CzUstsdReserves = await ethers.getContractFactory("CzUstsdReserves");
        czUstsdReservesSc = await CzUstsdReserves.deploy();
        await czUstsdReservesSc.deployed();

        await czusdSc.connect(deployer).setContractSafe(czUstsdReservesSc.address);
    });

    describe("Deploy success", function() {
        it("Should have deployed the contracts", async function() {
            await ustsdSc.connect(deployer).consecutiveBatchTransfer(czUstsdReservesSc.address,0,50);
            await czusdSc.connect(czusdMinter).mint(czUstsdReservesSc.address,parseEther("2000"));
            const ustsdBal = await ustsdSc.balanceOf(czUstsdReservesSc.address);
            const czusdBal = await czusdSc.balanceOf(czUstsdReservesSc.address);
            expect(ustsdBal).to.eq(50);
            expect(czusdBal).to.eq(parseEther("2000"));
        });
    });
    describe("Buy", function() {
        it("Should transfer/burn CZUSD and transfer USTSD", async function () {
            await czusdSc.connect(czusdMinter).mint(trader.address,parseEther("300"));
            const rcCzusdBalInitial = await czusdSc.balanceOf(rcWalletAddr);
            const traderCzusdBalInitial = await czusdSc.balanceOf(trader.address);
            const reserveCzusdBalInitial = await czusdSc.balanceOf(czUstsdReservesSc.address);
            let nftIds = [0,4,6,2,5];
            const value = await ustsdPriceSc.getCoinNftSum(ustsdSc.address,nftIds);
            const fees = parseEther("0.99").mul(nftIds.length);
            await czUstsdReservesSc.connect(trader).buy(nftIds,0);
            const rcCzusdBalFinal = await czusdSc.balanceOf(rcWalletAddr);
            const traderCzusdBalFinal = await czusdSc.balanceOf(trader.address);
            const reserveCzusdBalFinal = await czusdSc.balanceOf(czUstsdReservesSc.address);
            expect(rcCzusdBalFinal.sub(rcCzusdBalInitial)).to.eq("0");
            expect(reserveCzusdBalFinal.sub(reserveCzusdBalInitial)).to.eq("0");
            expect(traderCzusdBalInitial.sub(traderCzusdBalFinal)).to.eq(fees.add(parseEther(value.toString()).div("100")));
        })
        it("Should transfer BUSD and transfer USTSD", async function () {
            await czusdSc.connect(czusdMinter).mint(trader.address,parseEther("300"));
            await czusdSc.connect(trader).approve(ellipsisCzusd3psPoolSc.address,parseEther("300"));
            await ellipsisCzusd3psPoolSc.connect(trader).exchange_underlying(0,1,parseEther("300"),0);
            const rcBusdBalInitial = await busdSc.balanceOf(rcWalletAddr);
            const traderBusdBalInitial = await busdSc.balanceOf(trader.address);
            const czvPegV2BusdBalInitial = await busdSc.balanceOf(czvPegV2);
            let nftIds = [23,45,19,27];
            const value = await ustsdPriceSc.getCoinNftSum(ustsdSc.address,nftIds);
            const fees = parseEther("0.99").mul(nftIds.length);
            const expectedDelta = fees.add(parseEther(value.toString()).div("100"));
            await busdSc.connect(trader).approve(czUstsdReservesSc.address,parseEther("300"));
            await czUstsdReservesSc.connect(trader).buy(nftIds,1);
            const rcBusdBalFinal = await busdSc.balanceOf(rcWalletAddr);
            const traderBusdBalFinal = await busdSc.balanceOf(trader.address);
            const czvPegV2BusdBalFinal = await busdSc.balanceOf(czvPegV2);
            expect(rcBusdBalFinal.sub(rcBusdBalInitial)).to.eq("0");
            expect(czvPegV2BusdBalFinal.sub(czvPegV2BusdBalInitial)).to.eq(expectedDelta);
            expect(traderBusdBalInitial.sub(traderBusdBalFinal)).to.eq(expectedDelta);
        })
        it("Should revert if buying nft not in reserve", async function() {
            await expect(czUstsdReservesSc.connect(trader).buy([69])).to.be.reverted;
        });
        it("Should revert if buying nft twice", async function() {
            await expect(czUstsdReservesSc.connect(trader).buy([23])).to.be.reverted;
        });
    })
    describe("Sell", function() {
        it("Should revert if selling unowned nft", async function() {
            await ustsdSc.connect(trader).setApprovalForAll(czUstsdReservesSc.address,true);
            await expect(czUstsdReservesSc.connect(trader).sell([49])).to.be.reverted;
        });
        it("Should transfer CZUSD and transfer USTSD", async function () {
            const rcCzusdBalInitial = await czusdSc.balanceOf(rcWalletAddr);
            const traderCzusdBalInitial = await czusdSc.balanceOf(trader.address);
            const reserveCzusdBalInitial = await czusdSc.balanceOf(czUstsdReservesSc.address);
            let nftIds = [0,4,23,19,27,5];
            const value = parseEther(
                (await ustsdPriceSc.getCoinNftSum(ustsdSc.address,nftIds)).toString()
            ).div("100");
            const czFees = value.mul("1025").div("10000");
            const rcFees = value.mul("125").div("10000");
            await czUstsdReservesSc.connect(trader).sell(nftIds);
            const rcCzusdBalFinal = await czusdSc.balanceOf(rcWalletAddr);
            const traderCzusdBalFinal = await czusdSc.balanceOf(trader.address);
            const reserveCzusdBalFinal = await czusdSc.balanceOf(czUstsdReservesSc.address);
            expect(rcCzusdBalFinal.sub(rcCzusdBalInitial)).to.eq(rcFees);
            expect(reserveCzusdBalInitial.sub(reserveCzusdBalFinal)).to.eq(value.sub(czFees));
            expect(traderCzusdBalFinal.sub(traderCzusdBalInitial)).to.eq(value.sub(czFees).sub(rcFees));

        });
        it("Should revert if selling nft twice", async function() {
            await expect(czUstsdReservesSc.connect(trader).sell([4])).to.be.reverted;
        });
    });
})