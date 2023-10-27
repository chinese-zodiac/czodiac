const { Wallet, utils } = require("ethers");
const { HDNode } = require("ethers/lib/utils");
const hre = require("hardhat");
const loadJsonFile = require("load-json-file");
const { mnemonic } = loadJsonFile.sync("./networkConfig.json");
const { lsdt, lrt, dgod, gem, brag, divi, czred, czusd, czusdNotes, tribePoolMaster,
    SilverDollarTypePriceSheet, SilverDollarNfts } = loadJsonFile.sync("./deployConfig.json");

const { ethers } = hre;
const { BigNumber } = ethers;
const { parseEther, formatEther } = ethers.utils;

const count = 25;
const bnbPerWallet = parseEther("0.05")
const czusdPerWallet = parseEther("350")
const czrPerWallet = parseEther("1000")

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    const wallets = Array.from(
        { length: count },
        (e, i) => Wallet.fromMnemonic(mnemonic, `m/44'/60'/0'/0/${i}`).connect(ethers.provider)
    );
    wallets.forEach((w, i) => {
        console.log(w.address);
    });
    wallets.forEach((w, i) => {
        console.log(w.privateKey);
    });

    //BNB
    for (let i = 0; i < count - 1; i++) {
        const w1 = wallets[i];
        const w2 = wallets[i + 1];
        const bal = await w1.getBalance()
        if (bal.gte(bnbPerWallet.add(parseEther("0.005")))) {
            const wad = bal.sub(bnbPerWallet).sub(parseEther("0.005")).add(parseEther((Math.random() * 0.01).toFixed(18)));
            console.log(`${formatEther(wad)} BNB`);
            let tx = await w1.sendTransaction({
                to: w2.address,
                value: wad
            })
            await tx.wait();
            await delay(15000);
        }
    }


    //czusd
    const czusdSc = await ethers.getContractAt("CZUsd", czusd);
    for (let i = 0; i < count - 1; i++) {
        const w1 = wallets[i];
        const w2 = wallets[i + 1];
        console.log(`czusd running ${i} transfer from ${w1.address}`)
        const bal = await czusdSc.balanceOf(w1.address);
        if (bal.gte(czusdPerWallet.add(parseEther("100")))) {
            const wad = bal.sub(czusdPerWallet).sub(parseEther("100")).add(parseEther((Math.random() * 200).toFixed(18)));
            console.log(`${formatEther(wad)} CZUSD`);
            let tx = await czusdSc.connect(w1).transfer(w2.address, wad)
            await tx.wait();
            await delay(15000);
        }
    }


    //czr
    const czredSc = await ethers.getContractAt("IERC20", czred);
    for (let i = 0; i < count - 1; i++) {
        const w1 = wallets[i];
        const w2 = wallets[i + 1];
        console.log(`czr running ${i} transfer from ${w1.address}`)
        const bal = await czredSc.balanceOf(w1.address);
        if (bal.gte(czrPerWallet.add(parseEther("200")))) {
            const wad = bal.sub(czrPerWallet).sub(parseEther("200")).add(parseEther((Math.random() * 400).toFixed(18)))
            console.log(`${formatEther(wad)} CZR`);
            let tx = await czredSc.connect(w1).transfer(w2.address, wad)
            await tx.wait();
            await delay(15000);
        }
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });