import { useEffect, useState } from "react";
import { useEthers, useContractCalls, useContractFunction } from "@pdusedapp/core";
import usePair from "./usePair";
import usePairMulti from "./usePairMulti";
import { CHAINS, BUSD_ADDRESSES, WETH_ADDRESSES } from "../constants";
import { abi as IUniswapV2PairABI } from '@uniswap/v2-core/build/IUniswapV2Pair.json'
import { abi as ERC20ABI } from '@uniswap/v2-core/build/ERC20.json'
import { Contract, utils, BigNumber } from "ethers";
import useDeepCompareEffect from "../utils/useDeepCompareEffect";
const { formatEther, parseEther, Interface } = utils;


function useBUSDPriceMulti(addresses) {
  const {chainId, account, library} = useEthers();
  const wethAddresses = addresses.map(()=>WETH_ADDRESSES[chainId])
  const busdAddresses = addresses.map(()=>BUSD_ADDRESSES[chainId])

  const wbnbPairs = usePairMulti(addresses,wethAddresses);
  const busdPairs = usePairMulti(addresses,busdAddresses);
  const bnbBusdPair = usePair( WETH_ADDRESSES[chainId], BUSD_ADDRESSES[chainId]);
  const pairInterface = new Interface(IUniswapV2PairABI);
  const erc20Interface = new Interface(ERC20ABI);

  const [prices,setPrices] = useState([]);
  
  useEffect(()=>{
    if(chainId != CHAINS.BSC || !account) {
      setPrices([])
      return
    }
    const busdContract = new Contract(BUSD_ADDRESSES[chainId], erc20Interface, library);
    const bnbContract = new Contract(WETH_ADDRESSES[chainId], erc20Interface, library);
    const tokenContracts = (!!addresses && addresses.length > 0) ? addresses.map((a)=>new Contract(a, erc20Interface, library)) : [];
    
    (async () =>{
      if(!bnbBusdPair) return Promise.resolve(BigNumber.from("0")); 
      const busdBalanceOfBNB = await busdContract.balanceOf(bnbBusdPair);
      const bnbBalanceOfBNB = await bnbContract.balanceOf(bnbBusdPair);
      let pricePromises = []
      if(!!busdPairs && busdPairs.length>0 && "0x0000000000000000000000000000000000000000" != busdPairs[0]) {
        const busdBalances = await Promise.all(busdPairs.map((pair)=>busdContract.balanceOf(pair)));
        pricePromises = busdBalances.map((busdBalance, index)=>{
          //TODO: fix for contracts with no BUSD pair.
           //if(busdBalance.gt(parseEther("1000")) || !wbnbPairs[index]) {
            return tokenContracts[index].balanceOf(busdPairs[index]).then((res)=>busdBalance.mul(parseEther("1")).div(res))
           /*} else {
             if(!!wbnbPairs && wbnbPairs.length>0 && "0x0000000000000000000000000000000000000000" != wbnbPairs[index]){
              return Promise.all([
                bnbContract.balanceOf(wbnbPairs[index]),
                tokenContracts[index].balanceOf(wbnbPairs[index])
              ]).then((res)=>res[0].mul(parseEther("1")).div(res[1]).mul(busdBalanceOfBNB).div(bnbBalanceOfBNB));
             }            
           }*/
           return Promise.resolve(BigNumber.from("0"));
        })
      }
      let newPrices = await Promise.all(pricePromises);
      setPrices(newPrices)
    })();
  },[chainId,account,bnbBusdPair,busdPairs])

  return prices
}
export default useBUSDPriceMulti;