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
          {(!!tigzStaked && tigzStaked.gt(0)) && (<>
            <Text mt="20px" mb="20px" fontSize="large">Your Tiger HP Score</Text>
            <Link mt="20px" mb="20px" fontSize="large"
              href={"https://bscscan.com/token/"+TIGERHP_ADDRESSES[chainId]}
              style={{fontWeight:"bold",textDecoration:"underline"}}
              isExternal>{weiToShortString(tighpBalance,2)} TigHP</Link>
            <Box>
              <Button w="100%" mt="10px" onClick={()=>{
                eatSend();
              }}>Eat</Button>
              <Text>{timeDisplay(actionTimestamps[ACTION.EAT],eatTimer)}</Text>
            </Box>
            <Image src="./tigerhuntimg/tiger_eat.png"/>
            <Box>
              <Button w="100%" mt="10px" onClick={()=>{
                sleepSend();
              }}>Sleep</Button>
              <Text>{timeDisplay(actionTimestamps[ACTION.SLEEP],sleepTimer)}</Text>
            </Box>
            <Image src="./tigerhuntimg/tiger_sleeping.png"/>
            <Box>
              <Button w="100%" mt="10px" onClick={()=>{
                drinkSend();
              }}>Drink</Button>
              <Text>{timeDisplay(actionTimestamps[ACTION.DRINK],drinkTimer)}</Text>
            </Box>
            <Image src="./tigerhuntimg/tiger_drinking.png"/>
            <Box>
              <Button w="100%" mt="10px" onClick={()=>{
                poopSend();
              }}>Poop</Button>
              <Text>{timeDisplay(actionTimestamps[ACTION.POOP],poopTimer)}</Text>
            </Box>
            <Image src="./tigerhuntimg/tiger_poop.png"/>
            <Button w="100%" mt="10px" onClick={()=>{
                doEatSleepDrinkPoopSend();
              }}>Eat Sleep Drink Poop</Button>
            <Text>Does any above actions that are available. Check timers first. May save on gas.</Text>
          </>)}
        </SimpleGrid>
        {(!!tigzStaked && tigzStaked.gt(0)) && (<>
          <Box>
            <br/>
            <Heading>Hunt</Heading>
            <Text>
              Hunt another player.
              The weaker the player (Less {tigzHpLink()}) the higher the chance.
              The chance is 50% for unguarded players 2x your {tigzHpLink()}, 0% for unguarded players 4x your {tigzHpLink()}, and 100% for players with 0 {tigzHpLink()}.
              The chance for guarded players is 50% for 1x your {tigzHpLink()} and 0% for guarded players 2x your {tigzHpLink()}.
              When you attempt the Hunt, a future Hunt Block is selected. After that block is passed, whether you won or lost the Hunt will be displayed.
              If you won, you must quickly claim your win before 100 blocks pass from your win or your hunt will fail.
              Winning a hunt will transfer 5% to you from the target and burn another 5% from the target. So you will gain 5% and target loses 10%.
              </Text>
            <Image ml="auto" mr="auto" src="./tigerhuntimg/tiger_hunt.png"/>
            <br/>
            <Text>Target BSC Address:</Text>
            <Input fontFamily="monospace" placeholder="0x000..." onChange={event=>{
              if(utils.isAddress(event.target.value)){
                setNewHuntTarget(event.target.value);
              } else {
                setNewHuntTarget(null);
              }
            }} />
            <Text fontFamily="monospace" >{
              utils.isAddress(newHuntTarget) ? newHuntTarget : "invalid, make sure checksummed address with both upper/lowercase"
            }</Text>
            <Text>Target Strength: {weiToShortString(tighpTargetBalance,2)} {tigzHpLink()}</Text>
            <Button isDisabled={!tighpTargetBalance || tighpTargetBalance.eq("0")}
              w="100%" mt="10px" 
              onClick={()=>{
                tryHuntSend(newHuntTarget);
              }}
              >
              Try Hunt Target
            </Button>
            <Text>{timeDisplay(actionTimestamps[ACTION.HUNT],huntTimer)}</Text>
            <br/>
            <Text>Active Hunt:</Text>
            <Text fontFamily="monospace" >{
              (!!huntTarget & utils.isAddress(huntTarget)) ? huntTarget : "no current target"
            }</Text>
            <Text>Hunt/Current block: {huntBlock}/{currentBlock}</Text>
            <Text>Winning Hunt Available? {isHuntWinning.toString().toUpperCase()}</Text>
            <Button isDisabled={!isHuntWinning}
              w="100%" mt="10px" 
              onClick={()=>{
                winHuntSend();
              }}
              >
              Win Hunt
            </Button>
          </Box>
          <Box>
            <br/>
            <Heading>Guard</Heading>
            <Text>Burn 5% of your {tigzHpLink()} but make it twice as hard for other users to hunt you for 24 hours.</Text>
            <Image ml="auto" mr="auto" src="./tigerhuntimg/tiger_guard.png"/>
            <Button w="100%" mt="10px" onClick={()=>{
                guardSend();
              }}>Guard</Button>
              <Text>{timeDisplay(actionTimestamps[ACTION.GUARD],guardTimer)}</Text>
          </Box>
        </>)}
          <br/>
          <Heading>Stats</Heading>
        <SimpleGrid className="stats" columns={2} spacing={1}>
            <Text>Network:</Text>
            <Text>{CHAIN_LABELS[chainId]}</Text>
            <Text>Your TigHP:</Text>
            <Text>{weiToShortString(tighpBalance,2)} TigHP</Text>
            <Text>Your OxZ:</Text>
            <Text>{weiToShortString(oxzBalance,2)} OxZ</Text>
            <Text>Your TigZ:</Text>
            <Text>{weiToShortString(tigzBalance,2)} TigZ</Text>
        </SimpleGrid>
        
        </>)}
        </Box>
    </>);
}

export default TigerHunt;