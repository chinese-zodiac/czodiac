import { useEffect, useState } from "react";
import { useEthers, useContractCalls, useContractFunction, useBlockNumber } from "@pdusedapp/core";
import { STIMFARMS, CZFARM_ADDRESSES, BUSD_ADDRESSES } from "../constants";
import { Contract, utils, BigNumber, constants } from "ethers";
import useDeepCompareEffect from "../utils/useDeepCompareEffect";
import useBUSDPrice from "./useBUSDPrice";
import stimFarmAbi from "../abi/StimFarm.json";
import ierc20 from "../abi/ierc20.json";


const {Interface, parseEther} = utils;
const weiFactor = BigNumber.from("10").pow(BigNumber.from("18"));

function useStimFarms() {
  const stimFarm = {
    name: null,
    address: null,
    asset: null,
    isAssetCzfLp: null,
    getLink: null,
    czfPerAsset: null,
    openDate: null,
    closeDate: null,
    vestDate: null,
    isOpen: null,
    isVested: null,
    isLaunching: null,
    isClosed: null,
    aprBasis: null,
    tvl: null,
    sendDeposit: null,
    sendClaim: null,
    sendApprove: null,
    totalAssetDeposits: null,
    userInfo: {
      assetWallet: null,
      assetWalletUsd: null,
      depositorAsset: null,
      depositorUsd: null,
      czfClaimable: null,
      assetAllowance: null,
      isApproved: null
    }
  }
  
  const { account, chainId, library } = useEthers();
  const czfBusdPrice = useBUSDPrice(CZFARM_ADDRESSES[chainId]);

  const ierc20Interface = new Interface(ierc20);
  const stimFarmInterface = new Interface(stimFarmAbi);
  
  const [stimFarmContracts, setStimFarmContracts] = useState(!!STIMFARMS[chainId] ? STIMFARMS[chainId].map((p)=>new Contract(p.address, stimFarmInterface)) : []);

  const [stimFarms, setStimFarms] = useState([]);
  const [calls, setCalls] = useState([]);
  const callResults = useContractCalls(calls) ?? [];

  const sendDeposit = async (stimFarmAddress,wad) => {
    if(!account || !library || !stimFarmAddress) return;
    const stimFarmContract = (new Contract(stimFarmAddress, stimFarmInterface, library)).connect(library.getSigner());
    try{
      await stimFarmContract.deposit(wad,account);
    } catch(err) {
      console.log(err);
    }
  }

  const sendClaim = async (stimFarmAddress) => {
    if(!account || !library || !stimFarmAddress) return;
    const stimFarmContract = (new Contract(stimFarmAddress, stimFarmInterface, library)).connect(library.getSigner());
    try{
      await stimFarmContract.claim(account);
    } catch(err) {
      console.log(err);
    }
  }

  const sendApprove = async (stimFarmAddress,assetAddress) => {
    if(!account || !library || !stimFarmAddress) return;
    const assetContract = (new Contract(assetAddress, ierc20Interface, library)).connect(library.getSigner());
    try{
      await assetContract.approve(constants.MaxUint256);
    } catch(err) {
      console.log(err);
    }
  }

  useEffect(()=>{
    const newCalls = [];
    if(!STIMFARMS[chainId]) {
      setCalls(newCalls)
      return;
    }
    STIMFARMS[chainId].forEach((s)=>{
      let user = "0x0000000000000000000000000000000000000001"; // Simplifies code by calling for 0x1 if no account
      if(!!account) user = account;
      let ca = s.address;
      newCalls.push({
        abi:stimFarmInterface,
        address:ca,
        method:'czfPerAsset'
      });
      newCalls.push({
        abi:stimFarmInterface,
        address:ca,
        method:'openEpoch'
      });
      newCalls.push({
        abi:stimFarmInterface,
        address:ca,
        method:'closeEpoch'
      });
      newCalls.push({
        abi:stimFarmInterface,
        address:ca,
        method:'vestEpoch'
      });
      newCalls.push({
        abi:stimFarmInterface,
        address:ca,
        method:'isOpen'
      });
      newCalls.push({
        abi:stimFarmInterface,
        address:ca,
        method:'isVested'
      });
      newCalls.push({
        abi:ierc20Interface,
        address:s.asset,
        method:'balanceOf',
        args: [ca]
      });
      newCalls.push({
        abi:stimFarmInterface,
        address:ca,
        method:'depositorAsset',
        args: [account]
      });
      newCalls.push({
        abi:ierc20Interface,
        address:s.asset,
        method:'balanceOf',
        args: [account]
      });
      newCalls.push({
        abi:ierc20Interface,
        address:CZFARM_ADDRESSES[chainId],
        method:'balanceOf',
        args: [s.asset]
      });
      newCalls.push({
        abi:ierc20Interface,
        address:s.asset,
        method:'totalSupply'
      });
      newCalls.push({
        abi:ierc20Interface,
        address:s.asset,
        method:'allowance',
        args:[account,ca]
      });
    })
    setCalls(newCalls);
  },[account,chainId])
  
  useDeepCompareEffect(()=>{
    let newStimFarms = [];
    if(!callResults || callResults.length === 0 || !callResults[0] || !STIMFARMS[chainId] || !czfBusdPrice || !callResults[7]) {
        return;
    }
    let now = new Date();
    STIMFARMS[chainId].forEach((s,index)=>{
      let sd = STIMFARMS[chainId][index]
      let sn = {
        name: sd.name,
        address: sd.address,
        asset: sd.asset,
        isAssetCzfLp: sd.isAssetCzfLp,
        getLink: sd.getLink,
        czfPerAsset: callResults[0][0],
        openDate: new Date(callResults[1][0].toNumber()*1000),
        closeDate: new Date(callResults[2][0].toNumber()*1000),
        vestDate: new Date(callResults[3][0].toNumber()*1000),
        isOpen: callResults[4][0],
        isVested: callResults[5][0],
        totalAssetDeposits: callResults[6][0],
        userInfo: {
          depositorAsset: callResults[7][0],
          assetWallet: callResults[8][0],
          assetAllowance: callResults[11][0]
        },
        assetCzfBalance: callResults[9][0],
        assetTotalSupply: callResults[10][0]
      }
      sn.userInfo.czfClaimable = sn.userInfo.depositorAsset.mul(sn.czfPerAsset).div(weiFactor);
      sn.sendClaim = ()=>sendClaim(sn.address);
      sn.sendDeposit = (wad)=>sendDeposit(sn.address,wad);
      sn.sendApprove = ()=>sendApprove(sn.address,sn.asset);
      sn.userInfo.isApproved = sn.userInfo.assetAllowance.gt(constants.MaxUint256.div(BigNumber.from("10")))
      if(sn.isAssetCzfLp) {
        sn.aprBasis = sn.assetTotalSupply.mul(BigNumber.from("10000")).mul(sn.czfPerAsset).div(sn.assetCzfBalance.mul(2)).div(weiFactor).sub(BigNumber.from("10000")).mul(BigNumber.from("52")).toNumber();
        sn.tvl = sn.totalAssetDeposits.mul(sn.assetCzfBalance).mul(czfBusdPrice).div(sn.assetTotalSupply).div(weiFactor);
        sn.userInfo.assetWalletUsd =  sn.userInfo.assetWallet.mul(sn.assetCzfBalance).mul(czfBusdPrice).div(sn.assetTotalSupply).div(weiFactor);
        sn.userInfo.depositorUsd =  sn.userInfo.depositorAsset.mul(sn.assetCzfBalance).mul(czfBusdPrice).div(sn.assetTotalSupply).div(weiFactor);
      }

      if(sn.isVested || sn.isOpen) {
        sn.isLaunching = false;
        sn.isClosed = false;
      } else {
        sn.isLaunching = now < sn.openDate;
        sn.isClosed = !sn.isLaunching;          
      }
      newStimFarms.push(sn);
    });
    setStimFarms(newStimFarms);
  },[callResults,czfBusdPrice])

  return {
    stimFarms
  }
}

export default useStimFarms;