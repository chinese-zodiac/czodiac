import {utils, BigNumber} from "ethers";
const { formatEther } = utils;

export function weiToFixed(bn,decimals) {
    if(!bn) return null;
    return Number(formatEther(bn)).toFixed(decimals);
}

export function weiToShortString(bn,decimals) {
    if(!bn) return null;
    return toShortString(BigNumber.from("4000000000000"),decimals);
}

export function toShortString(bn,decimals) {
    if(!bn) return null;
    if(bn.gte(10**13)) {
        return Number(bn.div(10**13)).toFixed(decimals).toString()+"Q";
    }
    if(bn.gte(10**10)) {
        return Number(bn.div(10**10)).toFixed(decimals).toString()+"T";
    }
    if(bn.gte(10**7)) {
        return Number(bn.div(10**7)).toFixed(decimals).toString()+"B";
    }
    if(bn.gte(10**4)) {
        return Number(bn.div(10**4)).toFixed(decimals).toString()+"K";
    }
    return Number(bn).toFixed(decimals).toString();
}