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

const tokenLink = (address, name)=>{return (<Link style={{fontWeight:"bold",textDecoration:"underline"}} isExternal href={`https://bscscan.com/token/${address}`}>{name}</Link>)}

function CZVault({
  sendDeposit,
  sendWithdraw,
  sendClaim,
  rewardAddress,
  rewardDecimals,
  aprBasisPoints,
  rewardPerDay,
  usdPerDay,
  feeBasis,
  czfPerDay,
  timeStart,
  timeEnd,
  user,
  name,
  description,
  isBnbVault,
  logo,
  baseAssetStakedBusd
}) {
  const {chainId} = useEthers();

  const [basisPoints, setBasisPoints] = useState(10000)


  return (<>
      <Image src={logo} maxW="32px" display="inline-block" mr="7px" position="relative" top="-3px"></Image>
      <Heading display="inline-block" as="h3" fontSize="2xl" >{isBnbVault ? "BNB" : tokenLink(rewardAddress,name)}</Heading>
      <Text>{description}</Text>
      <br/>
      <Link isExternal href={`https://pancakeswap.finance/swap#/swap?outputCurrency=${isBnbVault ? "BNB" : CZFARM_ADDRESSES[chainId] }`} textDecoration="underline">🖙🖙 Get {name} on PCS<Icon as={FiExternalLink} /> 🖘🖘</Link>
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
        if(isBnbVault){
          if(user.bnbBal.gt(parseEther("0.025"))) {
            sendDeposit(user.bnbBal.sub(parseEther("0.025")).mul(bp).div(BigNumber.from(10000)));
          } else {
            alert("Not enough BNB");
          }
        } else {
          alert("TODO: NOT_IMPLEMENTED");
        }    
      }}>
        {isBnbVault ? <>
          Stake {!!basisPoints ? (basisPoints/100).toFixed(2) : (100).toFixed(2)}% ({!!basisPoints ? weiToShortString(user.bnbBal.sub(parseEther("0.025")).mul(BigNumber.from(basisPoints)).div(BigNumber.from(10000)),2) : weiToShortString(user.bnbBal.sub(parseEther("0.025")),2)} {`${name}`})
        </> : <>
          TODO: NOT_IMPLEMENTED
        </>}
        
      </Button>
      <br />
      <Button m="10px" onClick={()=>{
        sendWithdraw(user.vaultAssetStaked);
      }}>Withdraw All</Button>
      <Button m="10px" onClick={()=>{
        sendClaim();
      }}>Claim CZF</Button>

      <Divider />
      <Text fontWeight="bold">Your stats</Text>
      <SimpleGrid columns="4" spacing="1" >
        <Text textAlign="right">Staked:</Text><Text textAlign="left">{weiToShortString(user.baseAssetStaked,8)} {name}</Text>
        <Text textAlign="right">Claimable:</Text><Text textAlign="left">{tokenAmtToShortString(user.rewardPending,rewardDecimals,2)} CZF</Text>
        <Text textAlign="right">Wallet:</Text><Text textAlign="left">{weiToShortString(user.bnbBal,2)} {name}</Text>
        <Text textAlign="right">CZF/DAY:</Text><Text textAlign="left">{tokenAmtToShortString(user.czfPerDay,rewardDecimals,2)} CZF</Text>
      </SimpleGrid>
      <Text fontWeight="bold">Vault stats</Text>
      <SimpleGrid columns="4" spacing="1" >
        {/*<Text textAlign="right" >APR:</Text>
        <Text textAlign="left" >{aprBasisPoints.toNumber() / 100}%</Text>
        <Text textAlign="right" >{name}/day:</Text>
        <Text textAlign="left" >{tokenAmtToShortString(rewardPerDay,rewardDecimals,2)}</Text>
        */}
        <Text textAlign="right" >TVL:</Text>
        <Text textAlign="left" >${weiToShortString(baseAssetStakedBusd,2)}</Text>    
        <Text textAlign="right" >Deposit Fee:</Text>
        <Text textAlign="left" >0.00%</Text> 
        <Text textAlign="right" >CZF/day:</Text>
        <Text textAlign="left" >{tokenAmtToShortString(czfPerDay,rewardDecimals,2)} CZF</Text>
        <Text textAlign="right" >Withdraw Fee:</Text>
        <Text textAlign="left" >{!!feeBasis ? feeBasis / 100 : 0}%</Text>
      </SimpleGrid>
  </>)
}

export default CZVault;
