import { utils, BigNumber } from 'ethers';


import {
  BLOCK_EXPLORERS,
  CHAIN_CURRENCIES,
  CHAIN_LABELS,
  RPC_URLS,
} from '../constants';

export const addTokenToMetamask = async token => {
  return window.ethereum.request({
    method: 'wallet_watchAsset',
    params: {
      type: 'ERC20',
      options: {
        address: token.address,
        symbol: token.symbol,
        decimals: token.decimals,
      },
    },
  });
};

export const addChainToMetaMask = async chainId => {
  const name = CHAIN_LABELS[chainId];
  const symbol = CHAIN_CURRENCIES[chainId];
  return window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [
      {
        chainId: utils.hexValue(BigNumber.from(chainId)),
        chainName: name,
        nativeCurrency: {
          name:symbol,
          symbol,
          decimals: 18,
        },
        rpcUrls: [RPC_URLS[chainId]],
        blockExplorerUrls: [BLOCK_EXPLORERS[chainId]],
      },
    ],
  }).catch(err => console.log(err));
};
