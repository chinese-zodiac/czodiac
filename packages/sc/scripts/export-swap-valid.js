const { ExportToCsv } = require('export-to-csv');
const fs = require('fs')
const hre = require("hardhat");
const parse = require('csv-parse/lib/sync');
const path = require('path');
const LineByLineReader = require('line-by-line');

const {ethers} = hre;
const { formatEther, parseEther } = ethers.utils;


const oxzAddress = "0x58A39ceEcC7B5b1497c39fa8e12Dd781C4fAfaFc"

async function main() {
    const csvExporter = new ExportToCsv({
        fieldSeparator: ',',
        quoteStrings: '',
        decimalSeparator: '.',
        showLabels: true, 
        showTitle: true,
        title: 'swap-oxz-tigz-valid',
        useTextFile: false,
        useBom: true,
        useKeysAsHeaders: true,
    });

    const OxzToken = await hre.ethers.getContractFactory("CZodiacToken");
    const oxzToken = OxzToken.attach(oxzAddress);

    let results = []
    const lr = new LineByLineReader(
        path.resolve(__dirname, '..', 'swap-oxz-tigz.csv')
    );    
    lr.on('line', function(line) {
        lr.pause();
        (async()=>{
            console.log(line);
            //do something with csvrow
            let retry = true
            let currentBalance
            while(retry){
                try{
                    currentBalance = await oxzToken.balanceOf(line);
                    const isValid = currentBalance.gte(parseEther("1"));
                    console.log("isvalid",isValid);
                    if(isValid) results.push(line);
                    lr.resume();
                    retry = false;
                } catch (err) {
                    console.log(err.code)
                    if(err.code == "INVALID_ARGUMENT") {
                        console.log("skipping");
                        lr.resume();
                        retry = false;
                    } else {
                        console.log("retrying")
                        retry = true;
                    }
                }
            }
        })();
    })
    lr.on('end',async function() {    
        const csvData = csvExporter.generateCsv(results,true);
        fs.writeFileSync('swap-oxz-tigz-valid.csv',csvData)
    });

    
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => {
      
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });