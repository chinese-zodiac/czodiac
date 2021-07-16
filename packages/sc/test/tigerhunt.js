// SPDX-License-Identifier: GPL-3.0
// Authored by Plastic Digits
// If you read this, know that I love you even if your mom doesnt <3
const chai = require('chai');
const { solidity } = require("ethereum-waffle");
chai.use(solidity);

const { ethers, config } = require('hardhat');
const { time } = require("@openzeppelin/test-helpers");
const { toNum, toBN } = require("./utils/bignumberConverter");

const loadJsonFile = require("load-json-file");
const { uniswapRouterAddress, zeroAddress } = loadJsonFile.sync("./deployConfig.json");

const { expect } = chai;
const { parseEther } = ethers.utils;

describe("Tiger Hunt", function() {
    let tigz, oxz, tighp, tighunt;

    before(async function() {
        const CZodiacToken = await ethers.getContractFactory("CZodiacToken");
        tigz = await CZodiacToken.deploy(
            autoFarm.address, // address _autofarm
            zeroAddress,// IERC20 _prevCzodiac
            "01czodiac", //string memory _name
            "01c", //string memory _symbol
            0,//uint256 _swapStartTimestamp
            0//uint256 _swapEndTimestamp
        );
        await tigz.deployed();
        oxz = await CZodiacToken.deploy(
            autoFarm.address, // address _autofarm
            zeroAddress,// IERC20 _prevCzodiac
            "01czodiac", //string memory _name
            "01c", //string memory _symbol
            0,//uint256 _swapStartTimestamp
            0//uint256 _swapEndTimestamp
        );
        await oxz.deployed();

        const TigerHPToken = await ethers.getContractFactory("TigerHuntPoints");
        tighp = await CZodiacToken.deploy();
        await tighp.deployed();

        const TigerHunt = await ethers.getContractFactory("TigerHunt");
        tighunt = await CZodiacToken.deploy();
        await tighunt.deployed();
    })
})

