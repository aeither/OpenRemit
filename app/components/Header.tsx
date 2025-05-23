import { useTRPC } from '@/trpc/react';
import { useMutation } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { useEffect } from 'react';
import { ConnectButton, useActiveAccount } from 'thirdweb/react';
import { mantle, thirdwebClient } from '../lib/thirdweb';

export function Header() {
  const account = useActiveAccount();
  const address = account?.address;
  const isConnected = !!account;

  const trpc = useTRPC();

  // Updated to use upsertUser instead of createUser
  const upsertUserMutation = useMutation(
    trpc.user.upsertUser.mutationOptions({
      onSuccess: (data) => {
        console.log('User upserted successfully:', data.user?.address);
      },
      onError: (error: any) => {
        console.error('Failed to upsert user:', error);
      }
    })
  );

  useEffect(() => {
    if (isConnected && address) {
      // Upsert user when wallet is connected
      upsertUserMutation.mutate({ userAddress: address }); 
    }
  }, [isConnected, address]);

  return (
    <header className="fixed top-0 left-0 right-0 bg-background/90 backdrop-blur-sm z-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex-shrink-0 flex items-center gap-4">
            {/* <button
              onClick={() => window.location.reload()}
              className="p-2 rounded-lg transition-colors hover:bg-black/10 dark:hover:bg-white/10"
            >
              <PenSquare className="w-5 h-5" />
            </button> */}
            <Link to="/" className="text-xl font-bold">
              OpenRemit
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Feedback
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleSubmitFeedback} className="space-y-4">
                  <p className='text-sm text-muted-foreground'>Share your thoughts or report issues!</p>
                  <Textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Your feedback..."
                    required
                    minLength={10} // Add minLength for quality feedback
                  />
                  <Button
                    type="submit"
                    // Disable button while submitting
                    disabled={feedbackMutation.isPending || !feedback.trim()}
                  >
                    {feedbackMutation.isPending ? "Sending..." : "Send Feedback"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog> */}

            <ConnectButton client={thirdwebClient} chains={[mantle]} />
          </div>
        </div>
      </div>
    </header>
  );
}
