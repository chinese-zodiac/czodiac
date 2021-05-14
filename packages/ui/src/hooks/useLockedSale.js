import { useEffect, useState } from "react";
import { useEthers, useContractCalls } from "@usedapp/core";
import { CHAINS, CZODIAC_ADDRESSES, LOCKEDSALE_ADDRESSES} from "../constants";
import {BigNumber, Contract, utils } from "ethers";
import czodiacTokenAbi from "../abi/czodiacToken.json";
import lockedSaleAbi from "../abi/lockedSale.json";
const {Interface} = utils;

function useLockedSale(account, chainId) {

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
    }

    const [lockedSaleState, setLockedSaleState] = useState(baseSaleState);

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
    ]);

    useEffect(()=>{
        console.log("updating");
        const results = [...callResults];
        const newLockedSaleState = {...baseSaleState};
        newLockedSaleState.saleChainId = chainId;
        if(!results || results.length === 0 || !results[0]) {
            setLockedSaleState(newLockedSaleState);
            return;
        }
            
        newLockedSaleState.saleAddress = LOCKEDSALE_ADDRESSES[chainId];

        newLockedSaleState.totalBuyers = results[0]._totalBuyers;
        newLockedSaleState.totalSpendings = results[0]._totalPurchases;
        newLockedSaleState.startTimestamp = results[0]._startTime;
        newLockedSaleState.endTimestamp = results[0]._endTime;
        newLockedSaleState.saleSize = results[0]._tokensForSale;
        newLockedSaleState.tokenAddress = results[0]._token;
        newLockedSaleState.maxPurchase = results[0]._maxPurchase;
        newLockedSaleState.minPurchase = results[0]._minPurchase;

        newLockedSaleState.saleCap = results[1]._maxSaleSize;

        //newLockedSaleState.rate =  newLockedSaleState.saleSize.div(newLockedSaleState.saleCap);
        
        if(!!results[2]) newLockedSaleState.whitelistStatus = results[2][0];
        if(!!results[3]) {
            newLockedSaleState.spendings = results[3][0];
            //newLockedSaleState.receipts = newLockedSaleState.spendings.mul(newLockedSaleState.rate) 
        }
        setLockedSaleState(newLockedSaleState);

    },[account,chainId])

    return lockedSaleState
}

export default useLockedSale;