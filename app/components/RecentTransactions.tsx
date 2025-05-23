import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTRPC } from "@/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useActiveAccount } from "thirdweb/react";

export function RecentTransactions() {
  const activeAccount = useActiveAccount();
  const trpc = useTRPC();

  // Fetch real transactions from database
  const { data: dbTransactions = [], isLoading } = useQuery(
    trpc.user.listTransactions.queryOptions({
      userAddress: activeAccount?.address || "",
      limit: 10,
    })
  );

  // Mock transactions for demo purposes (these will be shown alongside real transactions)
  const mockTransactions = [
    {
      id: "mock-1",
      type: "received" as const,
      contactName: "Grandpa",
      contactImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      amount: "100.00",
      note: "Monthly allowance",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: "mock-2", 
      type: "sent" as const,
      contactName: "Mom",
      contactImage: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face",
      amount: "50.00",
      note: "Groceries",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      id: "mock-3",
      type: "received" as const,
      contactName: "Dad", 
      contactImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      amount: "200.00",
      note: "College expenses",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
  ];

  // Combine and sort transactions by date (most recent first)
  const allTransactions = [
    ...dbTransactions,
    ...(activeAccount ? [] : mockTransactions), // Only show mock data when wallet not connected
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Format date for display
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", { 
        month: "short", 
        day: "numeric",
        year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="flex items-center justify-between py-4 px-4 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1 min-w-0">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </div>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-700">
      {allTransactions.length === 0 ? (
        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
          <p>No transactions yet</p>
          <p className="text-sm mt-1">Start sending money to see your transaction history</p>
        </div>
      ) : (
        allTransactions.map((transaction, index) => (
          <div key={transaction.id} className={`flex items-center justify-between py-4 ${index === 0 ? 'pt-4' : ''} ${index === allTransactions.length - 1 ? 'pb-4' : ''} px-4 hover:bg-gray-50/50 dark:hover:bg-slate-700/20 transition-colors duration-200`}>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-12 w-12 border-2 border-white dark:border-slate-700 shadow-sm">
                  <AvatarImage src={transaction.contactImage || `https://api.dicebear.com/7.x/initials/svg?seed=${transaction.contactName}`} alt={transaction.contactName} />
                  <AvatarFallback className="text-sm font-medium">
                    {getInitials(transaction.contactName)}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`absolute -bottom-1 -right-1 rounded-full p-1 shadow-sm ${
                    transaction.type === "received" 
                      ? "bg-emerald-100 dark:bg-emerald-900/70" 
                      : "bg-red-100 dark:bg-red-900/70"
                  }`}
                >
                  {transaction.type === "received" ? (
                    <ArrowDownLeft className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <ArrowUpRight className="h-3 w-3 text-red-600 dark:text-red-400" />
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 dark:text-white">{transaction.contactName}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{transaction.note || "No description"}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatDate(new Date(transaction.createdAt))}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`font-bold text-lg ${
                transaction.type === "received" 
                  ? "text-emerald-600 dark:text-emerald-400" 
                  : "text-red-600 dark:text-red-400"
              }`}>
                {transaction.type === "received" ? "+" : "-"}
                ${transaction.amount}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                {transaction.type}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
} 

