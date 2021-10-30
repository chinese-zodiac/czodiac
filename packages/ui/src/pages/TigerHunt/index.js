import React, {useEffect, useState} from "react";
import {constants, utils} from "ethers";
import { useEthers, useTokenBalance, useTokenAllowance, useBlockNumber } from "@pdusedapp/core";
import { CHAIN_LABELS, CZODIAC_ADDRESSES, TIGERHUNT_ADDRESSES, TIGERHP_ADDRESSES} from "../../constants";
import { Box, Heading, Icon, Text, Link, Button, SimpleGrid, Image, Input,
NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper} from "@chakra-ui/react";
import BackgroundNetwork from "../../components/BackgroundNetwork";
import Header from "../../components/Header";
import useCountdown from "../../hooks/useCountdown";
import useCZodiacToken from "../../hooks/useCZodiacToken";
import useTigerHunt from "../../hooks/useTigerHunt";
import { FiExternalLink, FiArrowUp} from "react-icons/fi";
import {weiToFixed, weiToShortString, toShortString} from "../../utils/bnDisplay";
import Footer from "../../components/Footer";
import "./index.scss";

const { parseEther } = utils;


const tigzLink = ()=>{return (<Link style={{fontWeight:"bold",textDecoration:"underline"}} isExternal href="https://bscscan.com/token/0x535874bfbecac5f235717faea7c26d01c67b38c5">$TIGZ</Link>)}

const tigzHpLink = ()=>{return (<Link style={{fontWeight:"bold",textDecoration:"underline"}} isExternal href="https://bscscan.com/token/0xDd2F98a97fc2A59b1f0f03DE63B4b41041a339B0">$TIGZHP</Link>)}

function TigerHunt() {
    const {account, chainId} = useEthers();
    const oxzBalance = useTokenBalance(CZODIAC_ADDRESSES.OxZodiac[chainId], account);
    const tigzBalance = useTokenBalance(CZODIAC_ADDRESSES.TigerZodiac[chainId], account);
    const tighpBalance = useTokenBalance(TIGERHP_ADDRESSES[chainId], account);
    const {approve: oxzApprove, approveState: oxzApproveState} = useCZodiacToken(CZODIAC_ADDRESSES.OxZodiac[chainId]);
    const {approve: tigzApprove, approveState: tigzApproveState} = useCZodiacToken(CZODIAC_ADDRESSES.TigerZodiac[chainId]);
    const oxzAllowance = useTokenAllowance(CZODIAC_ADDRESSES.OxZodiac[chainId], account, TIGERHUNT_ADDRESSES[chainId]);
    const tigzAllowance = useTokenAllowance(CZODIAC_ADDRESSES.TigerZodiac[chainId], account, TIGERHUNT_ADDRESSES[chainId]);
    const currentBlock = useBlockNumber();
    function timeDisplay(timestamp,timer) {
      return !!timestamp ? (<>
        {(new Date(Number(timestamp)*1000)).toLocaleString()} ({timer})
      </>) : (
        "TBD"
      )
    }
    const {
        ACTION,
        doEatSleepDrinkPoopState,
        doEatSleepDrinkPoopSend,
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
        poopSend,
        guardState,
        guardSend
    } = useTigerHunt();
    const stakeTigzTimer = useCountdown(actionTimestamps[ACTION.STAKETIGZ],"Available");
    const eatTimer = useCountdown(actionTimestamps[ACTION.EAT],"Available");
    const sleepTimer = useCountdown(actionTimestamps[ACTION.SLEEP],"Available");
    const drinkTimer = useCountdown(actionTimestamps[ACTION.DRINK],"Available");
    const poopTimer = useCountdown(actionTimestamps[ACTION.POOP],"Available");
    const guardTimer = useCountdown(actionTimestamps[ACTION.GUARD],"Available");
    const huntTimer = useCountdown(actionTimestamps[ACTION.HUNT],"Available");

    const parseNumberInput = (val) => parseEther(val.replace(/^\$/, "").toString()+"000000");
    const formatTigz = (val) => `${weiToFixed(val.div("1000000"),0)} M TIGZ`;
    const [amountToStake,setAmountToStake] = useState(parseEther("10000000"))
    const [amountToUnstake,setAmountToUnstake] = useState(parseEther("10000000"))

    const [newHuntTarget, setNewHuntTarget] = useState(null);
    const tighpTargetBalance = useTokenBalance(TIGERHP_ADDRESSES[chainId], newHuntTarget);

    const {swap} = useCZodiacToken(CZODIAC_ADDRESSES.TigerZodiac[chainId]);
    
    return (<>
        <BackgroundNetwork />
        <Header />
        <Box as="main" className="tighunt-page horizontal-center">
            <Heading mt="100px">Tiger Hunt</Heading>
        {(chainId != 56 || typeof(tigzAllowance)=='undefined') ? (<>
          <br/>
          <Text>First, connect to BSC Mainnet in top right corner.</Text>
        </>) : (<>
        <SimpleGrid className="stats" columns={2} spacing={1}>
          {(tigzAllowance.lt(tigzBalance)) ? (
            <Text>TigerHunt v1 is over.</Text>
          ) : (<>
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
        </SimpleGrid></>)}
        {(!!tigzStaked && tigzStaked.gt(0)) && (<>
          <Text>TigerHunt v1 is over. Unstake your TIGZ.</Text>
        </>)}
        <Footer/>
        </Box>
    </>);
}

export default TigerHunt;