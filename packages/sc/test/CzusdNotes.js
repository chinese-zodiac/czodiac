// SPDX-License-Identifier: GPL-3.0
const chai = require('chai');
const { solidity } = require("ethereum-waffle");
chai.use(solidity);

const { ethers } = require('hardhat');
const { time } = require("@openzeppelin/test-helpers");

const loadJsonFile = require("load-json-file");
const { czusd, czodiacGnosis, blacklist } = loadJsonFile.sync("./deployConfig.json");

const { expect } = chai;
const { parseEther, formatEther } = ethers.utils;

describe("CzusdNotes", function () {
    let czusdSc, blacklistSc, czusdNotesSc;
    let deployer, user1, user2, user3, user4;
    let czusdAdmin;

    before(async function () {
        [deployer, user1, user2, user3, user4] = await ethers.getSigners();
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [czodiacGnosis],
        });
        czusdAdmin = await ethers.getSigner(czodiacGnosis);
        await deployer.sendTransaction({
            to: czusdAdmin.address,
            value: parseEther("1")
        })
        czusdSc = await ethers.getContractAt("CZUsd", czusd);
        blacklistSc = await ethers.getContractAt("IBlacklist", blacklist);
    });
    //TEST1: deploy CzusdNotes and assign to czusdNotesSc, check static variables are correct
    it("Should deploy CzusdNotes", async function () {
        const CzusdNotes = await ethers.getContractFactory("CzusdNotes");
        czusdNotesSc = await CzusdNotes.deploy();
        await czusdNotesSc.deployed();
        await czusdSc.connect(czusdAdmin).setContractSafe(czusdNotesSc.address);
        expect(await czusdNotesSc.name()).to.equal("CzusdNotes");
        expect(await czusdNotesSc.symbol()).to.equal("CZN");
        expect(await czusdNotesSc.baseURI()).to.equal("");
        expect(await czusdNotesSc.czusd()).to.equal(czusd);
        expect(await czusdNotesSc.blacklistChecker()).to.equal(blacklist);
        expect(await czusdNotesSc.treasury()).to.equal(czodiacGnosis);
        expect(await czusdNotesSc.overnightRateBasis()).to.equal(450);
        expect(await czusdNotesSc.maximumRateBasis()).to.equal(1350);
        expect(await czusdNotesSc.halflife()).to.equal(365 * 2);
        expect(await czusdNotesSc.minLock()).to.equal(1);
        expect(await czusdNotesSc.maxLock()).to.equal(3652);
        expect(await czusdNotesSc.minNoteSize()).to.equal(parseEther("50"));
        expect(await czusdNotesSc.maxNoteSize()).to.equal(parseEther("25000"));
        expect(await czusdNotesSc.maxOutstandingPrinciple()).to.equal(parseEther("150000"));
    });
    //TEST2: Test getYieldAtPeriod for 1 days, 3652 days, 365*2 days, 100 days, 500 days, 1000 days
    it("Should getYieldAtPeriod", async function () {
        expect(await czusdNotesSc.getYieldAtPeriod(1)).to.equal(450);
        expect(await czusdNotesSc.getYieldAtPeriod(100)).to.equal(558);
        expect(await czusdNotesSc.getYieldAtPeriod(500)).to.equal(816);
        expect(await czusdNotesSc.getYieldAtPeriod(365 * 2)).to.equal(900);
        expect(await czusdNotesSc.getYieldAtPeriod(1000)).to.equal(971);
        expect(await czusdNotesSc.getYieldAtPeriod(3652)).to.equal(1201);
    });
    //TEST3: Test mintNote, check that user1 has 1 note, check all returns from user1 getAccount and user1 getNotes, user1 czusd balance decreased
    it("Should mintNote", async function () {
        const period = 1000;
        const wad = parseEther("100");
        await czusdSc.connect(czusdAdmin).mint(user1.address, wad)
        expect(await czusdNotesSc.balanceOf(user1.address)).to.equal(0);
        expect(await czusdSc.balanceOf(user1.address)).to.equal(wad);
        await czusdNotesSc.connect(user1).mintNote(user1.address, wad, period);
        expect(await czusdNotesSc.balanceOf(user1.address)).to.equal(1);
        expect(await czusdSc.balanceOf(user1.address)).to.equal(0);
        expect(await czusdSc.balanceOf(czusdNotesSc.address)).to.equal(wad);
        const yieldApr = await czusdNotesSc.getYieldAtPeriod(period);
        const [lastUpdateEpoch, currYieldPerSecond, totalYield, totalPrinciple, accYield, accPrinciple, totalNotes] = await czusdNotesSc.getAccount(user1.address);
        const expectedTotalYield = yieldApr.mul(wad).mul(period).div(10000).div(365);
        const expectedYieldPerSecond = expectedTotalYield.div(time.duration.days(period).toNumber());
        const now = await time.latest();
        expect(lastUpdateEpoch).to.equal(now.toNumber());
        expect(totalYield).to.be.closeTo(expectedTotalYield, parseEther("0.00000001"));
        expect(currYieldPerSecond).to.eq(expectedYieldPerSecond);
        expect(totalPrinciple).to.eq(wad);
        expect(accYield).to.eq(0);
        expect(accPrinciple).to.eq(0);
        expect(totalNotes).to.eq(1);
        const [epoch, yieldPerSecond, principle, entryIds] = await czusdNotesSc.getNotes(user1.address, 0, 1);
        expect(epoch[0]).to.eq(now.add(time.duration.days(period)).toNumber());
        expect(yieldPerSecond[0]).to.eq(expectedYieldPerSecond);
        expect(principle[0]).to.eq(wad);
        expect(entryIds[0]).to.eq(1);
        expect(await czusdNotesSc.outstandingPrinciple()).to.eq(wad);
    });
    //TEST4: Test claimPending after note expiration (1000 days)
    it("Should claimPending after note expiration", async function () {
        const period = 1000;
        const wad = parseEther("100");
        const yieldApr = await czusdNotesSc.getYieldAtPeriod(period);
        const expectedTotalYield = yieldApr.mul(wad).mul(period).div(10000).div(365);
        await time.increase(time.duration.days(1000));
        await time.advanceBlock();
        await czusdSc.connect(czusdAdmin).mint(czusdNotesSc.address, expectedTotalYield)
        await czusdNotesSc.connect(user1).claimPending(user1.address, 0);
        const now = await time.latest();
        expect(await czusdNotesSc.balanceOf(user1.address)).to.equal(0);
        expect(await czusdSc.balanceOf(user1.address)).to.be.closeTo(wad.add(expectedTotalYield.mul(9000).div(10000)), parseEther("0.000000001"));
        expect(await czusdNotesSc.outstandingPrinciple()).to.eq(0);
        const [lastUpdateEpoch, currYieldPerSecond, totalYield, totalPrinciple, accYield, accPrinciple, totalNotes] = await czusdNotesSc.getAccount(user1.address);
        expect(lastUpdateEpoch).to.eq(now.toNumber());
        expect(totalYield).to.eq(0);
        expect(currYieldPerSecond).to.eq(0);
        expect(totalPrinciple).to.eq(0);
        expect(accYield).to.eq(0);
        expect(accPrinciple).to.eq(0);
        expect(totalNotes).to.eq(0);
    });
    //TEST5: Test claimPending before note expiration (500 days for 1000 days note)
    it("Should claimPending before note expiration", async function () {
        const period = 1000;
        const wad = parseEther("100");
        const yieldApr = await czusdNotesSc.getYieldAtPeriod(period);
        const expectedTotalYield = yieldApr.mul(wad).mul(period).div(10000).div(365);
        await czusdSc.connect(czusdAdmin).mint(czusdNotesSc.address, expectedTotalYield);
        await czusdNotesSc.connect(user1).mintNote(user1.address, wad, period);
        const mintNoteNow = await time.latest();
        expect(await czusdNotesSc.balanceOf(user1.address)).to.equal(1);
        await time.increase(time.duration.days(500));
        await time.advanceBlock();
        const initialUser1Bal = await czusdSc.balanceOf(user1.address);
        await czusdNotesSc.connect(user1).claimPending(user1.address, 0);
        const finalUser1Bal = await czusdSc.balanceOf(user1.address);
        expect(await czusdNotesSc.balanceOf(user1.address)).to.equal(1);
        const [lastUpdateEpoch, currYieldPerSecond, totalYield, totalPrinciple, accYield, accPrinciple, totalNotes] = await czusdNotesSc.getAccount(user1.address);
        const expectedYieldPerSecond = expectedTotalYield.div(time.duration.days(period).toNumber());
        const now = await time.latest();
        expect(finalUser1Bal.sub(initialUser1Bal)).to.be.closeTo(expectedTotalYield.div(2).mul(9000).div(10000), parseEther("0.00001"));
        expect(lastUpdateEpoch).to.equal(now.toNumber());
        expect(totalYield).to.be.closeTo(expectedTotalYield.div(2), parseEther("0.000001"));
        expect(currYieldPerSecond).to.eq(expectedYieldPerSecond);
        expect(totalPrinciple).to.eq(wad);
        expect(accYield).to.eq(0);
        expect(accPrinciple).to.eq(0);
        expect(totalNotes).to.eq(1);
        const [epoch, yieldPerSecond, principle, entryIds] = await czusdNotesSc.getNotes(user1.address, 0, 1);
        expect(epoch[0]).to.eq(mintNoteNow.add(time.duration.days(period)).toNumber());
        expect(yieldPerSecond[0]).to.eq(expectedYieldPerSecond);
        expect(principle[0]).to.eq(wad);
        expect(entryIds[0]).to.eq(2);
    });
    //TEST6: Test claimPending for note from TEST5 after note expiration (+500 days, 1000 days total)
    it("Should claimPending after note expiration", async function () {
        const period = 1000;
        const wad = parseEther("100");
        const yieldApr = await czusdNotesSc.getYieldAtPeriod(period);
        const expectedTotalYield = yieldApr.mul(wad).mul(period).div(10000).div(365);
        await time.increase(time.duration.days(500));
        await time.advanceBlock();
        const initialUser1Bal = await czusdSc.balanceOf(user1.address);
        await czusdNotesSc.connect(user1).claimPending(user1.address, 0);
        const finalUser1Bal = await czusdSc.balanceOf(user1.address);
        expect(await czusdNotesSc.balanceOf(user1.address)).to.equal(0);
        expect(await czusdNotesSc.balanceOf(user1.address)).to.equal(0);
        const [lastUpdateEpoch, currYieldPerSecond, totalYield, totalPrinciple, accYield, accPrinciple, totalNotes] = await czusdNotesSc.getAccount(user1.address);
        const now = await time.latest();
        expect(finalUser1Bal.sub(initialUser1Bal)).to.be.closeTo(wad.add(expectedTotalYield.div(2).mul(9000).div(10000)), parseEther("0.00001"));
        expect(lastUpdateEpoch).to.equal(now.toNumber());
        expect(totalYield).to.eq(0);
        expect(currYieldPerSecond).to.eq(0);
        expect(totalPrinciple).to.eq(0);
        expect(accYield).to.eq(0);
        expect(accPrinciple).to.eq(0);
        expect(totalNotes).to.eq(0);
    });
    //TEST7: Test user2 minting 2 notes, 100 days and 500 days, then claimPending after 200 days
    it("Should claimPending after 200 days", async function () {
        const period1 = 100;
        const period2 = 500;
        const wad1 = parseEther("100");
        const wad2 = parseEther("200");
        const yieldApr1 = await czusdNotesSc.getYieldAtPeriod(period1);
        const yieldApr2 = await czusdNotesSc.getYieldAtPeriod(period2);
        const expectedTotalYield1 = yieldApr1.mul(wad1).mul(period1).div(10000).div(365);
        const expectedTotalYield2 = yieldApr2.mul(wad2).mul(period2).div(10000).div(365);
        await czusdSc.connect(czusdAdmin).mint(czusdNotesSc.address, expectedTotalYield1.add(expectedTotalYield2));
        await czusdSc.connect(czusdAdmin).mint(user2.address, wad1.add(wad2));
        await czusdNotesSc.connect(user2).mintNote(user2.address, wad2, period2);
        const mintNoteNow = await time.latest();
        await czusdNotesSc.connect(user2).mintNote(user2.address, wad1, period1);
        expect(await czusdNotesSc.balanceOf(user2.address)).to.equal(2);
        await time.increase(time.duration.days(200));
        await time.advanceBlock();
        const [, , principlePreClaim,] = await czusdNotesSc.getNotes(user2.address, 0, 2);
        expect(principlePreClaim[0]).to.eq(wad1);
        expect(principlePreClaim[1]).to.eq(wad2);
        const initialUser2Bal = await czusdSc.balanceOf(user2.address);
        await czusdNotesSc.connect(user2).claimPending(user2.address, 0);
        const finalUser2Bal = await czusdSc.balanceOf(user2.address);
        expect(await czusdNotesSc.balanceOf(user2.address)).to.equal(1);
        const [lastUpdateEpoch, currYieldPerSecond, totalYield, totalPrinciple, accYield, accPrinciple, totalNotes] = await czusdNotesSc.getAccount(user2.address);
        const expectedYieldPerSecond2 = expectedTotalYield2.div(time.duration.days(period2).toNumber());
        const now = await time.latest();
        expect(finalUser2Bal.sub(initialUser2Bal)).to.be.closeTo(expectedTotalYield1.mul(9000).div(10000).add(expectedTotalYield2.mul(2).div(5).mul(9000).div(10000)).add(wad1), parseEther("0.00001"));
        expect(lastUpdateEpoch).to.equal(now.toNumber());
        expect(totalYield).to.be.closeTo(expectedTotalYield2.mul(3).div(5), parseEther("0.00001"));
        expect(currYieldPerSecond).to.eq(expectedYieldPerSecond2);
        expect(totalPrinciple).to.eq(wad2);
        expect(accYield).to.eq(0);
        expect(accPrinciple).to.eq(0);
        expect(totalNotes).to.eq(1);
        const [epoch, yieldPerSecond, principle, entryIds] = await czusdNotesSc.getNotes(user2.address, 0, 1);
        expect(epoch[0]).to.eq(mintNoteNow.add(time.duration.days(period2)).toNumber());
        expect(yieldPerSecond[0]).to.eq(expectedYieldPerSecond2);
        expect(principle[0]).to.eq(wad2);
        expect(entryIds[0]).to.eq(3);
    });
    //TEST8: Test user2 claimPending for note from TEST7 after note expiration (+300 days, 500 days total)
    it("Should claimPending after note expiration", async function () {
        const period = 500;
        const wad = parseEther("200");
        const yieldApr = await czusdNotesSc.getYieldAtPeriod(period);
        const expectedTotalYield = yieldApr.mul(wad).mul(period).div(10000).div(365);
        expect(await czusdNotesSc.balanceOf(user2.address)).to.equal(1);
        await time.increase(time.duration.days(300));
        await time.advanceBlock();
        const initialUser2Bal = await czusdSc.balanceOf(user2.address);
        await czusdNotesSc.connect(user2).claimPending(user2.address, 0);
        const finalUser2Bal = await czusdSc.balanceOf(user2.address);
        expect(await czusdNotesSc.balanceOf(user2.address)).to.equal(0);
        const [, currYieldPerSecond, totalYield, totalPrinciple, accYield, accPrinciple, totalNotes] = await czusdNotesSc.getAccount(user2.address);
        expect(finalUser2Bal.sub(initialUser2Bal)).to.be.closeTo(expectedTotalYield.mul(9000).div(10000).mul(3).div(5).add(wad), parseEther("0.00001"));
        expect(totalYield).to.eq(0);
        expect(currYieldPerSecond).to.eq(0);
        expect(totalPrinciple).to.eq(0);
        expect(accYield).to.eq(0);
        expect(accPrinciple).to.eq(0);
        expect(totalNotes).to.eq(0);
    });
    //TEST9: Test user3 minting a note, waiting 50 days, then IERC721 transfer to user4
    it("Should transfer note from user3 to user4", async function () {
        const period = 100;
        const wad = parseEther("100");
        const yieldApr = await czusdNotesSc.getYieldAtPeriod(period);
        const expectedTotalYield = yieldApr.mul(wad).mul(period).div(10000).div(365);
        await czusdSc.connect(czusdAdmin).mint(czusdNotesSc.address, expectedTotalYield);
        await czusdSc.connect(czusdAdmin).mint(user3.address, wad);
        await czusdNotesSc.connect(user3).mintNote(user3.address, wad, period);
        await time.increase(time.duration.days(50));
        await time.advanceBlock();
        const initialUser3Bal = await czusdSc.balanceOf(user3.address);
        await czusdNotesSc.connect(user3).transferFrom(user3.address, user4.address, 5);
        const finalUser3Bal = await czusdSc.balanceOf(user3.address);
        expect(await czusdNotesSc.balanceOf(user3.address)).to.equal(0);
        expect(await czusdNotesSc.balanceOf(user4.address)).to.equal(1);
        const [lastUpdateEpoch3, currYieldPerSecond3, totalYield3, totalPrinciple3, accYield3, accPrinciple3, totalNotes3] = await czusdNotesSc.getAccount(user3.address);
        const [lastUpdateEpoch4, currYieldPerSecond4, totalYield4, totalPrinciple4, accYield4, accPrinciple4, totalNotes4] = await czusdNotesSc.getAccount(user4.address);
        const expectedYieldPerSecond = expectedTotalYield.div(time.duration.days(period).toNumber());
        const now = await time.latest();
        expect(finalUser3Bal.sub(initialUser3Bal)).to.be.closeTo(expectedTotalYield.mul(9000).div(10000).div(2), parseEther("0.00001"));
        expect(lastUpdateEpoch3).to.equal(now.toNumber());
        expect(totalYield3).to.eq(0);
        expect(currYieldPerSecond3).to.eq(0);
        expect(totalPrinciple3).to.eq(0);
        expect(accYield3).to.eq(0);
        expect(accPrinciple3).to.eq(0);
        expect(totalNotes3).to.eq(0);
        expect(lastUpdateEpoch4).to.equal(now.toNumber());
        expect(totalYield4).to.be.closeTo(expectedTotalYield.div(2), parseEther("0.00001"));
        expect(currYieldPerSecond4).to.eq(expectedYieldPerSecond);
        expect(totalPrinciple4).to.eq(wad);
        expect(accYield4).to.eq(0);
        expect(accPrinciple4).to.eq(0);
        expect(totalNotes4).to.eq(1);
    });
    //TEST10: Test user4 claimPending for note from TEST9 after note expiration (+150 days, 250 days total)
    it("Should claimPending after note expiration", async function () {
        const period = 100;
        const wad = parseEther("100");
        const yieldApr = await czusdNotesSc.getYieldAtPeriod(period);
        const expectedTotalYield = yieldApr.mul(wad).mul(period).div(10000).div(365);
        expect(await czusdNotesSc.balanceOf(user4.address)).to.equal(1);
        await time.increase(time.duration.days(150));
        await time.advanceBlock();
        const initialUser4Bal = await czusdSc.balanceOf(user4.address);
        await czusdNotesSc.connect(user4).claimPending(user4.address, 0);
        const finalUser4Bal = await czusdSc.balanceOf(user4.address);
        expect(await czusdNotesSc.balanceOf(user4.address)).to.equal(0);
        const [, currYieldPerSecond, totalYield, totalPrinciple, accYield, accPrinciple, totalNotes] = await czusdNotesSc.getAccount(user4.address);
        expect(finalUser4Bal.sub(initialUser4Bal)).to.be.closeTo(expectedTotalYield.mul(9000).div(10000).div(2).add(wad), parseEther("0.00001"));
        expect(totalYield).to.eq(0);
        expect(currYieldPerSecond).to.eq(0);
        expect(totalPrinciple).to.eq(0);
        expect(accYield).to.eq(0);
        expect(accPrinciple).to.eq(0);
        expect(totalNotes).to.eq(0);
    });
    // TEST11: Verify that a user cannot mint a CZusdNote with a face value of less than 50 or more than 25000 CZUSD.
    it("Should not mint a note with a face value of less than 50 or more than 25000 CZUSD", async function () {
        const period = 100;
        const wadA = parseEther("49");
        const wadB = parseEther("25001");
        await czusdSc.connect(czusdAdmin).mint(user1.address, wadA.add(wadB));
        await expect(
            czusdNotesSc.connect(user1).mintNote(user1.address, wadA, period)).to.be.revertedWith(
                "CzusdNotes: Invalid _wad"
            );
        await expect(
            czusdNotesSc.connect(user1).mintNote(user1.address, wadB, period)).to.be.revertedWith(
                "CzusdNotes: Invalid _wad"
            );
    });
    // TEST12: Verify that a user cannot mint a CZusdNote with a lockup period of less than 1 or more than 3652 days.
    it("Should not mint a note with a lockup period of less than 1 or more than 3652 days", async function () {
        const periodA = 0;
        const periodB = 3653;
        const wad = parseEther("100");
        await czusdSc.connect(czusdAdmin).mint(user1.address, wad);
        await expect(
            czusdNotesSc.connect(user1).mintNote(user1.address, wad, periodA)).to.be.revertedWith(
                "CzusdNotes: Invalid _days"
            );
        await expect(
            czusdNotesSc.connect(user1).mintNote(user1.address, wad, periodB)).to.be.revertedWith(
                "CzusdNotes: Invalid _days"
            );
    });
    // TEST13: Verify that a user cannot mint a CZusdNote if the total outstanding principle exceeds 150,000 CZUSD.
    it("Should not mint a note if the total outstanding principle exceeds 150,000 CZUSD", async function () {
        const period = 100;
        const wad = parseEther("150001");
        await czusdSc.connect(czusdAdmin).mint(user1.address, wad);
        await expect(
            czusdNotesSc.connect(user1).mintNote(user1.address, wad, period)).to.be.revertedWith(
                "CzusdNotes: Max principle exceeded"
            );
    });
});