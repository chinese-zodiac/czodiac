import React from "react";
import { Box, Button, LightMode, Icon, Link, Text, Heading, Image,
Tabs, TabList, TabPanels, Tab, TabPanel, SimpleGrid, Divider } from "@chakra-ui/react";
import { FiExternalLink } from "react-icons/fi";
import { useEthers } from "@pdusedapp/core";
import { CZODIAC_ADDRESSES, BUSD_ADDRESSES, WETH_ADDRESSES } from "../../constants";
import { Contract, utils, BigNumber, constants } from "ethers";
import useBUSDPrice from "../../hooks/useBUSDPrice";
import useCZPools from "../../hooks/useCZPools";
import {weiToFixed, weiToShortString, toShortString} from "../../utils/bnDisplay";
import "./index.scss";

const tokenLink = (address, name)=>{return (<Link style={{fontWeight:"bold",textDecoration:"underline"}} isExternal href={`https://bscscan.com/token/${address}`}>{name}</Link>)}
const czfarmLink = ()=>tokenLink("0x7c1608C004F20c3520f70b924E2BfeF092dA0043","$CZF");

function CZPoolsList() {
  const {
    timestampStart,
    timestampEnd,
    rewardPerSecond,
    totalAmount,
    totalAmountUSD,
    aprBasisPoints,
    userInfo
  } = useCZPools("TIGZ");

  return (<>
    <p>Earn partnered tokens by by pooling {czfarmLink()}.</p>
    <Text>Under construction</Text>
  </>)
}

export default CZPoolsList;