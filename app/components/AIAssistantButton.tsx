"use client"; // Keep client directive if it was intended for the original mocked component

import { Button } from "@/components/ui/button";
import { Bot, Mic } from "lucide-react";
import { useState } from "react";
import { useActiveAccount } from "thirdweb/react"; // To conditionally render or guide user
import { NebulaIntegration } from "./NebulaIntegration"; // Changed from AIAssistantChat

export function AIAssistantButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false); // Voice functionality is mocked
  const activeAccount = useActiveAccount();

  const toggleChat = () => {
    if (!activeAccount) {
      // Optionally, prompt user to connect wallet first
      // For now, we'll just prevent opening if not connected, 
      // or NebulaIntegration will show its own connect prompt.
      console.log("AI Assistant: Wallet not connected.");
      // alert("Please connect your wallet to use the AI Assistant.");
      // return;
    }
    setIsOpen(!isOpen);
  };

  // Mocked voice toggle functionality from original UI
  const toggleVoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsListening(!isListening);
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false);
      }, 3000);
    }
  };

  return (
    <>
      {isOpen && activeAccount && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center backdrop-blur-sm">
          {/* NebulaIntegration is now the content of the modal-like card */}
          <div className="w-full max-w-md bg-card rounded-lg shadow-xl overflow-hidden">
            <NebulaIntegration onClose={() => setIsOpen(false)} />
          </div>
        </div>
      )}

      <div className="fixed bottom-6 right-4 z-40 flex flex-col items-end space-y-3 sm:bottom-8 sm:right-8">
        {isListening && (
          <div className="mb-2 rounded-full bg-primary p-3 text-primary-foreground shadow-lg">
            <div className="flex items-center gap-2">
              <div className="relative flex h-4 w-4 items-center justify-center">
                <div className="absolute h-full w-full animate-ping rounded-full bg-white opacity-75"></div>
                <div className="h-2 w-2 rounded-full bg-white"></div>
              </div>
              <span className="text-sm font-medium">Listening...</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            onClick={toggleVoice}
            size="icon"
            variant="default"
            className={`rounded-full shadow-lg h-12 w-12 ${isListening ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"}`}
            aria-label="Toggle Voice Assistant"
          >
            <Mic className="h-6 w-6" />
          </Button>

          <Button 
            onClick={toggleChat} 
            size="icon" 
            variant="default"
            className="rounded-full bg-primary hover:bg-primary/90 shadow-lg h-12 w-12"
            aria-label="Toggle AI Assistant Chat"
          >
            <Bot className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </>
  );
} 