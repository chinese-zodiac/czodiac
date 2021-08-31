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

function useCZPools() {
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
  
  const sendWithdrawForPool = async (poolAddress,wad) => {
    if(!account || !library || !poolAddress) return;
    const poolContract = (new Contract(poolAddress, czFarmPoolInterface, library)).connect(library.getSigner());
    try{
      await poolContract.withdraw(wad);
    } catch(err) {
      console.log(err);
    }
  }
  const sendDepositForPool = async (poolAddress,wad) => {
    if(!account || !library || !poolAddress) return;
    const poolContract = (new Contract(poolAddress, czFarmPoolInterface, library)).connect(library.getSigner());
    try{
      await poolContract.deposit(wad);
    } catch(err) {
      console.log(err);
    }
  }

  const czfBusdPrice = useBUSDPrice(CZFARM_ADDRESSES[chainId]);
  const rewardBusdPrices = useBUSDPriceMulti(!!CZFARMPOOLS[chainId] ? CZFARMPOOLS[chainId].map((p)=>p.rewardAddress) : []);

  const ierc20Interface = new Interface(ierc20);
  const czFarmPoolInterface = new Interface(czFarmPool);
  const [czFarmPoolContracts, setCzFarmPoolContracts] = useState(!!CZFARMPOOLS[chainId] ? CZFARMPOOLS[chainId].map((p)=>new Contract(p.address, czFarmPoolInterface)) : []);

  const [pools, setPools] = useState([]);
  const [calls, setCalls] = useState([]);
  const callResults = useContractCalls(calls) ?? [];

  useEffect(()=>{
    console.log("setting calls")
    const newCalls = [];
    if(!CZFARMPOOLS[chainId]) {
      setCalls(newCalls)
      return;
    }
    CZFARMPOOLS[chainId].forEach((p) => {
      let ca = p.address;
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
      newCalls.push({
        abi:ierc20Interface,
        address:CZFARM_ADDRESSES[chainId],
        method:'balanceOf',
        args: [ca]
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
        newCalls.push({
          abi:ierc20Interface,
          address:CZFARM_ADDRESSES[chainId],
          method:'balanceOf',
          args: [account]
        });
      }      
    });
    setCalls(newCalls);
  },[account,chainId])

  useDeepCompareEffect(()=>{
    console.log("Running results")
    console.log(!callResults, callResults.length === 0, !callResults[0], !CZFARMPOOLS[chainId], !czfBusdPrice)
    let newPools = []
    if(!callResults || callResults.length === 0 || !callResults[0] || !CZFARMPOOLS[chainId] || !czfBusdPrice) {
        return;
    }
    CZFARMPOOLS[chainId].forEach((p, index) => {
      let l = 7;
      if(!account) l = 4;
      let o = l*index

      p.sendDeposit = (wad) => sendDepositForPool(p.address,wad);
      p.sendWithdraw = (wad) => sendWithdrawForPool(p.address,wad);

      p.timeStart = new Date(callResults[0+o][0].toNumber()*1000);
      p.timeEnd = new Date(callResults[1+o][0].toNumber()*1000);
      p.rewardPerSecond = callResults[2+o][0]
      p.czfBal = callResults[3+o][0]

      p.usdValue = p.czfBal.mul(czfBusdPrice).div(weiFactor);
      p.rewardPerDay = p.rewardPerSecond.mul(BigNumber.from("86400"));
      if(!!rewardBusdPrices[index]){
        p.usdPerDay = p.rewardPerDay.mul(rewardBusdPrices[index]).div(weiFactor);
      } else {
        p.usdPerDay = BigNumber.from("0");
      }      
      if(p.usdValue.gt(BigNumber.from("0"))) {
        p.aprBasisPoints = p.usdPerDay.mul(BigNumber.from("365")).mul(BigNumber.from("10000")).div(p.usdValue);
      } else {
        p.aprBasisPoints = BigNumber.from("0");
      }

      if(!!account && !!callResults[4+o]){
        p.user = {}
        p.user.czfStaked = callResults[4+o][0];
        p.user.rewardPending = callResults[5+o][0];
        p.user.czfBal = callResults[6+o][0];

        p.user.czfStakedUsd = p.user.czfStaked.mul(czfBusdPrice).div(weiFactor);
        p.user.czfBalUsd = p.user.czfBal.mul(czfBusdPrice).div(weiFactor);
        if(p.czfBal > 0) {
          p.user.rewardPerDay = p.user.czfStaked.mul(p.rewardPerDay).div(p.czfBal);
        } else {
          p.user.rewardPerDay = BigNumber.from("0")
        }
        
      }
      newPools.push(p)
    });
    console.log(newPools);
    setPools(newPools);
  },[callResults,czfBusdPrice,rewardBusdPrices])


  return {
    pools
  }

}

export default useCZPools;