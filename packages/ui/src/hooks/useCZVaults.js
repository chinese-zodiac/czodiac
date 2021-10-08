import { useEffect, useState } from "react";
import {
  useEthers,
  useContractCalls,
  MultiCallABI
} from "@pdusedapp/core";
import { CZVAULTS, CZFARM_ADDRESSES, CZVAULTROUTER, CZFARMMASTERROUTABLE, CZFBELTVAULTBNB, BNB, CHAINS, MUTICALL_ADDRESSES } from "../constants";
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
  const vault = {
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

  const sendDepositForVault = async (pid, wad) => {
    if (!account || !library || !CZVAULTROUTER[CHAINS.BSC]) return;
    const vaultRouterContract = new Contract(
      CZVAULTROUTER[CHAINS.BSC],
      czVaultRouterInterface,
      library
    ).connect(library.getSigner());
    try {
      await vaultRouterContract.depositAndStakeBeltBNB(CZFARMMASTERROUTABLE[CHAIN], pid, {
        value: wad
      });
    } catch (err) {
      console.log(err);
    }
  };

  const sendWithdrawForVault = async ( pid, wad) => {
    if (!account || !library || !CZVAULTROUTER[CHAINS.BSC]) return;
    const vaultRouterContract = new Contract(
      CZVAULTROUTER[CHAINS.BSC],
      czVaultRouterInterface,
      library
    ).connect(library.getSigner());

    try {
      await vaultRouterContract.withdrawAndUnstakeBeltBNB(CZFARMMASTERROUTABLE[CHAIN], pid, wad);
    } catch (err) {
      console.log(err);
    }
  };

  const sendClaim = async (pid) => {
    if (!account || !library || !CZFARMMASTERROUTABLE[CHAINS.BSC]) return;
    const farmContract = new Contract(
      CZFARMMASTERROUTABLE[CHAINS.BSC],
      czFarmMasterRoutableInterface,
      library
    ).connect(library.getSigner());

    try {
      await farmContract.claim(pid);
    } catch (err) {
      console.log(err);
    }
  }

  const czfBusdPrice = useBUSDPrice(CZFARM_ADDRESSES[chainId]);
  const rewardBusdPrices = useBUSDPriceMulti(
    !!CZVAULTS[chainId]
      ? CZVAULTS[chainId].map((v) => v.rewardAddress)
      : []
  );

  const [vaults, setVaults] = useState([]);
  const [calls, setCalls] = useState([]);
  const callResults = useContractCalls(calls) ?? [];

  useEffect(() => {
    const newCalls = [];
    if (!CZVAULTS[chainId]) {
      setCalls(newCalls);
      return;
    }

    newCalls.push({
      abi: czFarmMasterRoutableInterface,
      address: CZFARMMASTERROUTABLE[chainId],
      method: "czfPerBlock"
    });

    CZVAULTS[chainId].forEach((v) => {
      let user = "0x0000000000000000000000000000000000000000"; // Simplifies code by calling for 0x0 if no account
      if(!!account) user = account;
      newCalls.push({
        abi: MultiCallABI,
        address: MUTICALL_ADDRESSES[chainId],
        method: "getEthBalance",
        args: [user]
      });
      newCalls.push({
        abi: czFarmMasterRoutableInterface,
        address: CZFARMMASTERROUTABLE[chainId],
        method: "userInfo",
        args: [v.pid, user],
      });
      newCalls.push({
        abi: czFarmMasterRoutableInterface,
        address: CZFARMMASTERROUTABLE[chainId],
        method: "pendingCzf",
        args: [v.pid, user],
      });
      newCalls.push({
        abi: ierc20Interface,
        address: CZFARM_ADDRESSES[chainId],
        method: "balanceOf",
        args: [user],
      });
    });
    setCalls(newCalls);
  }, [account, chainId]);

  useDeepCompareEffect(() => {
    let newVaults = [];
    if (
      !callResults ||
      callResults.length === 0 ||
      !callResults[0] ||
      !CZVAULTS[chainId] ||
      !czfBusdPrice
    ) {
      return;
    }

    let rewardPerSecond = callResults[0][0];

    CZVAULTS[chainId].forEach(async (v, index) => {
      let o = 4 * index; //Offset for cycling thru call results

      v.sendDeposit = (wad) => sendDepositForVault(v.pid, wad);
      v.sendWithdraw = (wad) => sendWithdrawForVault(v.pid, wad);
      v.sendClaim = () => sendClaim(v.pid);

      console.log("callResults",callResults)
      v.user = {};
      v.user.address = account;
      console.log("o",o)
      v.user.bnbBal = callResults[1 + o][0];
      //TODO get balance for bep20 token to deposit into non-BNB vaults
      //v.user.tokenBal = ;
      v.user.vaultAssetStaked = callResults[2 + o][0];
      //TODO: Calculate base asset value of vaultAssetStaked (eg BNB value for beltBNB)
      v.user.rewardPending = callResults[3 + o][0];

      console.log('userInfo', callResults[4 + o]);

      // v.rewardPerSecond = callResults[2 + o][0];
      // v.usdValue = v.czfBal.mul(czfBusdPrice).div(weiFactor);
      // v.rewardPerDay = v.rewardPerSecond.mul(BigNumber.from("86400"));
      // if (!!rewardBusdPrices[index]) {
      //   v.usdPerDay = v.rewardPerDay
      //     .mul(rewardBusdPrices[index])
      //     .div(weiFactor);
      // } else {
      //   v.usdPerDay = BigNumber.from("0");
      // }

      // //Fixes bug where TVL includes the CZF rewards in CZF->CZF pool
      // let tvlOffset = BigNumber.from("0");
      // if (
      //   v.rewardAddress == "0x7c1608C004F20c3520f70b924E2BfeF092dA0043" &&
      //   v.usdPerDay.gt(BigNumber.from("0"))
      // ) {
      //   let seconds = 0;
      //   if (new Date() >= v.timeStart && new Date() <= v.timeEnd) {
      //     seconds = Math.floor((v.timeEnd - new Date()) / 1000);
      //   } else if (new Date() < v.timeStart) {
      //     seconds = Math.floor((v.timeEnd - v.timeStart) / 1000);
      //   }
      //   tvlOffset = v.usdPerDay.mul(
      //     BigNumber.from(seconds.toString()).div(BigNumber.from("86400"))
      //   );
      //   v.usdValue = v.usdValue.sub(tvlOffset);
      // }

      // if (v.usdValue.gt(BigNumber.from("0"))) {
      //   v.aprBasisPoints = v.usdPerDay
      //     .mul(BigNumber.from("365"))
      //     .mul(BigNumber.from("10000"))
      //     .div(v.usdValue);
      // } else {
      //   v.aprBasisPoints = BigNumber.from("0");
      // }

      // if (v.usdValue.gt(BigNumber.from("0"))) {
      //   v.aprBasisPoints = v.usdPerDay
      //     .mul(BigNumber.from("365"))
      //     .mul(BigNumber.from("10000"))
      //     .div(v.usdValue.add(tvlOffset));
      // } else {
      //   v.aprBasisPoints = BigNumber.from("0");
      // }

      // if (
      //   v.rewardAddress == "0x7c1608C004F20c3520f70b924E2BfeF092dA0043" &&
      //   v.usdPerDay.gt(BigNumber.from("0"))
      // ) {
      //   v.usdValue = v.usdValue.add(
      //     parseEther("288385966")
      //       .mul(czfBusdPrice)
      //       .div(weiFactor)
      //   );
      // }

      // if (!!account && !!callResults[4 + o]) {
      //   v.user = {};
      //   v.user.czfStaked = callResults[4 + o][0];
      //   v.user.rewardPending = callResults[5 + o][0];
      //   v.user.czfBal = callResults[6 + o][0];

      //   v.user.czfStakedUsd = v.user.czfStaked.mul(czfBusdPrice).div(weiFactor);
      //   v.user.czfBalUsd = v.user.czfBal.mul(czfBusdPrice).div(weiFactor);
      //   if (v.czfBal > 0) {
      //     v.user.rewardPerDay = v.user.czfStaked
      //       .mul(v.rewardPerDay)
      //       .div(v.czfBal);
      //   } else {
      //     v.user.rewardPerDay = BigNumber.from("0");
      //   }
      // }
      newVaults.push(v);
    });

    console.log({ vaults: newVaults });
    setVaults(newVaults);
  }, [callResults, czfBusdPrice, rewardBusdPrices]);

  
  return {
    vaults,
  };
}

export default useCZVaults;
