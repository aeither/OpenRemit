import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { createThirdwebClient } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { ThirdwebProvider } from "thirdweb/react";

// 1. Define the Mantle chain
export const mantle = defineChain({
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

// 2. Create the Thirdweb client
// Make sure to replace 'YOUR_THIRDWEB_CLIENT_ID' with your actual client ID
// You can get a client ID from https://thirdweb.com/dashboard
export const thirdwebClient = createThirdwebClient({
    clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID as string, 
});

// 3. Create a new QueryClient instance
const queryClient = new QueryClient();

// 4. Create the provider component
export const ThirdwebRootProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <QueryClientProvider client={queryClient}>
            <ThirdwebProvider>
                {children}
            </ThirdwebProvider>
        </QueryClientProvider>
    );
};
