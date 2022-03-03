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

function ExoticFarm({
  pid,
  title,
  adjustedRateBasis,
  vestPeriod,
  ffBasis,
  userInfo,
  sendDeposit,
  sendClaim,
  sendFastForward,
  currentEpoch,
  czfBnbLpBalance,
  usdForOneCzfBnbLp,
  czfPerLPWad
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

      {(!!userInfo && !!userInfo.lpAllowance && !!czfBnbLpBalance && czfBnbLpBalance.lt(userInfo.lpAllowance)) ? 
        <Button onClick={()=>{
          let bp = BigNumber.from(10000);
          if(!!basisPoints) bp = basisPoints
          sendDeposit(pid, czfBnbLpBalance.mul(bp).div(BigNumber.from(10000)));
        }}>Deliver 
        {!!basisPoints ? " "+(basisPoints/100).toFixed(2) : " "+(100).toFixed(2)}%
        </Button>
      :
        (<>{!!userInfo &&
        <Button onClick={userInfo.sendApprove}>
          Approve LP
        </Button>
        }</>)
      } <br/>
      <Text>
        That's $
        {((!!czfBnbLpBalance && !!basisPoints && !!usdForOneCzfBnbLp) ?
          weiToShortString(czfBnbLpBalance.mul(BigNumber.from(basisPoints)).mul(usdForOneCzfBnbLp).div(parseEther("1")).div(BigNumber.from(10000)),2)
          : "0.00"
        )+" "}
        and will vest you 
        {" ~"+((!!czfBnbLpBalance && !!basisPoints && !!czfPerLPWad && !!adjustedRateBasis) ?
          weiToShortString(czfBnbLpBalance.mul(BigNumber.from(basisPoints)).mul(czfPerLPWad).mul(Math.floor(10000+adjustedRateBasis)).div(10000).div(parseEther("1")).div(BigNumber.from(10000)),2)
          : "0.00"
        )} CZF. <br/>
        {" ~"+((!!czfBnbLpBalance && !!basisPoints && !!czfPerLPWad && !!adjustedRateBasis) ?
          weiToShortString(czfBnbLpBalance.mul(BigNumber.from(basisPoints)).mul(czfPerLPWad).div(parseEther("1")).div(BigNumber.from(10000)),2)
          : "0.00"
        )} CZF principle and
        {" ~"+((!!czfBnbLpBalance && !!basisPoints && !!czfPerLPWad && !!adjustedRateBasis) ?
          weiToShortString(czfBnbLpBalance.mul(BigNumber.from(basisPoints)).mul(czfPerLPWad).mul(Math.floor(adjustedRateBasis)).div(10000).div(parseEther("1")).div(BigNumber.from(10000)),2)
          : "0.00"
        )} CZF interest.
      </Text>
      <br/>
      <Button m="10px" onClick={()=>{
        sendClaim(pid);
      }}>Claim CZF</Button> <br/>
      <Button m="10px" onClick={()=>{
        if(window.confirm("WARNING! FastForward will cancel ALL your future vesting!!! You will only get "+(!!ffBasis ? (ffBasis/100).toFixed(2) : "0.00")+"%. More info at czodiac.gitbook.io")) sendFastForward(pid);
      }}>FastForward {!!ffBasis ? (ffBasis/100).toFixed(2) : "0.00"}% </Button> <br/>
      <Divider />

      <Text>Est. Claimable: {
        !!userInfo && !!userInfo?.totalVesting && !!userInfo?.emissionRate  && 
        (
          userInfo?.emissionRate.mul(currentEpoch-userInfo?.updateEpoch).lt(userInfo?.totalVesting) ? 
            weiToShortString(userInfo?.emissionRate.mul(currentEpoch-userInfo?.updateEpoch),5) : 
            weiToShortString(userInfo?.totalVesting.mul(ffBasis).div(10000),2)
          )}</Text>
      <Text>Est. CZF/day: {
        !!userInfo && !!userInfo.totalVesting && !!userInfo.emissionRate && 
          (
            userInfo.emissionRate.mul(currentEpoch-userInfo.updateEpoch).lt(userInfo.totalVesting) ? 
              weiToShortString(userInfo.emissionRate.mul(86400),2) : "0.00"
              
          )}</Text>
      <Text>Est. FF: {!!userInfo && !!userInfo.totalVesting && weiToShortString(userInfo.totalVesting.mul(ffBasis).div(10000),2)}</Text>
      <Text>Vesting: {!!userInfo && !!userInfo.totalVesting && weiToShortString(userInfo.totalVesting,5)}</Text>

  </>)
}

export default ExoticFarm;
