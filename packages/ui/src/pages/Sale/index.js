import React, {useEffect, useState} from "react";
import { useEthers } from "@usedapp/core";
import { CHAIN_LABELS, BLOCK_EXPLORERS } from "../../constants";
import { useColorModeValue, Box, Heading, Icon, Text, Link, Button, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper } from "@chakra-ui/react";
import Header from "../../components/Header";
import useLockedSale from "../../hooks/useLockedSale";
import { FiExternalLink, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { SimpleGrid } from "@chakra-ui/react";
import Particles from "react-tsparticles";
import particleConfig from "./particleConfig";
import {weiToFixed, weiToShortString, toShortString} from "../../utils/bnDisplay";
import "./index.scss";


function Sale() {
  const format = (val) => `${val} BNB`;
  const parse = (val) => val.replace(/^\$/, "");
  const [value, setValue] = React.useState("1.5");
  const vignetteColor = useColorModeValue(
    "radial-gradient(circle, var(--chakra-colors-gray-100) 50%, transparent 100%)", 
    "radial-gradient(circle, var(--chakra-colors-gray-900) 50%, transparent 100%)"
  );

  const maxBNB = 2;

  const {
    saleChainId,
    whitelistStatus,
    spendings,
    receipts,
    totalBuyers,
    totalSpendings,
    rate,
    startTimestamp,
    endTimestamp,
    saleSize,
    saleCap,
    tokenAddress,
    saleAddress,
    maxPurchase,
    minPurchase
  } = useLockedSale();

  return (<>
    <Particles id="tsparticles" options={particleConfig} />
    <Box id="tsparticles-cover" bg={vignetteColor} />
    <Header />
    <Box as="main" className="horizontal-center sale-page">
      <Heading mt="100px">Initial Liquidity Sale</Heading>
      <Text className="explanation">
      The Sale runs from the start countdown to the end countdown.
      There is a limit of {maxBNB} BNB per buyer and a minimum of 0.1 BNB.
      The Sale can only reach a maximum of 100 BNB.
      Tokens are locked for 1 week and auto distributed.
      0% of tokens to team. Fair Launch!
      100% of BNB will be locked as liquidity.
      Whitelisting and more information on <Link isExternal color="orange.700" href="https://t.me/CZodiacofficial">Telegram <Icon as={FiExternalLink} /></Link>.<br/>
      <b> USA citizens, residents, agents etc are excluded.</b>
      </Text>
      <NumberInput 
        onChange={(valueString) => setValue(parse(valueString))}
        value={format(value)}
        className="bnbInput" defaultValue={1} precision={1} step={0.1} min={0.1} max={maxBNB}>
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
      <Button className="purchaseButton" >Purchase</Button>
      <hr />
      <Heading as="h2" size="md">Your Stats</Heading>
      <SimpleGrid className="stats" columns={2} spacing={1}>
        <Text>Whitelist Status:</Text>
        <Text>
          {whitelistStatus ?
            (<Icon color="orange.700" as={FiCheckCircle} />) :
            (<Icon color="red.700" as={FiXCircle} />)
            
}   </Text>
        <Text>Spendings:</Text>
        <Text>{weiToFixed(spendings)} BNB</Text>
        <Text>Receipts:</Text>
        <Text>{weiToShortString(receipts)} OxZodiac</Text>
      </SimpleGrid>
      <hr />
      <Heading as="h2" size="md">Sale Stats</Heading>
      <SimpleGrid className="stats" columns={2} spacing={1}>
        <Text>Network:</Text>
        <Text>{CHAIN_LABELS[saleChainId]}</Text>
        <Text>Total Buyers:</Text>
        <Text>{weiToFixed(totalBuyers,2)}</Text>
        <Text>Total Spendings:</Text>
        <Text>{weiToFixed(totalSpendings,2)} BNB</Text>
        <Text>Rate:</Text>
        <Text>{toShortString(rate,2)} OxZodiac/BNB</Text>
        <Text>Opening Date:</Text>
        <Text>TBD</Text>
        <Text>Closing Date:</Text>
        <Text>TBD</Text>
        <Text>Unlock Date:</Text>
        <Text>TBD</Text>
        <Text>Sale Size:</Text>
        <Text>{weiToShortString(saleSize,2)} OxZodiac</Text>
        <Text>Sale Cap:</Text>
        <Text>{weiToFixed(saleCap,2)} BNB</Text>
        <Text>Token Address:</Text>
        <Link isExternal color="orange.700"  fontFamily="monospace"
          href={`${BLOCK_EXPLORERS[saleChainId]}/token/${tokenAddress}`}>{tokenAddress}
        </Link>
        <Text>Sale Address:</Text>
        <Link isExternal color="orange.700"  fontFamily="monospace"
          href={`${BLOCK_EXPLORERS[saleChainId]}/token/${saleAddress}`}>{saleAddress}
        </Link>
        <Text>Swap Link:</Text>
        <Link isExternal color="orange.700" 
          href={`https://pancakeswap.info/token/${tokenAddress}`}>pancakeswap.info
        </Link>
      </SimpleGrid>
      <hr />
    </Box>
  </>);
}

export default Sale;
