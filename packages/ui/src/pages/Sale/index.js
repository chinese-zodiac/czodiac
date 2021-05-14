import React, {useEffect, useState} from "react";
import { useEthers } from "@pdusedapp/core";
import { CHAIN_LABELS, BLOCK_EXPLORERS, CHAINS } from "../../constants";
import { useColorModeValue, Box, Heading, Icon, Text, Link, Button, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper } from "@chakra-ui/react";
import Header from "../../components/Header";
import useLockedSale from "../../hooks/useLockedSale";
import useCountdown from "../../hooks/useCountdown";
import { FiExternalLink, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { SimpleGrid } from "@chakra-ui/react";
import Particles from "react-tsparticles";
import particleConfig from "./particleConfig";
import {weiToFixed, weiToShortString, toShortString} from "../../utils/bnDisplay";
import "./index.scss";
import {utils, BigNumber} from "ethers";
const { parseEther } = utils;

function Sale() {
  const format = (val) => `${val} BNB`;
  const parse = (val) => val.replace(/^\$/, "");
  const [value, setValue] = useState("1.5");
  const vignetteColor = useColorModeValue(
    "radial-gradient(circle, var(--chakra-colors-gray-100) 50%, transparent 100%)", 
    "radial-gradient(circle, var(--chakra-colors-gray-900) 50%, transparent 100%)"
  );
  const {account, chainId} = useEthers();
  const {
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
    minPurchase,
    depositEther
  } = useLockedSale();

  const [unlockTimestamp, setUnlockTimestamp] = useState(null);
  useEffect(()=>{
    setUnlockTimestamp(Number(endTimestamp) + (7*24*60*60));
  },[endTimestamp])
  const startTimer = useCountdown(startTimestamp,"Complete");
  const endTimer = useCountdown(endTimestamp,"Complete");
  const unlockTimer = useCountdown(unlockTimestamp,"Complete");

  function timeDisplay(timestamp,timer) {
    return !!timestamp ? (<>
      {(new Date(Number(timestamp)*1000)).toLocaleString()}
      <br/>
      ({timer})
    </>) : (
      "TBD"
    )
  }

  return (<>
    <Particles id="tsparticles" options={particleConfig} />
    <Box id="tsparticles-cover" bg={vignetteColor} />
    <Header />
    <Box as="main" className="horizontal-center sale-page">
      <Heading mt="100px">Initial Liquidity Sale</Heading>
      <Text className="explanation">
      The Sale runs from the start countdown to the end countdown.
      There is a limit of {weiToFixed(maxPurchase, 2)} BNB per buyer and a minimum of 0.10 BNB.
      The Sale can only reach a maximum of 100 BNB.
      Tokens are locked for 1 week and auto distributed.
      0% of tokens to team. Fair Launch!
      100% of BNB will be locked as liquidity.
      Whitelisting and more information on <Link isExternal color="orange.700" href="https://t.me/CZodiacofficial">Telegram <Icon as={FiExternalLink} /></Link>.<br/>
      <b> USA citizens, residents, agents etc are excluded.</b>
      </Text>

      {(chainId === CHAINS.BSC || (chainId === CHAINS.BSCTestnet && !!account)) ? (<>
      <NumberInput 
        onChange={(valueString) => setValue(parse(valueString))}
        value={format(value)}
        className="bnbInput" defaultValue={1} precision={1} step={0.1} min={0.1} max={!!maxPurchase && weiToFixed(maxPurchase.sub(spendings ?? parseEther("0")),2)}>
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
      <Button className="purchaseButton" onClick={()=>{
        if(!whitelistStatus) {
          alert("Not whitelisted, request on telegram");
          return;
        }
        if(parseEther(value.toString()).add(spendings).gt(saleCap)){
          alert("Amount over user cap");
          return;
        }
        if(parseEther(value.toString()).add(totalSpendings).gt(saleCap)){
          alert("Amount over user cap");
          return;
        }
        depositEther(value)
      }}>Purchase</Button>
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
        <Text>{weiToFixed(spendings,2)} BNB</Text>
        <Text>Cap:</Text>
        <Text>{weiToFixed(maxPurchase, 2)} BNB</Text>
        <Text>Remaining:</Text>
        <Text>{!!maxPurchase && weiToFixed(maxPurchase.sub(spendings ?? parseEther("0")),2)} BNB</Text>
        <Text>Receipts:</Text>
        <Text>{weiToShortString(receipts,2)} OxZodiac</Text>
      </SimpleGrid>
      <hr />
      <Heading as="h2" size="md">Sale Stats</Heading>
      <SimpleGrid className="stats" columns={2} spacing={1}>
        <Text>Network:</Text>
        <Text>{CHAIN_LABELS[chainId]}</Text>
        <Text>Total Buyers:</Text>
        <Text>{!!totalBuyers ? Number(totalBuyers) : 0}</Text>
        <Text>Total Spendings:</Text>
        <Text>{weiToFixed(totalSpendings,2)} BNB</Text>
        <Text>Rate:</Text>
        <Text>{toShortString(rate,2)} OxZodiac/BNB</Text>
        <Text>Opening Date:</Text>
        <Text>{timeDisplay(startTimestamp,startTimer)}</Text>
        <Text>Closing Date:</Text>
        <Text>{timeDisplay(endTimestamp,endTimer)}</Text>
        <Text>Unlock Date:</Text>
        <Text >{timeDisplay(unlockTimestamp,unlockTimer)}</Text>
        <Text>Sale Size:</Text>
        <Text>{weiToShortString(saleSize,2)} OxZodiac</Text>
        <Text>Sale Cap:</Text>
        <Text>{weiToFixed(saleCap,2)} BNB</Text>
        <Text>Token Address:</Text>
        <Link isExternal color="orange.700"  fontFamily="monospace"
          href={`${BLOCK_EXPLORERS[chainId]}/token/${tokenAddress}`}>{tokenAddress}
        </Link>
        <Text>Sale Address:</Text>
        <Link isExternal color="orange.700"  fontFamily="monospace"
          href={`${BLOCK_EXPLORERS[chainId]}/token/${saleAddress}`}>{saleAddress}
        </Link>
        <Text>Swap Link:</Text>
        <Link isExternal color="orange.700" 
          href={`https://pancakeswap.info/token/${tokenAddress}`}>pancakeswap.info
        </Link>
      </SimpleGrid>
      <hr /></>) : (<>
        <hr />
        <Text>You are not connected to BSC or BSCTestnet. Please use the buttons in the top right corner of the page to connect and/or switch networks.</Text>
        <hr />
      </>)}
    </Box>
  </>);
}

export default Sale;
