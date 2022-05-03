import React, { useState } from "react";
import { Box, Button, Icon, Link, Text, Heading, Image,
 SimpleGrid, Divider, Slider, SliderTrack, SliderFilledTrack, SliderThumb } from "@chakra-ui/react";
import { FiExternalLink } from "react-icons/fi";
import { useEthers } from "@pdusedapp/core";
import { CZFARM_ADDRESSES } from "../../constants";
import { BigNumber } from "ethers";
import useCZPools from "../../hooks/useCZPools";
import {weiToFixed, tokenAmtToShortString, weiToShortString, toShortString} from "../../utils/bnDisplay";
import "./index.scss";

const tokenLink = (address, name)=>{return (<Link style={{fontWeight:"bold",textDecoration:"underline"}} isExternal href={`https://bscscan.com/token/${address}`}>{name}</Link>)}

function CZPool({
  sendDeposit,
  sendWithdraw,
  rewardAddress,
  rewardDecimals,
  aprBasisPoints,
  rewardPerDay,
  usdValue,
  usdPerDay,
  timeStart,
  timeEnd,
  user,
  name,
  subtitle,
  logo
}) {
  const {chainId} = useEthers();

  const [basisPoints, setBasisPoints] = useState(10000)


  return (<>
      <Image src={logo} maxW="32px" display="inline-block" mr="7px" position="relative" top="-3px"></Image>
      <Heading display="inline-block" as="h3" fontSize="2xl" >{tokenLink(rewardAddress,name)}</Heading>
      <br/>
      <Text>{subtitle}</Text>
      <br/>
      <Link isExternal href={`https://cz.cash/#/swap?outputCurrency=${CZFARM_ADDRESSES[chainId]}`} textDecoration="underline">🖙🖙 Get CZF on cz.cash<Icon as={FiExternalLink} /> 🖘🖘</Link>
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
        sendDeposit(user.czfBal.mul(bp).div(BigNumber.from(10000)));
      }}>
        Stake {!!basisPoints ? (basisPoints/100).toFixed(2) : (100).toFixed(2)}% ({!!basisPoints ? weiToShortString(user.czfBal.mul(BigNumber.from(basisPoints)).div(BigNumber.from(10000)),2) : weiToShortString(user.czfBal,2)} CZF)
      </Button>
      <br />
      <Button m="10px" onClick={()=>{
        sendWithdraw(user.czfStaked);
      }}>Withdraw All</Button>
      <Button m="10px" onClick={()=>{
        sendWithdraw(BigNumber.from("0"));
      }}>Claim {name}</Button>

      <Divider />
      <Text fontWeight="bold">Your stats</Text>
      <SimpleGrid columns="4" spacing="1" >
        <Text textAlign="right">Staked:</Text><Text textAlign="left">{weiToShortString(user.czfStaked,2)} CZF</Text>
        <Text textAlign="right">Claimable:</Text><Text textAlign="left">{tokenAmtToShortString(user.rewardPending,rewardDecimals,2)} {name}</Text>
        <Text textAlign="right">Wallet:</Text><Text textAlign="left">{weiToShortString(user.czfBal,2)} CZF</Text>
        <Text textAlign="right">{name}/DAY:</Text><Text textAlign="left">{tokenAmtToShortString(user.rewardPerDay,rewardDecimals,2)} {name}</Text>
      </SimpleGrid>
      <Text fontWeight="bold">Pool stats</Text>
      <SimpleGrid columns="4" spacing="1" >
        <Text textAlign="right" >APR:</Text>
        <Text textAlign="left" >{aprBasisPoints.toNumber() / 100}%</Text>
        <Text textAlign="right" >{name}/day:</Text>
        <Text textAlign="left" >{tokenAmtToShortString(rewardPerDay,rewardDecimals,2)}</Text>
        <Text textAlign="right" >TVL:</Text>
        <Text textAlign="left" >${weiToShortString(usdValue,2)}</Text>
        <Text textAlign="right" >USD/day:</Text>
        <Text textAlign="left" >${weiToShortString(usdPerDay,2)}</Text>     
      </SimpleGrid>
      <SimpleGrid columns="2" spacing="1" >
        <Text textAlign="right" >Opens:</Text>
        <Text textAlign="left" >{timeStart.toString()}</Text>
        <Text textAlign="right" >Closes:</Text>
        <Text textAlign="left" >{timeEnd.toString()}</Text>
      </SimpleGrid>
  </>)
}

export default CZPool;