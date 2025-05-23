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
import { Check, ChevronsUpDown, DollarSign, Send } from "lucide-react";
import { useState } from "react";

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
          <Button size="sm" variant="secondary" className="flex-1">
            <Send className="mr-1 h-4 w-4" />
            Send Money
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Money</DialogTitle>
          <DialogDescription>
            Send money to one of your contacts. Select a recipient and enter the amount.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Selected Contact Preview */}
            {selectedContact && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedContact.image} alt={selectedContact.name} />
                  <AvatarFallback>{getInitials(selectedContact.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">{selectedContact.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {selectedContact.address.slice(0, 6)}...{selectedContact.address.slice(-4)}
                  </div>
                </div>
              </div>
            )}

            {/* Contact Selection */}
            <div className="grid gap-2">
              <Label>Recipient *</Label>
              <Popover open={contactSearchOpen} onOpenChange={setContactSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={contactSearchOpen}
                    className="justify-between"
                  >
                    {selectedContact ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={selectedContact.image} alt={selectedContact.name} />
                          <AvatarFallback className="text-xs">
                            {getInitials(selectedContact.name)}
                          </AvatarFallback>
                        </Avatar>
                        {selectedContact.name}
                      </div>
                    ) : (
                      "Select contact..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search contacts..." />
                    <CommandList>
                      <CommandEmpty>No contact found.</CommandEmpty>
                      <CommandGroup>
                        {contacts.map((contact, index) => (
                          <CommandItem
                            key={index}
                            value={contact.name}
                            onSelect={() => {
                              setSelectedContact(contact);
                              setContactSearchOpen(false);
                            }}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={contact.image} alt={contact.name} />
                                <AvatarFallback className="text-xs">
                                  {getInitials(contact.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="font-medium">{contact.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {contact.address.slice(0, 8)}...{contact.address.slice(-6)}
                                </div>
                              </div>
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  selectedContact?.address === contact.address ? "opacity-100" : "opacity-0"
                                )}
                              />
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
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Note Field */}
            <div className="grid gap-2">
              <Label htmlFor="note">Note (optional)</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note for this transaction..."
                className="min-h-[80px]"
              />
            </div>

            {/* Transaction Summary */}
            {selectedContact && amount && (
              <div className="p-3 bg-muted rounded-lg border">
                <div className="text-sm font-medium mb-2">Transaction Summary</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">To:</span>
                    <span>{selectedContact.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-medium">${amount}</span>
                  </div>
                  {note && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Note:</span>
                      <span className="text-right max-w-[200px] truncate">{note}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!selectedContact || !amount.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="mr-2 h-4 w-4" />
              Send ${amount || "0.00"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 