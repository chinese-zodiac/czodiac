import { useEffect, useState } from "react";
import {
  useEthers,
  useContractCalls,
  MultiCallABI
} from "@pdusedapp/core";
import { CZVAULTPOOLS, CZFARM_ADDRESSES, CZFARMMASTERROUTABLE, CZFBELTVAULTBNB, BNB, CHAINS, MUTICALL_ADDRESSES } from "../constants";
import { Contract, utils, BigNumber, getDefaultProvider } from "ethers";
import useDeepCompareEffect from "../utils/useDeepCompareEffect";
import useBUSDPrice from "./useBUSDPrice";
import useBUSDPriceMulti from "./useBUSDPriceMulti";
import czVaultRouter from "../abi/CZVaultRouter.json";
import czFarmMasterRoutable from "../abi/CZFarmMasterRoutable.json";
import ierc20 from "../abi/ierc20.json";
const { Interface } = utils;

const weiFactor = BigNumber.from("10").pow(BigNumber.from("18"));
const CHAIN = CHAINS.BSC;

function useCZVaults() {
  const pool = {
    timestampStart: null,
    timestampEnd: null,
    rewardPerSecond: null,
    totalAmount: null,
    totalAmountUSD: null,
    aprBasisPoints: null,
    userInfo: {
      amount: null,
      amountUSD: null,
      pendingReward: null,
    },
  };
  const { account, chainId, library } = useEthers();

  const ierc20Interface = new Interface(ierc20);
  const czFarmMasterRoutableInterface = new Interface(czFarmMasterRoutable);
  const czVaultRouterInterface = new Interface(czVaultRouter);

  const sendDepositForVault = async (poolAddress, pid, wad) => {
    if (!account || !library || !poolAddress) return;
    const poolContract = new Contract(
      poolAddress,
      czVaultRouterInterface,
      library
    ).connect(library.getSigner());
    try {
      await poolContract.depositAndStakeBeltBNB(CZFARMMASTERROUTABLE[CHAIN], pid, {
        value: wad
      });
    } catch (err) {
      console.log(err);
    }
  };

  const sendWithdrawForVault = async (poolAddress, pid, wad) => {
    if (!account || !library || !poolAddress) return;
    const poolContract = new Contract(
      poolAddress,
      czVaultRouterInterface,
      library
    ).connect(library.getSigner());

    try {
      await poolContract.withdrawAndUnstakeBeltBNB(CZFARMMASTERROUTABLE[CHAIN], pid, wad);
    } catch (err) {
      console.log(err);
    }
  };

  const czfBusdPrice = useBUSDPrice(CZFARM_ADDRESSES[chainId]);
  const rewardBusdPrices = useBUSDPriceMulti(
    !!CZVAULTPOOLS[chainId]
      ? CZVAULTPOOLS[chainId].map((p) => p.rewardAddress)
      : []
  );

  const [pools, setPools] = useState([]);
  const [calls, setCalls] = useState([]);
  const callResults = useContractCalls(calls) ?? [];

  useEffect(() => {
    const newCalls = [];
    if (!CZVAULTPOOLS[chainId]) {
      setCalls(newCalls);
      return;
    }

    CZVAULTPOOLS[chainId].forEach((p) => {
      let ca = p.address;
      // newCalls.push({
      //   abi: czFarmPoolInterface,
      //   address: ca,
      //   method: "timestampEnd",
      // });
      // newCalls.push({
      //   abi: czFarmPoolInterface,
      //   address: ca,
      //   method: "rewardPerSecond",
      // });
      newCalls.push({
        abi: MultiCallABI,
        address: MUTICALL_ADDRESSES[chainId],
        method: "getEthBalance",
        args: [ca]
      });
      if (account) {
        newCalls.push({
          abi: MultiCallABI,
          address: MUTICALL_ADDRESSES[chainId],
          method: "getEthBalance",
          args: [account]
        });
        newCalls.push({
          abi: czFarmMasterRoutableInterface,
          address: CZFARMMASTERROUTABLE[chainId],
          method: "userInfo",
          args: [p.pid, account],
        });
        newCalls.push({
          abi: czFarmMasterRoutableInterface,
          address: CZFARMMASTERROUTABLE[chainId],
          method: "pendingCzf",
          args: [p.pid, account],
        });
        newCalls.push({
          abi: ierc20Interface,
          address: CZFARM_ADDRESSES[chainId],
          method: "balanceOf",
          args: [account],
        });
      }
    });
    setCalls(newCalls);
  }, [account, chainId]);

  console.log({ callResults });

  useDeepCompareEffect(() => {
    let newPools = [];
    if (
      !callResults ||
      callResults.length === 0 ||
      !callResults[0] ||
      !CZVAULTPOOLS[chainId] ||
      !czfBusdPrice
    ) {
      return;
    }

    CZVAULTPOOLS[chainId].forEach(async (p, index) => {
      let l = 5;
      if (!account) l = 4;
      let o = l * index;


      p.sendDeposit = (wad) => sendDepositForVault(p.address, p.pid, wad);
      p.sendWithdraw = (wad) => sendWithdrawForVault(p.address, p.pid, wad);

      p.user = {};
      p.user.address = account;
      p.user.bnbBal = callResults[1 + o][0];
      p.user.bnbStaked = callResults[2 + o][0];
      p.user.rewardPending = callResults[3 + o][0];

      console.log('userInfo', callResults[2 + o]);

      // p.timeStart = new Date(callResults[0 + o][0].toNumber() * 1000);
      // p.timeEnd = new Date(callResults[1 + o][0].toNumber() * 1000);
      // p.rewardPerSecond = callResults[2 + o][0];
      // p.czfBal = callResults[3 + o][0];

      // p.usdValue = p.czfBal.mul(czfBusdPrice).div(weiFactor);
      // p.rewardPerDay = p.rewardPerSecond.mul(BigNumber.from("86400"));
      // if (!!rewardBusdPrices[index]) {
      //   p.usdPerDay = p.rewardPerDay
      //     .mul(rewardBusdPrices[index])
      //     .div(weiFactor);
      // } else {
      //   p.usdPerDay = BigNumber.from("0");
      // }

      // //Fixes bug where TVL includes the CZF rewards in CZF->CZF pool
      // let tvlOffset = BigNumber.from("0");
      // if (
      //   p.rewardAddress == "0x7c1608C004F20c3520f70b924E2BfeF092dA0043" &&
      //   p.usdPerDay.gt(BigNumber.from("0"))
      // ) {
      //   let seconds = 0;
      //   if (new Date() >= p.timeStart && new Date() <= p.timeEnd) {
      //     seconds = Math.floor((p.timeEnd - new Date()) / 1000);
      //   } else if (new Date() < p.timeStart) {
      //     seconds = Math.floor((p.timeEnd - p.timeStart) / 1000);
      //   }
      //   tvlOffset = p.usdPerDay.mul(
      //     BigNumber.from(seconds.toString()).div(BigNumber.from("86400"))
      //   );
      //   p.usdValue = p.usdValue.sub(tvlOffset);
      // }

      // if (p.usdValue.gt(BigNumber.from("0"))) {
      //   p.aprBasisPoints = p.usdPerDay
      //     .mul(BigNumber.from("365"))
      //     .mul(BigNumber.from("10000"))
      //     .div(p.usdValue);
      // } else {
      //   p.aprBasisPoints = BigNumber.from("0");
      // }

      // if (p.usdValue.gt(BigNumber.from("0"))) {
      //   p.aprBasisPoints = p.usdPerDay
      //     .mul(BigNumber.from("365"))
      //     .mul(BigNumber.from("10000"))
      //     .div(p.usdValue.add(tvlOffset));
      // } else {
      //   p.aprBasisPoints = BigNumber.from("0");
      // }

      // if (
      //   p.rewardAddress == "0x7c1608C004F20c3520f70b924E2BfeF092dA0043" &&
      //   p.usdPerDay.gt(BigNumber.from("0"))
      // ) {
      //   p.usdValue = p.usdValue.add(
      //     parseEther("288385966")
      //       .mul(czfBusdPrice)
      //       .div(weiFactor)
      //   );
      // }

      // if (!!account && !!callResults[4 + o]) {
      //   p.user = {};
      //   p.user.czfStaked = callResults[4 + o][0];
      //   p.user.rewardPending = callResults[5 + o][0];
      //   p.user.czfBal = callResults[6 + o][0];

      //   p.user.czfStakedUsd = p.user.czfStaked.mul(czfBusdPrice).div(weiFactor);
      //   p.user.czfBalUsd = p.user.czfBal.mul(czfBusdPrice).div(weiFactor);
      //   if (p.czfBal > 0) {
      //     p.user.rewardPerDay = p.user.czfStaked
      //       .mul(p.rewardPerDay)
      //       .div(p.czfBal);
      //   } else {
      //     p.user.rewardPerDay = BigNumber.from("0");
      //   }
      // }
      newPools.push(p);
    });

    console.log({ pools: newPools });
    setPools(newPools);
  }, [callResults, czfBusdPrice, rewardBusdPrices]);

  
  return {
    pools,
  };
}

export default useCZVaults;
