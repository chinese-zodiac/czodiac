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
  const { vaults } = useCZVaults();

  const displayVaults = (filter, vaults) => {
    return (
      !!vaults &&
      vaults.length > 0 && (
        <>
          {vaults.map((vault, index) => {
            if (!filter(vault)) return;
            return (
              <Box
                key={"pid-" + vault.name}
                border="solid 1px"
                borderRadius="5px"
                m="0px"
                mb="20px"
                p="20px"
                fontSize={{ base: "x-small", md: "md" }}
              >
                <CZVault
                  {...vault}
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
      <p>Earn autocompounding rewards and CZF without dumping on any projects.</p>
      <br />
      {displayVaults((vault) => true, vaults)}
      <Text fontWeight="bold">Vaults Totals</Text>
      {!!vaults && vaults.length > 0 ? (
        <SimpleGrid columns="2" spacing="1">
          <Text textAlign="right">Vault Count:</Text>
          <Text textAlign="left">{vaults.length}</Text>
          <Text textAlign="right">Active USD/Day Rewards:</Text>
          {/* <Text textAlign="left">
            $
            {weiToShortString(
              vaults.reduce(
                (prev, curr, index, vaults) =>
                  vaults[index].timeStart <= currentDate &&
                  vaults[index].timeEnd >= currentDate
                    ? prev.add(vaults[index].usdPerDay)
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
              vaults.reduce(
                (prev, curr, index, vaults) => prev.add(vaults[index].usdValue),
                BigNumber.from("0")
              ),
              2
            )}
          </Text> */}
        </SimpleGrid>
      ) : (
        <Box>Loading vaults...</Box>
      )}
      <br />
      <Divider />
    </>
  );
}

export default CZVaultList;
