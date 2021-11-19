import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BackgroundNetwork from "../../components/BackgroundNetwork";
import { Box, Link, SimpleGrid, Heading, Image } from "@chakra-ui/react";
import ChronoPoolsList from "../../components/ChronoPoolsList";

import "./index.scss";

const tokenLink = (address, name)=>{return (<Link style={{fontWeight:"bold",textDecoration:"underline"}} isExternal href={`https://bscscan.com/token/${address}`}>{name}</Link>)}
const czfarmLink = ()=>tokenLink("0x7c1608C004F20c3520f70b924E2BfeF092dA0043","$CZF");


function ChronoPools() {

  const [currentEpoch, setCurrentEpoch] = useState(Date.now());

  const finishTime = 1637399800;

  const secondsToCountdown = (delta) => {
    let hours = Math.floor(delta/3600);
    let minutes = Math.floor((delta-hours*3600)/60);
    let seconds = Math.floor((delta-hours*3600-minutes*60));
    return `${hours} hr : ${minutes} min : ${seconds} sec`
  }

  useEffect(() => {
    const interval = setInterval(() => setCurrentEpoch(Math.floor(Date.now()/1000)), 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);
  
  return (<>
    <BackgroundNetwork />
    <Header />
    <Box as="main" className="chronopools-page horizontal-center">
      <Heading>Chrono Pools</Heading><br/>
      <Image src="./chrono-header.jpg" maxWidth="100%" ml="auto" mr="auto" /><br/>
      Stake CZF and earn claimable CZF every second.<br/>
      Want CZF now? Fast Forward your earnings to get them now at a discount.
      <br/><br/>
      {currentEpoch < finishTime ?
      (<Heading>
        Launch In: <br/>
        {secondsToCountdown(finishTime-currentEpoch)}
      </Heading>

      )
      : 
      (<SimpleGrid columns={[1, 2, 3]} spacing="40px">
        <ChronoPoolsList />
      </SimpleGrid>)}
      <Footer />
    </Box>
</>);
}

export default ChronoPools;
