import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { PreparedTransaction } from "thirdweb";
import { Nebula } from "thirdweb/ai";
import {
    useActiveAccount,
    useActiveWalletChain,
    useSendTransaction,
} from "thirdweb/react";
import { thirdwebClient } from "../lib/thirdweb";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  transactions?: PreparedTransaction[];
  txHash?: string;
}

export function NebulaIntegration() {
  const connectedAccount = useActiveAccount();
  const activeChain = useActiveWalletChain();
  const { mutateAsync: sendTransaction,isPending: isTxPending } = useSendTransaction();

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userInput.trim() || !connectedAccount || !activeChain) {
      setError(
        !connectedAccount || !activeChain
          ? "Please connect your wallet and select a network."
          : "Please enter a message."
      );
      return;
    }

    const newUserMessage: ChatMessage = { role: "user", content: userInput };
    setChatMessages((prev) => [...prev, newUserMessage]);
    setUserInput("");
    setIsLoading(true);
    setError(null);

    try {
      const nebulaResponse = await Nebula.chat({
        client: thirdwebClient,
        account: connectedAccount, // Pass the connected account for context
        message: newUserMessage.content,
        contextFilter: {
          chains: [activeChain], // Context for Nebula
          walletAddresses: [connectedAccount.address],
        },
        // For multi-turn conversations, you can pass previous messages:
        // messages: [...chatMessages, newUserMessage].map(m => ({ role: m.role, content: m.content })),
      });

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: nebulaResponse.message,
        transactions: nebulaResponse.transactions,
      };
      setChatMessages((prev) => [...prev, assistantMessage]);

    } catch (err) {
      console.error("Nebula chat error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred with Nebula.";
      setError(errorMessage);
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${errorMessage}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteTransaction = async (tx: PreparedTransaction, messageIndex: number) => {
    if (!connectedAccount) {
      setError("Cannot execute transaction: Wallet not connected.");
      return;
    }
    setError(null);
    try {
      const receipt = await sendTransaction(tx);
      console.log("Transaction successful:", receipt);
      setChatMessages(prevMessages => prevMessages.map((msg, idx) => 
        idx === messageIndex ? { ...msg, content: `${msg.content} (TX executed: ${receipt.transactionHash.substring(0,10)}...)`, txHash: receipt.transactionHash, transactions: undefined } : msg
      ));
    } catch (err) {
      console.error("Error sending transaction:", err);
      const txError = err instanceof Error ? err.message : "Transaction failed.";
      setError(txError);
       setChatMessages(prevMessages => prevMessages.map((msg, idx) => 
        idx === messageIndex ? { ...msg, content: `${msg.content} (TX failed: ${txError})` } : msg
      ));
    }
  };

  return (
    <div className="flex flex-col h-[500px] max-w-2xl mx-auto bg-background border rounded-lg shadow-lg p-4 space-y-4">
      <h2 className="text-xl font-semibold text-center">Chat with Nebula AI</h2>
      <ScrollArea className="flex-grow border rounded-md p-3 space-y-2 bg-muted/50 prose dark:prose-invert max-w-none">
        {chatMessages.map((msg, index) => (
          <div key={index} className={`flex flex-col mb-3 ${msg.role === "user" ? "items-end" : "items-start"}`}>
            <div className={`p-3 rounded-lg max-w-[80%] break-words ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              {msg.transactions && msg.transactions.length > 0 && msg.role === "assistant" && (
                <div className="mt-2 pt-2 border-t border-muted-foreground/20">
                  <p className="text-sm font-medium mb-1">Proposed Transaction(s):</p>
                  {msg.transactions.map((tx, txIdx) => (
                    <Button
                      key={txIdx}
                      variant="outline"
                      size="sm"
                      onClick={() => handleExecuteTransaction(tx, index)}
                      disabled={isTxPending}
                      className="mt-1 w-full"
                    >
                      {isTxPending ? "Executing..." : `Execute Transaction on ${tx.chain?.name || "current chain"}`}
                    </Button>
                  ))}
                </div>
              )}
              {msg.txHash && (
                <p className="text-xs mt-1 text-muted-foreground/80">
                  TX Hash: {msg.txHash.substring(0, 10)}...
                </p>
              )}
            </div>
          </div>
        ))}
        {isLoading && (chatMessages.length === 0 || chatMessages[chatMessages.length -1].role === 'user') && (
          <div className="flex flex-col items-start mb-3">
            <div className="p-3 rounded-lg bg-muted max-w-[80%]">
              <p className="italic">Nebula is thinking...</p>
            </div>
          </div>
        )}
      </ScrollArea>
      <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
        <Input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder={connectedAccount ? `Ask Nebula about ${activeChain?.name || "selected chain"}...` : "Connect wallet to chat..."}
          disabled={!connectedAccount || isLoading}
          className="flex-grow"
        />
        <Button type="submit" disabled={!connectedAccount || isLoading || !userInput.trim()}>
          {isLoading ? "Sending..." : "Send"}
        </Button>
      </form>
      {error && <p className="text-sm text-red-500 text-center">Error: {error}</p>}
      {!connectedAccount && <p className="text-sm text-amber-500 text-center">Please connect your wallet to interact with Nebula.</p>}
    </div>
  );
} 