import { NextRequest, NextResponse } from 'next/server';
import { createWalletClient, http, parseEther, isAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { optimismSepolia } from 'viem/chains';
import { ERC20_ABI } from '@/lib/contracts';
import { config } from '@/lib/config';

// Rate limiting - store in memory (in production, use Redis or database)
const rateLimit = new Map<string, { lastMint: number; count: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_MINTS_PER_WINDOW = 3;
const MAX_MINT_AMOUNT = 5000; // Max 5000 USDC per mint

export async function POST(request: NextRequest) {
  try {
    const { address, amount } = await request.json();

    // Validate input
    if (!address || !isAddress(address)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    if (!amount || isNaN(amount) || amount <= 0 || amount > MAX_MINT_AMOUNT) {
      return NextResponse.json({ 
        error: `Invalid amount. Must be between 1 and ${MAX_MINT_AMOUNT} USDC` 
      }, { status: 400 });
    }

    // Rate limiting
    const now = Date.now();
    const userLimit = rateLimit.get(address.toLowerCase()) || { lastMint: 0, count: 0 };
    
    // Reset count if window has passed
    if (now - userLimit.lastMint > RATE_LIMIT_WINDOW) {
      userLimit.count = 0;
    }

    if (userLimit.count >= MAX_MINTS_PER_WINDOW) {
      const timeLeft = Math.ceil((RATE_LIMIT_WINDOW - (now - userLimit.lastMint)) / 1000 / 60);
      return NextResponse.json({ 
        error: `Rate limit exceeded. Try again in ${timeLeft} minutes.` 
      }, { status: 429 });
    }

    // Check if relayer key is configured
    if (!config.relayerPrivateKey) {
      return NextResponse.json({ 
        error: 'Minting service not configured' 
      }, { status: 500 });
    }

    // Set up wallet client
    const account = privateKeyToAccount(config.relayerPrivateKey as `0x${string}`);
    const walletClient = createWalletClient({
      account,
      chain: optimismSepolia,
      transport: http('https://sepolia.optimism.io'),
    });

    // Convert amount to USDC wei (6 decimals)
    const amountWei = BigInt(amount * 10**6);

    // Mint USDC to the user's address
    const hash = await walletClient.writeContract({
      address: config.tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'mint',
      args: [address as `0x${string}`, amountWei],
    });

    // Update rate limiting
    userLimit.count += 1;
    userLimit.lastMint = now;
    rateLimit.set(address.toLowerCase(), userLimit);

    return NextResponse.json({ 
      success: true, 
      transactionHash: hash,
      amount,
      message: `Successfully minted ${amount} USDC to ${address}`
    });

  } catch (error: any) {
    console.error('USDC minting error:', error);
    
    // Handle specific error types
    if (error.message?.includes('insufficient funds')) {
      return NextResponse.json({ 
        error: 'Minting service temporarily unavailable (insufficient relayer funds)' 
      }, { status: 503 });
    }
    
    if (error.message?.includes('User denied')) {
      return NextResponse.json({ 
        error: 'Transaction was rejected' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Failed to mint USDC. Please try again later.' 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'USDC Minting API for Optimism Sepolia Testnet',
    maxAmount: MAX_MINT_AMOUNT,
    rateLimit: `${MAX_MINTS_PER_WINDOW} mints per hour`,
    supportedNetwork: 'Optimism Sepolia (Chain ID: 11155420)',
  });
}
