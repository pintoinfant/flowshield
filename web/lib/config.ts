// Shared configuration for FlowShield protocol - designed to be chain-agnostic
export const config = {
  // Public environment variables (accessible on client-side)
  contractAddress: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000",
  tokenAddress: process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "0xA0b86991c31cc4aa553b2345c4dE16Fb4aD1e22E8", // Default to USDC
  defaultChainId: parseInt(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID || "1"), // Ethereum mainnet default
  relayerFeePercentage: parseFloat(process.env.NEXT_PUBLIC_RELAYER_FEE_PERCENTAGE || "0.1"), // 0.1% default
  
  // Token configuration
  tokenSymbol: process.env.NEXT_PUBLIC_TOKEN_SYMBOL || "USDC",
  tokenDecimals: parseInt(process.env.NEXT_PUBLIC_TOKEN_DECIMALS || "6"),
  
  // Server-side only environment variables
  relayerPrivateKey: process.env.RELAYER_PRIVATE_KEY,
  rpcUrl: process.env.RPC_URL,
  
  // Supported EVM chains configuration
  supportedChains: {
    1: { name: "Ethereum", symbol: "ETH", explorer: "https://etherscan.io" },
    137: { name: "Polygon", symbol: "MATIC", explorer: "https://polygonscan.com" },
    42161: { name: "Arbitrum", symbol: "ETH", explorer: "https://arbiscan.io" },
    10: { name: "Optimism", symbol: "ETH", explorer: "https://optimistic.etherscan.io" },
    56: { name: "BSC", symbol: "BNB", explorer: "https://bscscan.com" },
    8453: { name: "Base", symbol: "ETH", explorer: "https://basescan.org" },
    43114: { name: "Avalanche", symbol: "AVAX", explorer: "https://snowtrace.io" },
    250: { name: "Fantom", symbol: "FTM", explorer: "https://ftmscan.com" },
    11155111: { name: "Sepolia", symbol: "ETH", explorer: "https://sepolia.etherscan.io" },
    11155420: { name: "Optimism Sepolia", symbol: "ETH", explorer: "https://sepolia-optimistic.etherscan.io" }
  },
  
  // Default pool denominations (can be customized per deployment)
  poolDenominations: [
    { amount: 10, label: "10", wei: "10000000" }, // 10 tokens (6 decimals default)
    { amount: 100, label: "100", wei: "100000000" }, // 100 tokens
    { amount: 500, label: "500", wei: "500000000" }, // 500 tokens
    { amount: 2000, label: "2000", wei: "2000000000" }, // 2000 tokens
  ],
  
  // Helper functions for chain detection and configuration
  getCurrentChain() {
    if (typeof window !== "undefined" && window.ethereum) {
      // Try to get current chain from wallet
      return window.ethereum.chainId ? parseInt(window.ethereum.chainId, 16) : this.defaultChainId;
    }
    return this.defaultChainId;
  },
  
  getChainInfo(chainId?: number) {
    const id = chainId || this.getCurrentChain();
    return this.supportedChains[id as keyof typeof this.supportedChains] || {
      name: "Unknown Chain",
      symbol: "ETH",
      explorer: "#"
    };
  },
  
  getTokenDisplayAmount(wei: string | number): string {
    const amount = typeof wei === "string" ? parseInt(wei) : wei;
    return (amount / Math.pow(10, this.tokenDecimals)).toString();
  },
  
  getTokenWeiAmount(displayAmount: number): string {
    return (displayAmount * Math.pow(10, this.tokenDecimals)).toString();
  },
  
  // Validate required environment variables
  validate() {
    const warnings = [];
    
    if (!this.contractAddress || this.contractAddress === "0x0000000000000000000000000000000000000000") {
      warnings.push("NEXT_PUBLIC_CONTRACT_ADDRESS not configured - using placeholder");
    }
    
    if (!this.tokenAddress || this.tokenAddress === "0x0000000000000000000000000000000000000000") {
      warnings.push("NEXT_PUBLIC_TOKEN_ADDRESS not configured - using default USDC");
    }
    
    if (typeof window === "undefined") {
      // Server-side validation
      if (!this.relayerPrivateKey) {
        warnings.push("RELAYER_PRIVATE_KEY not configured - relayer functionality will be disabled");
      }
      
      if (!this.rpcUrl) {
        warnings.push("RPC_URL not configured - blockchain queries may fail");
      }
    }
    
    if (warnings.length > 0) {
      console.warn("FlowShield Configuration Warnings:", warnings);
    }
    
    return true;
  }
} as const;

// Legacy aliases for backward compatibility
export const usdcAddress = config.tokenAddress;

// Validate configuration on import
config.validate();
