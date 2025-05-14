import type { Chain } from "thirdweb/chains";
import { ConnectButton } from "thirdweb/react";
import { client } from "../lib/thirdweb";

interface ConnectWalletProps {
  chains?: Chain[];
}

export function ConnectWallet({ chains }: ConnectWalletProps) {
  return <ConnectButton client={client} chains={chains} />;
} 