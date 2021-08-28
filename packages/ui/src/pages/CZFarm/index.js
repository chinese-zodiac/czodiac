import Header from "../../components/Header";
import BackgroundNetwork from "../../components/BackgroundNetwork";
import { Box, Button, LightMode, Icon, Link, Text, Heading, Image,
Tabs, TabList, TabPanels, Tab, TabPanel, SimpleGrid, Divider } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { FiExternalLink } from "react-icons/fi";
import { useEthers } from "@pdusedapp/core";
import { CZODIAC_ADDRESSES, BUSD_ADDRESSES, WETH_ADDRESSES } from "../../constants";
import { Contract, utils, BigNumber, constants } from "ethers";
import useBUSDPrice from "../../hooks/useBUSDPrice";
import useCZFarmMaster from "../../hooks/useCZFarmMaster";
import {weiToFixed, weiToShortString, toShortString} from "../../utils/bnDisplay";

import "./index.scss";
const tokenLink = (address, name)=>{return (<Link style={{fontWeight:"bold",textDecoration:"underline"}} isExternal href={`https://bscscan.com/token/${address}`}>{name}</Link>)}
const czfarmLink = ()=>tokenLink("0x7c1608C004F20c3520f70b924E2BfeF092dA0043","$CZF");


function CZFarm() {  
  const {chainId} = useEthers();
  const tigzBusdPrice = useBUSDPrice(CZODIAC_ADDRESSES.TigerZodiac[chainId]);
  const {
      pools,
      czfPerBlock,
      totalAllocPoint,
      startBlock,
      poolLength,
      stateDeposit,
      sendDeposit,
      stateWithdraw,
      sendWithdraw,
      stateClaim,
      sendClaim
    } = useCZFarmMaster();
  return (<>
    <BackgroundNetwork />
    <Header />
    <Box as="main" className="czfarm-page horizontal-center">
      <Tabs>
        <TabList variant="enclosed">
          <Tab>Farms</Tab>
          <Tab>Pools</Tab>
          <Tab>Trade</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Text>Earn {czfarmLink()} by staking Pancakeswap liquidity.</Text>
            <br/>
            <Text>How it works: Each Farm below (for instance, CZF/TIGZ) is for Pancakeswap Liquidity Tokens (called LP). So if you want to stake your CZF and your TIGZ, you should scroll down to that farm and click "Mint TIGZ/CZF on PCS". That will take you to the page on Pancakeswap where you can combine your TIGZ and CZF to mint the LP tokens. Then come back to this page and refresh, your balance should show up in your wallet. Then, approve and "Stake All TIGZ/CZF" to start earning!</Text>
            <br/>
            <Divider />
            {(!!pools && pools.length > 0) ? (<Box>
              {pools.map((pool)=>{
                if(pool.pid == undefined) return
                let p = pool;
                if(!!pool.tokens && pool.tokens.length == 2){
                  if(p.tokens[0].symbol == "WBNB") {p.tokens[0].symbol = "BNB"; p.tokens[0].address = "BNB";}
                  if(p.tokens[1].symbol == "WBNB") {p.tokens[1].symbol = "BNB"; p.tokens[1].address = "BNB";}
                }
                if(!p.usdValue || p.usdValue.lte(BigNumber.from("0"))) {
                  p.aprBasisPoints = BigNumber.from("0");
                  p.usdValue = BigNumber.from("0");
                }
                let poolName = "";
                if(!!p.tokens && p.tokens.length == 2) {
                  poolName = p.tokens[0].symbol + "/" + p.tokens[1].symbol;
                }
                
                return (
                <Box key={"pid-"+pool.pid} border="solid 1px" borderRadius="5px" m="20px" p="20px" fontSize={{base:"x-small",md:"md"}}>
                  {(!!p.tokens && p.tokens.length == 2) ? (<>
                  <Heading as="h3" fontSize="2xl">
                    {p.tokens[0].symbol + "/" + p.tokens[1].symbol}
                  </Heading>   
                  <Image maxW="250px" src={`./farm/${p.tokens[0].symbol}-${p.tokens[1].symbol}.jpg`} ml="auto" mr="auto" mb="10px" mt="10px" />
                  <Text>
                    <Link isExternal href={`https://pancakeswap.finance/add/${p.tokens[0].address}/${p.tokens[1].address}`} textDecoration="underline">🖙🖙 Mint {poolName} on PCS <Icon as={FiExternalLink} /> 🖘🖘</Link>
                  </Text>
                  <Divider />
                  {(!!p.tokens && p.tokens.length == 2 && !!p.userInfo) ? (<>
                    {(p.userInfo.lpAllowance.lte(p.userInfo.lpBalance)) ? (<>
                    <Button m="10px" onClick={()=>{
                      pool.sendApprove();
                    }}>Approve</Button>
                    </>) : (<>
                    {p.userInfo.lpBalance.gt(BigNumber.from("0")) ? (
                      <Button m="10px" onClick={()=>{
                        sendDeposit(pool.pid,p.userInfo.lpBalance,true);
                      }}>Stake All {poolName}</Button>
                    ) : (
                      <Text display="inline-block">
                        <Link isExternal href={`https://pancakeswap.finance/add/${p.tokens[0].address}/${p.tokens[1].address}`} textDecoration="underline" m="10px">
                          Get {poolName} LP
                        </Link>
                      </Text>
                    )}
                    {p.userInfo.amount.gt(BigNumber.from("0")) ? (
                      <Button m="10px" onClick={()=>{
                        sendWithdraw(pool.pid,p.userInfo.amount,true);
                      }}>Withdraw All {poolName}</Button>
                    ) : (
                      <Text m="10px" display="inline-block">Stake to withdraw</Text>
                    )}
                    {p.userInfo.pendingCzf.gt(BigNumber.from("0")) ? (
                      <Button m="10px" onClick={()=>{
                      sendClaim(pool.pid);
                    }}>Claim CZF</Button>
                    ) : (
                      <Text m="10px" display="inline-block">No CZF earnings</Text>
                    )}
                    </>)}
                  <Divider />
                  <Text fontWeight="bold">Your stats</Text>
                  <SimpleGrid columns="4" spacing="1" maxW="100%" ml="auto" mr="auto">
                    <Text textAlign="right">Staked:</Text><Text textAlign="left">${weiToShortString(p.userInfo.amountValue,2)} {poolName}</Text>
                    <Text textAlign="right">Claimable:</Text><Text textAlign="left">{weiToShortString(p.userInfo.pendingCzf,2)} CZF</Text>
                    <Text textAlign="right">Wallet:</Text><Text textAlign="left">${weiToShortString(p.userInfo.lpBalanceValue,2)} {poolName}</Text>
                    <Text textAlign="right">CZF/DAY:</Text><Text textAlign="left">{weiToShortString(p.userInfo.czfPerDay,2)} CZF</Text>
                  </SimpleGrid>
                  </>) : (<>
                    <Text>Loading your account...</Text>
                  </>)}
                  <Divider />
                  <Text fontWeight="bold">Pool stats</Text>
                  <SimpleGrid columns="4" spacing="1" maxW="400px" ml="auto" mr="auto">
                    <Text textAlign="right">APR:</Text><Text textAlign="left">{p.aprBasisPoints.toNumber()/100}%</Text>
                    <Text textAlign="right">Allocation:</Text><Text textAlign="left">{p.allocPoint}</Text>
                    <Text textAlign="right">TVL:</Text><Text textAlign="left">${weiToShortString(p.usdValue,2)}</Text>
                    <Text textAlign="right">CZF/DAY:</Text><Text textAlign="left">{weiToShortString(p.czfPerDay,2)} CZF</Text>
                  </SimpleGrid>
                  </>) : (<>
                    <Heading as="h3" fontSize="2xl">Loading...</Heading>
                  </>)}
                </Box>
              )})}
            </Box>) : (<Box>
              Loading farms... Check your wallet is connected to BSC.
            </Box>)
            }
            <Divider />
            <Text fontWeight="bold">Farm Stats</Text>
            <SimpleGrid columns="2" spacing="1" >
              <Text textAlign="right" >Pool Count:</Text>
              <Text textAlign="left" >{poolLength}</Text>
              <Text textAlign="right" >{czfarmLink()} per block:</Text>
              <Text textAlign="left" >{weiToShortString(czfPerBlock,2)}</Text>
              <Text textAlign="right" >Start Block:</Text>
              <Text textAlign="left" >{startBlock}</Text>
              <Text textAlign="right" >Total Alloc Point:</Text>
              <Text textAlign="left" >{totalAllocPoint}</Text>              
              <Text textAlign="right" >Total Value Locked:</Text>
              <Text textAlign="left" >{(!!pools && pools.length>0 && !!pools[0].usdValue) ? 
                "$"+weiToShortString(pools.reduce((prev,curr,index,pools)=>prev.add(pools[index].usdValue),BigNumber.from("0")),2)
                : "loading"}</Text>
            </SimpleGrid>
          </TabPanel>
          <TabPanel>
            <p>Earn partnered tokens by by pooling {czfarmLink()}.</p>
            <p>(Coming soon)</p>
          </TabPanel>
          <TabPanel>
            <p>Earn {czfarmLink()} by trading tokens on Pancakeswap.</p>
            <p>(Coming soon)</p>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
</>);
}

export default CZFarm;
