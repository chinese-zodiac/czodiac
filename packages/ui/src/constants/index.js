import { ChainId } from "@pdusedapp/core";
import { parseEther } from "ethers/lib/utils";

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
      logo: "./pool/FG.png"
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
    },
    {
      name: "FG",
      address: "0xD471F0286f74034F91ec3948745A3b7525ed46F4",
      rewardAddress: "0x4492ca0aff6d603e18aea5075b49a5ff76b9ea06",
      rewardDecimals: 9,
      logo: "./pool/FG.png"
    },
    {
      name: "FRT",
      address: "0x88270372aAdf1a5deFf17942f39C581b3F46C80B",
      rewardAddress: "0xd51237a6f3219d186f0c8d8dd957b1bcb3ce5d48",
      rewardDecimals: 18,
      logo: "./pool/FRT.png"
    },
    {
      name: "GAME1",
      address: "0x74b38942a76ed8bb51a69d21b50837098Fc0C0Ce",
      rewardAddress: "0x0E52d24c87A5ca4F37E3eE5E16EF5913fb0cCEEB",
      rewardDecimals: 18,
      logo: "./pool/GAME1.png"
    },
    {
      name: "PRHO",
      address: "0x6C7509d6a87D73B7AcaD0EFB9ea155369a2EC65c",
      rewardAddress: "0x84a4a0df19f80fe00c856c354f05062d281e1a92",
      rewardDecimals: 18,
      logo: "./pool/PRHO.png"
    },
    {
      name: "WBNB",
      address: "0xC84A0581262460F807991A1916BFC41abEb0FC44",
      rewardAddress: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      rewardDecimals: 18,
      logo: "./pool/WBNB.png"
    },
    {
      name: "GUT",
      address: "0xbcB5DF746898d67bfe557b4C773A03136d1b31dd",
      rewardAddress: "0xb6bA8c98021C31A02DD65e9bE97729EbA859d4E2",
      rewardDecimals: 18,
      logo: "./pool/GUT.png"
    },
    {
      name: "LATTE",
      address: "0x34D76dFD93B3E5Fddc4EF730e37B9Ef1F2477c39",
      rewardAddress: "0xa269A9942086f5F87930499dC8317ccC9dF2b6CB",
      rewardDecimals: 18,
      logo: "./pool/LATTE.png"
    },
    {
      name: "MAINST",
      address: "0x4e7545a42Be56E93D1dff1c83Acf867c6fE33E9E",
      rewardAddress: "0x8FC1A944c149762B6b578A06c0de2ABd6b7d2B89",
      rewardDecimals: 9,
      logo: "./pool/MAINST.png"
    },
    {
      name: "DEP",
      address: "0x7a40940316dB31533f7D6462b24274A25Cc1d5f5",
      rewardAddress: "0xcaF5191fc480F43e4DF80106c7695ECA56E48B18",
      rewardDecimals: 18,
      logo: "./pool/DEP.png"
    },
    /*{
      name: "WSOW",
      address: "0xb345f4a196f0B385DA561B51cDD2278f2e019f87",
      rewardAddress: "0xe70d287aad130e2cee520e75d12c6efa4f1a377d",
      rewardDecimals: 18,
      logo: "./pool/WSOW.png"
    }/*,
    {
      name: "GEM",
      address: "0x9a56c4363bd5ca8c6b12433d700f0b9ac3e13eda",
      rewardAddress: "0xbac1df744df160877cdc45e13d0394c06bc388ff",
      rewardDecimals: 18,
      logo: "./pool/GHD.png"
    }*//*,
    {
      name: "GENX",
      address: "0x288739594E0cab36c492CE0BF349F86183C7631f",
      rewardAddress: "0x9aa18a4e73e1016918fa360eed950d9580c9551d",
      rewardDecimals: 18,
      logo: "./pool/GHD.png"
    }*//*,
    {
      name: "DST",
      address: "0x288739594E0cab36c492CE0BF349F86183C7631f",
      rewardAddress: "0x3969fe107bae2537cb58047159a83c33dfbd73f9",
      rewardDecimals: 18,
      logo: "./pool/GHD.png"
    }*/
  ]
}
export const CZUSDPOOLS = {
  [CHAINS.BSC] : [
    {
      name: "DEP",
      address: "0x1E24567fE9D8609079780D84009b1077AC5E5d0E",
      rewardAddress: "0xcaF5191fc480F43e4DF80106c7695ECA56E48B18",
      rewardDecimals: 18,
      logo: "./pool/DEP.png"
    },
    {
      name: "IF1",
      address: "0x17BA75573EC9F03dF3695535165E3F0CCe4FEDfA",
      rewardAddress: "0xfcac1a3ede7b55cc51e3ebff2885a67fbfe01a1a",
      rewardDecimals: 9,
      logo: "./pool/IF1.png"
    }
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
export const CZVAULTPEG = {
  [CHAINS.BSC]: "0xC9bDd74982901F3C231837a07002FA91084B8Abf"
}
export const CZVAULT4BELT = {
  [CHAINS.BSC]: "0xceE0C6a66df916991F3C730108CF8672157380b7"
}

export const STIMFARMS = {
  [CHAINS.BSC] : [
    {
      name: "CZF/BNB on PCS",
      address: "0x547d58c96400235E112Da8920521b38879A7C060",
      asset: "0xeF8e8CfADC0b634b6d0065080a69F139159a17dE",
      isAssetCzfLp: true,
      getLink: "https://pancakeswap.finance/add/0x7c1608C004F20c3520f70b924E2BfeF092dA0043/BNB",
      logo: "./farm/CZF-BNB.jpg"
    },
    {
      name: "CZF/TIGZ on PCS",
      address: "0x479E0afa17a18641E5f424CeeF8A6571b509011c",
      asset: "0xd2a20e23fC707e41Fe4C09f23473A0170d00707e",
      isAssetCzfLp: true,
      getLink: "https://pancakeswap.finance/add/0x535874bfbecac5f235717faea7c26d01c67b38c5/0x7c1608C004F20c3520f70b924E2BfeF092dA0043",
      logo: "./farm/TIGZ-CZF.jpg"
    },
    {
      name: "CZF/BUSD on PCS",
      address: "0x70E4FF914e1376203f08958121BFeD223eE58547",
      asset: "0xAAC96d00C566571bafdfa3B8440Bdc3cDB223Ad0",
      isAssetCzfLp: true,
      getLink: "https://pancakeswap.finance/add/0x7c1608C004F20c3520f70b924E2BfeF092dA0043/0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
      logo: "./farm/CZF-BUSD.jpg"
    },
    {
      name: "CZF/CZUSD on PCS",
      address: "0xd42519D5B188eBe54581CD6DCb423721465b7be1",
      asset: "0x98b5f5e7ec32cda1f3e89936c9972f92296afe47",
      isAssetCzfLp: true,
      getLink: "https://pancakeswap.finance/add/0x7c1608C004F20c3520f70b924E2BfeF092dA0043/0xE68b79e51bf826534Ff37AA9CeE71a3842ee9c70",
      logo: "./farm/CZF-CZUSD.jpg"
    },
    {
      name: "CZF/CAKE on PCS",
      address: "0xfE50d567B98C453Cb5E31C7A21C40c82baA614ff",
      asset: "0x13573b1970611bb401f0b75994c80e16c8f56c35",
      isAssetCzfLp: true,
      getLink: "https://pancakeswap.finance/add/0x7c1608C004F20c3520f70b924E2BfeF092dA0043/0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
      logo: "./farm/CZF-CAKE.jpg"
    },
    {
      name: "CZF/BTCB on PCS",
      address: "0x896045e8C734ECA05d17457D6b3a9a45cDF642F1",
      asset: "0x9C8bae84261eA499c628a4aaD925564766210e64",
      isAssetCzfLp: true,
      getLink: "https://pancakeswap.finance/add/0x7c1608C004F20c3520f70b924E2BfeF092dA0043/0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c",
      logo: "./farm/CZF-BTCB.jpg"
    },
    {
      name: "CZF/ETH on PCS",
      address: "0x7872402901bd41BF91fbDe9971C30d60F53C3b41",
      asset: "0xEcEEC5745Acf050A3a464fd2FAF64c1d683c8616",
      isAssetCzfLp: true,
      getLink: "https://pancakeswap.finance/add/0x7c1608C004F20c3520f70b924E2BfeF092dA0043/0x2170ed0880ac9a755fd29b2688956bd959f933f8",
      logo: "./farm/CZF-ETH.jpg"
    },
    {
      name: "CZF/TIGZ on PCS",
      address: "0xfE9BF9e7367156929776973dAe7765A29d4B92AA",
      asset: "0xd2a20e23fC707e41Fe4C09f23473A0170d00707e",
      isAssetCzfLp: true,
      getLink: "https://pancakeswap.finance/add/0x535874bfbecac5f235717faea7c26d01c67b38c5/0x7c1608C004F20c3520f70b924E2BfeF092dA0043",
      logo: "./farm/TIGZ-CZF.jpg"
    },
    {
      name: "CZF/TIGZHP on PCS",
      address: "0x2741b4F851ED29B529Da57d1741434bFf06714cE",
      asset: "0x36eC3cD5b3dA4E3cc05a49b65EF655564dDbA8ce",
      isAssetCzfLp: true,
      getLink: "https://pancakeswap.finance/add/0x7c1608C004F20c3520f70b924E2BfeF092dA0043/0xDd2F98a97fc2A59b1f0f03DE63B4b41041a339B0",
      logo: "./farm/CZF-TIGZHP.jpg"
    },
    {
      name: "CZF/BNB on PCS",
      address: "0xB0e632ec9b6745842b1441832267A7ba29f46DE1",
      asset: "0xeF8e8CfADC0b634b6d0065080a69F139159a17dE",
      isAssetCzfLp: true,
      getLink: "https://pancakeswap.finance/add/0x7c1608C004F20c3520f70b924E2BfeF092dA0043/BNB",
      logo: "./farm/CZF-BNB.jpg"
    },
    {
      name: "CZF/BUSD on PCS",
      address: "0x805Bca46323e1326557871F3419ad6e71E656D0b",
      asset: "0xAAC96d00C566571bafdfa3B8440Bdc3cDB223Ad0",
      isAssetCzfLp: true,
      getLink: "https://pancakeswap.finance/add/0x7c1608C004F20c3520f70b924E2BfeF092dA0043/0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
      logo: "./farm/CZF-BUSD.jpg"
    },
    {
      name: "CZF/CZUSD on PCS",
      address: "0x448404A587f0edff96501273d6A808A81f81e2E8",
      asset: "0x98b5f5e7ec32cda1f3e89936c9972f92296afe47",
      isAssetCzfLp: true,
      getLink: "https://pancakeswap.finance/add/0x7c1608C004F20c3520f70b924E2BfeF092dA0043/0xE68b79e51bf826534Ff37AA9CeE71a3842ee9c70",
      logo: "./farm/CZF-CZUSD.jpg"
    },
    {
      name: "CZF/ETH on PCS",
      address: "0x45b53051D92eE5058396E3Edcd9ad207Fb85c18b",
      asset: "0xEcEEC5745Acf050A3a464fd2FAF64c1d683c8616",
      isAssetCzfLp: true,
      getLink: "https://pancakeswap.finance/add/0x7c1608C004F20c3520f70b924E2BfeF092dA0043/0x2170ed0880ac9a755fd29b2688956bd959f933f8",
      logo: "./farm/CZF-ETH.jpg"
    },
    {
      name: "CZF/BTCB on PCS",
      address: "0x1ED7072E1463DCE331282640dCB0755fc79Ce4A2",
      asset: "0x9C8bae84261eA499c628a4aaD925564766210e64",
      isAssetCzfLp: true,
      getLink: "https://pancakeswap.finance/add/0x7c1608C004F20c3520f70b924E2BfeF092dA0043/0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c",
      logo: "./farm/CZF-BTCB.jpg"
    },
    {
      name: "CZF/CZUSD on PCS",
      address: "0xbc74f4fB1E39CD16e2547630AA30C3cE3C6eBF2b",
      asset: "0x98b5f5e7ec32cda1f3e89936c9972f92296afe47",
      isAssetCzfLp: true,
      getLink: "https://pancakeswap.finance/add/0x7c1608C004F20c3520f70b924E2BfeF092dA0043/0xE68b79e51bf826534Ff37AA9CeE71a3842ee9c70",
      logo: "./farm/CZF-CZUSD.jpg"
    },
    {
      name: "CZF/BNB on PCS",
      address: "0x2cBBe17b87b201bDb2Ce937eA0a25316716Ad976",
      asset: "0xeF8e8CfADC0b634b6d0065080a69F139159a17dE",
      isAssetCzfLp: true,
      getLink: "https://pancakeswap.finance/add/0x7c1608C004F20c3520f70b924E2BfeF092dA0043/BNB",
      logo: "./farm/CZF-BNB.jpg"
    },
    {
      name: "CZF/TIGZ on PCS",
      address: "0x381467C1346FD0BC486BA373F7918C4e551D8961",
      asset: "0xd2a20e23fC707e41Fe4C09f23473A0170d00707e",
      isAssetCzfLp: true,
      getLink: "https://pancakeswap.finance/add/0x535874bfbecac5f235717faea7c26d01c67b38c5/0x7c1608C004F20c3520f70b924E2BfeF092dA0043",
      logo: "./farm/TIGZ-CZF.jpg"
    }
  ]
}
export const CZFBUYOUTTOKEN = {
  [CHAINS.BSC]: "0xD3505D328e5f0ecF191A5Fd0d04d18B645e4158c"
}
export const CHRONOPOOLSERVICE = {
  [CHAINS.BSC]: "0x5B11FB84ca9bBFA02894d7385bfD0d46F2D30843"
}

export const CHRONOPOOLS = {
  [CHAINS.BSC] : [
    {
      title: "7 DAYS",
      pid: 0
      //ffBasis: 7500,
      //vestPeriod: 604800
      //apr: 30000
    },
    {
      title: "30 DAYS",
      pid: 7
      //ffBasis: 5000,
      //vestPeriod: 2592000
      //apr: 40000
    },
    {
      title: "90 DAYS",
      pid: 1
      //ffBasis: 3000,
      //vestPeriod: 7776000
      //apr: 50000
    },
    {
      title: "1 YEAR",
      pid: 2
      //ffBasis: 500,
      //vestPeriod: 31536000
      //apr: 100000
    },
    {
      title: "18 MONTHS",
      pid: 3
      //ffBasis: 300,
      //vestPeriod: 47304000
      //apr: 130000
    },
    {
      title: "4 YEARS",
      pid: 4
      //ffBasis: 75,
      //vestPeriod: 126144000
      //apr: 200000
    },/*,
    {
      title: "1 CENTURY",
      pid: 5
      //ffBasis: 2,
      //vestPeriod: 3153600000
      //apr: 300000
    },*/
    {
      title: "10 YEARS",
      pid: 6
      //ffBasis: 35,
      //vestPeriod: 315360000
      //apr: 250000
    }
  ]
}

export const EXOTIC_MASTER = {
  [CHAINS.BSC]: "0x37E4dDAfF95d684E1443B5F18C81deD953B627dD"
}


export const EXOTIC_FARMS = {
  [CHAINS.BSC] : [
    {
      title: "CZF/BNB on PCS",
      lp: "0xeF8e8CfADC0b634b6d0065080a69F139159a17dE",
      mintLink: "https://pancakeswap.finance/add/0x7c1608C004F20c3520f70b924E2BfeF092dA0043/BNB",
      baseEmissionRate: parseEther("1000"),
      oracle: "0x1D5D8bF7345D3cB611Dd4A98Fa5F7159Cb6d1451",
      farms: [
        {
          title: "7 DAYS",
          pid: 0
          //ffBasis: 7500,
          //vestPeriod: 604800
          //apr: 30000
        },
        {
          title: "90 DAYS",
          pid: 1
          //ffBasis: 3000,
          //vestPeriod: 7776000
          //apr: 50000
        },
        {
          title: "1 YEAR",
          pid: 2
          //ffBasis: 500,
          //vestPeriod: 31536000
          //apr: 100000
        }
      ]
    },
    {
      title: "CZF/BUSD on PCS",
      lp: "0xAAC96d00C566571bafdfa3B8440Bdc3cDB223Ad0",
      mintLink: "https://pancakeswap.finance/add/0x7c1608C004F20c3520f70b924E2BfeF092dA0043/0xe9e7cea3dedca5984780bafc599bd69add087d56",
      baseEmissionRate: parseEther("1000"),
      oracle: "0x741b0D9Bf195e7bE74DE138B7B5F7e7328d65f12",
      farms: [
        {
          title: "7 DAYS",
          pid: 3
          //ffBasis: 7500,
          //vestPeriod: 604800
          //apr: 30000
        },
        {
          title: "90 DAYS",
          pid: 4
          //ffBasis: 3000,
          //vestPeriod: 7776000
          //apr: 50000
        },
        {
          title: "1 YEAR",
          pid: 5
          //ffBasis: 500,
          //vestPeriod: 31536000
          //apr: 100000
        }
      ]
    }
  ]
}

export const LOSS_COMPENSATION = {
  [CHAINS.BSC]: "0xEf726680cB505fD6A6006Ce3A5b25f8c9EbF64Fb"
}