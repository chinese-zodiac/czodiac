import { useEffect, useState } from "react";
import { useEthers, useContractCalls, useContractFunction, useBlockNumber } from "@pdusedapp/core";
import { CHRONOPOOLSERVICE, CHRONOPOOLS, CHAINS } from "../constants";
import { Contract, utils, BigNumber } from "ethers";
import useDeepCompareEffect from "../utils/useDeepCompareEffect";
import chronoPoolServiceAbi from "../abi/ChronoPoolService.json";
const {Interface} = utils;
const weiFactor = BigNumber.from("10").pow(BigNumber.from("18"));

function useChronoPools() {
  const basePoolsState = {
    pools: CHRONOPOOLS[CHAINS.BSC].map((pool,i)=>{return {
      ...pool,
      adjustedRateBasis:null,
      vestPeriod:null,
      ffBasis:null,
      poolEmissionRate:null,
      userInfo:{
        totalVesting:null,
        emissionRate:null,
        updateEpoch:null
      }
    }})
  }
  
  const { account, chainId } = useEthers();
  const chronoPoolServiceInterface = new Interface(chronoPoolServiceAbi);
  const [chronoPoolServiceContract, setChronoPoolServiceContract] = useState(
      null);
  const { state: stateDeposit, send: sendDeposit } = useContractFunction(chronoPoolServiceContract, 'deposit');
  const { state: stateReinvest, send: sendReinvest } = useContractFunction(chronoPoolServiceContract, 'reinvest');
  const { state: stateClaimAll, send: sendClaimAll } = useContractFunction(chronoPoolServiceContract, 'claimAll');
  const { state: stateClaim, send: sendClaim } = useContractFunction(chronoPoolServiceContract, 'claimPool');
  const { state: stateFastForward, send: sendFastForward } = useContractFunction(chronoPoolServiceContract, 'claimAndFastForward');
  useEffect(()=>{
      if(!!account && !!CHRONOPOOLSERVICE[chainId])
      setChronoPoolServiceContract(new Contract(CHRONOPOOLSERVICE[chainId], chronoPoolServiceInterface));
  },[account,chainId]);
  
  const [poolsState, setPoolsState] = useState(basePoolsState);
  
  const [calls, setCalls] = useState([]);
  const callResults = useContractCalls(calls) ?? [];

  useEffect(()=>{
    const newCalls = []
    if(!!CHRONOPOOLSERVICE[chainId]) {
      for(let i=0; i<basePoolsState.pools.length; i++) {
        let pool = basePoolsState.pools[i];
        let pid = pool.pid;
        newCalls.push({
          abi:chronoPoolServiceInterface,
          address:CHRONOPOOLSERVICE[chainId],
          method:'getChronoPoolInfo',
          args: [pid]
        });
      }
      if(!!account) {
        for(let i=0; i<basePoolsState.pools.length; i++) {
          let pool = basePoolsState.pools[i];
          let pid = pool.pid;
          newCalls.push({
            abi:chronoPoolServiceInterface,
            address:CHRONOPOOLSERVICE[chainId],
            method:'getChronoPoolAccountInfo',
            args: [account,pid]
          });
        }
      }
    }
    setCalls(newCalls)
  },[account, chainId]);

  useDeepCompareEffect(()=>{
    let newPoolsState = {...basePoolsState}
    if(!callResults || callResults.length === 0 || !callResults[0] || !CHRONOPOOLSERVICE[chainId]) {
        return;
    }
    for(let i=0; i<basePoolsState.pools.length; i++) {
      newPoolsState.pools[i] = {
        ...newPoolsState.pools[i],
        adjustedRateBasis:callResults[0+i][0],
        vestPeriod:callResults[0+i][1],
        ffBasis:callResults[0+i][2],
        poolEmissionRate:callResults[0+i][3],
        userInfo: newPoolsState.pools[i].userInfo
      }
      if(callResults.length > CHRONOPOOLS[CHAINS.BSC].length && !!callResults[CHRONOPOOLS[CHAINS.BSC].length]) {
        //results from account
        let offset = CHRONOPOOLS[CHAINS.BSC].length
        newPoolsState.pools[i].userInfo = {
          totalVesting:callResults[0+offset+i][0],
          emissionRate:callResults[0+offset+i][1],
          updateEpoch:callResults[0+offset+i][2]
        }
      }
    }


    setPoolsState(newPoolsState);
  },[callResults,stateDeposit,stateReinvest,stateClaimAll,stateFastForward]);

  return {
    ...(poolsState ?? basePoolsState),
    stateDeposit,
    sendDeposit,
    stateReinvest,
    sendReinvest,
    stateClaimAll,
    sendClaimAll,
    stateClaim,
    sendClaim,
    stateFastForward,
    sendFastForward
  }
}

export default useChronoPools;