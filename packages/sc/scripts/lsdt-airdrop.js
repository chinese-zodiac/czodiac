const hre = require("hardhat");
const loadJsonFile = require("load-json-file");
const { lsdt, SilverDollarNfts, CzUstsdReserves, Gangs, EntityStoreERC721 } = loadJsonFile.sync("./deployConfig.json");
const lsdtAirdropAddr = "0x95a3a3b824b0D7aBfFBfe48Bc80F2b56616D441d";

const { ethers } = hre;
const { parseEther, formatEther } = ethers.utils;

async function main() {
  const lsdtSc = await ethers.getContractAt("LSDT", lsdt);
  const airdropSc = await ethers.getContractAt("LSDTRewards", lsdtAirdropAddr);
  const ustsdSc = await ethers.getContractAt("JsonNftTemplate", SilverDollarNfts);
  const gangsSc = await ethers.getContractAt("IERC721Enumerable", Gangs);
  const erc721EnumberableSc = await ethers.getContractAt("EntityStoreERC721", EntityStoreERC721);

  const lsdtToAirdrop = await lsdtSc.balanceOf(lsdtAirdropAddr);
  const ustsdSupply = Number(await ustsdSc.totalSupply());
  console.log(ustsdSupply)

  const gangStats = [];
  let totalStrength = 0;
  const winners = [];
  const winnersToPick = Math.floor(Number(formatEther(lsdtToAirdrop)) / 5);
  for (let i = 0; i < await gangsSc.totalSupply(); i++) {
    const gangOwner = await gangsSc.ownerOf(i);
    const gangUstsdCount = Number((await erc721EnumberableSc.getStoredERC721CountFor(Gangs, i, SilverDollarNfts)).toString())
    totalStrength += gangUstsdCount;
    let cutoff = totalStrength;
    gangStats.push({
      gangOwner,
      gangUstsdCount,
      cutoff,
      gangId: i
    });
  }

  for (let i = 0; i < winnersToPick; i++) {
    let roll = Math.random() * totalStrength;
    let winnerGangId;
    for (let j = 0; j < gangStats.length; j++) {
      if (gangStats[j].cutoff < roll) {
        winnerGangId = gangStats[j].gangId;
      } else {
        winners.push(winnerGangId);
        await airdropSc.sendAirdrop(winnerGangId, parseEther("5"))
        await delay(5000);
        break;
      }
    }
  }
  console.log({ winners });
}

function shuffleArray(array) {
  let curId = array.length;
  // There remain elements to shuffle
  while (0 !== curId) {
    // Pick a remaining element
    let randId = Math.floor(Math.random() * curId);
    curId -= 1;
    // Swap it with the current element.
    let tmp = array[curId];
    array[curId] = array[randId];
    array[randId] = tmp;
  }
  return array;
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });