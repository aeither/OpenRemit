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
      icon: <CreditCard className="h-5 w-5 text-purple-600" />,
      title: "Send to Grandpa",
      description: "It's been 2 weeks since your last transfer",
      action: "Send $100",
      gradient: "from-purple-500/10 to-indigo-500/10",
      iconBg: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      id: 2,
      icon: <Calendar className="h-5 w-5 text-pink-600" />,
      title: "Mom's Birthday",
      description: "Coming up in 3 days",
      action: "Send Gift",
      gradient: "from-pink-500/10 to-rose-500/10",
      iconBg: "bg-pink-100 dark:bg-pink-900/30",
    },
    {
      id: 3,
      icon: <TrendingUp className="h-5 w-5 text-emerald-600" />,
      title: "Exchange Rate Alert",
      description: "Good time to send EUR → USD",
      action: "View Rates",
      gradient: "from-emerald-500/10 to-teal-500/10",
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
    },
  ];

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex space-x-4 p-1">
        {suggestions.map((suggestion) => (
          <Card 
            key={suggestion.id} 
            className={`min-w-[280px] flex-shrink-0 border-0 shadow-lg bg-gradient-to-br ${suggestion.gradient} bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105`}
          >
            <CardContent className="p-5">
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${suggestion.iconBg} shadow-sm`}>
                {suggestion.icon}
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 dark:text-white text-base">{suggestion.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 min-h-[40px] leading-relaxed">
                  {suggestion.description}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-between mt-4 border-gray-200 dark:border-gray-700 hover:bg-white/50 dark:hover:bg-slate-700/50 font-medium transition-all duration-200"
              >
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