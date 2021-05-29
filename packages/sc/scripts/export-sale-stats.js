const { ExportToCsv } = require('export-to-csv');
const fs = require('fs')
const hre = require("hardhat");

const {ethers} = hre;
const { formatEther } = ethers.utils;


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
            const deposit = await lockedSale.deposits(buyer);
            console.log("Buyer",index,buyer,formatEther(deposit));
            return {buyer:buyer,tokens:formatEther(deposit.mul("6000000000"))}
        })()
    });
    console.log("Proccessing promises...")
    let results = await Promise.all(resultPromises);
    console.log("results",results);

    const csvData = csvExporter.generateCsv(results,true);
    fs.writeFileSync('sale-stats.csv',csvData)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });