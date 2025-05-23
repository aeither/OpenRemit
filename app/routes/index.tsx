import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CreditCard, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useActiveAccount } from "thirdweb/react"; // For checking if wallet is connected
import { AddContactModal } from "../components/AddContactModal";
import { AIAssistantButton } from "../components/AIAssistantButton";
import { MobileNav } from "../components/MobileNav";
import { QuickTransfer } from "../components/QuickTransfer";
import { RecentTransactions } from "../components/RecentTransactions";
import { RecurringPayments } from "../components/RecurringPayments";
import { SendMoneyModal } from "../components/SendMoneyModal";
import { SmartSuggestions } from "../components/SmartSuggestions";

export const Route = createFileRoute("/")({
  component: HomePage,
});

interface Contact {
  name: string;
  address: string;
  image: string;
}

function HomePage() {
  const activeAccount = useActiveAccount();
  const trpc = useTRPC();
  
  // State for managing contacts (both local and database)
  const [contacts, setContacts] = useState<Contact[]>([
    // Some default contacts for demo purposes
    {
      name: "Mom",
      address: "0x1234567890123456789012345678901234567890",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    {
      name: "Dad",
      address: "0x0987654321098765432109876543210987654321",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    }
  ]);

  // TRPC mutations
  const createContactMutation = useMutation(
    trpc.user.createContact.mutationOptions({
      onSuccess: (data: { success: boolean; message: string; contact?: { contactName: string; contactAddress: string } }) => {
        toast.success(`Contact "${data.contact?.contactName}" added successfully!`);
        // Add to local state as well for immediate UI update
        if (data.contact) {
          const newContact: Contact = {
            name: data.contact.contactName,
            address: data.contact.contactAddress,
            image: `https://api.dicebear.com/7.x/initials/svg?seed=${data.contact.contactName}`
          };
          setContacts(prev => [...prev, newContact]);
        }
      },
      onError: (error: any) => {
        toast.error(`Failed to add contact: ${error.message}`);
      }
    })
  );

  // Load contacts from database when wallet is connected
  const listContactsQuery = useQuery(
    trpc.user.listContacts.queryOptions({
      userAddress: activeAccount?.address || "",
    })
  );

  // Load contacts when wallet connects or query data changes
  useEffect(() => {
    if (listContactsQuery.data) {
      // Convert database contacts to UI format and merge with defaults
      const dbContacts: Contact[] = listContactsQuery.data.map(contact => ({
        name: contact.name,
        address: contact.address,
        image: `https://api.dicebear.com/7.x/initials/svg?seed=${contact.name}`
      }));
      
      // Keep default contacts for demo, but prioritize database contacts
      const defaultContacts = [
        {
          name: "Mom",
          address: "0x1234567890123456789012345678901234567890",
          image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
        },
        {
          name: "Dad",
          address: "0x0987654321098765432109876543210987654321",
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
        }
      ];
      setContacts([...defaultContacts, ...dbContacts]);
    }
  }, [listContactsQuery.data]);

  const handleAddContact = (newContact: Contact) => {
    if (activeAccount?.address) {
      // Use TRPC to add to database
      createContactMutation.mutate({
        userAddress: activeAccount.address,
        contactName: newContact.name,
        contactAddress: newContact.address,
      });
    } else {
      // Fallback to local state if not connected
      setContacts(prev => [...prev, newContact]);
      toast.success(`Contact "${newContact.name}" added locally!`);
    }
  };

  const handleSendMoney = (transaction: {
    contact: Contact;
    amount: string;
    note: string;
  }) => {
    // TODO: Integrate with thirdweb/blockchain to actually send the transaction
    console.log("Sending money:", transaction);
    
    // For now, just show a success message or add to transactions
    // In a real app, this would trigger a blockchain transaction
    toast.success(`Sending $${transaction.amount} to ${transaction.contact.name}${transaction.note ? ` with note: "${transaction.note}"` : ""}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header is part of the __root.tsx layout and will include the main ConnectButton */}
      
      {/* Main Content - Updated for responsiveness */}
      <main className="px-4 pt-6 pb-24 sm:pb-8 max-w-4xl mx-auto"> 
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Enhanced Balance Card */}
            <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700">
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 rounded-full"></div>
              <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-white/5 rounded-full"></div>
              
              <CardContent className="relative p-6 text-white">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-white/80 mb-1">Available Balance</p>
                    <h1 className="text-4xl font-bold tracking-tight">$1,250.00</h1>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-white/15 hover:bg-white/25 text-white border-white/20 backdrop-blur-sm transition-all duration-200 font-medium"
                      variant="outline"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Money
                    </Button>
                    <SendMoneyModal 
                      contacts={contacts}
                      onSendMoney={handleSendMoney}
                      trigger={
                        <Button 
                          size="sm" 
                          className="flex-1 bg-white text-purple-600 hover:bg-white/90 font-medium transition-all duration-200 shadow-lg"
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          Send Money
                        </Button>
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Smart Suggestions */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Smart Suggestions</h2>
                <div className="h-1 w-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></div>
              </div>
              <SmartSuggestions />
            </section>

            {/* Enhanced Recent Transactions */}
            <section className="space-y-4 lg:hidden">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Transactions</h2>
                <Link 
                  to="/transactions" 
                  className="text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors duration-200"
                >
                  View All
                </Link>
              </div>
              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 shadow-lg">
                <CardContent className="p-0">
                  <RecentTransactions />
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Enhanced Quick Transfer Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Transfer</h2>
                <AddContactModal 
                  onAddContact={handleAddContact}
                  trigger={
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-purple-600 border-purple-200 hover:bg-purple-50 dark:text-purple-400 dark:border-purple-800 dark:hover:bg-purple-950/20 transition-all duration-200"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Contact
                    </Button>
                  }
                />
              </div>
              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 shadow-lg">
                <CardContent className="p-4">
                  <QuickTransfer contacts={contacts} />
                </CardContent>
              </Card>
            </section>

            {/* Desktop Recent Transactions */}
            <section className="space-y-4 hidden lg:block">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Transactions</h2>
                <Link 
                  to="/transactions" 
                  className="text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors duration-200"
                >
                  View All
                </Link>
              </div>
              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 shadow-lg">
                <CardContent className="p-0">
                  <RecentTransactions />
                </CardContent>
              </Card>
            </section>

            {/* Enhanced Recurring Payments */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recurring Payments</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-sm font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 p-0 h-auto transition-colors duration-200"
                >
                  Manage
                </Button>
              </div>
              <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 shadow-lg">
                <CardContent className="p-4">
                  <RecurringPayments />
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* AI Assistant Button - Renders NebulaIntegration when active */}
      <AIAssistantButton />
    </div>
  );
}
