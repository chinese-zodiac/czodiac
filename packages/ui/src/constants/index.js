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

export const CZFARMPOOLS = {
  [CHAINS.BSC] : [
    {
      name: "TIGZ",
      address: "0xeAAe8daEe860eFc43851d4234eB944F8C9B5f968",
      rewardAddress: "0x535874bfbecac5f235717faea7c26d01c67b38c5",
      rewardDecimals: 18,
      logo: "https://storageapi.fleek.co/plasticdigits-team-bucket/common-files/tigz200.png"
    },
    {
      name: "CZF",
      address: "0x7981fed94a74e3b92a8974b5fe20c9359b695d12",
      rewardAddress: "0x7c1608C004F20c3520f70b924E2BfeF092dA0043",
      rewardDecimals: 18,
      logo: "https://storageapi.fleek.co/plasticdigits-team-bucket/czfarm/czf-logo-200.png"
    },
    {
      name: "FG",
      address: "0xB7987823D1208A75780Be7d2C171A5c74fDbb74b",
      rewardAddress: "0x4492ca0aff6d603e18aea5075b49a5ff76b9ea06",
      rewardDecimals: 18,
      logo: "./pool/farmageddon.png"
    },
    {
      name: "GHD",
      address: "0x009d28c1fcb9ba2256ed07c92049bd2a57f5ab00",
      rewardAddress: "0xfdfd27ae39cebefdbaac8615f18aa68ddd0f15f5",
      rewardDecimals: 18,
      logo: "./pool/GHD.png"
    },
    {
      name: "IF1",
      address: "0x6e35fdf5071f7c2d0f53532710135055a305731a",
      rewardAddress: "0xfcac1a3ede7b55cc51e3ebff2885a67fbfe01a1a",
      rewardDecimals: 9,
      logo: "./pool/IF1.png"
    },
    {
      name: "CZF",
      address: "0x8c7678cd08580d4ba55dff215229c6e6cb6b6df4",
      rewardAddress: "0x7c1608C004F20c3520f70b924E2BfeF092dA0043",
      rewardDecimals: 18,
      logo: "https://storageapi.fleek.co/plasticdigits-team-bucket/czfarm/czf-logo-200.png"
    },
    {
      name: "FINS",
      address: "0xe05A2888De69602B85e23Da67A8EaEdefc3E9E19",
      rewardAddress: "0x1b219Aca875f8C74c33CFF9fF98f3a9b62fCbff5",
      rewardDecimals: 18,
      logo: "./pool/FINS.png"
    }/*,
    {
      name: "DST",
      address: "0x288739594E0cab36c492CE0BF349F86183C7631f",
      rewardAddress: "0x3969fe107bae2537cb58047159a83c33dfbd73f9",
      logo: "./pool/GHD.png"
    }*/
  ]
}

export const ORACLES = {
  CZFBUSD : {
    [CHAINS.BSC] : "0x27ce3f6478c35f333659997ec6903c1b67153678"
  },  
  CZFCZUSD : {
    [CHAINS.BSC] : "0x7a9Bb0c5Aa35bf8ccf8B5BBeD07a79Ddb3708232"
  }  
}

export const BNB = {
  [CHAINS.BSC]: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
}

export const CZUSD = {
  [CHAINS.BSC]: "0xE68b79e51bf826534Ff37AA9CeE71a3842ee9c70"
}

export const CZUSDBORROWCZF = {
  [CHAINS.BSC]: "0xF59c6C43e499fDFDA3cE3BDe0174a7143a75A86e"
}

export const UPDATEORACLES = {
  [CHAINS.BSC]: "0x3957e172A6F21AF498c50C76b8A4Fcd3e97f3AAe"
}

export const CZFARMMASTERTIMELOCK = {
  [CHAINS.BSC]: "0x8b02ebcC97065C011d6f50F20FF9bbA538A2bC04"
}

export const CZFARMMASTERROUTABLE = {
  [CHAINS.BSC]: "0xb302842797486e3D0314E78E1844b97b3350F7F1"
}
export const CZVAULTROUTER = {
  [CHAINS.BSC]: "0xe4548FE50F46766DD951c2ff5cB834D3e262007E"
}
export const BELTPRICEPERSHARELAST = {
  [CHAINS.BSC]: "0xFd1B29b54A426B8153f471c5502Dc0F986ECB27c"
}

export const CZVAULTS = {
  [CHAINS.BSC] : [
    {
      name: "BNB → BNB+CZF",
      baseAssetName: "BNB",
      description: "Autocompound BNB and claim CZF rewards. This Antidump Vault uses Belt.fi.",
      isBnbVault: true, //Flag so UI knows whether to use router for BNB verses ERC20
      assetAddress: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB address (not used for BNB vault but needed for prices)
      vaultAddress: "0xa9f458F907F628495773e10190EAc81078bABc03", //czfBeltBNB address
      strategyAddress: "0xa8bb71facdd46445644c277f9499dd22f6f0a30c", //beltBNB
      lpCzfAddress: "0xeF8e8CfADC0b634b6d0065080a69F139159a17dE", //CZF-BNB : Used to calculate prices
      pid: 0,
      rewardAddress: "0x7c1608C004F20c3520f70b924E2BfeF092dA0043", // CZF address
      rewardDecimals: 18,
      logo: "./vault/BNB.png" // BNB icon
    },
  ],
}
