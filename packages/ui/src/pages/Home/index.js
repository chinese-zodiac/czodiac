import Header from "../../components/Header";
import BackgroundLines from "../../components/BackgroundLines";
import { Box, Button, LightMode, Icon, Link, Text } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { FiExternalLink } from "react-icons/fi";
import { useEthers } from "@pdusedapp/core";
import { CZODIAC_ADDRESSES, BUSD_ADDRESSES, WETH_ADDRESSES } from "../../constants";
import useBUSDPrice from "../../hooks/useBUSDPrice";
import {weiToFixed, weiToShortString, toShortString} from "../../utils/bnDisplay";

import "./index.scss";
const tigzLink = ()=>{return (<Link style={{fontWeight:"bold",textDecoration:"underline"}} isExternal href="https://bscscan.com/token/0x535874bfbecac5f235717faea7c26d01c67b38c5">$TIGZ</Link>)}


function Home() {  
  const {chainId} = useEthers();
  const tigzBusdPrice = useBUSDPrice(CZODIAC_ADDRESSES.TigerZodiac[chainId]);
  return (<>
    <BackgroundLines />
      <Header />
    <LightMode>
      <Box as="main" className="both-center home-page">
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
          <Text>{tigzLink()}: ${weiToFixed(tigzBusdPrice,12)}</Text>
          <br/><br/>
      </Box>
    </LightMode>
</>);
}

export default Home;
