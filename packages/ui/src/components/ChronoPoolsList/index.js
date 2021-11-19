import React, { useState, useEffect } from "react";
import {
  Box,
  Link,
  Text,
  SimpleGrid,
  Divider,
  Button
} from "@chakra-ui/react";
import { useEthers, useTokenBalance } from "@pdusedapp/core";
import { Contract, utils, BigNumber, constants } from "ethers";
import useBUSDPrice from "../../hooks/useBUSDPrice";
import useChronoPools from "../../hooks/useChronoPools";
import { CZFARM_ADDRESSES, CHAINS } from "../../constants";
import {
  weiToFixed,
  weiToShortString,
  toShortString,
} from "../../utils/bnDisplay";
import "./index.scss";
import ChronoPool from "./ChronoPool";

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

function ChronoPoolsList() {
  const { chainId,account } = useEthers();
  const { pools, 
    sendDeposit,
    sendReinvest,
    sendClaimAll,
    sendClaim,
    sendFastForward } = useChronoPools();
  const czfBalance = useTokenBalance(CZFARM_ADDRESSES[CHAINS.BSC], account);

  const [currentEpoch, setCurrentEpoch] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setCurrentEpoch(Math.floor(Date.now()/1000)), 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const displayPools = (pools) => {
    return (
      !!pools &&
      pools.length > 0 && (
        <>
          {pools.map((pool, index) => {
            return (
              <Box
                key={"pid-" + pool.pid}
                border="solid 1px"
                borderRadius="5px"
                m="0px"
                mb="20px"
                p="20px"
                fontSize={{ base: "x-small", md: "md" }}
              >
                <ChronoPool
                  {...pool}
                  sendDeposit={sendDeposit}
                  sendReinvest={sendReinvest}
                  sendFastForward={sendFastForward}
                  sendClaim={sendClaim}
                  currentEpoch={currentEpoch}
                  czfBalance={!!czfBalance ? czfBalance : BigNumber.from("0")}
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
      {displayPools(pools)}
      <Box>
        <Button m="10px" onClick={()=>{
        sendClaimAll();
      }}>Claim All CZF</Button><br/>
      Saves gas if using multiple Chrono Pools
      </Box>
    </>
  );
}

export default ChronoPoolsList;
