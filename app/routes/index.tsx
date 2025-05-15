import { createFileRoute } from "@tanstack/react-router";
import { useActiveAccount } from "thirdweb/react"; // For checking if wallet is connected
import { ConnectWalletButton } from "../components/ConnectWalletButton"; // Adjusted path
import { NebulaIntegration } from "../components/NebulaIntegration"; // Adjusted path
// import { useAuth } from "../hooks/useAuth"; // Removed as not directly relevant and causing error

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  // const auth = useAuth(); // Keep if used for other purposes
  const activeAccount = useActiveAccount();

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <header className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-primary">
          Welcome to OpenRemit with Nebula AI
        </h1>
        <p className="mt-3 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          Seamlessly manage your finances and interact with blockchain using natural language.
          Connect your wallet and start chatting with Nebula AI below.
        </p>
      </header>

      <div className="flex justify-center my-6">
        <ConnectWalletButton />
      </div>

      {activeAccount ? (
        <NebulaIntegration />
      ) : (
        <div className="text-center p-6 border rounded-lg bg-card text-card-foreground">
          <p className="text-lg font-medium">
            Please connect your wallet to start interacting with Nebula AI.
          </p>
        </div>
      )}

      {/* Example existing link, commented out to resolve linter error */}
      {/* <div className="text-center mt-12">
        <Button asChild variant="outline">
          <Link to="/about" className="text-lg">
            Learn More About Us
          </Link>
        </Button>
      </div> */}

      {/* Removed auth specific content for clarity on Nebula integration */}
      {/* <div className="flex flex-col items-center gap-4">
        {auth.user ? (
          <p>
            Logged in as <strong>{auth.user.email}</strong>
          </p>
        ) : null}
        <Button asChild>
          <Link to={auth.user ? "/app" : "/login"}>
            {auth.user ? "Go to App" : "Login"}
          </Link>
        </Button>
      </div> */}
    </div>
  );
}
