import { NextRequest, NextResponse } from "next/server";
import { createWalletClient, http, parseUnits, formatUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { optimismSepolia } from "viem/chains";
import { config } from "@/lib/config";
import { FLOWSHIELD_ABI } from "@/lib/contracts";

// Request body interface
interface RelayerRequest {
  secretHash: string;
  denomination: number; // Amount in USDC (e.g., 10, 100, 500, 2000)
  recipientAddress: string;
  secret: string; // The original secret for verification
}

// Response interface
interface RelayerResponse {
  success: boolean;
  transactionHash?: string;
  error?: string;
  userAmount?: string; // Amount received by user (98%)
  relayerFee?: string; // Fee taken by relayer (2%)
}

export async function POST(request: NextRequest): Promise<NextResponse<RelayerResponse>> {
  try {
    // Check if relayer is configured
    if (!config.relayerPrivateKey) {
      return NextResponse.json({
        success: false,
        error: "Relayer service is not configured"
      }, { status: 503 });
    }

    // Parse request body
    const body: RelayerRequest = await request.json();
    const { secretHash, denomination, recipientAddress, secret } = body;

    // Validate input parameters
    if (!secretHash || typeof secretHash !== 'string') {
      return NextResponse.json({
        success: false,
        error: "Invalid secret hash"
      }, { status: 400 });
    }

    if (!denomination || typeof denomination !== 'number' || denomination <= 0) {
      return NextResponse.json({
        success: false,
        error: "Invalid denomination"
      }, { status: 400 });
    }

    if (!recipientAddress || typeof recipientAddress !== 'string') {
      return NextResponse.json({
        success: false,
        error: "Invalid recipient address"
      }, { status: 400 });
    }

    if (!secret || typeof secret !== 'string') {
      return NextResponse.json({
        success: false,
        error: "Invalid secret"
      }, { status: 400 });
    }

    // Validate recipient address format (Ethereum address)
    if (!recipientAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      return NextResponse.json({
        success: false,
        error: "Invalid recipient address format"
      }, { status: 400 });
    }

    // Validate secret hash format (32 bytes hex)
    if (!secretHash.match(/^0x[a-fA-F0-9]{64}$/)) {
      return NextResponse.json({
        success: false,
        error: "Invalid secret hash format"
      }, { status: 400 });
    }

    // Create relayer account from private key
    const account = privateKeyToAccount(config.relayerPrivateKey as `0x${string}`);
    
    // Create wallet client
    const walletClient = createWalletClient({
      account,
      chain: optimismSepolia,
      transport: http('https://sepolia.optimism.io'),
    });


    // Convert denomination to wei (USDC has 6 decimals)
    const denominationWei = BigInt(denomination * 10**6);

    // Calculate user amount and relayer fee (98% user, 2% relayer)
    const relayerFeeAmount = (denomination * 0.02).toFixed(2);
    const userAmountValue = (denomination * 0.98).toFixed(2);

    // Submit withdrawal transaction via relayer
    const hash = await walletClient.writeContract({
      address: config.contractAddress as `0x${string}`,
      abi: FLOWSHIELD_ABI,
      functionName: 'withdrawViaRelayer',
      args: [
        secretHash as `0x${string}`,
        denominationWei,
        recipientAddress as `0x${string}`
      ],
    });


    return NextResponse.json({
      success: true,
      transactionHash: hash,
      userAmount: userAmountValue,
      relayerFee: relayerFeeAmount
    });

  } catch (error: any) {
    // Handle specific contract errors
    let errorMessage = "Withdrawal failed";
    
    if (error.message?.includes("SECRET_ALREADY_USED")) {
      errorMessage = "This secret note has already been used";
    } else if (error.message?.includes("DEPOSIT_NOT_FOUND")) {
      errorMessage = "Invalid secret note or deposit not found";
    } else if (error.message?.includes("POOL_NOT_FOUND")) {
      errorMessage = "Pool not found for this denomination";
    } else if (error.message?.includes("INSUFFICIENT_POOL_BALANCE")) {
      errorMessage = "Insufficient balance in the pool";
    } else if (error.message?.includes("execution reverted")) {
      errorMessage = "Transaction reverted - please check your secret note";
    } else if (error.shortMessage) {
      errorMessage = error.shortMessage;
    }

    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 400 });
  }
}

// Handle unsupported methods
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    success: false,
    error: "Method not allowed. Use POST to submit withdrawal requests."
  }, { status: 405 });
}

export async function OPTIONS(): Promise<NextResponse> {
  return NextResponse.json(
    { success: true },
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
