const hre = require("hardhat");
const loadJsonFile = require("load-json-file");
const { lsdt, SilverDollarNfts, CzUstsdReserves } = loadJsonFile.sync("./deployConfig.json");
const lsdtAirdropAddr = "0x95a3a3b824b0D7aBfFBfe48Bc80F2b56616D441d";

const {ethers} = hre;
const { parseEther, formatEther } = ethers.utils;

async function main() {
    const lsdtSc = await ethers.getContractAt("LSDT", lsdt);
    const airdropSc = await ethers.getContractAt("LSDTRewards", lsdtAirdropAddr);
    const ustsdSc = await ethers.getContractAt("JsonNftTemplate", SilverDollarNfts);

    const lsdtToAirdrop = await lsdtSc.balanceOf(lsdtAirdropAddr);
    const ustsdSupply = Number(await ustsdSc.totalSupply());
    console.log(ustsdSupply)

    const eligibleUstsdIds = [];
    const winnerIds = [];
    const winnersToPick = Math.floor(Number(formatEther(lsdtToAirdrop)) / 10);

    for(let i = 0; i<ustsdSupply; i++) {
        const idOwner = await ustsdSc.ownerOf(i);
        if(idOwner.toUpperCase() != CzUstsdReserves.toUpperCase()) {
            console.log(`USTSD ${i} is eligible`);
            eligibleUstsdIds.push(i);
        } else {
            console.log(`USTSD ${i} is not eligible`);
        }
    }
    console.log({eligibleUstsdIds});
    const shuffledUstsdIds = shuffleArray(eligibleUstsdIds);
    console.log({shuffledUstsdIds});
    for(let i = 0; i<winnersToPick; i++){
        let winningId = shuffledUstsdIds.pop();
        console.log(winningId);
        winnerIds.push(winningId)
        await airdropSc.sendAirdrop(winningId,parseEther("10"))
        await delay(5000);
    }
    console.log({winnerIds})
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