import React from "react";
import { useEthers } from "@usedapp/core";
import { useColorMode, Button, Heading, Text, Box, Icon } from "@chakra-ui/react";
import { FiSun, FiMoon, FiCornerDownRight } from "react-icons/fi";
import { CHAIN_LABELS, CHAINS } from "../../constants";
import { NavLink } from "react-router-dom";
import { addChainToMetaMask } from "../../utils/metamask";
import "./index.scss";

function Header() {
    const { activateBrowserWallet, account, chainId } = useEthers();
    const { colorMode, toggleColorMode } = useColorMode();

    return(
        <header className="header">
            <Heading className="title"><NavLink to="/">CZodiac</NavLink></Heading>
            <div className="controls">
                <Box className="wallet" >
                    {account ? (<>
                        <div className="info">
                            <Text className="account" >{`${account}`}</Text>
                            {chainId && (
                                <Text className="network" >{CHAIN_LABELS[chainId]}</Text>
                            )}
                        </div>
                    </>) : (<>                
                        <Button className="connect" onClick={() => activateBrowserWallet()}>
                        Connect
                        </Button>
                    </>)}
                </Box>
                <Button className={"color-mode"} onClick={toggleColorMode}>
                    {colorMode === "light" ? (<Icon as={FiMoon} />) : (<Icon as={FiSun} />)}
                </Button>
                {(!!chainId && (chainId != CHAINS.BSC || !account)) && (
                    <Button className="network-picker" onClick={()=>addChainToMetaMask(CHAINS.BSC)}>
                        <Icon as={FiCornerDownRight} />BSC
                    </Button>
                )}
                {(!!chainId && chainId == CHAINS.BSC && !!account) && (
                    <Button className="network-picker" onClick={()=>addChainToMetaMask(CHAINS.BSCTestnet)}>
                        <Icon as={FiCornerDownRight} />BSCT
                    </Button>
                )}
            </div>
        </header>
    )
}

export default Header;