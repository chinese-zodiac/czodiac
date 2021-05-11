import {utils} from "ethers";
const { formatEther } = utils;

export function weiToFixed(bn,decimals) {
    if(!bn) return null;
    return Number(formatEther(bn)).toFixed(decimals);
}