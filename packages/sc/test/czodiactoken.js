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

describe("CZodiacToken", function() {

  let czodiacToken1, czodiacToken2, czodiacToken3;

  before(async function() {
    await time.advanceBlock();
    const now = await time.latest()

    const CZodiacToken = await ethers.getContractFactory("CZodiacToken");
    czodiacToken1 = await CZodiacToken.deploy(
      uniswapRouterAddress, // IUniswapV2Router02 _uniswapV2Router
      zeroAddress,// IERC20 _prevCzodiac
      "01czodiac", //string memory _name
      "01c", //string memory _symbol
      now.add(time.duration.days(25)).toNumber(),//uint256 _swapStartTimestamp
      now.add(time.duration.days(30)).toNumber()//uint256 _swapEndTimestamp
    );
    await czodiacToken1.deployed();
  })

  it("Should return the new greeting once it's changed", function() {
    expect(0).to.equal(0)
  });
});
