import { Card, CardContent } from "@/components/ui/card";
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
  ];

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <Card key={transaction.id}>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <div
                className={`mr-3 rounded-full p-2 text-sm ${transaction.type === "received" ? "bg-green-100 dark:bg-green-900/50" : "bg-red-100 dark:bg-red-900/50"}`}
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
  );
} 