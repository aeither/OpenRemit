import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CreditCard, Plus } from "lucide-react";
import { useActiveAccount } from "thirdweb/react"; // For checking if wallet is connected
import { AIAssistantButton } from "../components/AIAssistantButton";
import { MobileNav } from "../components/MobileNav";
import { QuickTransfer } from "../components/QuickTransfer";
import { RecentTransactions } from "../components/RecentTransactions";
import { RecurringPayments } from "../components/RecurringPayments";
import { SmartSuggestions } from "../components/SmartSuggestions";
// import { useAuth } from "../hooks/useAuth"; // Removed as not directly relevant and causing error

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  // const auth = useAuth(); // Keep if used for other purposes
  const activeAccount = useActiveAccount();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header is part of the __root.tsx layout and will include the main ConnectButton */}
      {/* The header content provided in the mock (FamilyPay, Bell, Settings) 
          would typically be part of the existing Header.tsx or a new sub-header if desired.
          For now, this HomePage component focuses on the main content area below the global header.
      */}

      {/* Main Content */}
      <main className="flex-1 p-4 pb-20 sm:pb-4"> {/* Added padding-bottom for MobileNav overlap */}
        {/* Balance Card */}
        <Card className="mb-6 bg-primary text-primary-foreground shadow-lg">
          <CardContent className="p-6">
            <div className="mb-2 text-sm font-medium">Available Balance</div>
            {/* TODO: Replace with actual balance data from a hook or API */}
            <div className="mb-4 text-3xl font-bold">$1,250.00</div> 
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" className="flex-1">
                <Plus className="mr-1 h-4 w-4" />
                Add Money
              </Button>
              <Button size="sm" variant="secondary" className="flex-1">
                <CreditCard className="mr-1 h-4 w-4" />
                Send Money
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Smart Suggestions */}
        <section className="mb-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Smart Suggestions</h2>
          <SmartSuggestions />
        </section>

        {/* Quick Transfer Section */}
        <section className="mb-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Quick Transfer</h2>
          <QuickTransfer />
        </section>

        {/* Recent Transactions */}
        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent Transactions</h2>
            <Link to="/transactions" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>
          <RecentTransactions />
        </section>

        {/* Recurring Payments */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recurring Payments</h2>
            {/* TODO: Update this link if /recurring route is created */}
            <Link to="/recurring" className="text-sm text-primary hover:underline">
              Manage
            </Link>
          </div>
          <RecurringPayments />
        </section>
      </main>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* AI Assistant Button - Renders NebulaIntegration when active */}
      <AIAssistantButton />
    </div>
  );
}
