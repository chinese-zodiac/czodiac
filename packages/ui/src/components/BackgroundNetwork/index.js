import React, { useEffect } from "react";
import Particles from "react-tsparticles";
import particleConfig from "./particleConfig";
import { Box, useColorModeValue } from "@chakra-ui/react";

import "./index.scss";

function BackgroundNetwork() {
    const vignetteColor = useColorModeValue(
      "radial-gradient(circle, var(--chakra-colors-gray-100) 50%, transparent 100%)", 
      "radial-gradient(circle, var(--chakra-colors-gray-900) 50%, transparent 100%)"
    );
    return(<>    
        <Particles id="tsparticles" options={particleConfig} />
        <Box id="tsparticles-cover" bg={vignetteColor} />
    </>)
}

export default BackgroundNetwork;