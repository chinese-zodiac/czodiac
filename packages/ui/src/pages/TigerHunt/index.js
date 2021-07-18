import React, {useEffect, useState} from "react";
import { useEthers, useTokenBalance, useContractFunction } from "@pdusedapp/core";
import { CHAIN_LABELS, CZODIAC_ADDRESSES} from "../../constants";
import { Box, Heading, Icon, Text, Link, Button, SimpleGrid} from "@chakra-ui/react";
import BackgroundNetwork from "../../components/BackgroundNetwork";
import Header from "../../components/Header";
import useCountdown from "../../hooks/useCountdown";
import useCZodiacToken from "../../hooks/useCZodiacToken";
import { FiExternalLink} from "react-icons/fi";
import {weiToShortString} from "../../utils/bnDisplay";
import "./index.scss";

function timeDisplay(timestamp,timer) {
    return !!timestamp ? (<>
      {(new Date(Number(timestamp)*1000)).toLocaleString()}
      <br/>
      ({timer})
    </>) : (
      "TBD"
    )
  }

const tigzLink = ()=>{return (<Link style={{fontWeight:"bold",textDecoration:"underline"}} isExternal href="https://bscscan.com/token/0x535874bfbecac5f235717faea7c26d01c67b38c5">$TIGZ</Link>)}

function TigerHunt() {
    const {account, chainId} = useEthers();
    const oxzBalance = useTokenBalance(CZODIAC_ADDRESSES.OxZodiac[chainId], account)
    const tigzBalance = useTokenBalance(CZODIAC_ADDRESSES.TigerZodiac[chainId], account)
    const startTimer = useCountdown(1624529700,"Complete");
    const endTimer = useCountdown(1625237400,"Complete");

    const {swap} = useCZodiacToken(CZODIAC_ADDRESSES.TigerZodiac[chainId]);
    
    return (<>
        <BackgroundNetwork />
        <Header />
        <Box as="main" className="both-center swap-page">
            <Heading mt="100px">Tiger Hunt</Heading>
            <Text className="explanation">
            Earn BEP20 Tiger Hunt Points (TigHP) and win unique Tiger Zodiac NFTs! 
            First stake your {tigzLink()}. The more {tigzLink()} you stake the more points you will earn! 
            Eat, Sleep, Drink, and Poop to gain points based on your staked {tigzLink()}. 
            Guard byto protect your tigHP against other players, up to 100 times your staked {tigzLink()}. But it burns 5% of your TigHP!
            Hunt unprotected players to steal 5% of their TigHP and burn 5% more from them. You can only attack players smaller than you or with less than 4x your TigHP. The best chance to win is against ungaurded players with 2x your TigHP. Search on BscScan to find targets!
            If you don't understand how to play, ask on <Link isExternal color="orange.700" href="https://t.me/CZodiacofficial">Telegram<Icon as={FiExternalLink} /></Link> for assistance.
        </Text>
        <Text>Under construction</Text>
        <SimpleGrid className="stats" columns={2} spacing={1}>

        </SimpleGrid>
        <SimpleGrid className="stats" columns={2} spacing={1}>
            <Text>Network:</Text>
            <Text>{CHAIN_LABELS[chainId]}</Text>
            <Text>Your OxZ:</Text>
            <Text>{weiToShortString(oxzBalance,2)} OxZ</Text>
            <Text>Your TigZ:</Text>
            <Text>{weiToShortString(tigzBalance,2)} TigZ</Text>
        </SimpleGrid>
        </Box>
    </>);
}

export default TigerHunt;