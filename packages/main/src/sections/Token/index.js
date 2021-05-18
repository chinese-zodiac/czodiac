import React from 'react';
import DigitalDance from "../../components/DigitalDance";
import { Box, Text, Link, Heading, Icon, Button, Image } from "@chakra-ui/react";
import { FiExternalLink } from "react-icons/fi";
import './index.scss';
import { Parallax } from 'react-scroll-parallax';

function Token() {
    return(<>
      <Box
        as="section" id="token" className="section-token">
        
        <Heading>CZodiac Yield</Heading>
        <Heading>Rewards generated from each buy, sell, transfer!</Heading>
        <ul>
            <li>2.5% tax on each transaction.</li>
            <li>1.5% Reward to Liquidity Farmers via Autofarming Feature.</li>
            <li>0.5% Split to all holder balances!</li>
            <li>0.3% For future development, airdrops, rewards!</li>
            <li>0.2% Burn and decrease supply eternally.</li>
        </ul>
        <br/>
        <Heading>Tokenomics</Heading>
        <Text>8T supply, 4T Burn/CZ, 2T Sale, 2T Liquidity</Text>
        <Heading fontWeight="bold">100% to COMMUNITY for FAIR LAUNCH!</Heading>
        <Parallax x={["10%","0%"]} >
            <Image src="./tokenomics.png" maxWidth="960px" ml="auto" mr="auto" width="95%" />
        </Parallax>
        <div className="dividing-bar" />
      </Box>
    </>)
}

export default Token
