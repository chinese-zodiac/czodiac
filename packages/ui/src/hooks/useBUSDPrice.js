import { useEffect, useState } from "react";
import { useEthers, useContractCalls, useContractFunction } from "@pdusedapp/core";
import usePair from "./usePair";
import { CHAINS, BUSD_ADDRESSES, WETH_ADDRESSES } from "../constants";
import { abi as IUniswapV2PairABI } from '@uniswap/v2-core/build/IUniswapV2Pair.json'
import { abi as ERC20ABI } from '@uniswap/v2-core/build/ERC20.json'
import { Contract, utils, BigNumber } from "ethers";
const { formatEther, parseEther, Interface } = utils;


function useBUSDPrice(address) {
  const {chainId, account, library} = useEthers();
  const wbnbPair = usePair(address,WETH_ADDRESSES[chainId]);
  const busdPair = usePair(address,BUSD_ADDRESSES[chainId]);
  const bnbBusdPair = usePair(WETH_ADDRESSES[chainId],BUSD_ADDRESSES[chainId]);
  const pairInterface = new Interface(IUniswapV2PairABI);
  const erc20Interface = new Interface(ERC20ABI);

  const [price,setPrice] = useState(null);
  
  useEffect(()=>{
    if(chainId != CHAINS.BSC || !account || !bnbBusdPair || !chainId || !account) {
      return
    }
    const busdContract = new Contract(BUSD_ADDRESSES[chainId], erc20Interface, library);
    const bnbContract = new Contract(WETH_ADDRESSES[chainId], erc20Interface, library);
    const tokenContract = new Contract(address, erc20Interface, library);
    (async () =>{
      if(!!busdPair && "0x0000000000000000000000000000000000000000" != busdPair) {
        const busdBalance = await busdContract.balanceOf(busdPair);
        if(busdBalance.gt(parseEther("10000")) || !wbnbPair) {
          const tokenBalance = await tokenContract.balanceOf(busdPair);
          if(!!tokenBalance && tokenBalance.gt(BigNumber.from("0"))) {
            setPrice(
              busdBalance.mul(parseEther("1")).div(tokenBalance)
            );
          }
          return;
        }
      }
      if(!!wbnbPair && "0x0000000000000000000000000000000000000000" != wbnbPair && !!bnbBusdPair && "0x0000000000000000000000000000000000000000" != bnbBusdPair) {
        const busdBalanceOfBNB = await busdContract.balanceOf(bnbBusdPair);
        const bnbBalanceOfBNB = await bnbContract.balanceOf(bnbBusdPair);
        const bnbBalance = await bnbContract.balanceOf(wbnbPair);
        const tokenBalance = await tokenContract.balanceOf(wbnbPair);
        if(!!bnbBalanceOfBNB && bnbBalanceOfBNB.gt(BigNumber.from("0"))) {
          setPrice(
            bnbBalance.mul(parseEther("1")).div(tokenBalance).mul(busdBalanceOfBNB).div(bnbBalanceOfBNB)
          );
        }
        return;
      }
      setPrice(null)
    })();
  },[chainId,account,address,busdPair,wbnbPair,bnbBusdPair])

  return price
}
export default useBUSDPrice;