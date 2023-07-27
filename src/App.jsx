import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Text,
  CircularProgress,
} from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { fetchEnsAddress } from "@wagmi/core";
import { Alchemy, Network, Utils } from "alchemy-sdk";
import { ethers } from "ethers";
import { useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { mainnet, polygon, optimism, arbitrum, sepolia } from "wagmi/chains";

const chainIdToAlchemyChain = {
  [mainnet.id]: Network.ETH_MAINNET,
  [polygon.id]: Network.MATIC_MAINNET,
  [optimism.id]: Network.OPT_MAINNET,
  [arbitrum.id]: Network.ARB_MAINNET,
  [sepolia.id]: Network.ETH_SEPOLIA,
};

function App() {
  const [userAddress, setUserAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [hasQueried, setHasQueried] = useState(false);
  const [tokenDataObjects, setTokenDataObjects] = useState([]);

  const { address } = useAccount();
  const chainId = useChainId();

  async function getTokenBalance() {
    const ensAddress = await fetchEnsAddress({ name: userAddress });
    if (
      !ethers.utils.isAddress(address) &&
      !ethers.utils.isAddress(userAddress) &&
      !ensAddress
    ) {
      return;
    }

    const network = chainIdToAlchemyChain[chainId] || Network.ETH_MAINNET;
    const config = {
      apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
      network,
    };

    const alchemy = new Alchemy(config);
    setIsLoading(true);
    const data = await alchemy.core.getTokenBalances(address || userAddress);

    setResults(data);

    const tokenData = await Promise.all(
      data.tokenBalances.map((balance) => {
        return alchemy.core.getTokenMetadata(balance.contractAddress);
      })
    );
    setTokenDataObjects(tokenData);

    setIsLoading(false);
    setHasQueried(true);
  }
  return (
    <Box w="100vw" p={2}>
      <Center>
        <Flex
          alignItems={"center"}
          justifyContent="center"
          flexDirection={"column"}
        >
          <Heading mb={0} fontSize={36}>
            ERC-20 Token Indexer
          </Heading>
          <Text>
            Plug in an address and this website will return all of its ERC-20
            token balances!
          </Text>
        </Flex>
      </Center>
      <Flex
        mt={4}
        w="100%"
        flexDirection="column"
        alignItems="center"
        justifyContent={"center"}
        gap={4}
      >
        <ConnectButton />
        <Flex
          flexDirection={["column", "column", "row"]}
          gap={4}
          justifyContent="space-between"
        >
          <Input
            disabled={address}
            placeholder="Enter 0x address"
            onChange={(e) => setUserAddress(e.target.value)}
            color="purple"
            flex={["none", "none", 1]}
            p={4}
            bgColor="white"
            fontSize={18}
          />
          <Button
            fontSize={[14, 18, 20]}
            color="yellow"
            onClick={getTokenBalance}
            bgColor="black"
            display="flex"
            justifyItems="baseline"
            justifyContent="center"
            gap="4px"
          >
            Check ERC-20 Token Balances
            {isLoading && (
              <CircularProgress isIndeterminate color="blue" size="18px" />
            )}
          </Button>
        </Flex>

        <Heading mt={4}>ERC-20 token balances:</Heading>

        {hasQueried ? (
          <SimpleGrid w={"90vw"} columns={[1, 1, 3]} spacing={24}>
            {results.tokenBalances.map((e, i) => {
              return (
                <Flex
                  flexDir={"column"}
                  border="1px"
                  borderRadius={4}
                  textAlign="center"
                  w="100%"
                  p="2"
                  key={e.id}
                >
                  <Box>
                    <b>Symbol:</b> ${tokenDataObjects[i]?.symbol}&nbsp;
                  </Box>
                  <Box>
                    <b>Balance:</b>&nbsp;
                    {Utils.formatUnits(
                      e.tokenBalance,
                      tokenDataObjects[i]?.decimals
                    )}
                  </Box>
                  <Image
                    alignSelf="center"
                    w="24"
                    h="24"
                    src={tokenDataObjects[i]?.logo}
                  />
                </Flex>
              );
            })}
          </SimpleGrid>
        ) : (
          "Please make a query! This may take a few seconds..."
        )}
      </Flex>
    </Box>
  );
}

export default App;