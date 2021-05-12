import React from "react";
import { Box, Heading, Icon, Text, Link, Button, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper } from "@chakra-ui/react";
import Header from "../../components/Header";
import useLockedSale from "../../hooks/useLockedSale";
import { FiExternalLink } from "react-icons/fi";
import "./index.scss";

function Sale() {
  const format = (val) => `${val} BNB`;
  const parse = (val) => val.replace(/^\$/, "");
  const [value, setValue] = React.useState("1.53");
  return (<>
    <Header />
    <Box as="main" className="both-center sale-page">
      <Heading>Initial Liquidity Sale</Heading>
      <Text className="explanation">
      The Sale runs from the start countdown to the end countdown.
      There is a limit of 5 BNB per buyer and a minimum of 0.1 BNB.
      The Sale can only reach a maximum of 100 BNB.
      Tokens are locked for 1 week and auto distributed.
      0% of tokens to team. Fair Launch!
      100% of BNB will be locked as liquidity.
      Whitelisting and more information on <Link isExternal color="orange.700" href="https://t.me/CZodiacofficial">Telegram <Icon as={FiExternalLink} /></Link>. 
      </Text>
      <NumberInput 
        onChange={(valueString) => setValue(parse(valueString))}
        value={format(value)}
        className="bnbInput" defaultValue={1} precision={1} step={0.1} min={0.1} max={5}>
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
      <Button className="purchaseButton" >Purchase</Button>
    </Box>
  </>);
}

export default Sale;
