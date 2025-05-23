import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

export function RecentTransactions() {
  const transactions = [
    {
      id: 1,
      type: "received",
      name: "Grandpa",
      date: "Today, 10:30 AM",
      amount: "$100.00",
      description: "Monthly allowance",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: 2,
      type: "sent",
      name: "Mom",
      date: "Yesterday, 3:15 PM",
      amount: "$50.00",
      description: "Groceries",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    },
    {
      id: 3,
      type: "received",
      name: "Dad",
      date: "May 12, 2025",
      amount: "$200.00",
      description: "College expenses",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-700">
      {transactions.map((transaction, index) => (
        <div key={transaction.id} className={`flex items-center justify-between py-4 ${index === 0 ? 'pt-4' : ''} ${index === transactions.length - 1 ? 'pb-4' : ''} px-4 hover:bg-gray-50/50 dark:hover:bg-slate-700/20 transition-colors duration-200`}>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-12 w-12 border-2 border-white dark:border-slate-700 shadow-sm">
                <AvatarImage src={transaction.avatar} alt={transaction.name} />
                <AvatarFallback className="text-sm font-medium">
                  {getInitials(transaction.name)}
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
              <div className="font-semibold text-gray-900 dark:text-white">{transaction.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{transaction.description}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">{transaction.date}</div>
            </div>
          </div>
          <div className="text-right">
            <div className={`font-bold text-lg ${
              transaction.type === "received" 
                ? "text-emerald-600 dark:text-emerald-400" 
                : "text-red-600 dark:text-red-400"
            }`}>
              {transaction.type === "received" ? "+" : "-"}
              {transaction.amount}
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500 capitalize">
              {transaction.type}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 