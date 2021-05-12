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
          <NavLink to="sale">
            <Button colorScheme="red" >Liquidity Sale</Button>
          </NavLink>
          <Button isDisabled={true} colorScheme="red" >Swap (coming soon)</Button>
          <Link href="https://czodiac.com" isExternal>
            <Button colorScheme="orange" variant="outline" >Information <Icon as={FiExternalLink} /></Button>
          </Link >
          <br/><br/>
      </Box>
    </LightMode>
</>);
}

export default Home;
