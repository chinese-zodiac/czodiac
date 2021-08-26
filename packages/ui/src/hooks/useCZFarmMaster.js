import { useEffect, useState } from "react";
import { useEthers, useContractCalls, useContractFunction, useBlockNumber } from "@pdusedapp/core";
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
const farmLps = [
  "0xAAC96d00C566571bafdfa3B8440Bdc3cDB223Ad0",
  "0xeF8e8CfADC0b634b6d0065080a69F139159a17dE",
  "0xd2a20e23fC707e41Fe4C09f23473A0170d00707e"
];

function useCZFarmMaster() {
  const baseCZFarmState = {
    pools: farmLps.map((lpToken)=>{return {lpToken:lpToken}}),
    czfPerBlock: null,
    totalAllocPoint: null,
    startBlock: null,
    poolLength: farmLps.length
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
          for(let pid=0; pid<farmLps.length; pid++) {
            newCalls.push({
                  abi:czfarmMasterInterface,
                  address:CZFARMMASTER_ADDRESSES[chainId],
                  method:'poolInfo',
                  args: [pid]
            });
          }
          for(let pid=0; pid<farmLps.length; pid++) {
            //lp calls for lp czf balance
            newCalls.push({
                  abi:ierc20Interface,
                  address:CZFARM_ADDRESSES[chainId],
                  method:'balanceOf',
                  args: [farmLps[pid]]
            });
          }
          for(let pid=0; pid<farmLps.length; pid++) {
            //lp calls for lp total supply
            newCalls.push({
                  abi:ierc20Interface,
                  address:farmLps[pid],
                  method:'totalSupply'
            });
          }
          for(let pid=0; pid<farmLps.length; pid++) {
            //lp calls for lp balance of czfarm master
            newCalls.push({
                  abi:ierc20Interface,
                  address:farmLps[pid],
                  method:'balanceOf',
                  args: [CZFARMMASTER_ADDRESSES[chainId]]
            });
          }
          if(!!account){
            for(let pid=0; pid<farmLps.length; pid++) {
              newCalls.push({
                    abi:czfarmMasterInterface,
                    address:CZFARMMASTER_ADDRESSES[chainId],
                    method:'userInfo',
                    args: [pid,account]
              });
            }
            for(let pid=0; pid<farmLps.length; pid++) {
              newCalls.push({
                    abi:czfarmMasterInterface,
                    address:CZFARMMASTER_ADDRESSES[chainId],
                    method:'pendingCzf',
                    args: [pid,account]
              });
            }
            for(let pid=0; pid<farmLps.length; pid++) {
              //lp calls for lp balance of user
              newCalls.push({
                    abi:ierc20Interface,
                    address:farmLps[pid],
                    method:'balanceOf',
                    args: [account]
              });
            }
            for(let pid=0; pid<farmLps.length; pid++) {
              newCalls.push({
                    abi:ierc20Interface,
                    address:farmLps[pid],
                    method:'allowance',
                    args: [account,CZFARMMASTER_ADDRESSES[chainId]]
              });
            }
          }
        }
        setCalls(newCalls)
    },[account, chainId]);
  
    useDeepCompareEffect(()=>{
        let newCZFarmState = {...czFarmState}
        if(!callResults || callResults.length === 0 || !callResults[0] || !CZFARMMASTER_ADDRESSES[chainId] || !czfBusdPrice) {
            let newCZFarmState = {...baseCZFarmState}
            setCZFarmState(newCZFarmState);
            return;
        }        
        newCZFarmState.czfPerBlock = callResults[0][0];
        newCZFarmState.totalAllocPoint = callResults[1][0].toNumber();
        newCZFarmState.startBlock = callResults[2][0].toNumber();

        for(let pid=0; pid<farmLps.length; pid++) {
          let poolInfoResults = callResults[3+pid];
          let pool = {
            lpToken: farmLps[pid],
            allocPoint: poolInfoResults.allocPoint.toNumber(),
            lastRewardBlock: poolInfoResults.lastRewardBlock.toNumber(),
            accCzfPerShare: poolInfoResults.accCzfPerShare,
            sendApprove: () => sendApproveLpForCZFarmMaster(pool),
            pid: pid,
            lpCzfBalance: callResults[3+farmLps.length*1+pid][0],
            lpTotalSupply: callResults[3+farmLps.length*2+pid][0],
            lpBalance: callResults[3+farmLps.length*3+pid][0]
          }
          pool.lpUsdPrice = pool.lpCzfBalance.mul(czfBusdPrice).mul(BigNumber.from("2")).div(pool.lpTotalSupply);
          pool.czfPerBlock = newCZFarmState.czfPerBlock.mul(pool.allocPoint).div(newCZFarmState.totalAllocPoint);
          pool.czfPerDay = pool.czfPerBlock.mul(BigNumber.from("28800"));
          pool.usdValue = pool.lpUsdPrice.mul(pool.lpBalance).div(weiFactor);
          pool.usdPerDay = pool.czfPerDay.mul(czfBusdPrice).div(weiFactor);
          if(callResults.length > 3+farmLps.length*3) {
            //results from account
            console.log(3+farmLps.length*8)
            const userInfoResults = callResults[3+farmLps.length*4+pid];
            const pendingCzfResults = callResults[3+farmLps.length*5+pid];
            pool.userInfo = {
              amount: userInfoResults.amount,
              rewardDebt: userInfoResults.rewardDebt,
              pendingRewards: userInfoResults.pendingRewards,
              pendingCzf: pendingCzfResults.pendingCzf,
              lpBalance: callResults[3+farmLps.length*6+pid][0],
              lpAllowance: callResults[3+farmLps.length*7+pid][0],
            }
            pool.userInfo.lpBalanceValue = pool.userInfo.lpBalance.mul(pool.lpUsdPrice).div(weiFactor);
            pool.userInfo.amountValue = pool.userInfo.amount.mul(pool.lpUsdPrice).div(weiFactor);
            pool.userInfo.pendingValue = pool.userInfo.pendingRewards.mul(pool.lpUsdPrice).div(weiFactor);
          }
          if(pool.usdValue.gt(BigNumber.from("0")) && pool.lpBalance.gt(BigNumber.from("0"))){
            pool.aprBasisPoints = pool.usdPerDay.mul(BigNumber.from("365")).mul(BigNumber.from("10000")).div(pool.usdValue);
            if(!!pool.userInfo) {
              pool.userInfo.czfPerBlock = pool.czfPerBlock.mul(pool.userInfo.amount).div(pool.lpBalance);
              pool.userInfo.czfPerDay = pool.userInfo.czfPerBlock.mul(BigNumber.from("28800"));
              pool.userInfo.usdPerDay = pool.userInfo.czfPerDay.mul(czfBusdPrice).div(weiFactor);
            }            
          }
          newCZFarmState.pools[pid] = pool;
        }
        console.log(newCZFarmState.pools);
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
          setCZFarmState(newCZFarmState);
        })()
    },[callResults,czfBusdPrice,stateDeposit,stateWithdraw,stateClaim])


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