
import { Box, Button, LightMode, Icon, Link, Divider, Text, SimpleGrid, Flex, Spacer } from "@chakra-ui/react";
import { CZODIAC_ADDRESSES, CZFARM_ADDRESSES, TIGERHP_ADDRESSES } from "../../constants";
import { FiExternalLink, FiGithub } from "react-icons/fi";
import { FaDiscord, FaTelegram, FaTwitter, FaMedium } from "react-icons/fa"
import "./index.scss";

const tokenLink = (address, name)=>{return (<Link m="5px" style={{fontWeight:"bold",textDecoration:"underline"}} isExternal href={`https://bscscan.com/token/${address}`}>{name}</Link>)}
const czfarmLink = ()=>tokenLink("0x7c1608C004F20c3520f70b924E2BfeF092dA0043","$CZF");
const tigzLink = ()=>tokenLink("0x535874bfbecac5f235717faea7c26d01c67b38c5","$TIGZ");
//const oxzLink = ()=>tokenLink("0x58A39ceEcC7B5b1497c39fa8e12Dd781C4fAfaFc","$OXZ");
const tigzhpLink = ()=>tokenLink("0xDd2F98a97fc2A59b1f0f03DE63B4b41041a339B0","$TIGZHP");
const czusdLink = ()=>tokenLink("0xE68b79e51bf826534Ff37AA9CeE71a3842ee9c70","$CZUSD");

function Footer() {  
    return (<>
      <Divider paddingTop="20vh" />
      <Flex as="footer" justify="center" position="relative">
        <Box p="10px" >
          <Text>Token Contracts</Text>
          {czfarmLink()} {czusdLink()}
        </Box>
        <Box p="10px" borderLeft="1px" borderRight="1px" borderColor="gray.500">
          <Text>Social Links</Text>
          <Link m="5px" href="https://twitter.com/zodiacs_c" isExternal><Icon as={FaTwitter} /></Link>
          <Link m="5px" href="https://t.me/CZodiacofficial" isExternal><Icon as={FaTelegram} /></Link>
          <Link m="5px" href="https://discord.gg/FEpu3xF2Hb" isExternal><Icon as={FaDiscord} /></Link>
          <Link m="5px" href="https://czodiacs.medium.com/"><Icon as={FaMedium} /></Link>
          <Link m="5px" href="https://github.com/chinese-zodiac/czodiac"><Icon as={FiGithub} /></Link>
          <br/><br/>
          <Link m="5px" rel="me" href="https://mastodon.social/@plasticdigits" isExternal>Plastic's Mastodon</Link>
        </Box>
        <Box p="10px" >
          <Text>Partnerships</Text>
          <Link fontWeight="bold" textDecoration="underline" href="https://docs.google.com/forms/d/e/1FAIpQLSc7CgsErMRKUqXWeTTui9NdgdhcbFCXk3g0bi_AHsuTiKvblg/viewform?usp=fb_send_twt" >Farm/pool application</Link>
        </Box>
      </Flex>
    </>)
}

export default Footer