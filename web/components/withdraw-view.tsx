"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Zap } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast as sonnerToast } from "sonner";
import { keccak256, fromHex, parseEther } from "viem";
import { config } from "@/lib/config";
import { FLOWSHIELD_ABI } from "@/lib/contracts";

export function WithdrawView() {
  const [secretNote, setSecretNote] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [useRelayer, setUseRelayer] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { address, isConnected } = useAccount();
  const { data: hash, writeContract, error, isPending } = useWriteContract();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const handleWithdraw = async () => {
    if (!secretNote.trim()) {
      sonnerToast.error("Please enter your secret note.");
      return;
    }

    const noteParts = secretNote.trim().split("-");
    if (noteParts.length !== 3 || noteParts[0] !== "flowshield") {
      sonnerToast.error("Invalid secret note format.");
      return;
    }

    if (useRelayer) {
      await handleRelayerWithdraw();
    } else {
      await handleDirectWithdraw();
    }
  };

  const handleDirectWithdraw = async () => {
    if (!isConnected || !address) {
      sonnerToast.error("Please connect your wallet first.");
      return;
    }

    if (config.contractAddress === "0x0000000000000000000000000000000000000000") {
      sonnerToast.error("Contract not deployed. Please deploy the contract first.");
      return;
    }

    setIsLoading(true);

    try {
      const amount = parseFloat(secretNote.trim().split("-")[1]);
      const secretHex = secretNote.trim().split("-")[2];
      
      // Reconstruct the secret bytes and calculate commitment
      const secret = fromHex(secretHex as `0x${string}`, 'bytes');
      const commitment = keccak256(secret);
      const amountWei = BigInt(amount * 10**6); // USDC has 6 decimals

      // Send transaction
      writeContract({
        address: config.contractAddress as `0x${string}`,
        abi: FLOWSHIELD_ABI,
        functionName: 'withdrawDirect',
        args: [commitment, amountWei],
      });

    } catch (error: any) {
      sonnerToast.error("Failed to prepare withdrawal transaction.");
      setIsLoading(false);
    }
  };

  const handleRelayerWithdraw = async () => {
    if (!recipientAddress.trim()) {
      sonnerToast.error("Please enter a recipient address for relayer withdrawal.");
      return;
    }

    setIsLoading(true);

    try {
      const denomination = parseFloat(secretNote.trim().split("-")[1]);
      const secretHex = secretNote.trim().split("-")[2];
      
      // Reconstruct the secret bytes and calculate commitment
      const secret = fromHex(secretHex as `0x${string}`, 'bytes');
      const secretHash = keccak256(secret);

      // Call relayer API
      const response = await fetch('/api/resolver', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secretHash: secretHash,
          denomination,
          recipientAddress: recipientAddress.trim(),
          secret: secretHex,
        }),
      });

      const data = await response.json();

      if (data.success) {
        sonnerToast.success(
          `Relayer withdrawal successful! You received ${data.userAmount} USDC (${data.relayerFee} USDC fee)`
        );
        setSecretNote("");
        setRecipientAddress("");
      } else {
        sonnerToast.error(data.error || "Relayer withdrawal failed");
      }
    } catch (error: any) {
      sonnerToast.error("Relayer withdrawal failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle transaction status changes
  useEffect(() => {
    if (isConfirmed) {
      sonnerToast.success("Withdrawal successful!");
      setSecretNote("");
      setRecipientAddress("");
      setIsLoading(false);
    }
    if (error) {
      const errorMessage = error.message?.includes("SECRET_ALREADY_USED")
        ? "This secret note has already been used."
        : "Withdrawal failed. Please check the note and try again.";
      sonnerToast.error(errorMessage);
      setIsLoading(false);
    }
  }, [isConfirmed, error]);

  const loading = isLoading || isPending || isConfirming;

  return (
    <Card className="p-6 bg-card border-border">
      <div className="space-y-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-destructive">Security Warning</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Never share your secret note with anyone. Make sure you're withdrawing to a different address than the one
              you deposited from.
            </p>
          </div>
        </div>

        <div>
          <Label htmlFor="secret-note" className="text-base font-semibold mb-2 block">
            Secret Note
          </Label>
          <Textarea
            id="secret-note"
            placeholder="flowshield-xxxxxxxxxxxxxxxxxxxxx"
            value={secretNote}
            onChange={(e) => setSecretNote(e.target.value)}
            className="bg-secondary border-border font-mono text-sm min-h-24 resize-none"
          />
          <p className="text-xs text-muted-foreground mt-2">Enter the secret note you received when depositing</p>
        </div>

        {/* Relayer Option */}
        <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-primary" />
            <div>
              <Label className="text-base font-semibold">Use Relayer Service</Label>
              <p className="text-sm text-muted-foreground">No gas fees required (2% service fee)</p>
            </div>
          </div>
          <Switch
            checked={useRelayer}
            onCheckedChange={setUseRelayer}
          />
        </div>

        <div>
          <Label htmlFor="recipient" className="text-base font-semibold mb-2 block">
            Recipient Address
          </Label>
          <Input
            id="recipient"
            type="text"
            placeholder="0x..."
            value={useRelayer ? recipientAddress : (address || "")}
            onChange={(e) => setRecipientAddress(e.target.value)}
            readOnly={!useRelayer}
            disabled={!useRelayer && !isConnected}
            className="bg-secondary border-border font-mono h-12"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {useRelayer 
              ? "Enter the address where you want to receive your funds"
              : "Funds will be withdrawn to the connected wallet address"
            }
          </p>
        </div>

        <div className="pt-2">
          <Button
            onClick={handleWithdraw}
            disabled={loading || !secretNote || (useRelayer && !recipientAddress) || (!useRelayer && !isConnected)}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-semibold"
          >
            {isConfirming 
              ? "Confirming..." 
              : loading 
                ? "Processing Withdrawal..." 
                : useRelayer 
                  ? "Withdraw via Relayer (2% fee)"
                  : "Withdraw Funds"
            }
          </Button>
        </div>

        <div className="bg-secondary/50 border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Privacy Note:</span> Withdrawals are processed through
            zero-knowledge proofs to ensure your transaction privacy. {useRelayer 
              ? "Relayer service allows withdrawal without gas fees but charges a 2% service fee."
              : "Direct withdrawal requires ETH for gas fees but has no service charges."
            }
          </p>
        </div>
      </div>
    </Card>
  )
}
