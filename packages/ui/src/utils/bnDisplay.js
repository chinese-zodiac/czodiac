import {utils, BigNumber} from "ethers";
const { formatEther, parseEther } = utils;

export function weiToFixed(bn,decimals) {
    if(!bn) return (0).toFixed(decimals);
    return Number(formatEther(bn)).toFixed(decimals);
}

export function weiToShortString(bn,decimals) {
    if(!bn) return (0).toFixed(decimals);
    return toShortString(bn.div(BigNumber.from("10").pow(18)),decimals);
}

export function tokenAmtToShortString(bn,tokenDecimals,decimals) {
    if(!bn) return (0).toFixed(decimals);
    return toShortString(bn.div(BigNumber.from("10").pow(tokenDecimals)),decimals);
}

export function toShortString(bn,decimals) {
    if(!bn) return (0).toFixed(decimals);
    if(bn.gte(10**12)) {
        return (Number(bn)/10**12).toFixed(decimals)+"T";
    }
    if(bn.gte(10**9)) {
        return (Number(bn)/10**9).toFixed(decimals)+"B";
    }
    if(bn.gte(10**6)) {
        return (Number(bn)/10**6).toFixed(decimals)+"M";
    }
    if(bn.gte(10**3)) {
        return(Number(bn)/10**3).toFixed(decimals)+"K";
    }
    return Number(bn).toFixed(decimals);
}