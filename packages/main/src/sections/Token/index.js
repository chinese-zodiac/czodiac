import React from 'react';
import DigitalDance from "../../components/DigitalDance";
import { Box, Text, Link, Heading, Icon, Button, Image } from "@chakra-ui/react";
import { FiExternalLink } from "react-icons/fi";
import './index.scss';
import { Parallax } from 'react-parallax';

function Token() {
    return(<>
      <Box
        as="section" id="token" className="section-token">
        
          <Parallax className="yieldfield-parallax" strength={300}  renderLayer={percentage => (
            <Box className="yieldfield" borderBottom="solid 8px" borderColor="gray.900"
            style={{
              backgroundPositionX:`-${10-percentage*10}vw`,
              minWidth: "110vw",
              paddingRight: "10vw"
            }}>
              <Box style={{
                position:'relative',
                top:`${(percentage < 0.4 ? (0.4-percentage) : 0)*800}px`
              }}>
                <Heading>CZodiac Yield</Heading>
                <Heading>Rewards generated from each buy, sell, transfer!</Heading>
                <ul>
                    <li>2.5% tax on each transaction.</li>
                    <li>1.5% Reward to Liquidity Farmers via Autofarming Feature.</li>
                    <li>0.5% Split to all holder balances!</li>
                    <li>0.3% For future development, airdrops, rewards!</li>
                    <li>0.2% Burn and decrease supply eternally.</li>
                </ul>
              </Box>
            </Box>
          )}>
          </Parallax>
        <Heading>Tokenomics</Heading>
        <Text>8T supply, 4T Burn/CZ, 2T Sale, 2T Liquidity</Text>
        <Heading fontWeight="bold">100% to COMMUNITY for FAIR LAUNCH!</Heading>
        <Parallax
            renderLayer={percentage => (
              <Image src="./tokenomics.png" maxWidth="960px" ml="auto" mr="auto"
                  style={{
                    filter: `blur(${(percentage < 0.8 ? (0.8-percentage) : 0)*5}px) grayscale(${(percentage < 0.8 ? (0.8-percentage) : 0)*100}%)`
                  }}
              />
          )}
        />
        <div className="dividing-bar" />
      </Box>
    </>)
}

export default Token
