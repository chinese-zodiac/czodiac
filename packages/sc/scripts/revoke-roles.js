const hre = require("hardhat");
const loadJsonFile = require("load-json-file");

const { ethers } = hre;
const { parseEther } = ethers.utils;

const REVOKES = [
    {
        address: "0xC830413b30b3BfDEf1cC6A2c06AbCCC45eD38581",
        role: ethers.utils.id("DROPSENDER_ROLE"),
        members: [
            "0x07b950f0AecAdc66061216bb721b6B2ee0d75f40",
            "0x70e1cB759996a1527eD1801B169621C18a9f38F9",
        ]
    },/*
    {
        address: "0xE68b79e51bf826534Ff37AA9CeE71a3842ee9c70",
        role: ethers.utils.id("SAFE_GRANTER_ROLE"),
        members: [
            "0xCd897a5Ca3643DD946BC4bC7130251E0Efb34E26",
            "0x745A676C5c472b50B50e18D4b59e9AeEEc597046",
        ]
    },
    {
        address: "0xE68b79e51bf826534Ff37AA9CeE71a3842ee9c70",
        role: ethers.utils.id("PAUSER_ROLE"),
        members: [
            "0x6ddC966b6d97ddeb4cdA1224dC941d1a7E09bdEa",
            "0x745A676C5c472b50B50e18D4b59e9AeEEc597046",
        ]
    },/*
    {
        address: "0x7c1608C004F20c3520f70b924E2BfeF092dA0043",
        role: "0x0000000000000000000000000000000000000000000000000000000000000000",
        members: [
            "0x37E4dDAfF95d684E1443B5F18C81deD953B627dD",
            "0xEf726680cB505fD6A6006Ce3A5b25f8c9EbF64Fb",
            "0x5B11FB84ca9bBFA02894d7385bfD0d46F2D30843",
        ]
    },*/
]

async function main() {
    for (let i = 0; i < REVOKES.length; i++) {
        let contract = await ethers.getContractAt("IAccessControlEnumerable", REVOKES[i].address);
        for (let j = 0; j < REVOKES[i].members.length; j++) {
            console.log("revoking on", REVOKES[i].address, "role", REVOKES[i].role, "for", REVOKES[i].members[j])
            await contract.revokeRole(REVOKES[i].role, REVOKES[i].members[j]);
            console.log("waiting 10s")
            await delay(10000);
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

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}