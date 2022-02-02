import React from "react";
import ReactDOM, { unstable_batchedUpdates }  from "react-dom";
import { HashRouter, Route } from "react-router-dom";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import WebfontLoader from '@dr-kobros/react-webfont-loader';
import theme from "./theme";
import Home from "./pages/Home";
import StimFarms from "./pages/StimFarms";
import TigerHunt from "./pages/TigerHunt";
import CZFBuyoutTigz from "./pages/CZFBuyoutTigz";
import CZFarm from "./pages/CZFarm";
import CZUsd from "./pages/CZUsd";
import CZVaults from "./pages/CZVaults";
import LossCompensation from "./pages/LossCompensation";
import ChronoPools from "./pages/ChronoPools";
import ExoticFarms from "./pages/ExoticFarms";
import IBFRGames from "./pages/IBFRGames";
import reportWebVitals from "./reportWebVitals";
import { DAppProvider } from "@pdusedapp/core";
import {
  CHAINS,
  MUTICALL_ADDRESSES,
  RPC_URLS,
  SUPPORT_CHAINS,
} from "./constants";
import createStore from "./store";
import createContext from "zustand/context";
import "./styles/index.scss";

const { Provider, useStore } = createContext();

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
          <Provider createStore={createStore}>
            <ColorModeScript initialColorMode={theme.config.initialColorMode} />
            <Route exact path="/" component={Home} />
            <Route path="/stimfarms" component={StimFarms} />
            <Route path="/tigerhunt" component={TigerHunt} />
            <Route path="/czfarm" component={CZFarm} />
            <Route path="/czusd" component={CZUsd} />
            <Route path="/vaults" component={CZVaults} />
            <Route path="/czfbuyouttigz" component={CZFBuyoutTigz} />
            <Route path="/chronopools" component={ChronoPools} />
            <Route path="/exoticfarms" component={ExoticFarms} />
            <Route path="/ibfrgames" component={IBFRGames} />
            <Route path="/losscomp" component={LossCompensation} />
          </Provider>
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
