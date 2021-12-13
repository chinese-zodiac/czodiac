import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BackgroundNetwork from "../../components/BackgroundNetwork";
import { Box, Link, Button, Heading, Image, Divider, Text } from "@chakra-ui/react";
import { FiExternalLink, FiInfo, FiShoppingCart } from "react-icons/fi";
import useLossCompensation from "../../hooks/useLossCompensation";
import { useEthers } from "@pdusedapp/core";
import { BigNumber, utils } from "ethers";
import {weiToFixed, tokenAmtToShortString, weiToShortString, toShortString} from "../../utils/bnDisplay";

import "./index.scss";

const tokenLink = (address, name)=>{return (<Link style={{fontWeight:"bold",textDecoration:"underline"}} isExternal href={`https://bscscan.com/token/${address}`}>{name}</Link>)}
const czfarmLink = ()=>tokenLink("0x7c1608C004F20c3520f70b924E2BfeF092dA0043","$CZF");


function LossCompensation() {
  const { chainId,account } = useEthers();
  const { ffBasis, 
    vestPeriod,
    userInfo,
    sendClaim,
    sendFastForward } = useLossCompensation();
    

  const [currentEpoch, setCurrentEpoch] = useState(Date.now());
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
      <Heading>Loss Compensation</Heading><br/>
      
      <Divider />

      CZF per second distributed to victims of the past CZodiac exploit.<br/><br/>
      <br/><br/>
      <Button m="10px" onClick={()=>{
        sendClaim();
      }}>Claim CZF</Button> <br/>
      <Button m="10px" onClick={()=>{
        sendFastForward();
      }}>FastForward {!!ffBasis ? (ffBasis/100).toFixed(2) : "0.00"}% </Button> <br/>

      <Divider />

      <Text>Est. Claimable: {
        !!userInfo.totalVesting && !!userInfo.emissionRate  && 
        (
          userInfo.emissionRate.mul(currentEpoch-userInfo.updateEpoch).lt(userInfo.totalVesting) ? 
            weiToShortString(userInfo.emissionRate.mul(currentEpoch-userInfo.updateEpoch),5) : 
            weiToShortString(userInfo.totalVesting.mul(ffBasis).div(10000),2)
          )}</Text>
      <Text>Est. CZF/day: {
        !!userInfo.totalVesting && !!userInfo.emissionRate && 
          (
            userInfo.emissionRate.mul(currentEpoch-userInfo.updateEpoch).lt(userInfo.totalVesting) ? 
              weiToShortString(userInfo.emissionRate.mul(86400),2) : "0.00"
              
          )}</Text>
      <Text>Est. FF: {!!userInfo.totalVesting && weiToShortString(userInfo.totalVesting.mul(ffBasis).div(10000),2)}</Text>
      <Text>Vesting: {!!userInfo.totalVesting && weiToShortString(userInfo.totalVesting,5)}</Text>
      
      <Footer />
    </Box>
</>);
}

export default LossCompensation;
