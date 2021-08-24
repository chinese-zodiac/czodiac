import { useEffect, useState } from "react";
import { useEthers, useContractCalls, useContractFunction } from "@pdusedapp/core";
import { CZFARMMASTER_ADDRESSES, CZFARM_ADDRESSES } from "../constants";
import { Contract, utils, BigNumber, constants } from "ethers";
import useDeepCompareEffect from "../utils/useDeepCompareEffect";
import useBUSDPrice from "./useBUSDPrice";
import czFarmMaster from "../abi/CZFarmMaster.json";
import IAmmPair from "../abi/IAmmPair.json";
import ierc20 from "../abi/ierc20.json";
const {Interface} = utils;
//TODO: use persisted state

const weiFactor = BigNumber.from("10").pow(BigNumber.from("18"));

function useCZFarmMaster() {
  const baseCZFarmState = {
    pools: [],
    czfPerBlock: null,
    totalAllocPoint: null,
    startBlock: null,
    poolLength: null
  }
  const sendApproveLpForCZFarmMaster = async (lpAddress) => {
    if(!account || !library || !CZFARMMASTER_ADDRESSES[chainId]) return;
    const lpContract = (new Contract(lpAddress, ierc20Interface, library)).connect(library.getSigner());
    try{
      await lpContract.approve(CZFARMMASTER_ADDRESSES[chainId],constants.MaxUint256);
    } catch(err) {
      console.log(err)
    }
    
  }
  const { account, chainId, library } = useEthers();
  
  const IAmmPairInterface = new Interface(IAmmPair);
  const czfarmMasterInterface = new Interface(czFarmMaster);
  const [czFarmMasterContract, setCzFarmMasterContract] = useState(
      null);
  const { state: stateDeposit, send: sendDeposit } = useContractFunction(czFarmMasterContract, 'deposit');
  const { state: stateWithdraw, send: sendWithdraw } = useContractFunction(czFarmMasterContract, 'withdraw');
  const { state: stateClaim, send: sendClaim } = useContractFunction(czFarmMasterContract, 'claim');
  useEffect(()=>{
      if(!!account && !!CZFARMMASTER_ADDRESSES[chainId])
      setCzFarmMasterContract(new Contract(CZFARMMASTER_ADDRESSES[chainId], czfarmMasterInterface));
  },[account,chainId]);


  const [czFarmState, setCZFarmState] = useState(baseCZFarmState);
  const ierc20Interface = new Interface(ierc20);
  const czfBusdPrice = useBUSDPrice(CZFARM_ADDRESSES[chainId]);
  
  const [calls, setCalls] = useState([]);
  const callResults = useContractCalls(calls) ?? [];
  const [poolCalls, setpoolCalls] = useState([]);
  const poolCallResults = useContractCalls(poolCalls) ?? [];
  const [lpCalls, setLpCalls] = useState([]);
  const lpCallsResults = useContractCalls(lpCalls) ?? [];

  useEffect(()=>{
        const newCalls = []
        if(!!CZFARMMASTER_ADDRESSES[chainId]) {
            newCalls.push({
                abi:czfarmMasterInterface,
                address:CZFARMMASTER_ADDRESSES[chainId],
                method:'czfPerBlock'
            });
            newCalls.push({
                abi:czfarmMasterInterface,
                address:CZFARMMASTER_ADDRESSES[chainId],
                method:'totalAllocPoint'
            });
            newCalls.push({
                abi:czfarmMasterInterface,
                address:CZFARMMASTER_ADDRESSES[chainId],
                method:'startBlock'
            });
            newCalls.push({
                abi:czfarmMasterInterface,
                address:CZFARMMASTER_ADDRESSES[chainId],
                method:'poolLength'
            });
        }
        setCalls(newCalls)
    },[account, chainId]);
  
    useDeepCompareEffect(()=>{
        let newCZFarmState = {...czFarmState}
        if(!callResults || callResults.length === 0 || !callResults[0] || !CZFARMMASTER_ADDRESSES[chainId]) {
            let newCZFarmState = {...baseCZFarmState}
            setCZFarmState(newCZFarmState);
            return;
        }        
        newCZFarmState.czfPerBlock = callResults[0][0];
        newCZFarmState.totalAllocPoint = callResults[1][0].toNumber();
        newCZFarmState.startBlock = callResults[2][0].toNumber();
        newCZFarmState.poolLength = callResults[3][0].toNumber();
        let newPoolCalls = []
        if(!!newCZFarmState.poolLength){
          for(let pid=0; pid<newCZFarmState.poolLength; pid++) {
            newPoolCalls.push({
                  abi:czfarmMasterInterface,
                  address:CZFARMMASTER_ADDRESSES[chainId],
                  method:'poolInfo',
                  args: [pid]
            });
          }
        }
        if(!!newCZFarmState.poolLength && !!account){
          for(let pid=0; pid<newCZFarmState.poolLength; pid++) {
            newPoolCalls.push({
                  abi:czfarmMasterInterface,
                  address:CZFARMMASTER_ADDRESSES[chainId],
                  method:'userInfo',
                  args: [pid,account]
            });
          }
          for(let pid=0; pid<newCZFarmState.poolLength; pid++) {
            newPoolCalls.push({
                  abi:czfarmMasterInterface,
                  address:CZFARMMASTER_ADDRESSES[chainId],
                  method:'pendingCzf',
                  args: [pid,account]
            });
          }
        }
        setpoolCalls(newPoolCalls);
        setCZFarmState(newCZFarmState);
    },[callResults]);
    useDeepCompareEffect(()=>{
        let newCZFarmState = {...czFarmState}        
        if(!poolCallResults || poolCallResults.length === 0 || !poolCallResults[0] || !CZFARMMASTER_ADDRESSES[chainId]) {
            return;
        }  
        let newPools = [];
        let newLpCalls = [];
        for(let pid=0; pid<newCZFarmState.poolLength; pid++) {
          let pool = {
            lpToken: poolCallResults[pid].lpToken,
            allocPoint: poolCallResults[pid].allocPoint.toNumber(),
            lastRewardBlock: poolCallResults[pid].lastRewardBlock.toNumber(),
            accCzfPerShare: poolCallResults[pid].accCzfPerShare
          }
          pool.sendApprove = () => sendApproveLpForCZFarmMaster(pool.lpToken);
          if(poolCallResults.length > newCZFarmState.poolLength && !!account) {
            pool.userInfo = {
          //TODO: add user approval wad
              amount: poolCallResults[pid+newCZFarmState.poolLength].amount,
              rewardDebt: poolCallResults[pid+newCZFarmState.poolLength].rewardDebt,
              pendingRewards: poolCallResults[pid+newCZFarmState.poolLength].pendingRewards,
              pendingCzf: poolCallResults[pid+newCZFarmState.poolLength*2].pendingCzf
            }
          }
          newPools.push(pool)
        }
        newCZFarmState.pools = newPools

        
        for(let pid=0; pid<newCZFarmState.poolLength; pid++) {
          //lp calls for lp czf balance
          newLpCalls.push({
                abi:ierc20Interface,
                address:CZFARM_ADDRESSES[chainId],
                method:'balanceOf',
                args: [newCZFarmState.pools[pid].lpToken]
          });
        }
        for(let pid=0; pid<newCZFarmState.poolLength; pid++) {
          //lp calls for lp total supply
          newLpCalls.push({
                abi:ierc20Interface,
                address:newCZFarmState.pools[pid].lpToken,
                method:'totalSupply'
          });
        }
        for(let pid=0; pid<newCZFarmState.poolLength; pid++) {
          //lp calls for lp balance of czfarm master
          newLpCalls.push({
                abi:ierc20Interface,
                address:newCZFarmState.pools[pid].lpToken,
                method:'balanceOf',
                args: [CZFARMMASTER_ADDRESSES[chainId]]
          });
        }
        if(!!account){
          for(let pid=0; pid<newCZFarmState.poolLength; pid++) {
            //lp calls for lp balance of user
            newLpCalls.push({
                  abi:ierc20Interface,
                  address:newCZFarmState.pools[pid].lpToken,
                  method:'balanceOf',
                  args: [account]
            });
          }
          for(let pid=0; pid<newCZFarmState.poolLength; pid++) {
            newLpCalls.push({
                  abi:ierc20Interface,
                  address:newCZFarmState.pools[pid].lpToken,
                  method:'allowance',
                  args: [account,CZFARMMASTER_ADDRESSES[chainId]]
            });
          }
        }

        setLpCalls(newLpCalls);
        setCZFarmState(newCZFarmState);
    },[poolCallResults]);
    useDeepCompareEffect(()=>{
        let newCZFarmState = {...czFarmState}
        if(!czfBusdPrice || !lpCallsResults || lpCallsResults.length === 0 || !lpCallsResults[0] || !CZFARMMASTER_ADDRESSES[chainId] || !newCZFarmState.pools || !(newCZFarmState.pools.length == newCZFarmState.poolLength)) {
            return;
        }

        for(let pid=0; pid<newCZFarmState.poolLength; pid++) {
          let pool = newCZFarmState.pools[pid];
          pool.pid = pid;
          pool.lpCzfBalance = lpCallsResults[pid][0];
          pool.lpTotalSupply = lpCallsResults[pid+newCZFarmState.poolLength][0];
          pool.lpBalance = lpCallsResults[pid+newCZFarmState.poolLength*2][0];
          pool.lpUsdPrice = pool.lpCzfBalance.mul(czfBusdPrice).mul(BigNumber.from("2")).div(pool.lpTotalSupply);
          if(!!lpCallsResults[pid+newCZFarmState.poolLength*3]){
            pool.userInfo.lpBalance = lpCallsResults[pid+newCZFarmState.poolLength*3][0];
            pool.userInfo.lpBalanceValue = pool.userInfo.lpBalance.mul(pool.lpUsdPrice).div(weiFactor);
          }
          if(!!lpCallsResults[pid+newCZFarmState.poolLength*4]){
            pool.userInfo.lpAllowance = lpCallsResults[pid+newCZFarmState.poolLength*4][0];            
          }
          pool.czfPerBlock = newCZFarmState.czfPerBlock.mul(pool.allocPoint).div(newCZFarmState.totalAllocPoint);
          pool.czfPerDay = pool.czfPerBlock.mul(BigNumber.from("28800"));
          pool.usdValue = pool.lpUsdPrice.mul(pool.lpBalance).div(weiFactor);
          pool.usdPerBlock = newCZFarmState.czfPerBlock.mul(czfBusdPrice).div(weiFactor);
          if(pool.usdValue.gt(BigNumber.from("0")) && pool.lpBalance.gt(BigNumber.from("0"))){
            pool.aprBasisPoints = pool.usdPerBlock.mul(BigNumber.from("10519200")).mul(BigNumber.from("10000")).div(pool.usdValue);
            pool.userInfo.czfPerBlock = pool.czfPerBlock.mul(pool.userInfo.amount).div(pool.lpBalance);
            pool.userInfo.czfPerDay = pool.userInfo.czfPerBlock.mul(BigNumber.from("28800"));
            pool.userInfo.usdPerDay = pool.userInfo.czfPerDay.mul(pool.lpUsdPrice).div(weiFactor);
          }
          pool.userInfo.amountValue = pool.userInfo.amount.mul(pool.lpUsdPrice).div(weiFactor);
          pool.userInfo.pendingValue = pool.userInfo.pendingRewards.mul(pool.lpUsdPrice).div(weiFactor);
          newCZFarmState.pools[pid] = pool;
        }
        (async ()=>{
          if(!!account){
            const tokens = await Promise.all(
              newCZFarmState.pools.map((pool)=>{
                let pairContract = new Contract(pool.lpToken, IAmmPairInterface, library);
                return Promise.all([
                  pairContract.token0(),
                  pairContract.token1()
                ])
              })
            );

            for(let pid=0; pid<newCZFarmState.poolLength; pid++) {
              newCZFarmState.pools[pid].tokens = [{
                address:tokens[pid][0]
              },{
                address:tokens[pid][1]
              }]
            }
            const symbols = await Promise.all(
              newCZFarmState.pools.map((pool)=>{
                let token0Contract = new Contract(pool.tokens[0].address, IAmmPairInterface, library);
                let token1Contract = new Contract(pool.tokens[1].address, IAmmPairInterface, library);
                return Promise.all([
                  token0Contract.symbol(),
                  token1Contract.symbol()
                ])
              })
            )
            for(let pid=0; pid<newCZFarmState.poolLength; pid++) {
              newCZFarmState.pools[pid].tokens[0].symbol = symbols[pid][0];
              newCZFarmState.pools[pid].tokens[1].symbol = symbols[pid][1];
            }
          }
          console.log(newCZFarmState);
          setCZFarmState(newCZFarmState);
        })()
    },[lpCallsResults,czfBusdPrice])


  return {
    ...(czFarmState ?? baseCZFarmState),
    stateDeposit,
    sendDeposit,
    stateWithdraw,
    sendWithdraw,
    stateClaim,
    sendClaim
  }
}

export default useCZFarmMaster;