import { useEffect, useState } from "react";
import { useEthers, useContractCalls, useContractFunction, useBlockNumber } from "@pdusedapp/core";
import { CZFARMMASTER_ADDRESSES, CZFARM_ADDRESSES, BUSD_ADDRESSES } from "../constants";
import { Contract, utils, BigNumber, constants } from "ethers";
import useDeepCompareEffect from "../utils/useDeepCompareEffect";
import useBUSDPrice from "./useBUSDPrice";
import czFarmMaster from "../abi/CZFarmMaster.json";
import IAmmPair from "../abi/IAmmPair.json";
import ierc20 from "../abi/ierc20.json";
const {Interface, parseEther} = utils;
//TODO: use persisted state

const weiFactor = BigNumber.from("10").pow(BigNumber.from("18"));
const DEX = {
  PCS: {
    name: "Pancakeswap",
    shortName: "PCS",
    baseUrl: "https://pancakeswap.finance/"
  },
  CAFE: {
    name: "Cafeswap",
    shortName: "CAFE",
    baseUrl: "https://dex.cafeswap.finance/#/"
  }
}
const farmLps = [
  "0xAAC96d00C566571bafdfa3B8440Bdc3cDB223Ad0",
  "0xeF8e8CfADC0b634b6d0065080a69F139159a17dE",
  "0xd2a20e23fC707e41Fe4C09f23473A0170d00707e",
  false,
  "0x36eC3cD5b3dA4E3cc05a49b65EF655564dDbA8ce",
  "0x98b5F5E7Ec32cda1F3E89936c9972f92296aFE47",
  "0xd7C6Fc00FAe64cb7D242186BFD21e31C5b175671",
  "0xE90AEbc91Df3b534F4e2D74b527FaA6f49d45a77"
];
const farmDex = [
  DEX.PCS,
  DEX.PCS,
  DEX.PCS,
  false,
  DEX.PCS,
  DEX.PCS,
  DEX.PCS,
  DEX.PCS
];
const farmTokens = [
  [
    {
      address:"0x7c1608C004F20c3520f70b924E2BfeF092dA0043",
      symbol:"CZF"
    },
    {
      address:"0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
      symbol:"BUSD"
    }
  ],
  [
    {
      address:"0x7c1608C004F20c3520f70b924E2BfeF092dA0043",
      symbol:"CZF"
    },
    {
      address:"0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      symbol:"WBNB"
    }
  ],
  [
    {
      address:"0x535874bfbecac5f235717faea7c26d01c67b38c5",
      symbol:"TIGZ"
    },
    {
      address:"0x7c1608C004F20c3520f70b924E2BfeF092dA0043",
      symbol:"CZF"
    }
  ],
  [
    false,
    false
  ],
  [
    {
      address:"0x7c1608C004F20c3520f70b924E2BfeF092dA0043",
      symbol:"CZF"
    },
    {
      address:"0xDd2F98a97fc2A59b1f0f03DE63B4b41041a339B0",
      symbol:"TIGZHP"
    }
  ],
  [
    {
      address:"0x7c1608C004F20c3520f70b924E2BfeF092dA0043",
      symbol:"CZF"
    },
    {
      address:"0xE68b79e51bf826534Ff37AA9CeE71a3842ee9c70",
      symbol:"CZUSD"
    }
  ],
  [
    {
      address:"0xE68b79e51bf826534Ff37AA9CeE71a3842ee9c70",
      symbol:"CZUSD"
    },
    {
      address:"0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
      symbol:"BUSD"
    }
  ],
  [
    {
      address:"0x7c1608C004F20c3520f70b924E2BfeF092dA0043",
      symbol:"CZF"
    },
    {
      address:"0xfDFD27aE39cebefDBaAc8615F18aa68DDD0F15f5",
      symbol:"GHD"
    }
  ]
];

