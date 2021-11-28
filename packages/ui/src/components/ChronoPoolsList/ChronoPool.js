import React, { useState } from "react";
import { Box, Button, Icon, Link, Text, Heading, Image,
 SimpleGrid, Divider, Slider, SliderTrack, SliderFilledTrack, SliderThumb } from "@chakra-ui/react";
import { FiExternalLink } from "react-icons/fi";
import { useEthers } from "@pdusedapp/core";
import { CZFARM_ADDRESSES } from "../../constants";
import { BigNumber, utils } from "ethers";
import useCZVaults from "../../hooks/useCZVaults";
import {weiToFixed, tokenAmtToShortString, weiToShortString, toShortString} from "../../utils/bnDisplay";
import "./index.scss";

const {parseEther} = utils;

function ChronoPool({
  pid,
  title,
  adjustedRateBasis,
  vestPeriod,
  ffBasis,
  userInfo,
  sendDeposit,
  sendClaim,
  sendReinvest,
  sendFastForward,
  currentEpoch,
  czfBalance
}) {
  const [basisPoints, setBasisPoints] = useState(10000);
  return (<>
      <Heading display="inline-block" as="h3" fontSize="2xl" >{(adjustedRateBasis*31536000/100/vestPeriod).toFixed(2)}% APR<br/> {title}</Heading>
      <Divider />
      <Slider
        aria-label="stake-percentage"
        max={10000}
        defaultValue={10000}
        onChange={setBasisPoints}
        mt="10px"
        mb="10px"
      >
        <SliderTrack>
          <SliderFilledTrack bg="orange.800" />
        </SliderTrack>
        <SliderThumb />
      </Slider>

      <Button onClick={()=>{
        let bp = BigNumber.from(10000);
        if(!!basisPoints) bp = basisPoints
        sendDeposit(pid, czfBalance.mul(bp).div(BigNumber.from(10000)));
      }}>Stake 
      {!!basisPoints ? (basisPoints/100).toFixed(2) : (100).toFixed(2)}% 
      ({!!basisPoints ? weiToShortString(czfBalance.mul(BigNumber.from(basisPoints)).div(BigNumber.from(10000)),2) 
       : weiToShortString(czfBalance,2)} CZF)
      </Button> <br/>
      <Button m="10px" onClick={()=>{
        sendReinvest(pid);
      }}>Reinvest CZF</Button> 
      <Button m="10px" onClick={()=>{
        sendClaim(pid);
      }}>Claim CZF</Button> <br/>
      <Button m="10px" onClick={()=>{
        sendFastForward(pid);
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

  </>)
}

export default ChronoPool;
