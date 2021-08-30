import Header from "../../components/Header";
import BackgroundNetwork from "../../components/BackgroundNetwork";
import { Box, Link,
Tabs, TabList, TabPanels, Tab, TabPanel,  } from "@chakra-ui/react";
import CZFarmsList from "../../components/CZFarmsList";
import CZPoolsList from "../../components/CZPoolsList";


import "./index.scss";
const tokenLink = (address, name)=>{return (<Link style={{fontWeight:"bold",textDecoration:"underline"}} isExternal href={`https://bscscan.com/token/${address}`}>{name}</Link>)}
const czfarmLink = ()=>tokenLink("0x7c1608C004F20c3520f70b924E2BfeF092dA0043","$CZF");


function CZFarm() {  
  
  return (<>
    <BackgroundNetwork />
    <Header />
    <Box as="main" className="czfarm-page horizontal-center">
      <Tabs>
        <TabList variant="enclosed">
          <Tab>Farms</Tab>
          <Tab>Pools</Tab>
          <Tab>Trade</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <CZFarmsList />
          </TabPanel>
          <TabPanel>
            <CZPoolsList />
          </TabPanel>
          <TabPanel>
            <p>Earn {czfarmLink()} by trading tokens on Pancakeswap.</p>
            <p>(Coming soon)</p>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
</>);
}

export default CZFarm;
