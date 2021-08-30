import { useEffect, useState } from "react";
import { useEthers, useContractCalls, useContractFunction, useBlockNumber } from "@pdusedapp/core";
import { CZFARMPOOLS, CZFARM_ADDRESSES } from "../constants";
import { Contract, utils, BigNumber, constants } from "ethers";
import useDeepCompareEffect from "../utils/useDeepCompareEffect";
import useBUSDPrice from "./useBUSDPrice";
import useBUSDPriceMulti from "./useBUSDPriceMulti";
import czFarmPool from "../abi/CZFarmPool.json";
import ierc20 from "../abi/ierc20.json";
const {Interface} = utils;

const weiFactor = BigNumber.from("10").pow(BigNumber.from("18"));

function useCZPools(poolName) {
  const pool = {
    timestampStart: null,
    timestampEnd: null,
    rewardPerSecond: null,
    totalAmount: null,
    totalAmountUSD: null,
    aprBasisPoints: null,
    userInfo: {
      amount: null,
      amountUSD: null,
      pendingReward: null
    }
  }
  const { account, chainId, library } = useEthers();
  const czfBusdPrice = useBUSDPrice(CZFARM_ADDRESSES[chainId]);
  const rewardBusdPrices = useBUSDPriceMulti(!!CZFARMPOOLS[chainId] ? CZFARMPOOLS[chainId].map((p)=>p.address) : []);

  const ierc20Interface = new Interface(ierc20);
  const czFarmPoolInterface = new Interface(czFarmPool);
  const [czFarmPoolContract, setCzFarmPoolContract] = useState(null);
  const { state: stateDeposit, send: sendDeposit } = useContractFunction(czFarmPoolContract, 'deposit');
  const { state: stateWithdraw, send: sendWithdraw } = useContractFunction(czFarmPoolContract, 'withdraw');
  const [czFarmPoolsState, setCZFarmPoolsState] = useState([]);
  useEffect(()=>{
      if(!!account && !!CZFARMPOOLS[chainId] && !!poolName && !!CZFARMPOOLS[chainId][poolName])
      setCzFarmPoolContract(new Contract(CZFARMPOOLS[chainId][poolName].address, czFarmPoolInterface));
  },[account,poolName,chainId]);
  const [calls, setCalls] = useState([]);
  const callResults = useContractCalls(calls) ?? [];

  useEffect(()=>{
    const newCalls = [];
    if(!!CZFARMPOOLS[chainId] && !!CZFARMPOOLS[chainId][poolName]) {
      let ca = CZFARMPOOLS[chainId][poolName].address;
      newCalls.push({
        abi:czFarmPoolInterface,
        address:ca,
        method:'timestampStart'
      });
      newCalls.push({
        abi:czFarmPoolInterface,
        address:ca,
        method:'timestampEnd'
      });
      newCalls.push({
        abi:czFarmPoolInterface,
        address:ca,
        method:'rewardPerSecond'
      });
      if(!!account){
        newCalls.push({
          abi:czFarmPoolInterface,
          address:ca,
          method:'userInfo',
          args: [account]
        });
        newCalls.push({
          abi:czFarmPoolInterface,
          address:ca,
          method:'pendingReward',
          args: [account]
        });
      }      
    }
    
    setCalls(newCalls);
  },[account,chainId,poolName])

  useDeepCompareEffect(()=>{
    let newCZFarmPoolsState = []
    if(!callResults || callResults.length === 0 || !callResults[0] || !CZFARMPOOLS[chainId][poolName] || !czfBusdPrice) {
        return;
    }
    console.log(callResults);
    console.log(newCZFarmPoolsState);
    setCZFarmPoolsState(newCZFarmPoolsState);
  },[callResults,czfBusdPrice,stateDeposit,stateWithdraw])

  return {
    czFarmPoolsState,
    stateDeposit,
    sendDeposit,
    stateWithdraw,
    sendWithdraw
  }

}

export default useCZPools;