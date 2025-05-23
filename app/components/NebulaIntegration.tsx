import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTRPC } from "@/trpc/react"; // Corrected tRPC import
import { useMutation } from "@tanstack/react-query"; // Import useMutation
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
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

interface NebulaIntegrationProps {
  onClose: () => void;
}

export function NebulaIntegration({ onClose }: NebulaIntegrationProps) {
  const connectedAccount = useActiveAccount();
  const activeChain = useActiveWalletChain();
  const { mutateAsync: sendTransaction, isPending: isTxPending, isSuccess: isTxSuccess  } = useSendTransaction();
  const trpc = useTRPC(); // Get tRPC client instance via hook

  // tRPC mutation for parsing intent - Corrected usage
  const parseIntentMutation = useMutation(trpc.ai.parseUserIntentForNebula.mutationOptions());

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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

    const currentMessageContent = userInput;
    const newUserMessage: ChatMessage = { role: "user", content: currentMessageContent };
    setChatMessages((prev) => [...prev, newUserMessage]);
    setUserInput("");
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Parse user intent to resolve contact names
      const parsedResult = await parseIntentMutation.mutateAsync({
        userAddress: connectedAccount.address,
        userMessage: currentMessageContent,
      });

      // If contact not found, show error and stop
      if (!parsedResult.success && parsedResult.error) {
        setChatMessages((prev) => [
          ...prev,
          { role: "assistant", content: parsedResult.error },
        ]);
        setIsLoading(false);
        return;
      }

      // Step 2: Send to Nebula.chat with the modified message
      const nebulaResponse = await Nebula.chat({
        client: thirdwebClient,
        account: connectedAccount,
        message: parsedResult.messageForNebula, // Use the message with resolved addresses
        contextFilter: {
          chains: [activeChain],
          walletAddresses: [connectedAccount.address],
        },
      });

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: nebulaResponse.message,
        transactions: nebulaResponse.transactions,
      };
      setChatMessages((prev) => [...prev, assistantMessage]);

    } catch (err: any) { // Catch errors from both parsing and Nebula
      console.error("Error in chat flow:", err);
      // Check if it's a tRPC error from parseIntentMutation to provide a more specific message
      const errorMessage = err.data?.message || err.message || "An unexpected error occurred.";
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
      
      // Show success toast
      toast.success("Transaction Successful! 🎉", {
        description: `Transaction hash: ${receipt.transactionHash.substring(0, 10)}...`,
        duration: 5000,
      });
      
      setChatMessages(prevMessages => prevMessages.map((msg, idx) => 
        idx === messageIndex ? { ...msg, content: `${msg.content} (TX executed: ${receipt.transactionHash.substring(0,10)}...)`, txHash: receipt.transactionHash, transactions: undefined } : msg
      ));
    } catch (err) {
      console.error("Error sending transaction:", err);
      const txError = err instanceof Error ? err.message : "Transaction failed.";
      setError(txError);
      
      // Show error toast
      toast.error("Transaction Failed", {
        description: txError,
        duration: 5000,
      });
      
       setChatMessages(prevMessages => prevMessages.map((msg, idx) => 
        idx === messageIndex ? { ...msg, content: `${msg.content} (TX failed: ${txError})` } : msg
      ));
    }
  };

  return (
    <div className="flex flex-col w-full h-full text-card-foreground">
      <div className="flex items-center justify-between border-b p-4 flex-shrink-0">
        <div className="flex items-center">
          <h3 className="font-semibold">Nebula AI Assistant</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
          <span className="sr-only">Close chat</span>
        </Button>
      </div>

      <ScrollArea className="flex-grow p-4 bg-background/50 min-h-0">
        {chatMessages.map((msg, index) => (
          <div key={index} className={`flex flex-col mb-3 ${msg.role === "user" ? "items-end" : "items-start"}`}>
            <div className={`p-3 rounded-lg max-w-[80%] break-words shadow ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              <div className="prose prose-sm dark:prose-invert max-w-none w-full break-all">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
              </div>
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
              <p className="italic text-muted-foreground">Nebula is thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </ScrollArea>

      <div className="border-t p-4 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={connectedAccount ? `Ask Nebula...` : "Connect wallet to chat..."}
            disabled={!connectedAccount || isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={!connectedAccount || isLoading || !userInput.trim()}>
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </form>
        {error && <p className="text-xs text-red-500 text-center mt-2">Error: {error}</p>}
        {!connectedAccount && !isLoading && <p className="text-xs text-amber-600 text-center mt-2">Please connect your wallet.</p>}
      </div>
    </div>
  );
} 