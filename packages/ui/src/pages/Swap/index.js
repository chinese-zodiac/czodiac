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

function Swap() {
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
            <Heading mt="100px">Swap OxZ to TigZ</Heading>
            <Text className="explanation">
            The Swap runs from the start countdown to the end countdown.
            TigZ tokens will immediately arrive in your wallet unlocked.
            There are no fees for swapping.
            The Swap rate is 8 OxZ to 1 TigZ.
            100% of team liquidity will be swapped from OxZ/BUSD, OxZ/BNB to TigZ/BUSD, TigZ/BNB and locked.
            After the swap, OxZ will no longer be easily tradeable. 
            If you cannot afford gas to swap, you may post your address in the appropriate channel on <Link isExternal color="orange.700" href="https://discord.gg/FEpu3xF2Hb">Discord<Icon as={FiExternalLink} /></Link> for assistance.
            More info is in the <Link isExternal color="orange.700" href="https://czodiacs.medium.com/oxzodiac-swapping-details-tigz-tiger-czodiac-efe863dff9f">TigZ medium announcement<Icon as={FiExternalLink} /></Link>.
            <br/>  <br/> <b>Be certain to swap all your OxZ for TigZ before the deadline!</b><br/><br/>         
            <b> USA citizens, residents, agents etc are excluded.</b><br/>
        </Text>
        <Button className="swapButton" onClick={()=>{
            const nowTimestamp = Math.floor(Date.now() / 1000)
            if(!account) {
                alert("Please connect your account.");
                return;
              }
              if(nowTimestamp < 1624529700) {
                alert("Swap not yet open.");
                return;
              }
              if(nowTimestamp > 1625237400) {
                alert("Swap has closed.");
                return;
              }
              if(oxzBalance.eq(0)){
                alert("No OxZ to swap.");
                return;
              }
            swap()
        }}>Swap</Button>
        <SimpleGrid className="stats" columns={2} spacing={1}>
            <Text>Network:</Text>
            <Text>{CHAIN_LABELS[chainId]}</Text>
            <Text>Your OxZ:</Text>
            <Text>{weiToShortString(oxzBalance,2)} OxZ</Text>
            <Text>Your TigZ:</Text>
            <Text>{weiToShortString(tigzBalance,2)} TigZ</Text>
            <Text>Opening Date:</Text>
            <Text>{timeDisplay(1624529700,startTimer)}</Text>
            <Text>Closing Date:</Text>
            <Text>{timeDisplay(1625237400,endTimer)}</Text>
        </SimpleGrid>
        </Box>
    </>);
}

export default Swap;