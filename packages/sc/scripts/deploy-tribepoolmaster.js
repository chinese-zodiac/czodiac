const hre = require("hardhat");
const loadJsonFile = require("load-json-file");

const { ethers } = hre;
const { parseEther } = ethers.utils;

const { zeroAddress, czr, czusd, lrt, lsdt, oneBadRabbit, dgod, czodiacGnosis, deployer
} = loadJsonFile.sync("./deployConfig.json");

const ITERABLE_ARRAY = "0x4222FFCf286610476B7b5101d55E72436e4a6065";

async function main() {

    const TribePoolMaster = await ethers.getContractFactory("TribePoolMaster", {
        libraries: {
            IterableArrayWithoutDuplicateKeys: ITERABLE_ARRAY
        }
    });
    const tribePoolMasterSc = await TribePoolMaster.deploy();
    await tribePoolMasterSc.deployed();
    console.log("TribePoolMaster deployed to:", tribePoolMasterSc.address);

    console.log("granting permissions...")
    await delay(15000);
    await tribePoolMasterSc.grantRole(ethers.utils.id("MANAGER_SETTINGS"), czodiacGnosis);
    await delay(15000);
    await tribePoolMasterSc.grantRole(ethers.utils.id("MANAGER_POOLS"), czodiacGnosis);

    //czodiacGnosis needs to assign below
    //await czusdSc.connect(czusdAdmin).grantRole(ethers.utils.id("SAFE_GRANTER_ROLE"), tribePoolMasterSc.address);
    //await czrSc.connect(czusdAdmin).grantRole(ethers.utils.id("SAFE_GRANTER_ROLE"), tribePoolMasterSc.address);

    //To add a pool, the manager needs to do below (should be czodiacGnosis)
    /*
    await tribePoolMasterSc.addTribePool(
        lrtSc.address,//IERC20Metadata _tribeToken,
        false,//bool _isLrtWhitelist,
        1000,//uint256 _weight,
        owner.address//address _owner
    );
    //Then will need to whitelist the TribePool on the tribe token contract.

    //and to update czusd per second
    await tribePoolMasterSc.setCzusdPerSecond(parseEther("250").div(86400));
    
    */
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
