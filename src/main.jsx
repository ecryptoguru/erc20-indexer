import "./polyfills";

import React from "react";
import ReactDOM from "react-dom/client";
import { extendTheme, ChakraProvider } from "@chakra-ui/react";
import "@rainbow-me/rainbowkit/styles.css";

import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, sepolia } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import App from "./App";
import "./index.css";

const { chains, provider } = configureChains(
  [mainnet, polygon, optimism, arbitrum, sepolia],
  [
    alchemyProvider({ apiKey: import.meta.env.VITE_ALCHEMY_API_KEY }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "Escrow App",
  projectId: "ESCROW_APP",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

const colors = {
  brand: {
    900: "#1a365d",
    800: "#153e75",
    700: "#2a69ac",
  },
};

const theme = extendTheme({ colors });

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains}>
          <App />
        </RainbowKitProvider>
      </WagmiConfig>
    </ChakraProvider>
  </React.StrictMode>
);