import { extendTheme } from "@chakra-ui/react"

const theme = extendTheme({
    config: {
        initialColorMode: "dark",
        useSystemColorMode: false,
    },
        "colors": {
          "gray": {
            "50": "#F3F3F2",
            "100": "#DDDDD9",
            "200": "#C7C7C1",
            "300": "#B2B2A9",
            "400": "#9C9C91",
            "500": "#868679",
            "600": "#6B6B61",
            "700": "#515148",
            "800": "#363630",
            "900": "#1B1B18"
          },
          "red": {
            "50": "#FDE9E7",
            "100": "#FAC1BD",
            "200": "#F69993",
            "300": "#F37268",
            "400": "#EF4A3E",
            "500": "#EB2214",
            "600": "#BC1B10",
            "700": "#8D140C",
            "800": "#5E0E08",
            "900": "#2F0704"
          },
          "orange": {
            "50": "#FFF5E5",
            "100": "#FFE4B8",
            "200": "#FFD28A",
            "300": "#FFC15C",
            "400": "#FFAF2E",
            "500": "#FF9E00",
            "600": "#CC7E00",
            "700": "#995F00",
            "800": "#663F00",
            "900": "#332000"
          },
          "yellow": {
            "50": "#FCFAE8",
            "100": "#F8F2BF",
            "200": "#F3EA96",
            "300": "#EEE26D",
            "400": "#EADA43",
            "500": "#E5D21A",
            "600": "#B7A815",
            "700": "#897E10",
            "800": "#5C540A",
            "900": "#2E2A05"
          },
          "green": {
            "50": "#EBFAEE",
            "100": "#C6F1CF",
            "200": "#A1E7B0",
            "300": "#7DDE92",
            "400": "#58D573",
            "500": "#34CB54",
            "600": "#29A343",
            "700": "#1F7A33",
            "800": "#155122",
            "900": "#0A2911"
          }
        },
    fonts: {
      body: "Raleway, system-ui, sans-serif",
      heading: "Acme, Georgia, serif",
      mono: "Menlo, monospace",
    },
    styles: {
        global: (props) => ({
            "html, body": {
                color: props.colorMode === "dark" ? "orange.400" : "orange.800",
                bg: props.colorMode === "dark" ? "gray.900" : "gray.100",
            }
        })
    }
});

export default theme;