function useCZFarmMaster() {
  const baseCZFarmState = {
    pools: farmLps.map((lpToken,index)=>{return {lpToken:lpToken,tokens:farmTokens[index]}}).filter(p=>!!p.lpToken),
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
            if(!farmLps[pid]) continue;
            newCalls.push({
                  abi:czfarmMasterInterface,
                  address:CZFARMMASTER_ADDRESSES[chainId],
                  method:'poolInfo',
                  args: [pid]
            });
          }
          for(let pid=0; pid<farmLps.length; pid++) {
            if(!farmLps[pid]) continue;
            //lp calls for lp czf balance
            if(farmTokens[pid][0].address == BUSD_ADDRESSES[chainId] || farmTokens[pid][1].address == BUSD_ADDRESSES[chainId]) {
              newCalls.push({
                    abi:ierc20Interface,
                    address:BUSD_ADDRESSES[chainId],
                    method:'balanceOf',
                    args: [farmLps[pid]]
              });
            } else {
              newCalls.push({
                    abi:ierc20Interface,
                    address:CZFARM_ADDRESSES[chainId],
                    method:'balanceOf',
                    args: [farmLps[pid]]
              });
            }
          }
          for(let pid=0; pid<farmLps.length; pid++) {
            if(!farmLps[pid]) continue;
            //lp calls for lp total supply
            newCalls.push({
                  abi:ierc20Interface,
                  address:farmLps[pid],
                  method:'totalSupply'
            });
          }
          for(let pid=0; pid<farmLps.length; pid++) {
            if(!farmLps[pid]) continue;
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
              if(!farmLps[pid]) continue;
              newCalls.push({
                    abi:czfarmMasterInterface,
                    address:CZFARMMASTER_ADDRESSES[chainId],
                    method:'userInfo',
                    args: [pid,account]
              });
            }
            for(let pid=0; pid<farmLps.length; pid++) {
              if(!farmLps[pid]) continue;
              newCalls.push({
                    abi:czfarmMasterInterface,
                    address:CZFARMMASTER_ADDRESSES[chainId],
                    method:'pendingCzf',
                    args: [pid,account]
              });
            }
            for(let pid=0; pid<farmLps.length; pid++) {
              if(!farmLps[pid]) continue;
              //lp calls for lp balance of user
              newCalls.push({
                    abi:ierc20Interface,
                    address:farmLps[pid],
                    method:'balanceOf',
                    args: [account]
              });
            }
            for(let pid=0; pid<farmLps.length; pid++) {
              if(!farmLps[pid]) continue;
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
            return;
        }        
        newCZFarmState.czfPerBlock = callResults[0][0];
        newCZFarmState.totalAllocPoint = callResults[1][0].toNumber();
        newCZFarmState.startBlock = callResults[2][0].toNumber();

        let validFarmLength = farmLps.reduce((prev,curr)=>!curr ? prev - 1 : prev,farmLps.length);
        let offset = 0;
        for(let i=0; i<farmLps.length; i++) {
          if(!farmLps[i]) {
            offset -= 1;
            continue;
          }
          let pid = i + offset;
          let poolInfoResults = callResults[3+pid];
          let pool = {
            lpToken: farmLps[i],
            tokens: farmTokens[i],
            dex: farmDex[i],
            allocPoint: poolInfoResults.allocPoint.toNumber(),
            lastRewardBlock: poolInfoResults.lastRewardBlock.toNumber(),
            accCzfPerShare: poolInfoResults.accCzfPerShare,
            sendApprove: () => sendApproveLpForCZFarmMaster(farmLps[i]),
            pid: i,
            lpCzfBalance: callResults[3+validFarmLength*1+pid][0],
            lpTotalSupply: callResults[3+validFarmLength*2+pid][0],
            lpBalance: callResults[3+validFarmLength*3+pid][0]
          }


          if(farmTokens[i][0].address == BUSD_ADDRESSES[chainId] || farmTokens[i][1].address == BUSD_ADDRESSES[chainId]) {
            console.log(pid,czfBusdPrice.toString(),parseEther("1").toString())
            pool.lpUsdPrice = pool.lpCzfBalance.mul(parseEther("1")).mul(BigNumber.from("2")).div(pool.lpTotalSupply);
          } else {
            pool.lpUsdPrice = pool.lpCzfBalance.mul(czfBusdPrice).mul(BigNumber.from("2")).div(pool.lpTotalSupply);
          }
          pool.czfPerBlock = newCZFarmState.czfPerBlock.mul(pool.allocPoint).div(newCZFarmState.totalAllocPoint);
          pool.czfPerDay = pool.czfPerBlock.mul(BigNumber.from("28800"));
          pool.usdValue = pool.lpUsdPrice.mul(pool.lpBalance).div(weiFactor);
          pool.usdPerDay = pool.czfPerDay.mul(czfBusdPrice).div(weiFactor);
          if(callResults.length > 3+validFarmLength*3 && !!callResults[3+validFarmLength*4+1]) {
            //results from account
            const userInfoResults = callResults[3+validFarmLength*4+pid];
            const pendingCzfResults = callResults[3+validFarmLength*5+pid];
            pool.userInfo = {
              amount: userInfoResults.amount,
              rewardDebt: userInfoResults.rewardDebt,
              pendingRewards: userInfoResults.pendingRewards,
              pendingCzf: pendingCzfResults[0],
              lpBalance: callResults[3+validFarmLength*6+pid][0],
              lpAllowance: callResults[3+validFarmLength*7+pid][0],
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
        setCZFarmState(newCZFarmState);
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