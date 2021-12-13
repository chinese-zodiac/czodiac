import { useEffect, useState } from "react";
import { useEthers, useContractCalls, useContractFunction, useBlockNumber } from "@pdusedapp/core";
import { LOSS_COMPENSATION, CHAINS } from "../constants";
import { Contract, utils, BigNumber, constants } from "ethers";
import useDeepCompareEffect from "../utils/useDeepCompareEffect";
import useBUSDPrice from "./useBUSDPrice";
import useBUSDPriceMulti from "./useBUSDPriceMulti";
import lossCompensationAbi from "../abi/LossCompensation.json";
import ierc20 from "../abi/ierc20.json";
import { parseEther } from "@ethersproject/units";
const {Interface} = utils;
const weiFactor = BigNumber.from("10").pow(BigNumber.from("18"));

function useLossCompensation() {
  const lossCompensationBaseState = {
    ffBasis:1000,
    vestPeriod:31536000,
    userInfo:{
      totalVesting:null,
      emissionRate:null,
      updateEpoch:null
    }
  }
  
  const { account, chainId, library } = useEthers();
  const lossCompensationInterface = new Interface(lossCompensationAbi);
  const [lossCompensationContract, setLossCompensationContract] = useState(
      null);
  const { state: stateClaim, send: sendClaim } = useContractFunction(lossCompensationContract, 'claim');
  const { state: stateFastForward, send: sendFastForward } = useContractFunction(lossCompensationContract, 'claimAndFastForward');
  useEffect(()=>{
      if(!!account && !!LOSS_COMPENSATION[chainId])
      setLossCompensationContract(new Contract(LOSS_COMPENSATION[chainId], lossCompensationInterface));
  },[account,chainId]);
  
  const [lossCompensationState, setLossCompensationState] = useState(lossCompensationBaseState);
  
  const [calls, setCalls] = useState([]);
  const callResults = useContractCalls(calls) ?? [];

  useEffect(()=>{
    const newCalls = [];
    if(!!LOSS_COMPENSATION[chainId] && !!account) {
      newCalls.push({
        abi:lossCompensationInterface,
        address:LOSS_COMPENSATION[chainId],
        method:'getChronoPoolAccountInfo',
        args: [account]
      });
    }
    setCalls(newCalls)
  },[account, chainId]);

  useDeepCompareEffect(()=>{
    let newLossCompensationState = {...lossCompensationBaseState}
    if(!callResults || callResults.length === 0 || !callResults[0] || !LOSS_COMPENSATION[chainId]) {
        return;
    }
    newLossCompensationState.userInfo.totalVesting = callResults[0][0];
    newLossCompensationState.userInfo.emissionRate = callResults[0][1];
    newLossCompensationState.userInfo.updateEpoch = callResults[0][2];


    setLossCompensationState(newLossCompensationState);
  },[callResults,stateClaim,stateFastForward]);

  return {
    ...(lossCompensationState ?? lossCompensationBaseState),
    stateClaim,
    sendClaim,
    stateFastForward,
    sendFastForward
  }
}

export default useLossCompensation;