import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BackgroundNetwork from "../../components/BackgroundNetwork";
import { Box, Link } from "@chakra-ui/react";
import CZVaultList from "../../components/CZVaultList";

import "./index.scss";

const tokenLink = (address, name)=>{return (<Link style={{fontWeight:"bold",textDecoration:"underline"}} isExternal href={`https://bscscan.com/token/${address}`}>{name}</Link>)}
const czfarmLink = ()=>tokenLink("0x7c1608C004F20c3520f70b924E2BfeF092dA0043","$CZF");


function CZVaults() {  
  
  return (<>
    <BackgroundNetwork />
    <Header />
    <Box as="main" className="czvaults-page horizontal-center">
      <CZVaultList />
      <Footer />
    </Box>
</>);
}

export default CZVaults;
