import { Button } from "@/components/ui/button"; // Assuming shadcn/ui
import { Input } from "@/components/ui/input"; // Assuming shadcn/ui
import { useState } from "react";
import { useActiveAccount, useActiveWalletChain } from "thirdweb/react";

export function SendWithNebula() {
  const account = useActiveAccount();
  const activeChain = useActiveWalletChain();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSend = async () => {
    if (!account || !activeChain) {
      setError("Please connect your wallet and ensure a network is active.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/nebula", { // Updated to single endpoint
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message, // User's natural language query
          sessionId: account.address, // User's wallet address acts as session ID
          chainId: activeChain.id, // Active chain ID for context
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Request to Nebula backend failed");
      }

      const responseData = await response.json();

      if (responseData.txHash) {
        setSuccessMessage(
          `Transaction processed! Hash: ${responseData.txHash}. Nebula message: ${responseData.message || ''}`
        );
        setMessage(""); // Clear input on success
      } else if (responseData.message) { // Message from Nebula without a transaction
        setSuccessMessage(`Nebula: ${responseData.message}`);
      } else if (responseData.actions?.[0]?.type === "clarification") { // From original Nebula response structure
         setError(`Nebula needs clarification: ${responseData.actions[0].data?.message}`);
      }else {
        // Handle other cases or unexpected responses
        setSuccessMessage(`Nebula responded: ${JSON.stringify(responseData)}`);
      }

    } catch (err) {
      console.error("Nebula interaction error:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 pt-6 border-t mt-6">
      <h3 className="text-lg font-semibold text-gray-700">Send with Nebula AI</h3>
      <p className="text-sm text-gray-500">
        Try commands like: "Send 0.01 ETH to 0x..." or "Mint an NFT from [contract address] to my wallet". <br />
        Nebula will attempt to perform the action on the currently selected network: <strong>{activeChain?.name || "(No network selected)"}</strong>.
      </p>
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={`e.g. Send 0.01 ${activeChain?.nativeCurrency?.symbol || "tokens"} to 0x...`}
        disabled={!account || loading}
        className="bg-white"
      />
      <Button 
        onClick={handleSend}
        disabled={!account || loading || !message.trim()}
        className="w-full md:w-auto"
      >
        {loading ? "Processing..." : "Ask Nebula"}
      </Button>
      {error && <p className="text-red-500 text-sm mt-2">Error: {error}</p>}
      {successMessage && <p className="text-green-600 text-sm mt-2">{successMessage}</p>}
    </div>
  );
} 