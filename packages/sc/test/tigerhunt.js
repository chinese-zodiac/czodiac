// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// If you read this, know that I love you even if your mom doesnt <3
const chai = require('chai');
const { solidity } = require("ethereum-waffle");
chai.use(solidity);

const { ethers, config } = require('hardhat');
const { time } = require("@openzeppelin/test-helpers");
const { toNum, toBN } = require("./utils/bignumberConverter");

const loadJsonFile = require("load-json-file");
const { uniswapRouterAddress, zeroAddress, tigerZodiac, oxZodiac, czDeployer } = loadJsonFile.sync("./deployConfig.json");

const { expect } = chai;
const { parseEther } = ethers.utils;

describe("Tiger Hunt", function() {
    let tigz, oxz, tighp, tighunt;
    let owner, player1, player2, player3, player4;
    let mintroleHash;


    before(async function() {
        mintroleHash = ethers.utils.id("MINTER_ROLE");
        [player1, player2, player3, player4] = await ethers.getSigners();
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [czDeployer],
        })
        owner = await ethers.getSigner(czDeployer)

        const CZodiacToken = await ethers.getContractFactory("CZodiacToken");
        tigz = CZodiacToken.attach(tigerZodiac);
        oxz = CZodiacToken.attach(oxZodiac);

        const TigerHPToken = await ethers.getContractFactory("TigerHuntPoints");
        tighp = await TigerHPToken.connect(owner).deploy();
        await tighp.deployed();

        const TigerHunt = await ethers.getContractFactory("TigerHunt");
        tighunt = await TigerHunt.connect(owner).deploy(
            tigerZodiac, //IERC20 _tigz,
            oxZodiac, //IERC20 _oxz,
            tighp.address//ERC20PresetMinterPauser _tigerHP
        );
        await tighunt.deployed();

        await tigz.connect(owner).excludeFromReward(tighunt.address);
        await tigz.connect(owner).excludeFromFee(tighunt.address);
        await oxz.connect(owner).excludeFromReward(tighunt.address);
        await oxz.connect(owner).excludeFromFee(tighunt.address);

        await tighp.connect(owner).grantRole(mintroleHash,tighunt.address);
        await tighp.connect(owner).setContractSafe(tighunt.address);
    });

    it("Should set TigHP total supply to zero", async function() {
        const totalSupply = await tighp.totalSupply();
        expect(totalSupply).to.equal(0, "TigHP should have a supply of 0.");
    });

    it("Should allow staking", async function() {
        await tigz.connect(owner).approve(tighunt.address,parseEther("1000"))
        await tighunt.connect(owner).stakeTigz(parseEther("1000"));
        const tigerAccount = await tighunt.tigerAccounts(owner.address);
        const tigHuntTigzBalance = await tigz.balanceOf(tighunt.address);
        expect(parseEther("1000")).to.equal(tigerAccount.tigzStaked, "Should have staked 1000 TIGZ.");
        expect(parseEther("1000")).to.equal(tigHuntTigzBalance, "Should have transferred 1000 TIGZ to contract.");
    });

    it("Should revert if attempt to stake/unstake before 24 hours", async function() {
        await expect(tighunt.connect(owner).stakeTigz(parseEther("1000")))
            .to.be.revertedWith("TigerHunt: Recently staked or unstaked TIGZ.");
        
        await expect(tighunt.connect(owner).unstakeTigz(parseEther("1000")))
            .to.be.revertedWith("TigerHunt: Recently staked or unstaked TIGZ.");
    });

    it("Should unstake after 24 hours", async function() {
        time.increase(time.duration.days(1));
        await time.advanceBlock();
        await tighunt.connect(owner).unstakeTigz(parseEther("1000"));
        const tigerAccount = await tighunt.tigerAccounts(owner.address);
        const tigHuntTigzBalance = await tigz.balanceOf(tighunt.address);
        expect(parseEther("0")).to.equal(tigerAccount.tigzStaked, "Should have unstaked all TIGZ.");
        expect(parseEther("0")).to.equal(tigHuntTigzBalance, "Should have transferred 1000 TIGZ from contract.");
    });

    it("Should revert eat if no stake", async function() {
        await expect(tighunt.connect(owner).eat())
        .to.be.revertedWith("TigerHunt: No TIGZ Staked.");
    });

    it("Should grant tigerhp when eating", async function() {
        time.increase(time.duration.days(1));
        await time.advanceBlock();
        await tigz.connect(owner).approve(tighunt.address,parseEther("1000"));
        await tighunt.connect(owner).stakeTigz(parseEther("1000"));
        await tighunt.connect(owner).eat();
        const tigerhpBalance = await tighp.balanceOf(owner.address);
        expect(parseEther("7000")).to.equal(tigerhpBalance, "Should gained 7x the staked tigz.");
    });

    it("Should revert eat if eaten recently", async function() {
        await expect(tighunt.connect(owner).eat())
            .to.be.revertedWith("TigerHunt: Action not available.");
    });

    it("Should do all not done actions", async function() {
        await tighunt.connect(owner).doEatSleepDrinkPoop();
        const tigerhpBalance = await tighp.balanceOf(owner.address);
        expect(parseEther("57000")).to.equal(tigerhpBalance, "Should gained 57x the staked tigz.");
    });
})

