import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BackgroundNetwork from "../../components/BackgroundNetwork";
import { Box, Link, SimpleGrid, Heading, Image, Icon } from "@chakra-ui/react";
import { FiExternalLink, FiInfo, FiShoppingCart } from "react-icons/fi";
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
      Want CZF now? Fast Forward your earnings to get them now at a discount. <br/><br/>
      <Link href="https://czodiac.gitbook.io/czodiac-litepapper/features-active/chrono-pools" isExternal p="7px" border="solid 1px" borderRadius="10px">
         <Icon as={FiInfo} /> <b>Chrono Pools Guide <Icon as={FiExternalLink} /></b>
      </Link ><br/><br/>
      <Link href="https://app.1inch.io/#/56/swap/BNB/0x7c1608C004F20c3520f70b924E2BfeF092dA0043" isExternal p="7px" border="solid 1px" borderRadius="10px">
        <Icon as={FiShoppingCart} /> <b>Buy CZF <Icon as={FiExternalLink} /></b>
      </Link >
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
