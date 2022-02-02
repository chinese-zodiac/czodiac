import React, { useState, useEffect } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BackgroundNetwork from "../../components/BackgroundNetwork";
import { Box, Link, Button, Heading, Image, Divider, Text } from "@chakra-ui/react";

import "./index.scss";

const tokenLink = (address, name)=>{return (<Link style={{fontWeight:"bold",textDecoration:"underline"}} isExternal href={`https://bscscan.com/token/${address}`}>{name}</Link>)}
const czfarmLink = ()=>tokenLink("0x7c1608C004F20c3520f70b924E2BfeF092dA0043","$CZF");


function IBFRGames() {
  
  return (<>
    <BackgroundNetwork />
    <Header />
    <Box as="main" className="chronopools-page horizontal-center">
      <Heading>iBFR Games</Heading><br/>
      
      <Divider />

      Play games from our buffer.finance partner!<br/><br/>
      <br/><br/>
      <iframe className="ibfr-iframe" src="https://app.buffer.finance/prediction-game-widget?ref=0x70e1cB759996a1527eD1801B169621C18a9f38F9" height="700px" ></iframe>
      <iframe className="ibfr-iframe" src="https://app.buffer.finance/options-widget?ref=0x70e1cB759996a1527eD1801B169621C18a9f38F9" height="700px" ></iframe>
      <Footer />
    </Box>
</>);
}

export default IBFRGames;
