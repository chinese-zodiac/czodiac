import { useEffect, useState } from "react";
import { useEthers, useCall, useContractFunction, useBlockNumber } from "@pdusedapp/core";
import { Contract, utils, BigNumber, constants } from "ethers";
import { CZVPEGV2, CZUSD3EPS_POOL } from "../constants";
import { CHAINS, UNISWAPFACTORY_ADDRESSES } from "../constants";
import czPegV2Abi from "../abi/CZVPegV2.json";
import metaPoolAbi from "../abi/IMetaPool.json";
import { parseEther, formatEther } from "@ethersproject/units";
import { gssBnAsync } from "../utils/goldenSearch";

const {Interface} = utils;

async function getRepegParams(library) {
  if(!library) return {
        wad: BigNumber.from("0"),
        isOverPeg: true
      }
  const czusd3EpsPool = new Contract(CZUSD3EPS_POOL[CHAINS.BSC], new Interface(metaPoolAbi), library);
  let max10sExponent = 1;
  let smallDy = await czusd3EpsPool.get_dy_underlying(0,1,parseEther("10"));
  let isOverPeg = smallDy.gt(parseEther("10"));
  if(!isOverPeg) { //check if delta too small to rebalance
    smallDy = await czusd3EpsPool.get_dy_underlying(1,0,parseEther("10"));
    if(smallDy.lt(parseEther("10"))) {
      return {
        wad: BigNumber.from("0"),
        isOverPeg: true
      }
    }
  }
  let dyCalc = isOverPeg ? 
    async dx => await czusd3EpsPool.get_dy_underlying(0,1,dx) : 
    async dx => await czusd3EpsPool.get_dy_underlying(1,0,dx)
  while (true) {
    let dx = parseEther(max10sExponent.toString())
    let dy = await dyCalc(dx);
    if(dy.lt(dx)) break;
    max10sExponent = max10sExponent*10;
  }
  //The goal is to find the minimum of this function.
  let f = async (dx) => {
    return (
      (await dyCalc(dx))
      .sub(dx)
      .mul(-1)); //multiply by negative one so the minimum is our maximum profit
  }
  let dx;
  if(max10sExponent > 10) {
    dx = await gssBnAsync(f,parseEther("10"),parseEther(max10sExponent.toString()),parseEther("10"),100);
  } else {
    dx = 0;
  }
  return {
    wad: dx,
    isOverPeg: isOverPeg
  }
}

function useCZVPegV2(chainId, account, library) {
  const czPegV2Contract = new Contract(CZVPEGV2[CHAINS.BSC], new Interface(czPegV2Abi));
  const [repegWad, setRepegWad] = useState(null);
  const [isOverPeg, setIsOverPeg] = useState(null);
  const { state: stateRepegV2, send: sendRepegV2 } = useContractFunction(czPegV2Contract, 'repeg');

  useEffect(()=>{
    if(chainId != CHAINS.BSC || !account) {
      setRepegWad(null);
      setIsOverPeg(null);
      return;
    }
    (async () =>{
      const newRepegParams = await getRepegParams(library);
      setRepegWad(newRepegParams.wad);
      setIsOverPeg(newRepegParams.isOverPeg);
    })();
  },[chainId,account])

  return {
    repegWad: repegWad,
    isOverPeg: isOverPeg,
    stateRepeg: stateRepegV2,
    sendRepegV2: sendRepegV2
  }
}
export default useCZVPegV2;