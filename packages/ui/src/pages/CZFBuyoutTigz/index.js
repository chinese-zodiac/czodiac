import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BackgroundNetwork from "../../components/BackgroundNetwork";
import { Box, Link, Text,Button } from "@chakra-ui/react";
import { useEthers, useContractCalls, useContractCall, useContractFunction, useTokenBalance } from "@pdusedapp/core";
import czfBuyoutTigzAbi from "../../abi/CZFBuyoutTigz.json";
import { CZFBUYOUTTOKEN, CZODIAC_ADDRESSES, CHAINS } from "../../constants";
import { Contract, utils, BigNumber } from "ethers";
import "./index.scss";
import {weiToFixed, weiToShortString, toShortString} from "../../utils/bnDisplay";
import useCountdown from "../../hooks/useCountdown";

const {Interface, parseEther} = utils;

const tokenLink = (address, name)=>{return (<Link style={{fontWeight:"bold",textDecoration:"underline"}} isExternal href={`https://bscscan.com/token/${address}`}>{name}</Link>)}
const czfarmLink = ()=>tokenLink("0x7c1608C004F20c3520f70b924E2BfeF092dA0043","$CZF");


function CZFBuyoutTigz() {  
  const {chainId, account, library} = useEthers();
  const czfBuyoutTigzInterface = new Interface(czfBuyoutTigzAbi);
  const czfBuyoutTigzContract = new Contract(CZFBUYOUTTOKEN[CHAINS.BSC], czfBuyoutTigzInterface);
  const tigzBalance = useTokenBalance(CZODIAC_ADDRESSES.TigerZodiac[CHAINS.BSC], account);
  const [startEpoch] = useContractCall({
    abi:czfBuyoutTigzInterface,
    address:CZFBUYOUTTOKEN[CHAINS.BSC],
    method:'startEpoch',
    args:[]
  }) ?? [];
  const countdown = useCountdown(startEpoch,"TIGZ->CZF Swap Open (44 TIGZ for 1 CZF)")
  
  const { send: sendSwapAll } = useContractFunction(czfBuyoutTigzContract, 'swapAll');
  return (<>


    <BackgroundNetwork />
    <Header />
    <Box as="main" className="czvaults-page horizontal-center">
      {!!tigzBalance && tigzBalance.gt(BigNumber.from("0")) ? (<>
        <Text>You have {weiToShortString(tigzBalance,2)} TIGZ to swap to CZF.</Text>
        <Button m="10px" onClick={()=>{
        sendSwapAll();
      }}>Swap All TIGZ to CZF</Button>
      </>) : (<>
        <Text>You have no TIGZ to swap to CZF.</Text>
      </>)}
      {countdown}
      <Footer />
    </Box>
</>);
}

export default CZFBuyoutTigz;
