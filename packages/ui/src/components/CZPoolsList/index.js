import React, { useState } from "react";
import { Box, Button, LightMode, Icon, Link, Text, Heading, Image,
Tabs, TabList, TabPanels, Tab, TabPanel, SimpleGrid, Divider, Slider, SliderTrack, SliderFilledTrack, SliderThumb } from "@chakra-ui/react";
import { FiExternalLink } from "react-icons/fi";
import { useEthers } from "@pdusedapp/core";
import { CZODIAC_ADDRESSES, BUSD_ADDRESSES, WETH_ADDRESSES, CZFARM_ADDRESSES } from "../../constants";
import { Contract, utils, BigNumber, constants } from "ethers";
import useBUSDPrice from "../../hooks/useBUSDPrice";
import useCZPools from "../../hooks/useCZPools";
import {weiToFixed, weiToShortString, toShortString} from "../../utils/bnDisplay";
import "./index.scss";

const tokenLink = (address, name)=>{return (<Link style={{fontWeight:"bold",textDecoration:"underline"}} isExternal href={`https://bscscan.com/token/${address}`}>{name}</Link>)}
const czfarmLink = ()=>tokenLink("0x7c1608C004F20c3520f70b924E2BfeF092dA0043","$CZF");

function CZPoolsList() {
  const {chainId} = useEthers();
  const {
    pools
  } = useCZPools();

  // States
  const [percent, setPercent] = useState([100, 100])

  return (<>
    <p>Earn partnered tokens by by pooling {czfarmLink()}.</p>
    <Box border="solid 1px" borderRadius="5px" p="10px" m="10px">
      <b>NOTICE</b><br/>
      - CZ Pools are in BETA. You may need to refresh the page to update UI.
      <br/>
      - Flexible staking amounts (select amount to stake) coming soon.
    </Box>
    <Divider />
    <br/>
    {(!!pools && pools.length > 0) ? (<Box>
      {pools.map((pool, index)=>{
        return(<Box key={"pid-"+pool.name} border="solid 1px" borderRadius="5px" m="20px" p="20px" fontSize={{base:"x-small",md:"md"}}>
          <Image src={pool.logo} maxW="32px" display="inline-block" mr="7px" position="relative" top="-3px"></Image>
          <Heading display="inline-block" as="h3" fontSize="2xl" >{tokenLink(pool.rewardAddress,pool.name)}</Heading>
          <br/>
          <Link isExternal href={`https://pancakeswap.finance/swap#/swap?outputCurrency=${CZFARM_ADDRESSES[chainId]}`} textDecoration="underline">🖙🖙 Get CZF on PCS<Icon as={FiExternalLink} /> 🖘🖘</Link>
          <Divider />

          <Slider
            aria-label="stake-percentage"
            defaultValue={100}
            onChange={(value) => {
              const newPercents = [...percent]
              newPercents[index] = value
              setPercent(newPercents)
            }}
          >
            <SliderTrack>
              <SliderFilledTrack bg="orange.800" />
            </SliderTrack>
            <SliderThumb />
          </Slider>

          <Button onClick={()=>{
            pool.sendDeposit(pool.user.czfBal.mul(BigNumber.from(percent[index])).div(BigNumber.from("100")));
          }}>
            Stake {weiToShortString(pool.user.czfBal.mul(BigNumber.from("20")).div(BigNumber.from("100")),2)} %
          </Button>
          <br />
          {/* <Button m="10px" onClick={()=>{
              pool.sendDeposit(pool.user.czfBal);
            }}>Stake All</Button>
          <Button m="10px" onClick={()=>{
              pool.sendDeposit(pool.user.czfBal.div(BigNumber.from("2")));
            }}>Stake 50%</Button>
          <Button m="10px" onClick={()=>{
              pool.sendDeposit(pool.user.czfBal.div(BigNumber.from("10")));
            }}>Stake 10%</Button> */}
          <Button m="10px" onClick={()=>{
            pool.sendWithdraw(pool.user.czfStaked);
          }}>Withdraw All</Button>
          <Button m="10px" onClick={()=>{
            pool.sendWithdraw(BigNumber.from("0"));
          }}>Claim {pool.name}</Button>

          <Divider />
          <Text fontWeight="bold">Your stats</Text>
          <SimpleGrid columns="4" spacing="1" >
            <Text textAlign="right">Staked:</Text><Text textAlign="left">{weiToShortString(pool.user.czfStaked,2)} CZF</Text>
            <Text textAlign="right">Claimable:</Text><Text textAlign="left">{weiToShortString(pool.user.rewardPending,2)} {pool.name}</Text>
            <Text textAlign="right">Wallet:</Text><Text textAlign="left">{weiToShortString(pool.user.czfBal,2)} CZF</Text>
            <Text textAlign="right">{pool.name}/DAY:</Text><Text textAlign="left">{weiToShortString(pool.user.rewardPerDay,2)} {pool.name}</Text>
          </SimpleGrid>
          <Text fontWeight="bold">Pool stats</Text>
          <SimpleGrid columns="4" spacing="1" >
            <Text textAlign="right" >APR:</Text>
            <Text textAlign="left" >{pool.aprBasisPoints.toNumber() / 100}%</Text>
            <Text textAlign="right" >{pool.name}/day:</Text>
            <Text textAlign="left" >{weiToShortString(pool.rewardPerDay)}</Text>
            <Text textAlign="right" >TVL:</Text>
            <Text textAlign="left" >${weiToShortString(pool.usdValue,2)}</Text>
            <Text textAlign="right" >USD/day:</Text>
            <Text textAlign="left" >${weiToShortString(pool.usdPerDay,2)}</Text>     
          </SimpleGrid>
          <SimpleGrid columns="2" spacing="1" >
            <Text textAlign="right" >Opens:</Text>
            <Text textAlign="left" >{pool.timeStart.toString()}</Text>
            <Text textAlign="right" >Closes:</Text>
            <Text textAlign="left" >{pool.timeEnd.toString()}</Text>
          </SimpleGrid>
        </Box>)
      })}
    </Box>) : (<Box>
      Loading pools... Check your wallet is connected to BSC.
    </Box>)}
    <br/>
    <Divider />
  </>)
}

export default CZPoolsList;