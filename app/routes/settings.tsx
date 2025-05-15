import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
    ArrowLeft,
    Bell,
    Bot,
    CreditCard,
    Globe,
    HelpCircle,
    Lock,
    LogOut,
    User,
} from "lucide-react";
import * as React from "react"; // Import React for JSX types
import { MobileNav } from "../components/MobileNav"; // Adjusted import path

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

// Define a type for individual setting items
interface SettingItem {
  icon: React.ReactNode; // Changed from JSX.Element to React.ReactNode
  label: string;
  href: string; // We'll keep these as strings, TanStack Router will handle them
  toggle?: boolean;
  checked?: boolean;
  description?: string;
  danger?: boolean;
}

// Define a type for setting groups
interface SettingsGroup {
  title: string;
  items: SettingItem[];
}

function SettingsPage() {
  const settingsGroups: SettingsGroup[] = [
    {
      title: "Account",
      items: [
        {
          icon: <User className="h-5 w-5 text-muted-foreground" />,
          label: "Profile Information",
          href: "/settings/profile",
        },
        {
          icon: <Lock className="h-5 w-5 text-muted-foreground" />,
          label: "Security & Privacy",
          href: "/settings/security",
        },
        {
          icon: <CreditCard className="h-5 w-5 text-muted-foreground" />,
          label: "Payment Methods",
          href: "/settings/payment-methods",
        },
      ],
    },
    {
      title: "AI Features",
      items: [
        {
          icon: <Bot className="h-5 w-5 text-muted-foreground" />,
          label: "AI Assistant Settings",
          href: "/settings/ai", // Changed from /ai-help to be under settings path
        },
        {
          icon: <Bell className="h-5 w-5 text-muted-foreground" />,
          label: "Smart Notifications",
          href: "/settings/notifications", // This might conflict with the one below, consider merging
          toggle: true,
          checked: true, // Default value, actual state would come from user preferences
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          icon: <Bell className="h-5 w-5 text-muted-foreground" />,
          label: "Notifications",
          href: "/settings/notifications",
          toggle: true,
          checked: true, // Default value
        },
        {
          icon: <Globe className="h-5 w-5 text-muted-foreground" />,
          label: "Currency Preferences",
          href: "/settings/currency",
          description: "USD", // This would likely come from user settings
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          icon: <HelpCircle className="h-5 w-5 text-muted-foreground" />,
          label: "Help Center",
          href: "/settings/help",
        },
        {
          icon: <LogOut className="h-5 w-5 text-muted-foreground" />,
          label: "Sign Out",
          href: "/logout", // This should probably trigger a sign-out action, not just navigate
          danger: true,
        },
      ],
    },
  ];

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
          <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 pb-20 sm:pb-4"> {/* Added padding-bottom for MobileNav overlap */}
        {settingsGroups.map((group, index) => (
          <div key={index} className="mb-6">
            <h2 className="mb-2 text-sm font-medium text-muted-foreground">
              {group.title}
            </h2>
            <div className="overflow-hidden rounded-lg border bg-card dark:border-neutral-800">
              {group.items.map((item, itemIndex) => (
                <Link
                  to={item.href}
                  key={itemIndex}
                  className={`flex items-center justify-between border-b p-4 last:border-b-0 dark:border-neutral-700 ${
                    item.danger ? "text-red-500 hover:bg-red-500/10" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center">
                    <div className="mr-3 text-muted-foreground">{item.icon}</div>
                    <div>
                      <div className={`font-medium ${item.danger ? "text-red-500" : "text-foreground"}`}>{item.label}</div>
                      {item.description && (
                        <div className="text-xs text-muted-foreground">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </div>
                  {item.toggle ? (
                    <Switch 
                        checked={item.checked} 
                        onClick={(e: React.MouseEvent) => {
                            e.preventDefault(); 
                            // Add state update logic here in a real app
                        }}
                        aria-label={item.label}
                    />
                  ) : (
                    <div className="text-muted-foreground">›</div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>OpenRemit v1.0.0</p> {/* Changed from FamilyPay */}
          <p className="mt-1">© 2024 OpenRemit. All rights reserved.</p> {/* Changed from FamilyPay and year*/}
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
} 