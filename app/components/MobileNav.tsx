import { Link } from "@tanstack/react-router"; // Changed from next/link
import { History, Home, Settings } from "lucide-react";

export function MobileNav() {
  return (
    <nav className="sticky bottom-0 z-10 border-t bg-white dark:bg-neutral-900 dark:border-neutral-800">
      <div className="grid grid-cols-3">
        <Link to="/" className="flex flex-col items-center justify-center p-3 text-primary aria-[current=page]:text-primary aria-[current=page]:font-semibold">
          <Home className="h-5 w-5" />
          <span className="mt-1 text-xs">Home</span>
        </Link>
        {/* TODO: Update links to actual transaction/history pages if they exist */}
        <Link to="/transactions" className="flex flex-col items-center justify-center p-3 text-muted-foreground hover:text-primary aria-[current=page]:text-primary aria-[current=page]:font-semibold">
          <History className="h-5 w-5" />
          <span className="mt-1 text-xs">History</span>
        </Link>
        <Link to="/settings" className="flex flex-col items-center justify-center p-3 text-muted-foreground hover:text-primary aria-[current=page]:text-primary aria-[current=page]:font-semibold">
          <Settings className="h-5 w-5" />
          <span className="mt-1 text-xs">Settings</span>
        </Link>
      </div>
    </nav>
  );
} 