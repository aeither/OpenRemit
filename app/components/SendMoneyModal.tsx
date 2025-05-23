"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Check, ChevronsUpDown, DollarSign, Send, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActiveAccount } from "thirdweb/react";

interface Contact {
  name: string;
  address: string;
  image: string;
}

interface SendMoneyModalProps {
  contacts: Contact[];
  trigger?: React.ReactNode;
  onSendMoney?: (transaction: {
    contact: Contact;
    amount: string;
    note: string;
  }) => void;
}

export function SendMoneyModal({ contacts, trigger, onSendMoney }: SendMoneyModalProps) {
  const [open, setOpen] = useState(false);
  const [contactSearchOpen, setContactSearchOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  
  const activeAccount = useActiveAccount();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  
  // TRPC mutation for creating transactions
  const createTransactionMutation = useMutation(
    trpc.user.createTransaction.mutationOptions({
      onSuccess: (data) => {
        toast.success("Transaction recorded successfully! 💰");
        // Invalidate and refetch transactions to refresh the recent transactions list
        queryClient.invalidateQueries({ queryKey: ['user', 'listTransactions'] });
      },
      onError: (error: any) => {
        toast.error(`Failed to record transaction: ${error.message}`);
      }
    })
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedContact || !amount.trim()) {
      return;
    }

    const transaction = {
      contact: selectedContact,
      amount: amount.trim(),
      note: note.trim(),
    };

    // Save transaction to database if wallet is connected
    if (activeAccount?.address) {
      createTransactionMutation.mutate({
        userAddress: activeAccount.address,
        type: "sent",
        contactName: selectedContact.name,
        contactAddress: selectedContact.address,
        contactImage: selectedContact.image,
        amount: amount.trim(),
        note: note.trim() || undefined,
        status: "completed",
      });
    }

    onSendMoney?.(transaction);

    // Reset form and close modal
    setSelectedContact(null);
    setAmount("");
    setNote("");
    setOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="secondary" className="flex-1 gap-2">
            <Send className="h-4 w-4" />
            Send Money
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-white to-gray-50/50 dark:from-slate-900 dark:to-slate-800/50 border-0 shadow-2xl">
        {/* Header with gradient */}
        <DialogHeader className="text-center space-y-3 pb-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
            <Send className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Send Money
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-300">
            Send money instantly to your contacts with just a few clicks.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selected Contact Preview */}
          {selectedContact && (
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200/50 dark:border-emerald-800/30">
              <Avatar className="h-12 w-12 border-2 border-emerald-200 dark:border-emerald-800 shadow-sm">
                <AvatarImage src={selectedContact.image} alt={selectedContact.name} />
                <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-semibold">
                  {getInitials(selectedContact.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-white">{selectedContact.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                  {selectedContact.address.slice(0, 6)}...{selectedContact.address.slice(-4)}
                </div>
              </div>
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                <Check className="h-4 w-4 text-white" />
              </div>
            </div>
          )}

          <div className="space-y-5">
            {/* Contact Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Send To *
              </Label>
              <Popover open={contactSearchOpen} onOpenChange={setContactSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={contactSearchOpen}
                    className="w-full h-12 justify-between border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-200"
                  >
                    {selectedContact ? (
                      <div className="flex items-center gap-3">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={selectedContact.image} alt={selectedContact.name} />
                          <AvatarFallback className="text-xs font-medium">
                            {getInitials(selectedContact.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{selectedContact.name}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">Select a contact...</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search contacts..." className="h-12" />
                    <CommandList>
                      <CommandEmpty className="py-6 text-center text-gray-500">
                        No contacts found.
                      </CommandEmpty>
                      <CommandGroup>
                        {contacts.map((contact, index) => (
                          <CommandItem
                            key={`${contact.address}-${index}`}
                            value={contact.name}
                            onSelect={(currentValue) => {
                              const selectedContactItem = contacts.find(c => c.name.toLowerCase() === currentValue.toLowerCase());
                              setSelectedContact(selectedContactItem || null);
                              setContactSearchOpen(false);
                            }}
                            className="p-3 cursor-pointer"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedContact?.address === contact.address ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex items-center gap-3 w-full">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={contact.image} alt={contact.name} />
                                <AvatarFallback className="text-xs font-medium">
                                  {getInitials(contact.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 dark:text-white">{contact.name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                  {contact.address.slice(0, 8)}...{contact.address.slice(-6)}
                                </div>
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Amount Field */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Amount *
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="h-14 pl-12 pr-4 text-lg font-semibold border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Note Field */}
            <div className="space-y-2">
              <Label htmlFor="note" className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                Note
                <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                  Optional
                </span>
              </Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note for this transaction..."
                className="min-h-[100px] border-gray-200 dark:border-gray-700 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200 resize-none"
              />
            </div>

            {/* Transaction Summary */}
            {selectedContact && amount && (
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Transaction Summary</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">To:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedContact.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                    <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">${amount}</span>
                  </div>
                  {note && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Note:</span>
                      <span className="text-right max-w-[200px] truncate text-gray-900 dark:text-white">{note}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="flex-1 h-12 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedContact || !amount.trim()}
              className="flex-1 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="mr-2 h-4 w-4" />
              Send ${amount || "0.00"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 