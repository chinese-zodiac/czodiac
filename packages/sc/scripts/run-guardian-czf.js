const hre = require("hardhat");
const loadJsonFile = require("load-json-file");
const {
  guardian, czf,
} = require("../deployConfig.json");

const { ethers } = hre;
const { parseEther } = ethers.utils;

async function main() {
  const czfToken = await ethers.getContractAt("CZFarm", czf);
  const guardianSc = await ethers.getContractAt("Guardian", guardian);

  const bots = [
    
  ];

  while (true) {
    try {
      const botsWithCzf = [];
      console.log(bots);
      console.log(bots.length);
      for (let i = 0; i < bots.length; i++) {
        const botCzfBal = await czfToken.balanceOf(bots[i]);
        console.log("Bot:", bots[i]);
        console.log("Botbal:", botCzfBal);
        if (botCzfBal.gte(parseEther("100000"))) {
          botsWithCzf.push(bots[i]);
        }
      }
      if (botsWithCzf.length > 0) {
        console.log("Found bots:", botsWithCzf.length);
        await guardianSc.recover(botsWithCzf, { gasLimit: 500000, gasPrice: 6100000000 });
        await delay(15000);
      } else {
        console.log("No bots found");
      }
    } catch (e) { console.log(e) }
    await delay(15000);
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

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}