import React, { useState } from "react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import BackgroundNetwork from "../../components/BackgroundNetwork";
import { Box, Link, Text, Heading, Button, Slider, SliderTrack, SliderFilledTrack, SliderThumb } from "@chakra-ui/react";
import { CZUSDBORROWCZF, CZFARM_ADDRESSES, CZUSD, CHAINS, ORACLES, UPDATEORACLES } from "../../constants";
import czusdBorrowCzfContractAbi from "../../abi/czusdBorrowCzfContract.json";
import ierc20 from "../../abi/ierc20.json";
import pairOracleAbi from "../../abi/pairOracle.json";
import updateOraclesAbi from "../../abi/updateOracles.json";
import { useEthers, useContractCalls, useContractCall, useContractFunction, useTokenBalance } from "@pdusedapp/core";
import { Contract, utils, BigNumber } from "ethers";
import {weiToFixed, weiToShortString, toShortString} from "../../utils/bnDisplay";
import "./index.scss";
const {Interface, parseEther} = utils;

const ZADDR = "0x0000000000000000000000000000000000000000"

const tokenLink = (address, name)=>{return (<Link style={{fontWeight:"bold",textDecoration:"underline"}} isExternal href={`https://bscscan.com/token/${address}`}>{name}</Link>)}
const czfarmLink = ()=>tokenLink("0x7c1608C004F20c3520f70b924E2BfeF092dA0043","$CZF");
const czusdLink = ()=>tokenLink("0xE68b79e51bf826534Ff37AA9CeE71a3842ee9c70","$CZUSD");

const SliderStaker = ({basis,setBasis,balance,sendAction,account,name,token}) => {
    return (<>
        <Slider
        aria-label="deposit-percentage"
        max={10000}
        defaultValue={10000}
        onChange={(value) => {
            setBasis(value)
        }}
      >
        <SliderTrack>
          <SliderFilledTrack bg="orange.800" />
        </SliderTrack>
        <SliderThumb />
      </Slider>

      <Button onClick={()=>{
        let bp = BigNumber.from(10000);
        if(!!basis) bp = BigNumber.from(basis);
        sendAction(account,balance.mul(bp).div(BigNumber.from(10000)));
      }}>
        {name} {!!basis ? (basis/100).toFixed(2) : (100).toFixed(2)}% ({!!balance ? weiToShortString(balance.mul(BigNumber.from(basis)).div(BigNumber.from(10000)),2) : weiToShortString(balance,2)} {token})
      </Button>  
    </>)
}

