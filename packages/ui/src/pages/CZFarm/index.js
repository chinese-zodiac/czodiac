import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BackgroundNetwork from "../../components/BackgroundNetwork";
import { Box, Link,
Tabs, TabList, TabPanels, Tab, TabPanel,  } from "@chakra-ui/react";
import CZFarmsList from "../../components/CZFarmsList";
import CZFarmsRoutableList from "../../components/CZFarmsRoutableList";
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
          <Tab>Farms.v1</Tab>
          <Tab>Farms.v2</Tab>
          <Tab>Pools</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <CZFarmsList />
          </TabPanel>
          <TabPanel>
            <CZFarmsRoutableList />
          </TabPanel>
          <TabPanel>
            <CZPoolsList />
          </TabPanel>
        </TabPanels>
      </Tabs>
      <Footer />
    </Box>
</>);
}

export default CZFarm;
