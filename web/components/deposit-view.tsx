"use client";

declare global {
  interface Window {
    ethereum?: any;
  }
}

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { SecretNoteModal } from "@/components/secret-note-modal";
import { Check } from "lucide-react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast as sonnerToast } from "sonner";
import { sha256 } from "js-sha256";
import { keccak256, toHex, parseEther } from "viem";
import { config } from "@/lib/config";
import { FLOWSHIELD_ABI, ERC20_ABI } from "@/lib/contracts";

const POOLS = [
  { amount: 10, label: "10 USDC", enabled: true },
  { amount: 100, label: "100 USDC", enabled: true },
  { amount: 500, label: "500 USDC", enabled: true },
  { amount: 2000, label: "2000 USDC", enabled: true },
];

export function DepositView() {
  const [selectedPool, setSelectedPool] = useState<number | null>(10);
  const [customAmount, setCustomAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSecretModal, setShowSecretModal] = useState(false);
  const [secretNote, setSecretNote] = useState("");
  const [currentStep, setCurrentStep] = useState<'idle' | 'approving' | 'depositing'>('idle');
  
  const { address, isConnected } = useAccount();
  const { data: hash, writeContract, error, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const handleDeposit = async () => {
    if (!isConnected || !address) {
      sonnerToast.error("Please connect your wallet first.");
      return;
    }

    const amount = selectedPool;

    if (!amount) {
      sonnerToast.error("Please select a pool to deposit.");
      return;
    }

    if (config.contractAddress === "0x0000000000000000000000000000000000000000") {
      sonnerToast.error("Contract not deployed. Please deploy the contract first.");
      return;
    }

    setIsLoading(true);
    setCurrentStep('approving');

    try {
      // First, try to add USDC token to MetaMask for better UX
      if (window.ethereum) {
        try {
          await window.ethereum.request({
            method: 'wallet_watchAsset',
            params: {
              type: 'ERC20',
              options: {
                address: config.tokenAddress,
                symbol: 'USDC',
                decimals: 6,
                image: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
              },
            },
          });
        } catch (error) {
          // Ignore if user rejects adding token
        }
      }

      // Amount in USDC wei (6 decimals)
      const amountWei = BigInt(amount * 10**6);
      
      sonnerToast.info("Step 1/2: Approving USDC spending...");
      sonnerToast.info(`Note: Approving ${amount} USDC (MetaMask may show large numbers due to decimal differences)`);
      
      // Step 1: Approve USDC spending
      writeContract({
        address: config.tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [config.contractAddress as `0x${string}`, amountWei],
      });

    } catch (error) {
      sonnerToast.error("Failed to prepare approval transaction.");
      setIsLoading(false);
      setCurrentStep('idle');
    }
  };

  const handleDepositAfterApproval = async () => {
    const amount = selectedPool!;
    setCurrentStep('depositing');
    
    try {
      // Generate secret and hash
      const secret = crypto.getRandomValues(new Uint8Array(32));
      const secretHash = keccak256(secret);

      // Create secret note
      const note = `flowshield-${amount}-${toHex(secret)}`;
      setSecretNote(note);

      // Amount in USDC wei (6 decimals)
      const amountWei = BigInt(amount * 10**6);
      
      sonnerToast.info("Step 2/2: Depositing to pool...");
      
      // Step 2: Deposit to pool
      writeContract({
        address: config.contractAddress as `0x${string}`,
        abi: FLOWSHIELD_ABI,
        functionName: 'deposit',
        args: [secretHash, amountWei],
      });

    } catch (error) {
      sonnerToast.error("Failed to prepare deposit transaction.");
      setIsLoading(false);
      setCurrentStep('idle');
    }
  };

  // Handle transaction status changes
  useEffect(() => {
    if (isConfirmed) {
      if (currentStep === 'approving') {
        sonnerToast.success("USDC spending approved!");
        // Automatically proceed to deposit
        handleDepositAfterApproval();
      } else if (currentStep === 'depositing') {
        setShowSecretModal(true);
        sonnerToast.success("Deposit successful!");
        setIsLoading(false);
        setCurrentStep('idle');
      }
    }
    if (error) {
      sonnerToast.error(
        currentStep === 'approving' 
          ? "Approval failed. Please try again." 
          : "Deposit failed. Please try again."
      );
      setIsLoading(false);
      setCurrentStep('idle');
    }
  }, [isConfirmed, error, currentStep]);

  const loading = isLoading || isPending || isConfirming;

  return (
    <>
      <Card className="p-6 bg-card border-border">
        <div className="space-y-6">
          <div>
            <Label className="text-base font-semibold mb-3 block">Select Pool Amount</Label>
            <div className="grid grid-cols-2 gap-3">
              {POOLS.map((pool) => (
                <button
                  key={pool.amount}
                  onClick={() => {
                    if (pool.enabled) {
                      setSelectedPool(pool.amount);
                      setCustomAmount("");
                    }
                  }}
                  disabled={!pool.enabled}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all
                    ${
                      selectedPool === pool.amount
                        ? "border-primary bg-primary/10"
                        : "border-border bg-secondary"
                    }
                    ${
                      pool.enabled
                        ? "cursor-pointer hover:border-primary/50"
                        : "cursor-not-allowed opacity-50"
                    }
                  `}
                >
                  {!pool.enabled && (
                    <Badge
                      variant="secondary"
                      className="absolute top-2 right-2"
                    >
                      Soon
                    </Badge>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold">{pool.label}</span>
                    {selectedPool === pool.amount && <Check className="w-5 h-5 text-primary" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <div className="relative">
            <Label htmlFor="custom-amount" className="text-base font-semibold mb-2 block">
              Custom Amount
            </Label>
            <div className="flex items-center gap-2">
              <div className="relative flex-grow">
                <Input
                  id="custom-amount"
                  type="number"
                  placeholder="0.00"
                  value={customAmount}
                  disabled
                  className="pr-16 bg-secondary border-border text-lg h-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                  USDC
                </span>
              </div>
              <Badge variant="outline" className="h-fit">
                Soon
              </Badge>
            </div>
          </div>

          <div className="pt-2">
            <Button
              onClick={handleDeposit}
              disabled={loading || !selectedPool || !isConnected}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-semibold"
            >
              {currentStep === 'approving' && isConfirming 
                ? "Confirming Approval..." 
                : currentStep === 'depositing' && isConfirming
                ? "Confirming Deposit..."
                : currentStep === 'depositing'
                ? "Preparing Deposit..."
                : loading 
                ? "Processing..." 
                : "Approve & Deposit"}
            </Button>
          </div>

          <div className="bg-secondary/50 border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">How it works:</span> The deposit process requires 2 transactions:
              <br />1. <strong>Approve</strong> - Allow FlowShield to spend your USDC
              <br />2. <strong>Deposit</strong> - Transfer USDC to the privacy pool
              <br /><br />
              <span className="font-semibold text-foreground">MetaMask Note:</span> The approval amount may appear as a large number in MetaMask due to decimal differences between ETH (18) and USDC (6). The actual approval is for the correct USDC amount shown above.
              <br /><br />
              After depositing, you will receive a secret note. Keep this note safe - you will need it to withdraw your funds to a different address.
            </p>
          </div>
        </div>
      </Card>

      <SecretNoteModal isOpen={showSecretModal} onClose={() => setShowSecretModal(false)} secretNote={secretNote} />
    </>
  )
}
