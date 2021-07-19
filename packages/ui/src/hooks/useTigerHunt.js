import { useEffect, useState } from "react";
import { useEthers, useContractCalls, useContractFunction } from "@pdusedapp/core";
import { TIGERHUNT_ADDRESSES } from "../constants";
import { Contract, utils, } from "ethers";
import tigerHuntAbi from "../abi/tigerHunt.json";

const {Interface} = utils;

function useTigerHunt() {
    const { account, chainId } = useEthers();

    const tigerHuntInterface = new Interface(tigerHunt);

    const [tigerHuntContract, setTigerHuntContract] = useState(null);
    const {state: stakeTigzState, send: stakeTigzSend } = useContractFunction(tigerHuntContract, 'stakeTigz');
    const {state: unstakeTigzState, send: unstakeTigzSend } = useContractFunction(tigerHuntContract, 'unstakeTigz');
    const {state: tryHuntState, send: tryHuntSend } = useContractFunction(tigerHuntContract, 'tryHunt');
    const {state: winHuntState, send: winHuntSend } = useContractFunction(tigerHuntContract, 'winHunt');
    const {state: refreshHuntState, send: refreshHuntSend } = useContractFunction(tigerHuntContract, 'refreshHunt');
    const {state: eatState, send: eatSend } = useContractFunction(tigerHuntContract, 'eat');
    const {state: sleepState, send: sleepSend } = useContractFunction(tigerHuntContract, 'sleep');
    const {state: drinkState, send: drinkSend } = useContractFunction(tigerHuntContract, 'drink');
    const {state: poopState, send: poopSend } = useContractFunction(tigerHuntContract, 'poop');

    useEffect(()=>{
        if(!!account && !!TIGERHUNT_ADDRESSES[chainId])
        setTigerHuntContract(new Contract(TIGERHUNT_ADDRESSES[chainId], tigerHuntInterface));
    },[account,chainId]);

    return {
        stakeTigzState,
        stakeTigzSend
    }; 
}

export default useTigerHunt;