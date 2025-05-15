import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Added TabsContent
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowDownLeft, ArrowLeft, ArrowUpRight, Filter } from "lucide-react";
import { MobileNav } from "../components/MobileNav"; // Adjusted import path

export const Route = createFileRoute("/transactions")({
  component: TransactionsPage,
});

function TransactionsPage() {
  const transactions = [
    {
      id: 1,
      type: "received",
      name: "Grandpa",
      date: "Today, 10:30 AM",
      amount: "$100.00",
      description: "Monthly allowance",
    },
    {
      id: 2,
      type: "sent",
      name: "Mom",
      date: "Yesterday, 3:15 PM",
      amount: "$50.00",
      description: "Groceries",
    },
    {
      id: 3,
      type: "received",
      name: "Dad",
      date: "May 12, 2025",
      amount: "$200.00",
      description: "College expenses",
    },
    {
      id: 4,
      type: "sent",
      name: "Grandma",
      date: "May 10, 2025",
      amount: "$25.00",
      description: "Birthday gift",
    },
    {
      id: 5,
      type: "received",
      name: "Aunt Sarah",
      date: "May 5, 2025",
      amount: "$75.00",
      description: "Graduation gift",
    },
    {
      id: 6,
      type: "sent",
      name: "Brother",
      date: "May 1, 2025",
      amount: "$30.00",
      description: "Shared bill",
    },
  ];

  // Filtered transactions for "Sent" and "Received" tabs
  const sentTransactions = transactions.filter(t => t.type === "sent");
  const receivedTransactions = transactions.filter(t => t.type === "received");

  return (
    <div className="flex min-h-screen flex-col bg-background dark:bg-neutral-950">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-card p-4 dark:border-neutral-800">
        <div className="flex items-center">
          <Link to="/">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold text-foreground">Transaction History</h1>
          <Button variant="ghost" size="icon" className="ml-auto">
            <Filter className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 pb-20 sm:pb-4"> {/* Added padding-bottom for MobileNav overlap */}
        <Tabs defaultValue="all" className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="received">Received</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <Card key={transaction.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center">
                      <div
                        className={`mr-3 rounded-full p-2 ${transaction.type === "received" ? "bg-green-100 dark:bg-green-900/50" : "bg-red-100 dark:bg-red-900/50"}`}
                      >
                        {transaction.type === "received" ? (
                          <ArrowDownLeft className="h-5 w-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{transaction.name}</div>
                        <div className="text-xs text-muted-foreground">{transaction.date}</div>
                        <div className="text-xs text-muted-foreground">{transaction.description}</div>
                      </div>
                    </div>
                    <div className={`font-semibold ${transaction.type === "received" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {transaction.type === "received" ? "+" : "-"}
                      {transaction.amount}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="sent" className="mt-4">
             <div className="space-y-3">
              {sentTransactions.map((transaction) => (
                <Card key={transaction.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center">
                      <div
                        className={'mr-3 rounded-full p-2 bg-red-100 dark:bg-red-900/50'}
                      >
                        <ArrowUpRight className="h-5 w-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{transaction.name}</div>
                        <div className="text-xs text-muted-foreground">{transaction.date}</div>
                        <div className="text-xs text-muted-foreground">{transaction.description}</div>
                      </div>
                    </div>
                    <div className={'font-semibold text-red-600 dark:text-red-400'}>
                      - {transaction.amount}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="received" className="mt-4">
            <div className="space-y-3">
              {receivedTransactions.map((transaction) => (
                <Card key={transaction.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center">
                      <div
                        className={'mr-3 rounded-full p-2 bg-green-100 dark:bg-green-900/50'}
                      >
                        <ArrowDownLeft className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{transaction.name}</div>
                        <div className="text-xs text-muted-foreground">{transaction.date}</div>
                        <div className="text-xs text-muted-foreground">{transaction.description}</div>
                      </div>
                    </div>
                    <div className={'font-semibold text-green-600 dark:text-green-400'}>
                      + {transaction.amount}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  )
} 