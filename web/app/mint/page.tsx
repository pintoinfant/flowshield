"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coins, ExternalLink, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { useAccount, useBalance } from "wagmi";
import { toast } from "sonner";
import { config } from "@/lib/config";
import { Header } from "@/components/header";
import Link from "next/link";

const PRESET_AMOUNTS = [
  { amount: 100, label: "100 USDC", popular: false },
  { amount: 500, label: "500 USDC", popular: true },
  { amount: 1000, label: "1000 USDC", popular: false },
  { amount: 2500, label: "2500 USDC", popular: false },
];

export default function MintPage() {
  const [selectedAmount, setSelectedAmount] = useState(500);
  const [customAmount, setCustomAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mintResult, setMintResult] = useState<{
    success: boolean;
    transactionHash?: string;
    message?: string;
    error?: string;
  } | null>(null);

  const { address, isConnected, chain } = useAccount();
  const { data: usdcBalance, refetch: refetchBalance } = useBalance({
    address: address,
    token: config.tokenAddress as `0x${string}`,
  });

  // Check if connected to correct network
  const isCorrectNetwork = chain?.id === 11155420; // Optimism Sepolia

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
    setMintResult(null);
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(0);
    setMintResult(null);
  };

  const getCurrentAmount = () => {
    return customAmount ? parseFloat(customAmount) : selectedAmount;
  };

  const handleMint = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!isCorrectNetwork) {
      toast.error("Please switch to Optimism Sepolia network");
      return;
    }

    const amount = getCurrentAmount();
    
    if (!amount || amount <= 0 || amount > 5000) {
      toast.error("Please enter a valid amount between 1 and 5000 USDC");
      return;
    }

    setIsLoading(true);
    setMintResult(null);

    try {
      const response = await fetch('/api/mint-usdc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          amount,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMintResult({
          success: true,
          transactionHash: data.transactionHash,
          message: data.message,
        });
        toast.success(`Successfully minted ${amount} USDC!`);
        
        // Refresh balance after successful mint
        setTimeout(() => {
          refetchBalance();
        }, 2000);
      } else {
        setMintResult({
          success: false,
          error: data.error || 'Minting failed',
        });
        toast.error(data.error || 'Minting failed');
      }
    } catch (error) {
      const errorMessage = 'Network error. Please try again.';
      setMintResult({
        success: false,
        error: errorMessage,
      });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatUsdcBalance = (balance: any) => {
    if (!balance || !balance.value) return "0.00";
    const usdcValue = Number(balance.value) / 1000000; // 6 decimals
    return usdcValue.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Coins className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Mint Test USDC</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Get free USDC tokens for testing on Optimism Sepolia
          </p>
          <Badge variant="outline" className="text-sm">
            Testnet Only • No Gas Fees Required
          </Badge>
        </div>

        {/* Network Warning */}
        {isConnected && !isCorrectNetwork && (
          <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Wrong Network</span>
              </div>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Please switch to Optimism Sepolia network to mint USDC
              </p>
            </CardContent>
          </Card>
        )}

        {/* Current Balance */}
        {isConnected && isCorrectNetwork && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current USDC Balance</span>
                <span className="text-lg font-bold">
                  {formatUsdcBalance(usdcBalance)} USDC
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mint Interface */}
        <Card>
          <CardHeader>
            <CardTitle>Select Amount to Mint</CardTitle>
            <CardDescription>
              Choose from preset amounts or enter a custom amount (max 5,000 USDC)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Preset Amounts */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Quick Select</Label>
              <div className="grid grid-cols-2 gap-3">
                {PRESET_AMOUNTS.map((preset) => (
                  <button
                    key={preset.amount}
                    onClick={() => handleAmountSelect(preset.amount)}
                    className={`
                      relative p-4 rounded-lg border-2 transition-all
                      ${
                        selectedAmount === preset.amount && !customAmount
                          ? "border-primary bg-primary/10"
                          : "border-border bg-secondary hover:border-primary/50"
                      }
                    `}
                  >
                    {preset.popular && (
                      <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
                        Popular
                      </Badge>
                    )}
                    <div className="text-lg font-semibold">{preset.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div>
              <Label htmlFor="custom-amount" className="text-base font-semibold mb-2 block">
                Custom Amount
              </Label>
              <div className="relative">
                <Input
                  id="custom-amount"
                  type="number"
                  placeholder="Enter custom amount"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  className="pr-16 text-lg h-12"
                  min="1"
                  max="5000"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                  USDC
                </span>
              </div>
            </div>

            {/* Mint Button */}
            <Button
              onClick={handleMint}
              disabled={isLoading || !isConnected || !isCorrectNetwork || getCurrentAmount() <= 0}
              className="w-full h-12 text-base font-semibold"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 animate-spin" />
                  Minting...
                </div>
              ) : (
                `Mint ${getCurrentAmount()} USDC`
              )}
            </Button>

            {/* Result Display */}
            {mintResult && (
              <Card className={`${mintResult.success ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'}`}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    {mintResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className={`font-medium ${mintResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                        {mintResult.success ? 'Mint Successful!' : 'Mint Failed'}
                      </p>
                      <p className={`text-sm mt-1 ${mintResult.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                        {mintResult.message || mintResult.error}
                      </p>
                      {mintResult.transactionHash && (
                        <Link
                          href={`https://sepolia-optimistic.etherscan.io/tx/${mintResult.transactionHash}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2"
                        >
                          View Transaction <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Important Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <span className="font-medium text-foreground">Network:</span>
              <span>Optimism Sepolia Testnet only</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-foreground">Rate Limit:</span>
              <span>3 mints per hour per address</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-foreground">Max Amount:</span>
              <span>5,000 USDC per mint</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-foreground">Gas Fees:</span>
              <span>None required - completely free!</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-medium text-foreground">Purpose:</span>
              <span>Testing FlowShield privacy deposits only</span>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="text-center">
          <Link href="/shield">
            <Button variant="outline" className="gap-2">
              Go to FlowShield App
            </Button>
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
}
