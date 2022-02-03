import { useEffect, useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BackgroundLines from "../../components/BackgroundLines";
import { Box, Button, LightMode, Icon, Link, Text, SimpleGrid } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { FiExternalLink } from "react-icons/fi";
import { useContractFunction, useEthers } from "@pdusedapp/core";
import { CZODIAC_ADDRESSES, CZFARM_ADDRESSES, TIGERHP_ADDRESSES, CZUSD, CZVAULTPEG } from "../../constants";
import useBUSDPrice from "../../hooks/useBUSDPrice";
import {weiToFixed, weiToShortString, toShortString} from "../../utils/bnDisplay";
import czVaultPeg from "../../abi/CZVaultPeg.json";
import { Contract, utils, BigNumber, constants } from "ethers";
import useLossCompensation from "../../hooks/useLossCompensation";

import "./index.scss";

const {Interface, parseEther} = utils;

const tokenLink = (address, name)=>{return (<Link style={{fontWeight:"bold",textDecoration:"underline"}} isExternal href={`https://bscscan.com/token/${address}`}>{name}</Link>)}
const czfarmLink = ()=>tokenLink("0x7c1608C004F20c3520f70b924E2BfeF092dA0043","$CZF");
const tigzLink = ()=>tokenLink("0x535874bfbecac5f235717faea7c26d01c67b38c5","$TIGZ");
//const oxzLink = ()=>tokenLink("0x58A39ceEcC7B5b1497c39fa8e12Dd781C4fAfaFc","$OXZ");
const tigzhpLink = ()=>tokenLink("0xDd2F98a97fc2A59b1f0f03DE63B4b41041a339B0","$TIGZHP");
const czusdLink = ()=>tokenLink("0xE68b79e51bf826534Ff37AA9CeE71a3842ee9c70","$CZUSD");


function Home() {  
  const {chainId, account} = useEthers();
  const czfarmBusdPrice = useBUSDPrice(CZFARM_ADDRESSES[chainId]);
  const czusdBusdPrice = useBUSDPrice(CZUSD[chainId]);

  const czVaultPegInterface = new Interface(czVaultPeg);
  const [czVaultPegContract, setCzVaultPegContract] = useState(null);
  const { state: stateRepeg, send: sendRepeg } = useContractFunction(czVaultPegContract, 'repeg');
  useEffect(()=>{
      if(!!account && !!CZVAULTPEG[chainId])
      setCzVaultPegContract(new Contract(CZVAULTPEG[chainId], czVaultPegInterface));
  },[account,chainId]);
  
  const { ffBasis, 
    vestPeriod,
    userInfo,
    sendClaim,
    sendFastForward } = useLossCompensation();

  return (<>
    <BackgroundLines />
    <Header />
    <LightMode>
      <Box as="main" className="horizontal-center home-page" paddingTop="10vh">
          <Link href="https://app.1inch.io/#/56/swap/BNB/0x7c1608C004F20c3520f70b924E2BfeF092dA0043" isExternal>
            <Button colorScheme="purple"  >Buy CZF <Icon as={FiExternalLink} /></Button>
          </Link >
          <NavLink to="exoticfarms">
            <Button colorScheme="red" >★ Exotic Farms</Button>
          </NavLink>
          <NavLink to="chronopools">
            <Button colorScheme="red" >★ Chrono Pools</Button>
          </NavLink>
          <NavLink to="czfarm">
            <Button colorScheme="red" >★ v1Pools, v1Farms</Button>
          </NavLink>
          {/*<NavLink to="ibfrgames">
            <Button colorScheme="red">iBFR Games</Button>
          </NavLink>*/}
          <NavLink to="vaults">
            <Button colorScheme="orange">Antidump Vaults</Button>
          </NavLink>
          <NavLink to="czusd">
            <Button colorScheme="orange" >Exempt Borrow</Button>
          </NavLink>
          <Link href="https://czodiac.com" isExternal>
            <Button colorScheme="orange" variant="outline" >Information <Icon as={FiExternalLink} /></Button>
          </Link >
          {!!userInfo && !!userInfo.emissionRate && userInfo.emissionRate.gt(0) && (<NavLink to="losscomp">
            <Button colorScheme="red" >★ Loss Compensation</Button>
          </NavLink>)}
          <SimpleGrid className="stats" columns={2} spacing={1} w="100vw" position="relative" left="-27px">
            <Text w="100%" textAlign="right" pr="5px">{czfarmLink()}:</Text><Text textAlign="left" fontFamily="monospace" fontSize="14px" pt="3px"> ${weiToFixed(czfarmBusdPrice,12)}</Text>
            <Text w="100%" textAlign="right" pr="5px">{czusdLink()}:</Text><Text textAlign="left" fontFamily="monospace" fontSize="14px" pt="3px"> ${weiToFixed(czusdBusdPrice,12)}</Text>
          </SimpleGrid>
      </Box>
    </LightMode>
    <Button ml="auto" mr="auto" display="block" onClick={()=>sendRepeg()} variant="outline" >Repeg CZUSD</Button>
    <br/><br/>
    <Footer />
</>);
}

export default Home;
