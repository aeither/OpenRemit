import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export function RecurringPayments() {
  const recurringPayments = [
    {
      id: 1,
      name: "Grandma",
      amount: "$75.00",
      frequency: "Monthly",
      nextDate: "Jun 1, 2025",
    },
    {
      id: 2,
      name: "Sister's Tuition",
      amount: "$250.00",
      frequency: "Quarterly",
      nextDate: "Jul 15, 2025",
    },
  ];

  return (
    <div className="space-y-3">
      {recurringPayments.map((payment) => (
        <Card key={payment.id}>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <div className="mr-3 rounded-full bg-blue-100 dark:bg-blue-900/50 p-2">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="font-medium text-foreground">{payment.name}</div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {payment.frequency}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Next: {payment.nextDate}</span>
                </div>
              </div>
            </div>
            <div className="font-semibold text-foreground">{payment.amount}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 