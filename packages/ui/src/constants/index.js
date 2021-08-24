import { ChainId } from "@pdusedapp/core";

export const CHAINS = {
  ...ChainId,
  BSC: 56,
  BSCTestnet: 97,
};

export const SUPPORT_CHAINS = [
  CHAINS.Mainnet,
  CHAINS.Rinkeby,
  CHAINS.BSC,
  CHAINS.BSCTestnet,
  CHAINS.xDai,
];

export const CHAIN_LABELS = {
  [CHAINS.Mainnet]: "ETH Mainnet",
  [CHAINS.Rinkeby]: "ETH Rinkeby",
  [CHAINS.BSC]: "BSC Mainnet",
  [CHAINS.BSCTestnet]: "BSC Testnet",
  [CHAINS.xDai]: "xDai",
};

export const CHAIN_CURRENCIES = {
  [CHAINS.Mainnet]: "ETH",
  [CHAINS.Rinkeby]: "ETH",
  [CHAINS.BSC]: "BNB",
  [CHAINS.BSCTestnet]: "BNB",
  [CHAINS.xDai]: "xDAI",
};

export const RPC_URLS = {
  [CHAINS.Mainnet]: `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA}`,
  [CHAINS.Rinkeby]: `https://rinkeby.infura.io/v3/${process.env.REACT_APP_INFURA}`,
  [CHAINS.BSC]: "https://bsc-dataseed.binance.org/",
  [CHAINS.BSCTestnet]: "https://data-seed-prebsc-1-s2.binance.org:8545/",
  [CHAINS.xDai]: "https://rpc.xdaichain.com",
};

export const BLOCK_EXPLORERS = {
  [CHAINS.Mainnet]: `https://etherscan.io`,
  [CHAINS.Rinkeby]: `https://rinkeby.etherscan.io`,
  [CHAINS.BSC]: "https://bscscan.com",
  [CHAINS.BSCTestnet]: "https://testnet.bscscan.com",
  [CHAINS.xDai]: "https://blockscout.com/xdai/mainnet",
};

export const MUTICALL_ADDRESSES = {
  [CHAINS.BSC]: "0x1Ee38d535d541c55C9dae27B12edf090C608E6Fb",
  [CHAINS.BSCTestnet]: "0x6e5bb1a5ad6f68a8d7d6a5e47750ec15773d6042",
  [CHAINS.xDai]: "0xb5b692a88bdfc81ca69dcb1d924f59f0413a602a"
};

export const CZODIAC_ADDRESSES = {
  OxZodiac: {
    [CHAINS.BSC]: "0x58A39ceEcC7B5b1497c39fa8e12Dd781C4fAfaFc",
    [CHAINS.BSCTestnet]: "0xEee665826342D2297CDdA640e8F206Ad2aD0cE7C",
  },
  TigerZodiac: {
    [CHAINS.BSC]: "0x535874BfBECaC5f235717FAEA7C26d01C67B38c5",
  }
}

export const LOCKEDSALE_ADDRESSES = {
  [CHAINS.BSC]: "0x4e1d0E46540309F50E8c90D5c238122EeF663d55",
  [CHAINS.BSCTestnet]: "0x573D074191fbAC246214d16cEc67544c5CC2aB49",
}

export const AUTOFARM_ADDRESSES = {
  [CHAINS.BSC]: "0x340674E7Ab3eedE434f319ECF13094176E98c4E7",
}

export const TIGERHP_ADDRESSES = {
  [CHAINS.BSC]: "0xDd2F98a97fc2A59b1f0f03DE63B4b41041a339B0",
}

export const TIGERHUNT_ADDRESSES = {
  [CHAINS.BSC]: "0xcC585DD2D5B2159bA01871e6645c02FcBEEAf7Dd",
}

export const BUSD_ADDRESSES = {
  [CHAINS.BSC]: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
  [CHAINS.BSCTestnet]: "0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee"
}

export const WETH_ADDRESSES = {
  [CHAINS.BSC]: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
}

export const UNISWAPFACTORY_ADDRESSES = {
  [CHAINS.BSC]: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73"
}

export const CZFARM_ADDRESSES = {
  [CHAINS.BSC]: "0x7c1608C004F20c3520f70b924E2BfeF092dA0043"
}

export const CZFARMMASTER_ADDRESSES = {
  [CHAINS.BSC]: "0x57ceeB745370cdB666d0b771DCA2173C4e677141"
}

export const CZFARMPOOLFACTORY_ADDRESSES = {
  [CHAINS.BSC]: "0xBA8A16Fd1Bc596F7BAFD0640c65d4281dA9d43DB"
}