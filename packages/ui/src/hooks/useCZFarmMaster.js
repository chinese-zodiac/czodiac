import { useEffect, useState } from "react";
import { useEthers, useContractCalls, useContractFunction, useBlockNumber } from "@pdusedapp/core";
import { CZFARMMASTER_ADDRESSES, CZFARM_ADDRESSES, BUSD_ADDRESSES, CZUSD } from "../constants";
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
  },
  DONK: {
    name: "Donkswap",
    shortName: "DONK",
    baseUrl: "https://donkswap.com/#/"
  },
  SHRK: {
    name: "Autoshark",
    shortName: "SHRK",
    baseUrl: "https://autoshark.finance/"
  },
  JETS: {
    name: "Jetswap",
    shortName: "JETS",
    baseUrl: "https://exchange.jetswap.finance/#/"
  },
  BABY: {
    name: "Babyswap",
    shortName: "BABY",
    baseUrl: "https://exchange.babyswap.finance/#/"
  },
  GTAR: {
    name: "Guitarswap",
    shortName: "GTAR",
    baseUrl: "https://guitarswap.exchange/"
  },
  AMPL: {
    name: "Ampleswap",
    shortName: "AMPL",
    baseUrl: "https://ampleswap.com/"
  },
  APE: {
    name: "Apeswap",
    shortName: "APE",
    baseUrl: "https://app.apeswap.finance/"
  },
  EPS: {
    name: "Ellipsis",
    shortName: "EPS",
    baseUrl: "https://ellipsis.finance/pool/0"
  },
  DONK: {
    name: "DonkSwap",
    shortName: "DONK",
    baseUrl: "https://www.donkswap.com/#/"
  }
}
const farmLps = [
  "0xAAC96d00C566571bafdfa3B8440Bdc3cDB223Ad0",
  "0xeF8e8CfADC0b634b6d0065080a69F139159a17dE",
  false,
  false,
  false,
  "0x98b5F5E7Ec32cda1F3E89936c9972f92296aFE47",
  "0xd7C6Fc00FAe64cb7D242186BFD21e31C5b175671",
  "0xE90AEbc91Df3b534F4e2D74b527FaA6f49d45a77",
  "0x3e9c5352c486524a407d9900a5a3a9d05b6c14e6",
  false,//CZF/BREW - CAFE
  "0x41063A1AEFE6d6f4b44a2b030bB259673dCA8bA6", //CZF/IF1 -PCS
  "0x425183B75687a54e1D77eE7580ec42FfEB6610bF", //CZF/BRY -PCS
  false, //CZF/GM1 -BABY
  "0x9C8bae84261eA499c628a4aaD925564766210e64", //CZF/BTCB -PCS
  "0xEcEEC5745Acf050A3a464fd2FAF64c1d683c8616", //CZF/ETH -PCS
  "0x13573b1970611bb401f0B75994C80E16c8F56C35", //CZF/CAKE -PCS
  false, //CZF/PRHO -PCS
  "0x4E80c807233546F3F820ADEbCE64E75f5Eac3AB8", //CZF/ADA -PCS
  false, //CZF/GUT -GTAR
  "0xd5654a515f1cec88d1e3011e6729a3bd023b7533", //CZF/AMPLE -AMPL
  "0x970b0c00880a5e2D5aa64aeb4a38CD3E82A2d5Cb", //CZF/MAINST -APE
  false, //CZF/BABY -BABY
  "0xaCC6AF9C62B482Cb89522e262F8b315d870208ab", //CZF/DEP -APE
  "0x8Bb25E9CD67AF1E2b961A905e76A95E675b69645", //CZUSD/DEP -APE
  "0xC1a52E938fFd0eda3C6AD78CE86179adC9D59FeB", //CZUSD/3EPS -EPS
  "0x336b2ea94fca2798b0679e4d12b96472fe067baf", //CZF/OLIVE -PCS
  "0x6b080059Fdd75113CeE43fb57A8B8c900d527D81", //CZF/CWE -PCS
  "0x01ab57d5062eFa63F87F062C981F7BE6C2Fe2739", //CZF/WNOW -PCS
  "0x33FcB84f5e79082f62BA7de8285C9b37a68f1a02", //CZF/DONK -PCS
  //"0x7acafdf90a85a88b1bcdb802d708752dd4478bf5", //CZF/WSOW -BABY
  //"0x1865ba1400ade61d3e01974e63a5bd31362f6683", //CZF/JAWS -SHRK
  //"0xF2F04Fa27274d02E9E72B324dE11440B36DBFC11", //CZF/BNB -DONK
  //"0xC8F3Cc8514B3c7614Cd6C79983d054cDd2991F43", //CZF/BNB -JETS
  //"0x5C0a6E89b9aF04c8874CF95755bD92fe76d36b2C" //CZF/BUSD -JETS
];

