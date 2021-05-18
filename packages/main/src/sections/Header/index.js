import React from 'react';
import DigitalDance from "../../components/DigitalDance";
import { Box, Text, Link, Heading, Icon } from "@chakra-ui/react";
import { FiExternalLink } from "react-icons/fi";
import './index.scss';

function Header() {
    return(<>
      <header id="home" className="section-header">
        <DigitalDance />
        <Heading>Chinese Zodiac</Heading>
        <Text maxW="350px" fontSize="0.6em">
        Fortune and Luck are your ingredients for wealth and prosperity in DefiSpace.
        Be one of us and join the Czodiacs Community!
        </Text>
        <Box className="links" padding="20px" mt="20px" fontSize="0.6em" 
        border="solid 4px" 
        borderColor="gray.800" 
        backgroundColor="rgba(27,27,24,0.5)" 
        maxW="350px">
          <Link href="#home">Home</Link>
          <Link href="#about">About</Link>
          <Link href="#token">Token</Link>
          <Link href="#nfts">NFTs</Link>
          <hr/>
          <Link href="https://twitter.com/c_zodiacs?s=09" isExternal>Twitter <Icon as={FiExternalLink} /></Link>
          <Link href="https://t.me/CZodiacofficial" isExternal>Telegram <Icon as={FiExternalLink} /></Link>
          <Link href="https://app.czodiac.com" isExternal>Dapp <Icon as={FiExternalLink} /></Link>
        </Box>
        <div className="dividing-bar" />
      </header>
    </>)
}

export default Header
