"use client";

import { Button } from "@/components/ui/button";
import { Wallet, Shield } from "lucide-react";
import { useAccount, useConnect, useDisconnect, useBalance } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { config } from "@/lib/config";
import { shortenAddress } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function Header() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { data: ethBalance } = useBalance({
    address: address,
  });

  const { data: usdcBalance } = useBalance({
    address: address,
    token: config.tokenAddress as `0x${string}`,
  });

  // Format USDC balance correctly (6 decimals instead of 18)
  const formatUsdcBalance = (balance: any) => {
    if (!balance || !balance.value) return "0.00";
    // USDC has 6 decimals, so divide by 10^6 instead of 10^18
    const usdcValue = Number(balance.value) / 1000000; // 10^6
    return usdcValue.toFixed(2);
  };


  const router = useRouter();

  const handleDisconnect = () => {
    disconnect();
    toast.success("Wallet disconnected");
    // Navigate to landing page after disconnect
    router.push("/");
  };

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success("Address copied to clipboard");
    }
  };

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">FlowShield</span>
          </Link>
          
          {isConnected && (
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/shield" className="text-sm font-medium hover:text-primary transition-colors">
                Shield
              </Link>
              <Link href="/mint" className="text-sm font-medium hover:text-primary transition-colors">
                Mint USDC
              </Link>
              {/* <Link href="/analytics" className="text-sm font-medium hover:text-primary transition-colors">
                Analytics
              </Link> */}
            </nav>
          )}
        </div>

        {isConnected && address ? (
          <div className="flex items-center gap-3">
            <div
              className="px-3 py-2 bg-secondary rounded-lg border border-border cursor-pointer"
              onClick={handleCopyAddress}
            >
              <span className="text-sm font-mono">
                {ethBalance ? `${parseFloat(ethBalance.formatted).toFixed(4)} ${ethBalance.symbol}` : "0.0000 ETH"} |{" "}
                {formatUsdcBalance(usdcBalance)} USDC |{" "}
                {shortenAddress(address)}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={handleDisconnect}>
              Disconnect
            </Button>
          </div>
        ) : (
          <ConnectButton.Custom>
            {({ openConnectModal, connectModalOpen }) => {
              return (
                <Button 
                  onClick={openConnectModal} 
                  disabled={connectModalOpen}
                  className="flex items-center gap-2"
                >
                  <Wallet className="w-4 h-4" />
                  Connect Wallet
                </Button>
              );
            }}
          </ConnectButton.Custom>
        )}
      </div>
    </header>
  );
}
