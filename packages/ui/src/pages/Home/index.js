import Header from "../../components/Header";
import BackgroundLines from "../../components/BackgroundLines";
import { Box, Button, LightMode, Icon, Link } from "@chakra-ui/react";
import { NavLink } from "react-router-dom";
import { FiExternalLink } from "react-icons/fi";

import "./index.scss";

function Home() {
  return (<>
    <BackgroundLines />
      <Header />
    <LightMode>
      <Box as="main" className="both-center home-page">
          <NavLink to="tigerhunt">
            <Button colorScheme="red" >Play Tiger Hunt</Button>
          </NavLink>
          <NavLink to="swap">
            <Button colorScheme="orange" >OxZ{"->"}TigZ (complete)</Button>
          </NavLink>
          <NavLink to="sale">
            <Button colorScheme="orange" >Sale (complete)</Button>
          </NavLink>
          <Link href="https://czodiac.com" isExternal>
            <Button colorScheme="orange" variant="outline" >Information <Icon as={FiExternalLink} /></Button>
          </Link >
          <br/><br/>
      </Box>
    </LightMode>
</>);
}

export default Home;
