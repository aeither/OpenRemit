import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ArrowRight, Calendar, CreditCard, TrendingUp } from "lucide-react";

export function SmartSuggestions() {
  // useState was in the original provided code but 'suggestions' was not set by setSuggestions.
  // If suggestions are dynamic, this should be `useState(initialSuggestions)`. For now, it's static.
  const suggestions = [
    {
      id: 1,
      icon: <CreditCard className="h-5 w-5 text-primary" />,
      title: "Send to Grandpa",
      description: "It's been 2 weeks since your last transfer",
      action: "Send $100",
    },
    {
      id: 2,
      icon: <Calendar className="h-5 w-5 text-primary" />,
      title: "Mom's Birthday",
      description: "Coming up in 3 days",
      action: "Send Gift",
    },
    {
      id: 3,
      icon: <TrendingUp className="h-5 w-5 text-primary" />,
      title: "Exchange Rate Alert",
      description: "Good time to send EUR → USD",
      action: "View Rates",
    },
  ];

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex space-x-4 p-1">
        {suggestions.map((suggestion) => (
          <Card key={suggestion.id} className="min-w-[250px] flex-shrink-0">
            <CardContent className="p-4">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                {suggestion.icon}
              </div>
              <h3 className="font-medium text-foreground">{suggestion.title}</h3>
              <p className="mb-3 text-sm text-muted-foreground min-h-[40px]">{suggestion.description}</p>
              <Button variant="outline" size="sm" className="w-full justify-between">
                {suggestion.action}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
} 