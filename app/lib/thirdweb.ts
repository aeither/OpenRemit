import { createThirdwebClient } from "thirdweb";
import { defineChain } from "thirdweb/chains";

// Make sure VITE_THIRDWEB_CLIENT_ID is set in your .env file
const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID;

if (!clientId) {
  console.error("VITE_THIRDWEB_CLIENT_ID is not set in environment variables.");
  // You could throw an error here or provide a default client that indicates misconfiguration
}

export const thirdwebClient = createThirdwebClient({
  clientId: clientId || "", // Fallback to empty string if not set, though SDK might complain
});

// Define and export Mantle chain (moved from app/providers/thirdweb.tsx)
export const mantle = defineChain({
    id: 5000, // Mantle Mainnet chain ID
    name: "Mantle",
    nativeCurrency: {
        name: "MNT",
        symbol: "MNT",
        decimals: 18,
    },
    rpc: "https://rpc.mantle.xyz",
    blockExplorers: [
        {
            name: "Mantle Explorer",
            url: "https://explorer.mantle.xyz",
        },
    ],
});

// You can define and export other chains here as well, e.g.:
export const sepolia = defineChain(11155111); 