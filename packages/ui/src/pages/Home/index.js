import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BackgroundLines from "../../components/BackgroundLines";
import { Box, Button, LightMode, Icon, Link, Text, SimpleGrid } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { FiExternalLink } from "react-icons/fi";
import { useEthers } from "@pdusedapp/core";
import { CZODIAC_ADDRESSES, CZFARM_ADDRESSES, TIGERHP_ADDRESSES } from "../../constants";
import useBUSDPrice from "../../hooks/useBUSDPrice";
import {weiToFixed, weiToShortString, toShortString} from "../../utils/bnDisplay";

import "./index.scss";
const tokenLink = (address, name)=>{return (<Link style={{fontWeight:"bold",textDecoration:"underline"}} isExternal href={`https://bscscan.com/token/${address}`}>{name}</Link>)}
const czfarmLink = ()=>tokenLink("0x7c1608C004F20c3520f70b924E2BfeF092dA0043","$CZF");
const tigzLink = ()=>tokenLink("0x535874bfbecac5f235717faea7c26d01c67b38c5","$TIGZ");
//const oxzLink = ()=>tokenLink("0x58A39ceEcC7B5b1497c39fa8e12Dd781C4fAfaFc","$OXZ");
const tigzhpLink = ()=>tokenLink("0xDd2F98a97fc2A59b1f0f03DE63B4b41041a339B0","$TIGZHP");


function Home() {  
  const {chainId} = useEthers();
  const tigzBusdPrice = useBUSDPrice(CZODIAC_ADDRESSES.TigerZodiac[chainId]);
  const czfarmBusdPrice = useBUSDPrice(CZFARM_ADDRESSES[chainId]);
  //const oxzBusdPrice = useBUSDPrice(CZODIAC_ADDRESSES.OxZodiac[chainId]);
  const tigzhpBusdPrice = useBUSDPrice(TIGERHP_ADDRESSES[chainId]);
  return (<>
    <BackgroundLines />
    <Header />
    <LightMode>
      <Box as="main" className="horizontal-center home-page" paddingTop="10vh">
          <NavLink to="czfarm">
            <Button colorScheme="red" >Earn On CZFarm</Button>
          </NavLink>
          <NavLink to="czusd">
            <Button colorScheme="red" >Borrow CZUsd</Button>
          </NavLink>
          <NavLink to="tigerhunt">
            <Button colorScheme="red" >Play Tiger Hunt</Button>
          </NavLink>
          <NavLink to="swap">
            <Button colorScheme="orange" >OxZ{"->"}TigZ (complete)</Button>
          </NavLink>
          <NavLink to="sale">
            <Button colorScheme="orange" >Sale (complete)</Button>
          </NavLink>
          <Link href="https://czodiac.com" isExternal>
            <Button colorScheme="orange" variant="outline" >Information <Icon as={FiExternalLink} /></Button>
          </Link >
          <SimpleGrid className="stats" columns={2} spacing={1} w="100vw" position="relative" left="-27px">
            <Text w="100%" textAlign="right" pr="5px">{tigzLink()}:</Text><Text textAlign="left" fontFamily="monospace" fontSize="14px" pt="3px"> ${weiToFixed(tigzBusdPrice,12)}</Text>
            <Text w="100%" textAlign="right" pr="5px">{tigzhpLink()}:</Text><Text textAlign="left" fontFamily="monospace" fontSize="14px" pt="3px"> ${weiToFixed(tigzhpBusdPrice,12)}</Text>
            <Text w="100%" textAlign="right" pr="5px">{czfarmLink()}:</Text><Text textAlign="left" fontFamily="monospace" fontSize="14px" pt="3px"> ${weiToFixed(czfarmBusdPrice,12)}</Text>
          </SimpleGrid>
          <br/><br/>
          <Footer />
      </Box>
    </LightMode>
</>);
}

export default Home;
