const hre = require("hardhat");
const loadJsonFile = require("load-json-file");
const { lsdt, lrt, dgod, gem, brag, divi, czred, czusd, czusdNotes, tribePoolMaster,
    SilverDollarTypePriceSheet, SilverDollarNfts } = loadJsonFile.sync("./deployConfig.json");

const { ethers } = hre;
const { BigNumber } = ethers;
const { parseEther, formatEther } = ethers.utils;



const users = []




async function main() {
    const czusdNotesSc = await ethers.getContractAt("CzusdNotes", czusdNotes);

    const ustsdNftSc = await ethers.getContractAt("IERC721Enumerable", SilverDollarNfts);
    const ustsdPriceSheetSc = await ethers.getContractAt("SilverDollarTypePriceSheet", SilverDollarTypePriceSheet);

    const tribePoolMasterSc = await ethers.getContractAt("TribePoolMaster", tribePoolMaster);
    const tribePools = await Promise.all(
        Array(
            (await tribePoolMasterSc.getTribePoolCount()).toNumber()
        ).fill(0).map((val, index) => {
            return (async () => {
                return await
                    (await ethers.getContractAt("TribePool", (
                        await tribePoolMasterSc.getTribePoolAddress(index)
                    ))).stakeWrapperToken();
            })();
        })
    );
    const tokens = [
        {
            address: lsdt,
            price: parseEther("11.564")
        },
        {
            address: lrt,
            price: parseEther("8.8960")
        },
        {
            address: dgod,
            price: parseEther("0.000016193")
        },
        {
            address: gem,
            price: parseEther("0.11658")
        },
        {
            address: brag,
            price: parseEther("0.00014836")
        },
        {
            address: divi,
            price: parseEther("0.000057743")
        },
        {
            address: czred,
            price: parseEther("2.6653")
        },
        {
            address: czusd,
            price: parseEther("1")
        },
        ...tribePools.map((wrapperAddress) => ({
            address: wrapperAddress,
            price: parseEther("2.6653")
        }))
    ]

    const userTokensValue = await Promise.all(users.map((user) => {
        return (async () => {
            return (await Promise.all([
                //for tribe tokens and tribe pools
                ...(tokens.map((value) => {
                    return (async () => {
                        const token = await ethers.getContractAt("IERC20", value.address);
                        const bal = await token.balanceOf(user);
                        return bal.mul(value.price).div(parseEther("1"));
                    })()
                })),
                //for czusd notes
                (async () => {
                    const { totalPrinciple_, accPrinciple_, accYield_ } = await czusdNotesSc.getAccount(user);
                    return totalPrinciple_.add(accPrinciple_).add(accYield_);
                })(),
                //for USTSD nfts
                (async () => {
                    const nftIds = await Promise.all(Array(
                        (await ustsdNftSc.balanceOf(user)).toNumber()
                    ).fill(0).map((val, index) => {
                        return ustsdNftSc.tokenOfOwnerByIndex(user, index);
                    }));
                    const valueCents = await ustsdPriceSheetSc.getCoinNftSum(
                        ustsdNftSc.address,
                        nftIds
                    );
                    return BigNumber.from(valueCents).mul(parseEther("1")).div(100)
                })()
            ])

            ).reduce((acc, val) => acc.add(val), parseEther("0"))
        })()
    }));

    console.log(userTokensValue)

    console.log(userTokensValue.map((val) => formatEther(val)));






}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });