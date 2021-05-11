import React from "react";
import { useEthers } from "@usedapp/core";
import { useColorMode, Button } from "@chakra-ui/react";
import { CHAIN_LABELS, CHAINS } from "../../constants";
import { NavLink } from "react-router-dom";
import { addChainToMetaMask } from "../../utils/metamask";

function Header() {
    const { activateBrowserWallet, account, chainId } = useEthers();
    const { colorMode, toggleColorMode } = useColorMode();

    return(
        <header>
            <NavLink to="/">CZodiac</NavLink>
            {account ? (
                <div className="info">
                {chainId && (
                    <span className="network">{CHAIN_LABELS[chainId]}</span>
                )}
                <span className="account">{`${account}`}</span>
                </div>
            ) : (
                <>
                    <Button onClick={() => activateBrowserWallet()}>
                    Connect Wallet
                    </Button>
                </>
            )}
            <Button onClick={toggleColorMode}>
                Toggle {colorMode === "light" ? "Dark" : "Light"}
            </Button>
            {(!!chainId && chainId != CHAINS.BSC) && (
                <Button onClick={()=>addChainToMetaMask(CHAINS.BSC)}>
                    Switch to BSC
                </Button>
            )}
            {(!!chainId && chainId != CHAINS.BSCTestnet) && (
                <Button onClick={()=>addChainToMetaMask(CHAINS.BSCTestnet)}>
                    Switch to BSC Testnet
                </Button>
            )}
        </header>
    )
}

export default Header;