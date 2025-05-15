import { ConnectButton } from "thirdweb/react";
import { mantle, sepolia, thirdwebClient } from "../lib/thirdweb"; // Import chains from lib

// Chains are now imported from lib/thirdweb.ts
// const mantle = defineChain(5000);
// const sepolia = defineChain(11155111);

const supportedChains = [mantle, sepolia];

export function ConnectWalletButton() {
  return (
    <ConnectButton
      client={thirdwebClient}
      chains={supportedChains}
    />
  );
} 