function CZUsd() {
    const { account, chainId } = useEthers();
    const erc20Interface = new Interface(ierc20);
    const czusdBorrowCzfInterface = new Interface(czusdBorrowCzfContractAbi);
    const pairOracleInterface = new Interface(pairOracleAbi);
    const updateOraclesInterface = new Interface(updateOraclesAbi);
    const updateOraclesContract = new Contract(UPDATEORACLES[CHAINS.BSC], updateOraclesInterface);
    const czusdBorrowCzfContract = new Contract(CZUSDBORROWCZF[CHAINS.BSC], czusdBorrowCzfInterface);
    const czfBalance = useTokenBalance(CZFARM_ADDRESSES[CHAINS.BSC], account);
    const czusdBalance = useTokenBalance(CZUSD[CHAINS.BSC], account);
    const [czfDeposited] = useContractCall({
        abi:czusdBorrowCzfInterface,
        address:CZUSDBORROWCZF[CHAINS.BSC],
        method:'deposited',
        args:[account ?? ZADDR]
    }) ?? [];
    const [czusdBorrowed] = useContractCall({
        abi:czusdBorrowCzfInterface,
        address:CZUSDBORROWCZF[CHAINS.BSC],
        method:'borrowed',
        args:[account ?? ZADDR]
    }) ?? [];
    const [maxBorrow] = useContractCall({
        abi:czusdBorrowCzfInterface,
        address:CZUSDBORROWCZF[CHAINS.BSC],
        method:'maxBorrow',
        args:[account ?? ZADDR]
    }) ?? [];
    const [maxCZUsd] = useContractCall({
        abi:czusdBorrowCzfInterface,
        address:CZUSDBORROWCZF[CHAINS.BSC],
        method:'maxCZUsd',
        args:[]
    }) ?? [];
    const [maxBorrowBasis] = useContractCall({
        abi:czusdBorrowCzfInterface,
        address:CZUSDBORROWCZF[CHAINS.BSC],
        method:'maxBorrowBasis',
        args:[]
    }) ?? [];
    const [czusdTotalSupply] = useContractCall({
        abi:erc20Interface,
        address:CZUSD[CHAINS.BSC],
        method:'totalSupply',
        args:[]
    }) ?? [];
    const [czfBusdPricePair] = useContractCall({
        abi:pairOracleInterface,
        address:ORACLES.CZFBUSD[CHAINS.BSC],
        method:'consultPair',
        args:[CZFARM_ADDRESSES[CHAINS.BSC],parseEther("1")]
    }) ?? [];
    const [czfCzusdPricePair] = useContractCall({
        abi:pairOracleInterface,
        address:ORACLES.CZFCZUSD[CHAINS.BSC],
        method:'consultPair',
        args:[CZFARM_ADDRESSES[CHAINS.BSC],parseEther("1")]
    }) ?? [];
    const [czfBusdPriceTwap] = useContractCall({
        abi:pairOracleInterface,
        address:ORACLES.CZFBUSD[CHAINS.BSC],
        method:'consultTwap',
        args:[CZFARM_ADDRESSES[CHAINS.BSC],parseEther("1")]
    }) ?? [];
    const [czfCzusdPriceTwap] = useContractCall({
        abi:pairOracleInterface,
        address:ORACLES.CZFCZUSD[CHAINS.BSC],
        method:'consultTwap',
        args:[CZFARM_ADDRESSES[CHAINS.BSC],parseEther("1")]
    }) ?? [];
    const [czfTotalLocked] = useContractCall({
        abi:erc20Interface,
        address:CZFARM_ADDRESSES[CHAINS.BSC],
        method:'balanceOf',
        args:[CZUSDBORROWCZF[CHAINS.BSC]]
    }) ?? [];

    const { send: sendUpdateOracles } = useContractFunction(updateOraclesContract, 'updateAll');
    const { send: sendDeposit } = useContractFunction(czusdBorrowCzfContract, 'deposit');
    const { send: sendBorrow } = useContractFunction(czusdBorrowCzfContract, 'borrow');
    const { send: sendRepay } = useContractFunction(czusdBorrowCzfContract, 'repay');
    const { send: sendWithdraw } = useContractFunction(czusdBorrowCzfContract, 'withdraw');

    const [basisPointsDeposit, setBasisPointsDeposit] = useState(10000);
    const [basisPointsBorrow, setBasisPointsBorrow] = useState(10000);
    const [basisPointsRepay, setBasisPointsRepay] = useState(10000);
    const [basisPointsWithdraw, setBasisPointsWithdraw] = useState(10000);
  
return (<>
    <BackgroundNetwork />
    <Header />
    <Box as="main" className="czusd-page horizontal-center">
        <Heading>CZUSD Borrowing</Heading>
        <Text>
        Borrow {czusdLink()} against {czfarmLink()}. First deposit {czfarmLink()}. Then borrow up to your limit. No interest, liquidations, or fees.
        </Text>
    <Box border="solid 1px" borderRadius="5px" p="10px" m="10px">
      <b>NOTICE</b><br/>
      - {czusdLink()} is in BETA. You may need to refresh the page to update UI.
      <br/>
      - Algorithmic peg may be activated at any time. It is recommended to expect the price of {czusdLink()} to return to 1.0000 once the peg is active.
      <br/>
      - {czusdLink()} minting is currently highly restricted. The cap will be raised once the price stabilizes.
    </Box>
        <br/>
        {(!!maxBorrow && !!czfBalance && !!czfBusdPriceTwap && !!czusdBorrowed) ? (<>
        <SliderStaker name="Deposit" token="CZF" basis={basisPointsDeposit} setBasis={setBasisPointsDeposit} balance={czfBalance} sendAction={sendDeposit} account={account} />
        <br/><br/>
        <SliderStaker name="Borrow" token="CZUSD" basis={basisPointsBorrow} setBasis={setBasisPointsBorrow} balance={maxBorrow.sub(czusdBorrowed)} sendAction={sendBorrow} account={account} />
        <br/><br/>
        <SliderStaker name="Repay" token="CZUSD" basis={basisPointsRepay} setBasis={setBasisPointsRepay} balance={czusdBorrowed} sendAction={sendRepay} account={account} />
        <br/><br/>
        <SliderStaker name="Withdraw" token="CZF" basis={basisPointsWithdraw} setBasis={setBasisPointsWithdraw} balance={czfDeposited.sub(czusdBorrowed.mul(BigNumber.from(parseEther("1"))).mul(BigNumber.from(10000)).div(BigNumber.from(maxBorrowBasis)).div(czfBusdPriceTwap))} sendAction={sendWithdraw} account={account} />
        </>): <Text>Loading... check wallet is connected and on BSC</Text>}
        <br/><br/>
        <Text><b>Your Vault info</b></Text>
        <Text>{czfarmLink()} Deposited: {weiToShortString(czfDeposited,2)}</Text>
        <Text>{czfarmLink()} Value: ${(!!czfDeposited && !!czfBusdPricePair) ? weiToShortString(czfDeposited.mul(czfBusdPricePair).div(parseEther("1")),2) : "0.00"}</Text>
        <Text>{czusdLink()} Borrowed: {weiToShortString(czusdBorrowed,2)}</Text>
        <Text>{czusdLink()} Max Borrow: {weiToShortString(maxBorrow,2)}</Text>
        <br/>
        <Text><b>Your Wallet info</b></Text>
        <Text>{czfarmLink()}: {weiToShortString(czfBalance,2)}</Text>
        <Text>{czusdLink()}: {weiToShortString(czusdBalance,2)}</Text>
        <br/>
        <Text><b>Global CZUSD stats</b></Text>
        <Text>{czfarmLink()} Locked: {weiToShortString(czfTotalLocked,2)}</Text>
        <Text>TVL: ${(!!czfTotalLocked && !!czfBusdPricePair) ? weiToShortString(czfTotalLocked.mul(czfBusdPricePair).div(parseEther("1")),2) : "0.00"}</Text>
        <Text>{czusdLink()} max supply: {weiToShortString(maxCZUsd,2)}</Text>
        <Text>{czusdLink()} current supply: {weiToShortString(czusdTotalSupply,2)}</Text>
        <Text>Max Borrow Ratio: {maxBorrowBasis && (maxBorrowBasis.toNumber()/100).toFixed(2) + "%"}</Text>
        <Text>{czfarmLink()} TWAP: {weiToFixed(czfBusdPriceTwap,8)}</Text>
        <Text>{czusdLink()} Pair Price: {
            (!!czfBusdPricePair && !!czfCzusdPricePair && czfCzusdPricePair.gt(BigNumber.from("0")))
             ? weiToFixed(czfBusdPricePair.mul(parseEther("1")).div(czfCzusdPricePair),4) : 0}</Text>
        <Text>{czusdLink()} 1 hour Price: {
            (!!czfBusdPriceTwap && !!czfCzusdPriceTwap && czfCzusdPriceTwap.gt(BigNumber.from("0")))
             ? weiToFixed(czfBusdPriceTwap.mul(parseEther("1")).div(czfCzusdPriceTwap),4) : 0}</Text>
        <Button onClick={()=>{sendUpdateOracles()}} >Update Oracles (GLOBAL, experts only)</Button>
        <Footer />
    </Box>
</>);
}

export default CZUsd;
