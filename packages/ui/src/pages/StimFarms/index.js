import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BackgroundNetwork from "../../components/BackgroundNetwork";
import { Box, Link,
Tabs, TabList, TabPanels, Tab, TabPanel,  } from "@chakra-ui/react";
import useStimFarms from "../../hooks/useStimFarms";
import StimFarm from "../../components/StimFarm";

import "./index.scss";
const tokenLink = (address, name)=>{return (<Link style={{fontWeight:"bold",textDecoration:"underline"}} isExternal href={`https://bscscan.com/token/${address}`}>{name}</Link>)}
const czfarmLink = ()=>tokenLink("0x7c1608C004F20c3520f70b924E2BfeF092dA0043","$CZF");


function StimFarms() {  
  const {stimFarms} = useStimFarms();
  const displayStimFarms = (filter,stimFarms) => {
    return (!!stimFarms && stimFarms.length > 0) && (<>
      {stimFarms.map((s, index)=>{
        if(!filter(s)) return;
        return(<Box key={"pid-"+s.name} border="solid 1px" borderRadius="5px" m="0px" mb="20px" p="20px" fontSize={{base:"x-small",md:"md"}}>
           <StimFarm 
              name={s.name}
              getLink={s.getLink}
              openDate={s.openDate}
              closeDate={s.closeDate}
              vestDate={s.vestDate}
              isOpen={s.isOpen}
              isVested={s.isVested}
              isLaunching={s.isLaunching}
              isClosed={s.isClosed}
              aprBasis={s.aprBasis}
              tvl={s.tvl}
              sendDeposit={s.sendDeposit}
              sendClaim={s.sendClaim}
              sendApprove={s.sendApprove}
              user={s.userInfo}
            />
        </Box>
      )})}</>)
  }
  return (<>
    <BackgroundNetwork />
    <Header />
    <Box as="main" className="stimfarms-page horizontal-center">
      Stim Farms are v2 farms inspired by Olympus Dao. Deliver LP to the v2 Farms to receive a fixed amount of CZF after 1 week. This CZF is set such that if the price does not change, you will get CZF equal to the value of your LP plus interest at a high APR. The LP you deliver is retained by the protocol.
      <br/><br/>
      <Tabs>
        <TabList variant="enclosed">
          <Tab>Launching</Tab>
          <Tab>Open</Tab>
          <Tab>Closed</Tab>
          <Tab>Vested</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            Launching Stim Farms will become available for deposit at the stated time.<br/><br/>
            {displayStimFarms(
              stimFarm=>(stimFarm.isLaunching),
              stimFarms
            )}
          </TabPanel>
          <TabPanel>
            Open Stim Farms are available to deposit. Deposits close afte 24 hours.<br/><br/>
            {displayStimFarms(
              stimFarm=>(stimFarm.isOpen),
              stimFarms
            )}
          </TabPanel>
          <TabPanel>
            After 1 week, depositors can claim their CZF rewards from Stim Farms in vesting.<br/><br/>
            {displayStimFarms(
              stimFarm=>(stimFarm.isClosed),
              stimFarms
            )}
          </TabPanel>
          <TabPanel>
            Depositors may claim their CZF rewards here. Claim only needs to be done once.<br/><br/>
            {displayStimFarms(
              stimFarm=>(stimFarm.isVested),
              stimFarms
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
      <Footer />
    </Box>
</>);
}

export default StimFarms;
