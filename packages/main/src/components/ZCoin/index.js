import React from "react";
import { Box, Text, Link, Heading, Icon, Button, Image } from "@chakra-ui/react";
import "./index.scss";


function ZCoin() {
    return(<Box className="zcoin">
        <div class="flip-container" >
            <div class="flipper">
                <div class="front">
                    Front
                </div>
                <div class="back">
                    Back
                </div>
            </div>
        </div>
    </Box>)
}

export default ZCoin;