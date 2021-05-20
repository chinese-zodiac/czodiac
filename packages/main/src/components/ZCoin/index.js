import React from "react";
import { Box, Image, Text } from "@chakra-ui/react";
import "./index.scss";


function ZCoin({imgSrc, name}) {
    return(<Box margin="20px" className="zcoin">
        <div className="flip-container" >
            <div className="flipper">
                <div className="front">
                    <Image width="150px" src="./czodiac-coin.png" />
                </div>
                <div className="back">
                    <Image width="150px" src={!!imgSrc ? imgSrc : "./blank.png"} />
                </div>
            </div>
        </div>
        <Text mt="10px" fontWeight="bold">{!!name ? name : "???"}</Text>
    </Box>)
}

export default ZCoin;