import { useEffect, useState } from "react";
import { useEthers, useContractCalls, useContractFunction, useBlockNumber } from "@pdusedapp/core";
import { CZFARMPOOLS, CZFARM_ADDRESSES } from "../constants";
import { Contract, utils, BigNumber, constants } from "ethers";
import useDeepCompareEffect from "../utils/useDeepCompareEffect";
import useBUSDPrice from "./useBUSDPrice";
import useBUSDPriceMulti from "./useBUSDPriceMulti";
import czFarmPool from "../abi/CZFarmPool.json";
import ierc20 from "../abi/ierc20.json";
import { parseEther } from "@ethersproject/units";
const {Interface} = utils;

const weiFactor = BigNumber.from("10").pow(BigNumber.from("18"));

function useCZPools(stakeTokenAddress, poolSet) {
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

  const czfBusdPrice = useBUSDPrice(stakeTokenAddress);
  const rewardBusdPrices = useBUSDPriceMulti(!!poolSet ? poolSet.map((p)=>p.rewardAddress) : []);

  const ierc20Interface = new Interface(ierc20);
  const czFarmPoolInterface = new Interface(czFarmPool);
  const [czFarmPoolContracts, setCzFarmPoolContracts] = useState(!!poolSet ? poolSet.map((p)=>new Contract(p.address, czFarmPoolInterface)) : []);

  const [pools, setPools] = useState(poolSet ?? []);
  const [calls, setCalls] = useState([]);
  const callResults = useContractCalls(calls) ?? [];

  useEffect(()=>{
    const newCalls = [];
    if(!poolSet || !stakeTokenAddress || !account) {
      return;
    }
    poolSet.forEach((p) => {
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
        address:stakeTokenAddress,
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
          address:stakeTokenAddress,
          method:'balanceOf',
          args: [account]
        });
      }      
    });
    setCalls(newCalls);
  },[stakeTokenAddress,account,chainId])

  useDeepCompareEffect(()=>{
    if(!callResults || callResults.length === 0 || !callResults[0] || !poolSet || !czfBusdPrice || !account || rewardBusdPrices.length == 0) {
        return;
    }
    let newPools = [...pools];
    console.log("newPools",newPools)
    console.log("rewardBusdPrices",rewardBusdPrices);
    poolSet.forEach((p, index) => {
      if(rewardBusdPrices[index].eq("0") && !!p.usdPerDay && !p.usdPerDay.eq("0")) return;
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

      //Fixes bug where TVL includes the CZF rewards in CZF->CZF pool
      let tvlOffset = BigNumber.from("0")
      /*if(p.rewardAddress == "0x7c1608C004F20c3520f70b924E2BfeF092dA0043" && p.usdPerDay.gt(BigNumber.from("0"))) {
        let seconds = 0;
        if(new Date() >= p.timeStart && new Date() <= p.timeEnd) {
          seconds = Math.floor((p.timeEnd - new Date()) / 1000);
        } else if(new Date() < p.timeStart) {
          seconds = Math.floor((p.timeEnd - p.timeStart) / 1000);
        }
        tvlOffset = p.usdPerDay.mul(BigNumber.from(seconds.toString()).div(BigNumber.from("86400")));
        p.usdValue = p.usdValue.sub(tvlOffset);
      }*/

      if(p.usdValue.gt(BigNumber.from("0"))) {
        p.aprBasisPoints = p.usdPerDay.mul(BigNumber.from("365")).mul(BigNumber.from("10000")).div(p.usdValue);
      } else {
        p.aprBasisPoints = BigNumber.from("0");
      }

      if(p.usdValue.gt(BigNumber.from("0"))) {
        p.aprBasisPoints = p.usdPerDay.mul(BigNumber.from("365")).mul(BigNumber.from("10000")).div(p.usdValue.add(tvlOffset));
      } else {
        p.aprBasisPoints = BigNumber.from("0");
      }

      /*if(p.rewardAddress == "0x7c1608C004F20c3520f70b924E2BfeF092dA0043" && p.usdPerDay.gt(BigNumber.from("0"))) {
        p.usdValue = p.usdValue.add(
          parseEther("288385966").mul(czfBusdPrice).div(weiFactor)
        );
       }*/



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
      newPools[index] = p;
    });
    setPools(newPools);
  },[callResults,czfBusdPrice,rewardBusdPrices])


  return {
    pools
  }

}

export default useCZPools;