import React, { useState, useEffect } from "react";
import {
  Box,
  Link,
  Text,
  SimpleGrid,
  Divider,
  Button, Icon, Heading
} from "@chakra-ui/react";
import { FiExternalLink } from "react-icons/fi";
import { useEthers, useTokenBalance } from "@pdusedapp/core";
import { Contract, utils, BigNumber, constants } from "ethers";
import useBUSDPrice from "../../hooks/useBUSDPrice";
import useExoticFarms from "../../hooks/useExoticFarms";
import { CZFARM_ADDRESSES, EXOTIC_FARMS, CHAINS } from "../../constants";
import {
  weiToFixed,
  weiToShortString,
  toShortString,
} from "../../utils/bnDisplay";
import "./index.scss";
import ExoticFarm from "./ExoticFarm";

const { formatEther, parseEther } = utils;

const tokenLink = (address, name) => {
  return (
    <Link
      style={{ fontWeight: "bold", textDecoration: "underline" }}
      isExternal
      href={`https://bscscan.com/token/${address}`}
    >
      {name}
    </Link>
  );
};

const czfarmLink = () =>
  tokenLink("0x7c1608C004F20c3520f70b924E2BfeF092dA0043", "$CZF");

function ExoticFarmsList() {
  const { chainId,account } = useEthers();
  const { farmSets, 
    sendDeposit,
    sendClaimAll,
    sendClaim,
    sendFastForward } = useExoticFarms();
  const czfBnbLpBalance = useTokenBalance(EXOTIC_FARMS[CHAINS.BSC][0].lp, account);
  const czfarmBusdPrice = useBUSDPrice(CZFARM_ADDRESSES[chainId]);

  const [currentEpoch, setCurrentEpoch] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setCurrentEpoch(Math.floor(Date.now()/1000)), 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const displayFarms = (farmSet) => {
    const czfPerLPWad = farmSet.czfPerLPWad;
    return (
      !!farmSet &&
      farmSet.farms.length > 0 && (
        <>
          <Box className="farmSet-heading">
            <Heading mt="10px">{farmSet.title}</Heading><br/>
            <Text >
              <Link isExternal href={farmSet.mintLink} textDecoration="underline">🖙🖙 Mint CZF/BNB on PCS <Icon as={FiExternalLink} /> 🖘🖘</Link>
            </Text>
          </Box>
          {farmSet.farms.map((farm, index) => {
            return (
              <Box
                key={"pid-" + farm.pid}
                border="solid 1px"
                borderRadius="5px"
                m="0px"
                mb="20px"
                p="20px"
                fontSize={{ base: "x-small", md: "md" }}
              >                
              <ExoticFarm
                {...farm}
                sendDeposit={sendDeposit}
                sendFastForward={sendFastForward}
                sendClaim={sendClaim}
                currentEpoch={currentEpoch}
                czfBnbLpBalance={!!czfBnbLpBalance ? czfBnbLpBalance : BigNumber.from("0")}
                czfPerLPWad={czfPerLPWad}
                usdForOneCzfBnbLp={(!!czfarmBusdPrice && !!farm && !!czfPerLPWad) ? czfarmBusdPrice.mul(czfPerLPWad).div(parseEther("1")) : BigNumber.from("0")}
              />
              </Box>
            );
          })}
        </>
      )
    );
  };

  return (
    <>
      {displayFarms(farmSets[0])}
      <Box className="farmSet-footing">
        <Button m="10px" onClick={()=>{
          sendClaimAll();
        }}>Claim All CZF</Button><br/>
        Saves gas if using multiple Exotic Farms
      </Box>
    </>
  );
}

export default ExoticFarmsList;
