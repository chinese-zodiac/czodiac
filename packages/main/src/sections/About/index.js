import React from 'react';
import DigitalDance from "../../components/DigitalDance";
import { Box, Text, Link, Heading, Icon, Button, Image } from "@chakra-ui/react";
import { FiExternalLink } from "react-icons/fi";
import './index.scss';
import { Parallax } from 'react-scroll-parallax';

function About() {
    return(<>
      <Box
        as="section" id="about" className="section-about">
        <Heading className=""
          color="red.800" fontWeight="bold">
            Presenting Chinese Zodiacs
        </Heading>
        <Text color="gray.900" fontWeight="bold" fontSize="0.8em" mt="-5px">
          A NFT+ERC20 Community Project on BSC
        </Text>
        <Text  color="gray.900" fontWeight="bold" >
        Many people around the world believes in Chinese Zodiac for their fortune and luck, we have decided to make a project that will surely make your crypto portfolio lucky!
        </Text>
        <Text color="gray.900" fontWeight="bold" >
        Since we are in 2021, we will start with OX, and after each month instead of yearly swap we will do a token swap every 30days to the next Zodiac decreasing the supply 8:1 until we finish the 12 Chinese Zodiac Sign and will have a fixed supply of CZodiac Token.
        </Text>
        <Parallax x={["-8%","8%"]} className="header-thin">
          <Image src="./header_thin.png" borderBottom="solid 4px" borderColor="gray.900" />
        </Parallax>
        <Heading className=""
          color="red.900" fontWeight="bold">
        Fortune and Luck are your ingredients for wealth and prosperity in DefiSpace.
        Be one of us and join
        Czodiacs Community! 
        </Heading>
        <Button colorScheme="orange"><Link href="https://t.me/CZodiacofficial" isExternal>Join Telegram <Icon as={FiExternalLink} /></Link></Button>
        <div className="dividing-bar" />
      </Box>
    </>)
}

export default About