const farmDex = [
  DEX.PCS,
  DEX.PCS,
  false,
  false,
  false,
  DEX.PCS,
  DEX.PCS,
  DEX.PCS,
  DEX.CAFE,
  false,
  DEX.PCS,
  DEX.PCS,
  false,
  DEX.PCS,
  DEX.PCS,
  DEX.PCS,
  false,
  DEX.PCS,
  false,
  DEX.AMPL,
  DEX.APE,
  false,
  DEX.APE,
  DEX.APE,
  DEX.EPS,
  DEX.PCS,
  DEX.PCS,
  DEX.PCS,
  DEX.DONK,
  //DEX.BABY,
  //DEX.SHRK,
  //DEX.DONK,
  //DEX.JETS,
  //DEX.JETS
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
    false,
    false
  ],
  [
    false,
    false
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
      address:"0x7c1608C004F20c3520f70b924E2BfeF092dA0043",
      symbol:"CZF"
    },
    {
      address:"0x790be81c3ca0e53974be2688cdb954732c9862e1",
      symbol:"BREW"
    }
  ],
  [
    {
      address:"0x7c1608C004F20c3520f70b924E2BfeF092dA0043",
      symbol:"CZF"
    },
    {
      address:"0xfcac1a3ede7b55cc51e3ebff2885a67fbfe01a1a",
      symbol:"IF1"
    }
  ],
  [
    {
      address:"0x7c1608C004F20c3520f70b924E2BfeF092dA0043",
      symbol:"CZF"
    },
    {
      address:"0xf859Bf77cBe8699013d6Dbc7C2b926Aaf307F830",
      symbol:"BRY"
    }
  ],
  [
    {
      address:"0x7c1608C004F20c3520f70b924E2BfeF092dA0043",
      symbol:"CZF"
    },
    {
      address:"0x0E52d24c87A5ca4F37E3eE5E16EF5913fb0cCEEB",
      symbol:"GAME1"
    }
  ],
  [
    {
      address:"0x7c1608C004F20c3520f70b924E2BfeF092dA0043",
      symbol:"CZF"
    },
    {
      address:"0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c",
      symbol:"BTCB"
    }
  ],
  [
    {
      address:"0x7c1608C004F20c3520f70b924E2BfeF092dA0043",
      symbol:"CZF"
    },
    {
      address:"0x2170ed0880ac9a755fd29b2688956bd959f933f8",
      symbol:"ETH"
    }
  ],
  [
    {
      address:"0x7c1608C004F20c3520f70b924E2BfeF092dA0043",
      symbol:"CZF"
    },
    {
      address:"0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
      symbol:"CAKE"
    }
  ],
  [
    {
      address:"0x7c1608C004F20c3520f70b924E2BfeF092dA0043",
      symbol:"CZF"
    },
    {
      address:"0x84a4a0df19f80fe00c856c354f05062d281e1a92",
      symbol:"PRHO"
    }
  ],
  [
    {
      address:"0x7c1608C004F20c3520f70b924E2BfeF092dA0043",
      symbol:"CZF"
    },
    {
      address:"0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47",
      symbol:"ADA"
    }
  ],
  [
    {
      address:"0x7c1608C004F20c3520f70b924E2BfeF092dA0043",
      symbol:"CZF"
    },
    {
      address:"0xb6ba8c98021c31a02dd65e9be97729eba859d4e2",
      symbol:"GUT"
    }
  ],
  [
    {
      address:"0x7c1608C004F20c3520f70b924E2BfeF092dA0043",
      symbol:"CZF"
    },
    {
      address:"0x335f6e0e804b70a96bf9eb8af31588942e9b2515",
      symbol:"AMPLE"
    }
  ],
  [
    {
      address:"0x7c1608C004F20c3520f70b924E2BfeF092dA0043",
      symbol:"CZF"
    },
    {
      address:"0x8fc1a944c149762b6b578a06c0de2abd6b7d2b89",
      symbol:"MAINST"
    },
  ],
  [
    {
      address:"0x7c1608C004F20c3520f70b924E2BfeF092dA0043",
      symbol:"CZF"
    },
    {
      address:"0x53e562b9b7e5e94b81f10e96ee70ad06df3d2657",
      symbol:"BABY"
    }
  ],
  [
    {
      address:"0x7c1608C004F20c3520f70b924E2BfeF092dA0043",
      symbol:"CZF"
    },
    {
      address:"0xcaF5191fc480F43e4DF80106c7695ECA56E48B18",
      symbol:"DEP"
    }
  ],
  [
    {
      address:"0xE68b79e51bf826534Ff37AA9CeE71a3842ee9c70",
      symbol:"CZUSD"
    },
    {
      address:"0xcaF5191fc480F43e4DF80106c7695ECA56E48B18",
      symbol:"DEP"
    }
  ],
  [
    {
      address:"0xE68b79e51bf826534Ff37AA9CeE71a3842ee9c70",
      symbol:"CZUSD"
    },
    {
      address:"0xaf4de8e872131ae328ce21d909c74705d3aaf452",
      symbol:"3EPS"
    }
  ],
  [
    {
      address:"0x7c1608C004F20c3520f70b924E2BfeF092dA0043",
      symbol:"CZF"
    },
    {
      address:"0x617724974218A18769020A70162165A539c07E8a",
      symbol:"OLIVE"
    }
  ],
  [
    {
      address:"0x7c1608C004F20c3520f70b924E2BfeF092dA0043",
      symbol:"CZF"
    },
    {
      address:"0x9c6b7221cDDA3b8136fbF9D27ac07AeeCC1087B5",
      symbol:"CWE"
    }
  ],
  [
    {
      address:"0x7c1608C004F20c3520f70b924E2BfeF092dA0043",
      symbol:"CZF"
    },
    {
      address:"0x56AA0237244C67B9A854B4Efe8479cCa0B105289",
      symbol:"WNOW"
    }
  ],
  [
    {
      address:"0x7c1608C004F20c3520f70b924E2BfeF092dA0043",
      symbol:"CZF"
    },
    {
      address:"0x3969Fe107bAe2537cb58047159a83C33dfbD73f9",
      symbol:"DST"
    }
  ]
  /*[
    {
      address:"0x7c1608C004F20c3520f70b924E2BfeF092dA0043",
      symbol:"CZF"
    },
    {
      address:"0xe70d287aad130e2cee520e75d12c6efa4f1a377d",
      symbol:"WSOW"
    }
  ]
  /*[
    {
      address:"0x7c1608C004F20c3520f70b924E2BfeF092dA0043",
      symbol:"CZF"
    },
    {
      address:"0xdd97ab35e3c0820215bc85a395e13671d84ccba2",
      symbol:"JAWS"
    }
  ],*/
  /*[
    {
      address:"0x7c1608C004F20c3520f70b924E2BfeF092dA0043",
      symbol:"CZF"
    },
    {
      address:"0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      symbol:"WBNB"
    }
  ],*/
  /*[
    {
      address:"0x7c1608C004F20c3520f70b924E2BfeF092dA0043",
      symbol:"CZF"
    },
    {
      address:"0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
      symbol:"BUSD"
    }
  ],*/
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
  const czusdBusdPrice = useBUSDPrice(CZUSD[chainId]);
  
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
            } else if(farmTokens[pid][0].address == CZUSD[chainId] || farmTokens[pid][1].address == CZUSD[chainId]) {
              newCalls.push({
                    abi:ierc20Interface,
                    address:CZUSD[chainId],
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
        if(!callResults || callResults.length === 0 || !callResults[0] || !CZFARMMASTER_ADDRESSES[chainId] || !czfBusdPrice || !czusdBusdPrice) {
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
          if(pool.lpTotalSupply.gt(BigNumber.from("0"))) {
            if(pool.dex == DEX.EPS) {
              pool.lpUsdPrice = parseEther("1");
            } else if(farmTokens[i][0].address == BUSD_ADDRESSES[chainId] || farmTokens[i][1].address == BUSD_ADDRESSES[chainId]) {
              pool.lpUsdPrice = pool.lpCzfBalance.mul(parseEther("1")).mul(BigNumber.from("2")).div(pool.lpTotalSupply);
            } else if(farmTokens[i][0].address == CZUSD[chainId] || farmTokens[i][1].address == CZUSD[chainId]) {
              pool.lpUsdPrice = pool.lpCzfBalance.mul(czusdBusdPrice).mul(BigNumber.from("2")).div(pool.lpTotalSupply);         
            } else {
              pool.lpUsdPrice = pool.lpCzfBalance.mul(czfBusdPrice).mul(BigNumber.from("2")).div(pool.lpTotalSupply);
            }
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