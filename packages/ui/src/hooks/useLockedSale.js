import { useEffect, useState } from "react";
import { useEthers, useContractCalls } from "@usedapp/core";
import { CHAINS, CZODIAC_ADDRESSES, LOCKEDSALE_ADDRESSES} from "../constants";
import {BigNumber, Contract, utils } from "ethers";
import czodiacTokenAbi from "../abi/czodiacToken.json";
import lockedSaleAbi from "../abi/lockedSale.json";
import { localStorageManager } from "@chakra-ui/color-mode";
const {Interface} = utils;
const mainChain = CHAINS.BSC;
const defaultChain = CHAINS.BSCTestnet;

const baseSaleState = {
    saleChainId: null,
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
}

function useLockedSale() {
    const { account, chainId } = useEthers();

    const [lockedSaleState, setLockedSaleState] = useState(baseSaleState)

    const lockedSaleInterface = new Interface(lockedSaleAbi);
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

    useEffect(()=>{
        const newLockedSaleState = {...baseSaleState};
        newLockedSaleState.saleChainId = chainId === mainChain ? CHAINS.BSC : defaultChain;
        if(callResults.length === 0 || !callResults[0]) {
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

        newLockedSaleState.saleCap = callResults[1]._maxSaleSize;

        //newLockedSaleState.rate =  newLockedSaleState.saleSize.div(newLockedSaleState.saleCap);
        
        if(!!callResults[2]) newLockedSaleState.whitelistStatus = callResults[2][0];
        if(!!callResults[3]) {
            newLockedSaleState.spendings = callResults[3][0];
            //newLockedSaleState.receipts = newLockedSaleState.spendings.mul(newLockedSaleState.rate) 
        }
        setLockedSaleState(newLockedSaleState);

    },[callResults])

    return lockedSaleState
}

export default useLockedSale;