import { useEffect, useState } from "react";
import { useEthers, useContractCalls, useContractFunction } from "@pdusedapp/core";
import { CHAINS, CZODIAC_ADDRESSES, LOCKEDSALE_ADDRESSES} from "../constants";
import {BigNumber, Contract, utils } from "ethers";
import useDeepCompareEffect from "../utils/useDeepCompareEffect";
import czodiacTokenAbi from "../abi/czodiacToken.json";
import lockedSaleAbi from "../abi/lockedSale.json";
const {Interface} = utils;

function useLockedSale() {
    const baseSaleState = {
        whitelistStatus: null,
        spendings: null,
        receipts: null,
        totalBuyers: null,
        totalSpendings: null,
        rate: null,
        startTimestamp: null,
        endTimestamp: null,
        saleSize: null,
        saleCap: null,
        tokenAddress: null,
        saleAddress: null,
        maxPurchase: null,
        minPurchase: null
    };

    const { account, chainId } = useEthers();

    const [lockedSaleState, setLockedSaleState] = useState(baseSaleState);

    const lockedSaleInterface = new Interface(lockedSaleAbi);
    const [lockedSaleContract] = useState(
        !!LOCKEDSALE_ADDRESSES[chainId] ? 
        new Contract(LOCKEDSALE_ADDRESSES[chainId], lockedSaleInterface):
        null);
    const { state, send } = useContractFunction(lockedSaleContract, 'deposit')
    const depositEther = (etherAmount) => {
        send({ value: utils.parseEther(etherAmount) })
    }

    const callResults = useContractCalls([
        {
            abi:lockedSaleInterface,
            address:LOCKEDSALE_ADDRESSES[chainId],
            method:'getState',
        },
        {
            abi:lockedSaleInterface,
            address:LOCKEDSALE_ADDRESSES[chainId],
            method:'maxSaleSize',
        },
        ...(account ? [
            {
                abi:lockedSaleInterface,
                address:LOCKEDSALE_ADDRESSES[chainId],
                method:'isWhitelisted',
                args: [account]
            },
            {
                abi:lockedSaleInterface,
                address:LOCKEDSALE_ADDRESSES[chainId],
                method:'deposits',
                args: [account]
            }
        ] :
        [])
    ]) ?? [];

    useDeepCompareEffect(()=>{
        console.log("updating");
        const newLockedSaleState = {...baseSaleState};
        newLockedSaleState.saleChainId = chainId;
        if(!callResults || callResults.length === 0 || !callResults[0]) {
            setLockedSaleState(newLockedSaleState);
            return;
        }
            
        newLockedSaleState.saleAddress = LOCKEDSALE_ADDRESSES[chainId];

        newLockedSaleState.totalBuyers = callResults[0]._totalBuyers;
        newLockedSaleState.totalSpendings = callResults[0]._totalPurchases;
        newLockedSaleState.startTimestamp = callResults[0]._startTime;
        newLockedSaleState.endTimestamp = callResults[0]._endTime;
        newLockedSaleState.saleSize = callResults[0]._tokensForSale;
        newLockedSaleState.tokenAddress = callResults[0]._token;
        newLockedSaleState.maxPurchase = callResults[0]._maxPurchase;
        newLockedSaleState.minPurchase = callResults[0]._minPurchase;

        if(!!callResults[1][0])
            newLockedSaleState.saleCap = callResults[1][0];

        newLockedSaleState.rate = !!newLockedSaleState.saleSize ?
            newLockedSaleState.saleSize.div(newLockedSaleState.saleCap) : null
        
        if(!!callResults[2]) newLockedSaleState.whitelistStatus = callResults[2][0];
        if(!!callResults[3]) {
            newLockedSaleState.spendings = callResults[3][0];
            //newLockedSaleState.receipts = newLockedSaleState.spendings.mul(newLockedSaleState.rate) 
        }
        setLockedSaleState(newLockedSaleState);

    },[callResults,account,chainId])

    return {
        ...(lockedSaleState ?? baseSaleState),
        depositEther: depositEther
    }; 
}

export default useLockedSale;