import React from 'react';
import { Box, Text, Link, Heading, Icon, Button, Image } from "@chakra-ui/react";
import { FiExternalLink } from "react-icons/fi";
import './index.scss';

function Footer() {
    return(<>
      <Box
        as="section" id="footer" className="section-footer">
        <Link href="https://twitter.com/c_zodiacs?s=09" isExternal>Twitter <Icon as={FiExternalLink} /></Link><br/>
        <Link href="https://t.me/CZodiacofficial" isExternal>Telegram <Icon as={FiExternalLink} /></Link><br/>
        <Link href="https://app.czodiac.com" isExternal>Dapp <Icon as={FiExternalLink} /></Link><br/>
        <Link href="https://github.com/chinese-zodiac/" isExternal>Github <Icon as={FiExternalLink} /></Link>
        <br/><br/>
        <Text >May you have good fortune & a lucky portfolio!</Text>
        <Image className="bottom-image" src="./tea-table.png" />
      </Box>
    </>)
}

export default Footer
