import React, { useState } from "react";
import {
  Box,
  Link,
  Text,
  SimpleGrid,
  Divider,
} from "@chakra-ui/react";
import { useEthers } from "@pdusedapp/core";
import { Contract, utils, BigNumber, constants } from "ethers";
import useBUSDPrice from "../../hooks/useBUSDPrice";
import useCZVaults from "../../hooks/useCZVaults";
import {
  weiToFixed,
  weiToShortString,
  toShortString,
} from "../../utils/bnDisplay";
import "./index.scss";
import CZVault from "./CZVault";

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

function CZVaultList() {
  const { chainId } = useEthers();
  const { pools } = useCZVaults();

  const [basisPoints, setBasisPoints] = useState(pools.map((p) => 10000));

  const [currentDate] = useState(new Date());

  const displayPools = (filter, pools) => {
    return (
      !!pools &&
      pools.length > 0 && (
        <>
          {pools.map((pool, index) => {
            if (!filter(pool)) return;
            return (
              <Box
                key={"pid-" + pool.name}
                border="solid 1px"
                borderRadius="5px"
                m="0px"
                mb="20px"
                p="20px"
                fontSize={{ base: "x-small", md: "md" }}
              >
                <CZVault
                  sendDeposit={pool.sendDeposit}
                  sendWithdraw={pool.sendWithdraw}
                  rewardAddress={pool.rewardAddress}
                  rewardDecimals={pool.rewardDecimals}
                  aprBasisPoints={pool.aprBasisPoints}
                  rewardPerDay={pool.rewardPerDay}
                  usdValue={pool.usdValue}
                  usdPerDay={pool.usdPerDay}
                  timeStart={pool.timeStart}
                  timeEnd={pool.timeEnd}
                  user={pool.user}
                  name={pool.name}
                  description={pool.description}
                  isBnbVault={pool.isBnbVault}
                  logo={pool.logo}
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
      <p>Earn partnered tokens by pooling {czfarmLink()}.</p>
      <br />
      {displayPools((pool) => true, pools)}
      <Text fontWeight="bold">Pools Totals</Text>
      {!!pools && pools.length > 0 ? (
        <SimpleGrid columns="2" spacing="1">
          <Text textAlign="right">Pool Count:</Text>
          <Text textAlign="left">{pools.length}</Text>
          <Text textAlign="right">Active USD/Day Rewards:</Text>
          {/* <Text textAlign="left">
            $
            {weiToShortString(
              pools.reduce(
                (prev, curr, index, pools) =>
                  pools[index].timeStart <= currentDate &&
                  pools[index].timeEnd >= currentDate
                    ? prev.add(pools[index].usdPerDay)
                    : prev,
                BigNumber.from("0")
              ),
              2
            )}
          </Text> */}
          <Text textAlign="right">Total Value Locked:</Text>
          {/* <Text textAlign="left">
            $
            {weiToShortString(
              pools.reduce(
                (prev, curr, index, pools) => prev.add(pools[index].usdValue),
                BigNumber.from("0")
              ),
              2
            )}
          </Text> */}
        </SimpleGrid>
      ) : (
        <Box>Loading pools...</Box>
      )}
      <br />
      <Divider />
    </>
  );
}

export default CZVaultList;
