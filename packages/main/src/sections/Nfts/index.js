import React from 'react';
import { Box, Text, Link, Heading, Icon, Button, Image } from "@chakra-ui/react";
import ZCoin from "../../components/ZCoin";
import './index.scss';

function Nfts() {
    return(<>
      <Box
        as="section" id="nfts" className="section-nfts">
        <Heading>NFTs are very hot right now in cryptospace! Let's add some spice by having NFTs for your Chinese Zodiac Sign!</Heading>
        <Text>
        Before swapping to the next Zodiac Sign, we will be minting 16 Limited edition NFTs for the current Zodiac Sign that will be funded using the development fund from taxes.
        </Text>
        <br/>
        <Heading>The Chinese Zodiacs</Heading>
        <ZCoin imgSrc="./oxczodiac.png" name="OxZodiac" />
        <ZCoin />
        <ZCoin />
        <ZCoin />
        <ZCoin />
        <ZCoin />
        <ZCoin />
        <ZCoin />
        <ZCoin />
        <ZCoin />
        <ZCoin />
        <ZCoin />
        <div className="dividing-bar" />
      </Box>
    </>)
}

export default Nfts
