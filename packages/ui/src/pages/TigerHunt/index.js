import React, {useEffect, useState} from "react";
import {constants, utils} from "ethers";
import { useEthers, useTokenBalance, useTokenAllowance } from "@pdusedapp/core";
import { CHAIN_LABELS, CZODIAC_ADDRESSES, TIGERHUNT_ADDRESSES} from "../../constants";
import { Box, Heading, Icon, Text, Link, Button, SimpleGrid,
NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper} from "@chakra-ui/react";
import BackgroundNetwork from "../../components/BackgroundNetwork";
import Header from "../../components/Header";
import useCountdown from "../../hooks/useCountdown";
import useCZodiacToken from "../../hooks/useCZodiacToken";
import useTigerHunt from "../../hooks/useTigerHunt";
import { FiExternalLink, FiArrowUp} from "react-icons/fi";
import {weiToFixed, weiToShortString, toShortString} from "../../utils/bnDisplay";
import "./index.scss";

const { parseEther } = utils;


const tigzLink = ()=>{return (<Link style={{fontWeight:"bold",textDecoration:"underline"}} isExternal href="https://bscscan.com/token/0x535874bfbecac5f235717faea7c26d01c67b38c5">$TIGZ</Link>)}

function TigerHunt() {
    const {account, chainId} = useEthers();
    const oxzBalance = useTokenBalance(CZODIAC_ADDRESSES.OxZodiac[chainId], account);
    const tigzBalance = useTokenBalance(CZODIAC_ADDRESSES.TigerZodiac[chainId], account);
    const {approve: oxzApprove, approveState: oxzApproveState} = useCZodiacToken(CZODIAC_ADDRESSES.OxZodiac[chainId]);
    const {approve: tigzApprove, approveState: tigzApproveState} = useCZodiacToken(CZODIAC_ADDRESSES.TigerZodiac[chainId]);
    const oxzAllowance = useTokenAllowance(CZODIAC_ADDRESSES.OxZodiac[chainId], account, TIGERHUNT_ADDRESSES[chainId]);
    const tigzAllowance = useTokenAllowance(CZODIAC_ADDRESSES.TigerZodiac[chainId], account, TIGERHUNT_ADDRESSES[chainId]);
    const startTimer = useCountdown(1624529700,"Complete");
    const endTimer = useCountdown(1625237400,"Complete");
    function timeDisplay(timestamp,timer) {
      return !!timestamp ? (<>
        {(new Date(Number(timestamp)*1000)).toLocaleString()} ({timer})
      </>) : (
        "TBD"
      )
    }
    const {
        ACTION,
        isPaused,
        actionTimestamps,
        tigzStaked,
        huntBlock,
        huntTarget,
        canAction,
        isHuntWinning,
        stakeTigzState,
        stakeTigzSend,
        unstakeTigzState,
        unstakeTigzSend,
        tryHuntState,
        tryHuntSend,
        winHuntState,
        winHuntSend,
        refreshHuntState,
        refreshHuntSend,
        eatState,
        eatSend,
        sleepState,
        sleepSend,
        drinkState,
        drinkSend,
        poopState,
        poopSend
    } = useTigerHunt();
    console.log(actionTimestamps[ACTION.STAKETIGZ])
    const stakeTigzTimer = useCountdown(actionTimestamps[ACTION.STAKETIGZ],"Available");

    const parseNumberInput = (val) => parseEther(val.replace(/^\$/, "").toString()+"000000");
    const formatTigz = (val) => `${weiToFixed(val.div("1000000"),0)} M TIGZ`;
    const [amountToStake,setAmountToStake] = useState(parseEther("10000000"))
    const [amountToUnstake,setAmountToUnstake] = useState(parseEther("10000000"))

    const {swap} = useCZodiacToken(CZODIAC_ADDRESSES.TigerZodiac[chainId]);
    
    return (<>
        <BackgroundNetwork />
        <Header />
        <Box as="main" className="tighunt-page horizontal-center">
            <Heading mt="100px">Tiger Hunt</Heading>
            <Text className="explanation">
            Earn BEP20 Tiger Hunt Points (TigHP) and win unique Tiger Zodiac NFTs! 
            First stake your {tigzLink()}. The more {tigzLink()} you stake the more points you will earn! 
            Eat, Sleep, Drink, and Poop to gain points based on your staked {tigzLink()}. 
            Guard byto protect your tigHP against other players, up to 100 times your staked {tigzLink()}. But it burns 5% of your TigHP!
            Hunt unprotected players to steal 5% of their TigHP and burn 5% more from them. You can only attack players smaller than you or with less than 4x your TigHP. The best chance to win is against ungaurded players with 2x your TigHP. Search on BscScan to find targets!
            If you don't understand how to play, ask on <Link isExternal color="orange.700" href="https://t.me/CZodiacofficial">Telegram<Icon as={FiExternalLink} /></Link> for assistance.
        </Text>
        {(chainId != 56 || typeof(tigzAllowance)=='undefined') ? (<>
          <br/>
          <Text>First, connect to BSC Mainnet in top right corner.</Text>
        </>) : (<>
        <SimpleGrid className="stats" columns={2} spacing={1}>
          {(tigzAllowance.lt(tigzBalance)) ? (
            <Button onClick={()=>{
              tigzApprove(TIGERHUNT_ADDRESSES[chainId], constants.MaxUint256);
            }}>Approve TIGZ</Button>
          ) : (<>
            <Box style={{position:"relative",paddingRight: "20px",marginRight: "10px"}}>
              <NumberInput 
                onChange={(valueString) => setAmountToStake(parseNumberInput(valueString))}
                value={formatTigz(amountToStake)}
                className="tigzInput" defaultValue={1} precision={0} step={1} min={1} max={!!tigzBalance && weiToFixed(tigzBalance.div("1000000"))}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              <Icon className="max" as={FiArrowUp} onClick={()=>{
                setAmountToStake(tigzBalance);
              }} />
              </NumberInput>
            </Box>
            <Button onClick={()=>{
              console.log(weiToFixed(tigzBalance,2))
              console.log(weiToFixed(amountToStake,2))
              stakeTigzSend(amountToStake);
            }}>Stake TIGZ</Button>
            <Box/>
            <Text>{timeDisplay(actionTimestamps[ACTION.STAKETIGZ],stakeTigzTimer)}</Text>
          </>)}
          {(!!tigzStaked && tigzStaked.gt(0)) && (<>
            <Box style={{position:"relative",paddingRight: "20px",marginRight: "10px"}}>
              <NumberInput 
                onChange={(valueString) => setAmountToUnstake(parseNumberInput(valueString))}
                value={formatTigz(amountToUnstake)}
                className="tigzInput" defaultValue={1} precision={0} step={1} min={1} max={!!tigzStaked && weiToFixed(tigzStaked.div("1000000"))}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              <Icon className="max" as={FiArrowUp} onClick={()=>{
                setAmountToUnstake(tigzStaked);
              }} />
              </NumberInput>
            </Box>
            <Button onClick={()=>{
              unstakeTigzSend(amountToUnstake);
            }}>Unstake TIGZ</Button>
            <Box/>
            <Text>{timeDisplay(actionTimestamps[ACTION.STAKETIGZ],stakeTigzTimer)}</Text>
          </>)}
        </SimpleGrid>
        <SimpleGrid className="stats" columns={2} spacing={1}>
            <Text>Network:</Text>
            <Text>{CHAIN_LABELS[chainId]}</Text>
            <Text>Your OxZ:</Text>
            <Text>{weiToShortString(oxzBalance,2)} OxZ</Text>
            <Text>Your TigZ:</Text>
            <Text>{weiToShortString(tigzBalance,2)} TigZ</Text>
            <Text>Your TigZ Staked:</Text>
            <Text>{weiToShortString(tigzStaked,2)} TigZ</Text>
        </SimpleGrid>
        
        </>)}
        </Box>
    </>);
}

export default TigerHunt;