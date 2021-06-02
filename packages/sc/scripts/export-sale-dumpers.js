const { ExportToCsv } = require('export-to-csv');
const fs = require('fs')
const hre = require("hardhat");

const {ethers} = hre;
const { formatEther, parseEther } = ethers.utils;


const saleAddress = "0x4e1d0E46540309F50E8c90D5c238122EeF663d55";
const oxzAddress = "0x58A39ceEcC7B5b1497c39fa8e12Dd781C4fAfaFc"

async function main() {
    const csvExporter = new ExportToCsv({
        fieldSeparator: ',',
        quoteStrings: '',
        decimalSeparator: '.',
        showLabels: true, 
        showTitle: true,
        title: 'sale-stats',
        useTextFile: false,
        useBom: true,
        useKeysAsHeaders: true,
    });

    const LockedSale = await hre.ethers.getContractFactory("LockedSale");
    const OxzToken = await hre.ethers.getContractFactory("CZodiacToken");
    const lockedSale = LockedSale.attach(saleAddress);
    const oxzToken = OxzToken.attach(oxzAddress);

    const totalBuyers = (await lockedSale.totalBuyers()).toNumber();
    console.log("Total buyers",totalBuyers);

    let resultPromises = Array.apply(null, Array(totalBuyers)).map((_,index,__)=>{
        console.log("creating promise",index)
        return (async ()=>{
            const buyer = await lockedSale.buyers(index);
            console.log(index,"Buyer found", buyer);
            const deposit = await lockedSale.deposits(buyer);
            console.log(index,"Deposit found", formatEther(deposit));
            const currentBalance = await oxzToken.balanceOf(buyer);
            console.log(index,"isDumper",currentBalance.lt(parseEther("1")),formatEther(currentBalance));
            return {buyer:buyer,isDumper:currentBalance.lt(parseEther("1")),tokens:formatEther(deposit.mul("6000000000")), currentBalance:formatEther(currentBalance)}
        })()
    });
    console.log("Proccessing promises...")
    let results = await Promise.all(resultPromises);

    const csvData = csvExporter.generateCsv(results,true);
    fs.writeFileSync('sale-dumpers.csv',csvData)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });