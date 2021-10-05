import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route } from "react-router-dom";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import WebfontLoader from '@dr-kobros/react-webfont-loader';
import theme from "./theme";
import Home from "./pages/Home";
import Sale from "./pages/Sale";
import Swap from "./pages/Swap";
import TigerHunt from "./pages/TigerHunt";
import CZFarm from "./pages/CZFarm";
import CZUsd from "./pages/CZUsd";
import CZVaults from "./pages/CZVaults";
import reportWebVitals from "./reportWebVitals";
import { DAppProvider } from "@pdusedapp/core";
import {
  CHAINS,
  MUTICALL_ADDRESSES,
  RPC_URLS,
  SUPPORT_CHAINS,
} from "./constants";

import "./styles/index.scss";

const webFontConfig = {
  google: {
    families: ['Acme:light,regular,bold,italic','Raleway:light,regular,bold,italic']
  }
};

const dappConfig = {
  readOnlyChainId: CHAINS.BSCTestnet,
  readOnlyUrls: RPC_URLS,
  supportedChains: SUPPORT_CHAINS,
  multicallAddresses: MUTICALL_ADDRESSES,
};

ReactDOM.render(
  <WebfontLoader config={webFontConfig}>
    <ChakraProvider theme={theme}>
      <HashRouter>
        <DAppProvider config={dappConfig}>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Route exact path="/" component={Home} />
          <Route path="/sale" component={Sale} />
          <Route path="/swap" component={Swap} />
          <Route path="/tigerhunt" component={TigerHunt} />
          <Route path="/czfarm" component={CZFarm} />
          <Route path="/czusd" component={CZUsd} />
          <Route path="/vaults" component={CZVaults} />
        </DAppProvider>
      </HashRouter>
    </ChakraProvider>
  </WebfontLoader>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
