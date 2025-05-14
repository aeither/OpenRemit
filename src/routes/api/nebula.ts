import { createThirdwebClient, prepareTransaction, sendTransaction } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { privateKeyToAccount } from "thirdweb/wallets";

// Initialize Thirdweb client for backend operations
const thirdwebBackendClient = createThirdwebClient({
  secretKey: process.env.THIRDWEB_SECRET_KEY || "", // Provide a default or handle missing key
});

// Helper to define/get chain objects. Add more chains as needed.
// Ensure these definitions are complete enough for prepareTransaction.
function getChainDefinition(chainId: number) {
  // Example: Add Mantle Mainnet definition (ID 5000)
  if (chainId === 5000) {
    return defineChain({
      id: 5000,
      name: "Mantle",
      rpc: "https://rpc.mantle.xyz",
      nativeCurrency: { name: "MNT", symbol: "MNT", decimals: 18 },
      blockExplorers: [{ name: "Mantle Explorer", url: "https://explorer.mantle.xyz" }],
    });
  }
  // Example: Add Sepolia Testnet definition (ID 11155111)
  if (chainId === 11155111) {
    return defineChain({
      id: 11155111,
      name: "Sepolia",
      rpc: "https://rpc.sepolia.org", // Or your preferred Sepolia RPC
      nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
      blockExplorers: [{ name: "Etherscan Sepolia", url: "https://sepolia.etherscan.io" }],
    });
  }
  // Add other chains your app supports
  console.warn(`getChainDefinition: Chain ID ${chainId} not explicitly defined. Falling back to simple object.`);
  // Fallback: prepareTransaction needs at least an id. 
  // For robust behavior, ensure all supported chainIds have full definitions.
  return defineChain(chainId);
}

export async function POST(request: Request) {
  const secretKey = process.env.THIRDWEB_SECRET_KEY;
  const privateKey = process.env.WALLET_PRIVATE_KEY;

  if (!secretKey || !privateKey) {
    console.error("Missing THIRDWEB_SECRET_KEY or WALLET_PRIVATE_KEY in environment variables.");
    return Response.json({ error: "Server configuration error." }, { status: 500 });
  }

  try {
    const { message, sessionId, chainId } = await request.json();

    if (!message || !sessionId || chainId === undefined) {
      return Response.json({ error: "Missing message, sessionId, or chainId" }, { status: 400 });
    }

    // 1. Call Nebula API
    const nebulaResponse = await fetch("https://nebula-api.thirdweb.com/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-secret-key": secretKey,
      },
      body: JSON.stringify({
        message,
        sessionId, 
        stream: false,
        context: {
          chainIds: [chainId],
          walletAddress: sessionId,
        },
      }),
    });

    const nebulaData = await nebulaResponse.json();

    if (!nebulaResponse.ok) {
      console.error("Nebula API error:", nebulaData);
      return Response.json({ error: nebulaData.error || "Nebula API request failed" }, { status: nebulaResponse.status });
    }

    // 2. Handle transactions if proposed by Nebula
    if (nebulaData.actions?.length > 0 && nebulaData.actions[0].type === "signtransaction") {
      const action = nebulaData.actions[0];
      const txData = JSON.parse(action.data);
      
      const backendAccount = privateKeyToAccount({
        client: thirdwebBackendClient, // Client initialized with secretKey already
        privateKey: privateKey,
      });

      const targetChain = getChainDefinition(txData.chainId || chainId);
      if (!targetChain) {
        return Response.json({ error: `Unsupported chainId for transaction: ${txData.chainId || chainId}` }, { status: 400 });
      }
      
      const transaction = prepareTransaction({
        to: txData.to,
        value: txData.value ? BigInt(txData.value) : undefined,
        data: txData.data,
        chain: targetChain,
        client: thirdwebBackendClient,
      });

      const { transactionHash } = await sendTransaction({
        transaction,
        account: backendAccount,
      });

      return Response.json({
        message: nebulaData.message || "Transaction processed by Nebula.",
        txHash: transactionHash,
        nebulaResponse: nebulaData,
      });
    }

    return Response.json(nebulaData);

  } catch (error) {
    console.error("Error in /api/nebula POST handler:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return Response.json({ error: errorMessage }, { status: 500 });
  }
} 