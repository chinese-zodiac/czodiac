import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BackgroundNetwork from "../../components/BackgroundNetwork";
import { Box, Link, SimpleGrid, Heading, Image, Icon } from "@chakra-ui/react";
import { FiExternalLink, FiInfo, FiShoppingCart } from "react-icons/fi";
import ExoticFarmsList from "../../components/ExoticFarmsList";

import "./index.scss";

const tokenLink = (address, name)=>{return (<Link style={{fontWeight:"bold",textDecoration:"underline"}} isExternal href={`https://bscscan.com/token/${address}`}>{name}</Link>)}
const czfarmLink = ()=>tokenLink("0x7c1608C004F20c3520f70b924E2BfeF092dA0043","$CZF");


function ExoticFarms() {

  const [currentEpoch, setCurrentEpoch] = useState(Date.now());

  const finishTime = 1638493200;

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
    <Box as="main" className="exoticfarms-page horizontal-center">
      <Heading>Exotic Farms</Heading><br/>
      <Image src="./chrono-header.jpg" maxWidth="100%" ml="auto" mr="auto" /><br/>
      Earn CZF without Impermanent Loss.<br/>
      Each deposit vests seperately with its own APR.<br/>
      FastForward will delete your Vesting but will give you CZF now.<br/>
      All LP is delivered to the CZodiac treasury, you receive CZF worth the value plus interest.<br/><br/>
      <Link display="inline-block" m="10px" href="https://czodiac.gitbook.io/czodiac-litepapper/features-active/exotic-farms" isExternal p="7px" border="solid 1px" borderRadius="10px">
         <Icon as={FiInfo} /> <b>Exotic Farms Guide <Icon as={FiExternalLink} /></b>
      </Link >
      <Link display="inline-block" m="10px" href="https://app.1inch.io/#/56/swap/BNB/0x7c1608C004F20c3520f70b924E2BfeF092dA0043" isExternal p="7px" border="solid 1px" borderRadius="10px">
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
        <ExoticFarmsList />
      </SimpleGrid>)}
      <Footer />
    </Box>
</>);
}

export default ExoticFarms;
