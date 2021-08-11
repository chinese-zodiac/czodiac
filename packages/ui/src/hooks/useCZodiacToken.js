import { useEffect, useState } from "react";
import { useEthers, useContractCalls, useContractFunction } from "@pdusedapp/core";
import { Contract, utils, } from "ethers";
import czodiacTokenAbi from "../abi/czodiacToken.json";

const {Interface} = utils;

function useCZodiacToken(address) {
    const { account, chainId } = useEthers();

    const czodiacTokenInterface = new Interface(czodiacTokenAbi);

    const [czContract, setCzContract] = useState(
        null);
    const { state, send } = useContractFunction(czContract, 'swap')
    const { state: approveState, send: approve } = useContractFunction(czContract, 'approve')

    useEffect(()=>{
        if(!!account && !!address)
        setCzContract(new Contract(address, czodiacTokenInterface));
    },[account,chainId,address])

    return {
        swap: send,
        swapState: state,
        approve: approve,
        approveState: approveState
    }; 
}

export default useCZodiacToken;