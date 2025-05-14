import { createFileRoute } from '@tanstack/react-router';
import { defineChain, sepolia } from "thirdweb/chains";
import { useActiveAccount, useActiveWalletChain, useWalletBalance } from "thirdweb/react";
import { ConnectWallet } from "../components/ConnectWallet";
import { SendWithNebula } from "../components/SendWithNebula";
import { client } from "../lib/thirdweb";

// Define Mantle chain
const mantle = defineChain({
  id: 5000, // Mantle Mainnet chain ID
  name: "Mantle",
  nativeCurrency: {
    name: "MNT",
    symbol: "MNT",
    decimals: 18,
  },
  rpc: "https://rpc.mantle.xyz", // Mantle Mainnet's public RPC endpoint
  blockExplorers: [
    {
      name: "Mantle Explorer",
      url: "https://explorer.mantle.xyz",
    },
  ],
});

const supportedChains = [sepolia, mantle];

export const Route = createFileRoute('/thirdweb-test')({
  component: ThirdwebTestPage,
});

function ThirdwebTestPage() {
  const account = useActiveAccount();
  const activeChain = useActiveWalletChain();

  const chainToUse = activeChain || sepolia; // Fallback to Sepolia if no active chain (e.g., not connected)

  const { data: balance, isLoading } = useWalletBalance({
    client,
    chain: chainToUse,
    address: account?.address,
    // tokenAddress: "..." //  Uncomment and add token address to get specific token balance
  });

  return (
    <main className="p-4 md:p-8 max-w-xl mx-auto">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Thirdweb Multi-Chain Demo
        </h1>
        <div className="flex justify-center mb-6">
          <ConnectWallet chains={supportedChains} />
        </div>
        <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50 min-h-[120px]">
          {!account ? (
            <p className="text-gray-600 text-center py-4">Please connect your wallet.</p>
          ) : (
            <div className="space-y-3">
              <div>
                <strong className="text-gray-700">Connected Address:</strong>
                <p className="font-mono text-sm break-all text-blue-600">{account.address}</p>
              </div>
              <div>
                <strong className="text-gray-700">Current Network:</strong>
                <p className="font-semibold text-md text-purple-600">
                  {activeChain?.name || "Unknown (Please switch)"}
                </p>
              </div>
              <div>
                <strong className="text-gray-700">Balance ({chainToUse.name}):</strong>
                {isLoading ? (
                  <p className="italic text-gray-500">Loading balance...</p>
                ) : (
                  <p className="font-semibold text-lg text-green-600">
                    {balance?.displayValue ?? "0.00"} {balance?.symbol}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        {account && activeChain && <SendWithNebula />}
      </div>
    </main>
  );
} 