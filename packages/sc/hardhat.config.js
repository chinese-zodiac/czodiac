require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-web3");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("solidity-coverage");
const loadJsonFile = require("load-json-file");
const networkConfig = loadJsonFile.sync("./networkConfig.json");


/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          }
        }
      }
    ],
  },
  mocha: {
    timeout: 60000,
  },
  networks: {
    hardhat: {
      forking: {
        url: `https://bsc-dataseed.binance.org`
      }
    },
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${networkConfig.rpcKey}`,
      accounts: [networkConfig.ethKey],
      gasMultiplier: 1.2,
    },
    mainnet: {
      url: `https://eth-mainnet.alchemyapi.io/v2/${networkConfig.rpcKey}`,
      accounts: [networkConfig.ethKey],
      gasMultiplier: 1.2,
    },
    xdai: {
      url: `https://rpc.xdaichain.com`,
      accounts: [networkConfig.ethKey],
      gasMultiplier: 1.2,
    },
    matic: {
      url: `https://rpc-mainnet.maticvigil.com`,
      accounts: [networkConfig.ethKey],
      gasMultiplier: 1.2,
    },
    bsc: {
      url: `https://bsc-dataseed.binance.org`,
      accounts: [networkConfig.ethKey],
      gasMultiplier: 1.2,
    }
  }
};

