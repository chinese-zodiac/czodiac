import { useEffect, useState } from "react";
import { useEthers, useContractCalls, useContractFunction } from "@pdusedapp/core";
import { TIGERHUNT_ADDRESSES } from "../constants";
import { Contract, utils, BigNumber } from "ethers";
import useDeepCompareEffect from "../utils/useDeepCompareEffect";
import tigerHuntAbi from "../abi/tigerHunt.json";

const {Interface} = utils;

function useTigerHunt() {
    const { account, chainId } = useEthers();

    const tigerHuntInterface = new Interface(tigerHuntAbi);

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

    const ACTION = {
        DRINK:0,
        EAT:1,
        POOP:2,
        SLEEP:3,
        HUNT:4,
        GUARD:5,
        STAKETIGZ:6,
        STAKEOXZ:7
    }

    const ACTION_TIMES = {
        [ACTION.DRINK]: 3*60*60,
        [ACTION.EAT]: 7*60*60,
        [ACTION.POOP]: 8*60*60,
        [ACTION.SLEEP]: 24*60*60,
        [ACTION.HUNT]: 5*60*60,
        [ACTION.GUARD]: 12*60*60,
        [ACTION.STAKETIGZ]: 24*60*60,
        [ACTION.STAKEOXZ]: 24*60*60,
    }

    const baseTigerHuntState = {
        isPaused: null,
        actionTimestamps: [null,null,null,null,null,null,null,null],
        tigzStaked: null,
        huntBlock: null,
        huntTarget: null,
        canAction: [null,null,null,null,null,null,null,null],
        isHuntWinning: null
    }
    const [tigerHuntState, setTigerHuntState] = useState(baseTigerHuntState);

    useEffect(()=>{
        if(!!account && !!TIGERHUNT_ADDRESSES[chainId]) {
            setTigerHuntContract(new Contract(TIGERHUNT_ADDRESSES[chainId], tigerHuntInterface));
        }
        
    },[account,chainId]);


    const [calls, setCalls] = useState([]);
    useEffect(()=>{
        const newCalls = []
        if(!!TIGERHUNT_ADDRESSES[chainId]) {
            newCalls.push({
                abi:tigerHuntInterface,
                address:TIGERHUNT_ADDRESSES[chainId],
                method:'paused',
            });
        }
        if(!!TIGERHUNT_ADDRESSES[chainId] && !!account) {
            newCalls.push({
                abi:tigerHuntInterface,
                address:TIGERHUNT_ADDRESSES[chainId],
                method:'getTigerAccount',
                args: [account]
            });
            newCalls.push({
                abi:tigerHuntInterface,
                address:TIGERHUNT_ADDRESSES[chainId],
                method:'isHuntWinning',
                args: [account]
            });
        }
        setCalls(newCalls)
    },[account, chainId])
    const callResults = useContractCalls(calls) ?? [];
    useDeepCompareEffect(()=>{
        const newTigerHuntState = {...baseTigerHuntState}
        if(!callResults || callResults.length === 0 || !callResults[0] || !TIGERHUNT_ADDRESSES[chainId]) {
            setTigerHuntState(newTigerHuntState);
            return;
        }

        if(!!callResults[1]) {
            newTigerHuntState.actionTimestamps = [
                callResults[1].drinkTimestamp.add(BigNumber.from(ACTION_TIMES[ACTION.DRINK])),
                callResults[1].eatTimestamp.add(BigNumber.from(ACTION_TIMES[ACTION.EAT])),
                callResults[1].poopTimestamp.add(BigNumber.from(ACTION_TIMES[ACTION.POOP])),
                callResults[1].sleepTimestamp.add(BigNumber.from(ACTION_TIMES[ACTION.SLEEP])),
                callResults[1].huntTimestamp.add(BigNumber.from(ACTION_TIMES[ACTION.HUNT])),
                callResults[1].guardTimestamp.add(BigNumber.from(ACTION_TIMES[ACTION.GUARD])),
                callResults[1].stakeTigzTimestamp.add(BigNumber.from(ACTION_TIMES[ACTION.STAKETIGZ])),
                0
            ];
            newTigerHuntState.tigzStaked = callResults[1].tigzStaked;
            newTigerHuntState.huntBlock = callResults[1].huntBlock.toNumber();
            newTigerHuntState.huntTarget = callResults[1].huntTarget;
            newTigerHuntState.canAction = [null,null,null,null,null,null,null,null];
        }
        if(!!callResults[2]) {
            newTigerHuntState.isHuntWinning = null;
        }
        
        newTigerHuntState.isPaused = callResults[0];
        setTigerHuntState(newTigerHuntState);
    },[callResults,account,chainId])

    return {
        ...(tigerHuntState ?? baseTigerHuntState),
        ACTION:ACTION,
        stakeTigzState,
        stakeTigzSend,
        unstakeTigzState,
        unstakeTigzSend,
        tryHuntState,
        tryHuntSend,
        winHuntState,
        winHuntSend,
        refreshHuntState,
        refreshHuntSend,
        eatState,
        eatSend,
        sleepState,
        sleepSend,
        drinkState,
        drinkSend,
        poopState,
        poopSend,
    }; 
}

export default useTigerHunt;