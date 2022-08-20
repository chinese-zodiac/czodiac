// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digital
// If you read this, know that I love you even if your mom doesnt <3
const chai = require('chai');
const { solidity } = require("ethereum-waffle");
chai.use(solidity);

const { expect } = require("chai");
const { ethers, config } = require('hardhat');
const { time } = require("@openzeppelin/test-helpers");
const { toNum, toBN } = require("./utils/bignumberConverter");

const loadJsonFile = require("load-json-file");
const { lsdt, gnosisTreasury, czDeployer } = loadJsonFile.sync("./deployConfig.json");


describe("LSDT", function () {
  let owner, treasury, deployer;
  let lsdtSc, lsdtPatchSc;
  before(async function() {    
    [owner] = await ethers.getSigners();
    await hre.network.provider.request({ 
      method: "hardhat_impersonateAccount",
      params: [czDeployer]
    });
    deployer = await ethers.getSigner(czDeployer);
    console.log("Got deployer");
    
    lsdtSc = await ethers.getContractAt("LSDT",lsdt);
    console.log("Got contracts");

    const LsdtPatchSc = await ethers.getContractFactory("LSDTPatch");
    lsdtPatchSc = await LsdtPatchSc.deploy(lsdt);
    console.log("Deployed lsdtPatchSc");
  });
  it("Should transfer ownership", async function () {
    await lsdtSc.connect(deployer).transferOwnership(lsdtPatchSc.address);
    let lsdtOwner = await lsdtSc.owner();
    expect(lsdtOwner).to.eq(lsdtPatchSc.address);
  });
  it("Should transfer ownership back", async function () {
    await lsdtPatchSc.transferLsdtOwnership(deployer.address);
    let lsdtOwner = await lsdtSc.owner();
    expect(lsdtOwner).to.eq(deployer.address);
  });
  
});