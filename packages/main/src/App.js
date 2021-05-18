import Header from "./sections/Header";
import About from "./sections/About";
import Token from "./sections/Token";
import Nfts from "./sections/Nfts";
import Footer from "./sections/Footer";
import { Box } from "@chakra-ui/react";
import './App.scss';


function App() {
  return (<>
    <Box className="App">
      <Header />
      <About />
      <Token />
      <Nfts />
      <Footer />
    </Box>
  </>);
}

export default App;
