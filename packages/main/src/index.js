import React from 'react';
import ReactDOM from 'react-dom';
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import WebfontLoader from '@dr-kobros/react-webfont-loader';
import theme from "./theme";
import './index.scss';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ParallaxProvider } from 'react-scroll-parallax';

const webFontConfig = {
  google: {
    families: ['Acme:light,regular,bold,italic','Raleway:light,regular,bold,italic']
  }
};

ReactDOM.render(
    <WebfontLoader config={webFontConfig}>
      <ChakraProvider theme={theme}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <ParallaxProvider>
          <App />
        </ParallaxProvider>
      </ChakraProvider>
    </WebfontLoader>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
