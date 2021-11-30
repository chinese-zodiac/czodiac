import { useEffect, useState } from "react";
import { useEthers, useContractCalls, useContractFunction, useBlockNumber } from "@pdusedapp/core";
import { EXOTIC_MASTER, EXOTIC_FARMS, CZFARM_ADDRESSES, CHAINS } from "../constants";
import { Contract, utils, BigNumber, constants } from "ethers";
import useDeepCompareEffect from "../utils/useDeepCompareEffect";
import useBUSDPrice from "./useBUSDPrice";
import useBUSDPriceMulti from "./useBUSDPriceMulti";
import ExoticMasterAbi from "../abi/ExoticMaster.json";
import ierc20 from "../abi/ierc20.json";
import { parseEther } from "@ethersproject/units";
const {Interface} = utils;
const weiFactor = BigNumber.from("10").pow(BigNumber.from("18"));

function useExoticFarms() {
  const baseFarmSetsState = {
    farmSets: EXOTIC_FARMS[CHAINS.BSC].map((farmSet,i)=>{return {
      ...(
        farmSet.farms.map((farm,i)=>{
          return {
            adjustedRateBasis:null,
            vestPeriod:null,
            ffBasis:null,
            poolEmissionRate:null,
            czfPerLpWad:null,
            userInfo:{
              totalVesting:null,
              emissionRate:null,
              updateEpoch:null,
              fastForwardLockToEpoch:null
            }
          }
        })
      ),
      farms: farmSet.farms,
      czfPerLPWad:null,
      title:farmSet.title,
      lp:farmSet.lp,
      mintLink:farmSet.mintLink,
      baseEmissionRate:farmSet.baseEmissionRate,
      oracle:farmSet.oracle
    }})
  }
  
  const { account, chainId, library } = useEthers();
  const exoticMasterInterface = new Interface(ExoticMasterAbi);
  const [exoticMasterContract, setExoticMasterContract] = useState(null);
  const { state: stateDeposit, send: sendDeposit } = useContractFunction(exoticMasterContract, 'deposit');
  const { state: stateClaimAll, send: sendClaimAll } = useContractFunction(exoticMasterContract, 'claimFarm');
  const { state: stateClaim, send: sendClaim } = useContractFunction(exoticMasterContract, 'claimPool');
  const { state: stateFastForward, send: sendFastForward } = useContractFunction(exoticMasterContract, 'claimAndFastForward');

  const ierc20Interface = new Interface(ierc20);
  const sendApproveLpForFarm = async (lpAddress) => {
    if(!account || !library || !EXOTIC_MASTER[chainId]) return;
    const lpContract = (new Contract(lpAddress, ierc20Interface, library)).connect(library.getSigner());
    try{
      await lpContract.approve(EXOTIC_MASTER[chainId],constants.MaxUint256);
    } catch(err) {
      console.log(err)
    }
    
  }

  useEffect(()=>{
      if(!!account && !!EXOTIC_MASTER[chainId])
      setExoticMasterContract(new Contract(EXOTIC_MASTER[chainId], exoticMasterInterface));
  },[account,chainId]);
  
  const [farmSetsState, setFarmSetsState] = useState(baseFarmSetsState);
  
  const [calls, setCalls] = useState([]);
  const callResults = useContractCalls(calls) ?? [];

  useEffect(()=>{
    const newCalls = []
    if(!!EXOTIC_MASTER[chainId] && !!account) {
      for(let i=0; i<baseFarmSetsState.farmSets.length; i++) {
        newCalls.push({
          abi:exoticMasterInterface,
          address:EXOTIC_MASTER[chainId],
          method:'getCzfPerLPWad',
          args: [baseFarmSetsState.farmSets[i].oracle,baseFarmSetsState.farmSets[i].lp]
        });
        newCalls.push({
          abi:ierc20Interface,
          address:baseFarmSetsState.farmSets[i].lp,
          method:'allowance',
          args: [account,EXOTIC_MASTER[chainId]]
        });
        for(let j=0; j<baseFarmSetsState.farmSets[i].farms.length; j++){
          let farm = baseFarmSetsState.farmSets[i].farms[j];
          let pid = farm.pid;
          newCalls.push({
            abi:exoticMasterInterface,
            address:EXOTIC_MASTER[chainId],
            method:'getExoticFarmInfo',
            args: [pid]
          });
          newCalls.push({
            abi:exoticMasterInterface,
            address:EXOTIC_MASTER[chainId],
            method:'getExoticFarmAccountInfo',
            args: [account,pid]
          });
        }
      }
    }
    setCalls(newCalls)
  },[account, chainId]);

  useDeepCompareEffect(()=>{
    let newFarmSetsState = {...baseFarmSetsState}
    if(!callResults || callResults.length === 0 || !callResults[0] || !callResults[2] || !callResults[3] || !EXOTIC_MASTER[chainId] || !account) {
        return;
    }
    let farmsProcessed = 0;
    let callsPerFarm = 2;
    let callsPerFarmSet = 2;
    for(let i=0; i<baseFarmSetsState.farmSets.length; i++) {
      let farmSet = baseFarmSetsState.farmSets[i];
      let farmSetOffset = i*(callsPerFarmSet + farmsProcessed * callsPerFarm);
      newFarmSetsState.farmSets[i].czfPerLPWad = callResults[0+farmSetOffset][0];

      for(let j=0; j<farmSet.farms.length; j++){
        farmsProcessed++;
        let farm = farmSet.farms[j];
        let farmOffset = callsPerFarmSet + farmSetOffset + j * callsPerFarm;

        newFarmSetsState.farmSets[i].farms[j] = {
          ...newFarmSetsState.farmSets[i].farms[j],
          adjustedRateBasis:callResults[0+farmOffset][0],
          vestPeriod:callResults[0+farmOffset][1],
          ffBasis:callResults[0+farmOffset][2],
          poolEmissionRate:callResults[0+farmOffset][3],
          userInfo: newFarmSetsState.farmSets[i].farms[j].userInfo
        }
        newFarmSetsState.farmSets[i].farms[j].userInfo = {
          ...newFarmSetsState.farmSets[i].farms[j].userInfo,
            totalVesting:callResults[1+farmOffset][0],
            emissionRate:callResults[1+farmOffset][1],
            updateEpoch:callResults[1+farmOffset][2],
            fastForwardLockToEpoch:callResults[1+farmOffset][3],
            lpAllowance:callResults[1+farmSetOffset][0],
            sendApprove:()=>sendApproveLpForFarm(farmSet.lp)
        }
      }
    }


    setFarmSetsState(newFarmSetsState);
  },[callResults,stateDeposit,stateClaimAll,stateFastForward]);

  return {
    ...(farmSetsState ?? baseFarmSetsState),
    stateDeposit,
    sendDeposit,
    stateClaimAll,
    sendClaimAll,
    stateClaim,
    sendClaim,
    stateFastForward,
    sendFastForward
  }
}

export default useExoticFarms;