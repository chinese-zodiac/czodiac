import React, {useEffect, useState} from "react";
import { useColorModeValue, Box, Heading, Icon, Text, Link, Button, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper } from "@chakra-ui/react";
import Header from "../../components/Header";
import useLockedSale from "../../hooks/useLockedSale";
import { FiExternalLink, FiCheck } from "react-icons/fi";
import { SimpleGrid } from "@chakra-ui/react";
import Particles from "react-tsparticles";
import particleConfig from "./particleConfig";
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
        <Text><Icon color="green.700" as={FiCheck} /></Text>
        <Text>Spendings:</Text>
        <Text>{0} BNB</Text>
        <Text>OxZodiac:</Text>
        <Text>{0} OxZodiac</Text>
      </SimpleGrid>
      <hr />
      <Heading as="h2" size="md">Sale Stats</Heading>
      <SimpleGrid className="stats" columns={2} spacing={1}>
        <Text>Total Buyers:</Text>
        <Text>{0}</Text>
        <Text>Total Purchases:</Text>
        <Text>{0} BNB</Text>
        <Text>Rate:</Text>
        <Text>20B OxZodiac/BNB</Text>
        <Text>Opening Date:</Text>
        <Text>TBD</Text>
        <Text>Closing Date:</Text>
        <Text>TBD</Text>
        <Text>Unlock Date:</Text>
        <Text>TBD</Text>
        <Text>Sale Size:</Text>
        <Text>2T OxZodiac</Text>
        <Text>Sale Cap:</Text>
        <Text>100 BNB</Text>     
        <Text>Token:</Text>
        <Link isExternal color="orange.700" 
          href="https://etherscan.io">0x0000...
        </Link>
      </SimpleGrid>
      <hr />
    </Box>
  </>);
}

export default Sale;
