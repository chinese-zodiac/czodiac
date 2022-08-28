const { ExportToCsv } = require('export-to-csv');
const fs = require('fs')
const hre = require("hardhat");
const parse = require('csv-parse/lib/sync');
const path = require('path');
const LineByLineReader = require('line-by-line');

const {ethers} = hre;
const { formatEther, parseEther } = ethers.utils;


const poolAddress = "0x88B77333FAf12E49e7c98bc69898756787D9FA41";

async function main() {
    const csvExporter = new ExportToCsv({
        fieldSeparator: ',',
        quoteStrings: '',
        decimalSeparator: '.',
        showLabels: true, 
        showTitle: true,
        title: 'pool-bal',
        useTextFile: false,
        useBom: true,
        useKeysAsHeaders: true,
    });

    const pool = await ethers.getContractAt("CZFarmPoolNftSlottableTaxFree", poolAddress);

    let output = []
    const lr = new LineByLineReader(
        path.resolve(__dirname, '..', 'pool-migration.csv')
    );  
    lr.on('line', function(line) {
        lr.pause();
        (async()=>{
            console.log("line1",line);
            if(typeof(line)==undefined) return;
            //do something with csvrow
            let retry = true
            while(retry){
                try{
                    let pending = await pool.pendingReward(line);
                    const isValid = pending.gte(parseEther("1"));
                    if(isValid) output.push([line,formatEther(pending)]);
                    lr.resume();
                    retry = false;
                } catch (err) {
                    console.log(err.code)
                    if(err.code == "INVALID_ARGUMENT" || err.code=="UNSUPPORTED_OPERATION") {
                        console.log("skipping");
                        lr.resume();
                        retry = false;
                    } else {
                        console.log({err})
                        console.log("retrying")
                        retry = true;
                    }
                }
            }
        })();
    });
    lr.on('end',async function() {    
        const csvData = csvExporter.generateCsv(output,true);
        fs.writeFileSync('pool-pending.csv',csvData)
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