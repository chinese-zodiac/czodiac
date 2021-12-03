import React, {useEffect} from "react";
import { useEthers } from "@pdusedapp/core";
import {
  useColorMode,
  Button,
  Heading,
  Text,
  Box,
  Icon,
} from "@chakra-ui/react";
import { FiSun, FiMoon, FiCornerDownRight, FiHelpCircle } from "react-icons/fi";
import { CHAIN_LABELS, CHAINS } from "../../constants";
import { NavLink } from "react-router-dom";
import { addChainToMetaMask } from "../../utils/metamask";
import "./index.scss";

const ADDRESSS_STORAGE_KEY = 'UserWalletAddress';

function Header() {
  const { activateBrowserWallet, account, chainId } = useEthers();
  const { colorMode, toggleColorMode } = useColorMode();

// connection logic should be moved to hook
  React.useEffect(() => {
    const sessionAddress = localStorage.getItem(ADDRESSS_STORAGE_KEY);

    if (sessionAddress && !account) {
      activateBrowserWallet();
    }
  }, [account, activateBrowserWallet]);

  React.useEffect(() => {
    if (account) {
      localStorage.setItem(ADDRESSS_STORAGE_KEY, account);
    }
  }, [account]);

  return (
    <header className="header">
      <Heading className="title">
        <NavLink to="/">CZodiac</NavLink>
      </Heading>
      <div className="controls">
        <Box className="wallet">
          {account ? (
            <>
              <div className="info">
                <Text className="account">{`${account}`}</Text>
                {chainId && (
                  <Text className="network">{CHAIN_LABELS[chainId]}</Text>
                )}
              </div>
            </>
          ) : (
            <>
              <Button
                className="connect"
                onClick={activateBrowserWallet}
              >
                Connect
              </Button>
            </>
          )}
        </Box>
        <Button className={"color-mode"} onClick={toggleColorMode}>
          {colorMode === "light" ? <Icon as={FiMoon} /> : <Icon as={FiSun} />}
        </Button>
        {!!chainId && (chainId != CHAINS.BSC || !account) && (
          <>
            <Button
              className="network-picker"
              onClick={() => addChainToMetaMask(CHAINS.BSC)}
            >
              <Icon as={FiCornerDownRight} />
              BSC
              <Box className="network-tooltip">
                <Icon className="network-tooltip-icon" as={FiHelpCircle} />
                <Text
                  bg="gray.300"
                  color="gray.900"
                  className="network-tooltip-text"
                >
                  Switches to BSC in some wallets. On others, you will need to
                  switch manually.
                </Text>
              </Box>
            </Button>
          </>
        )}
        {!!chainId && chainId == CHAINS.BSC && !!account && (
          <>
            <Button
              className="network-picker"
              onClick={() => addChainToMetaMask(CHAINS.BSCTestnet)}
            >
              <Icon as={FiCornerDownRight} />
              BSCT
              <Box className="network-tooltip">
                <Icon className="network-tooltip-icon" as={FiHelpCircle} />
                <Text
                  bg="gray.300"
                  color="gray.900"
                  className="network-tooltip-text"
                >
                  Test the app on BSCT. Not supported by all wallets.
                </Text>
              </Box>
            </Button>
          </>
        )}
      </div>
      <Text className="version">v0.11.1</Text>
    </header>
  );
}

export default Header;
