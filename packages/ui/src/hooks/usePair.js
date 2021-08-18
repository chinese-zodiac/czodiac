import { useEffect, useState } from "react";
import { useEthers, useContractCalls, useContractFunction } from "@pdusedapp/core";
import { Contract, utils, BigNumber } from "ethers";
import { CHAINS, UNISWAPFACTORY_ADDRESSES } from "../constants";
import { abi as IUniswapV2PairABI } from '@uniswap/v2-core/build/IUniswapV2Pair.json'
import { abi as IUniswapV2FactoryABI } from '@uniswap/v2-core/build/IUniswapV2Factory.json'

const {Interface} = utils;

function usePair(tokenA,tokenB) {
  const {chainId, account, library} = useEthers();
  const pairInterface = new Interface(IUniswapV2PairABI);
  const factoryInterface = new Interface(IUniswapV2FactoryABI);

  const [pair, setPair] = useState(null);

  useEffect(()=>{
    if(chainId != CHAINS.BSC || !account) {
      setPair(null);
      return;
    }
    const factory = new Contract(UNISWAPFACTORY_ADDRESSES[chainId], IUniswapV2FactoryABI, library);
    (async () =>{
      const result = await factory.getPair(tokenA,tokenB);
      setPair(result)
    })();
  },[chainId,account,tokenA,tokenB])

  return pair
}
export default usePair;