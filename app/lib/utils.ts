import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shortenEthAddress(address: string, chars = 4): string {
  if (!address) return '';
  const parsed = address.startsWith('0x') ? address : `0x${address}`;
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(parsed.length - chars)}`;
}
