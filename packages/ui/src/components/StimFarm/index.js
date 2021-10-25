import React, { useState } from "react";
import { Box, Button, Icon, Link, Text, Heading, Image,
 SimpleGrid, Divider, Slider, SliderTrack, SliderFilledTrack, SliderThumb } from "@chakra-ui/react";
import { FiExternalLink } from "react-icons/fi";
import { useEthers } from "@pdusedapp/core";
import { CZFARM_ADDRESSES } from "../../constants";
import { BigNumber } from "ethers";
import {weiToFixed, tokenAmtToShortString, weiToShortString, toShortString} from "../../utils/bnDisplay";
import "./index.scss";

const tokenLink = (address, name)=>{return (<Link style={{fontWeight:"bold",textDecoration:"underline"}} isExternal href={`https://bscscan.com/token/${address}`}>{name}</Link>)}

function StimFarm({
  name,
  getLink,
  openDate,
  closeDate,
  vestDate,
  isOpen,
  isVested,
  isLaunching,
  isClosed,
  aprBasis,
  tvl,
  sendDeposit,
  sendClaim,
  sendApprove,
  user,
  logo
}) {
  const {chainId} = useEthers();

  const [basisPoints, setBasisPoints] = useState(10000)


  return (<>
      <Heading display="inline-block" as="h3" fontSize="2xl" >{name}</Heading>
      <Image maxW="250px" src={logo} ml="auto" mr="auto" mb="10px" mt="10px" />
      <Link isExternal href={getLink} textDecoration="underline">🖙🖙 Mint LP<Icon as={FiExternalLink} /> 🖘🖘</Link>

      {isOpen && !user.isApproved && (<>
        <Button m="10px" onClick={()=>{
          sendApprove();
        }}>Approve</Button>
      </>)}
      <Divider />

      {isLaunching && (<Text>Once launched, your Approve and Stake buttons will show here.</Text>)}
      {isClosed && (<Text>If you deposited, your CZF Calim button will show here after vesting.</Text>)}

      {isOpen && user.isApproved && (<>
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
          sendDeposit(user.assetWallet.mul(bp).div(BigNumber.from(10000)));
        }}>
          Stake {!!basisPoints ? (basisPoints/100).toFixed(2) : (100).toFixed(2)}% LP)
        </Button>      
      </>)}

      {isVested && user.depositorAsset.gt(BigNumber.from("0")) (<>
        <Button m="10px" onClick={()=>{
          sendClaim();
        }}>Claim CZF</Button>
      </>)}

      <Divider />
      <Text fontWeight="bold">Your stats</Text>
      <SimpleGrid columns="4" spacing="1" >
        <Text textAlign="right">Staked:</Text><Text textAlign="left">${weiToShortString(user.depositorUsd,2)}</Text>
        <Text textAlign="right">Vesting CZF:</Text><Text textAlign="left">{weiToShortString(user.czfClaimable,2)} CZF</Text>
        <Text textAlign="right">Wallet:</Text><Text textAlign="left">${weiToShortString(user.assetWalletUsd,2)}</Text>
      </SimpleGrid>
      <Text fontWeight="bold">Pool stats</Text>
      <SimpleGrid columns="2" spacing="1" >
        <Text textAlign="right" >APR:</Text>
        <Text textAlign="left" >{aprBasis / 100}%</Text>
        <Text textAlign="right" >TVL:</Text>
        <Text textAlign="left" >${weiToShortString(tvl,2)}</Text>
        <Text textAlign="right" >Open:</Text>
        <Text textAlign="left" >{openDate.toString()}</Text>
        <Text textAlign="right" >Close:</Text>
        <Text textAlign="left" >{closeDate.toString()}</Text>
        <Text textAlign="right" >Vest:</Text>
        <Text textAlign="left" >{vestDate.toString()}</Text>
      </SimpleGrid>
  </>)
}

export default StimFarm;