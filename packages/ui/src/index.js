import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route } from "react-router-dom";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react"
import theme from "./theme";
import Home from "./pages/Home";
import Sale from "./pages/Sale";
import reportWebVitals from "./reportWebVitals";
import { DAppProvider } from "@usedapp/core";
import {
  CHAINS,
  MUTICALL_ADDRESSES,
  RPC_URLS,
  SUPPORT_CHAINS,
} from "./constants";

import "./styles/index.scss";

const dappConfig = {
  readOnlyChainId: CHAINS.BSC,
  readOnlyUrls: RPC_URLS,
  supportedChains: SUPPORT_CHAINS,
  multicallAddresses: MUTICALL_ADDRESSES,
};

ReactDOM.render(
  <ChakraProvider theme={theme}>
    <HashRouter>
      <DAppProvider config={dappConfig}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <Route exact path="/" component={Home} />
        <Route path="/sale" component={Sale} />
      </DAppProvider>
    </HashRouter>
  </ChakraProvider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
