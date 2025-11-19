import { createPublicClient, http, parseAbiItem } from "viem";
import { optimismSepolia } from "viem/chains";
import { config } from "./config";

// Initialize Optimism Sepolia client
const publicClient = createPublicClient({
  chain: optimismSepolia,
  transport: http('https://sepolia.optimism.io'),
});

// FlowShield contract events
const DEPOSIT_EVENT = parseAbiItem('event Deposit(uint256 indexed poolId, uint256 indexed leafIndex, uint256 amount)');
const WITHDRAWAL_EVENT = parseAbiItem('event Withdrawal(address indexed recipient, uint256 amount)');

export interface PoolUsage {
  denomination: number;
  count: number;
  percentage: number;
}

export interface PrivacyStats {
  totalDeposits: number;
  depositsThisMonth: number;
  totalMixed: number;
  averageAnonymitySet: number;
  daysSinceLastActivity: number;
  poolUsage: PoolUsage[];
  privacyScore: number;
}

export interface AddressInteraction {
  address: string;
  transactionCount: number;
  totalValue: number;
  lastInteraction: string;
  label?: string;
}

export interface TransactionData {
  hash: string;
  timestamp: string;
  type: 'deposit' | 'withdraw' | 'transfer' | 'other';
  amount: number;
  success: boolean;
  isFlowShield: boolean;
  counterparty?: string;
  poolDenomination?: number;
}

export interface WalletStats {
  totalTransactions: number;
  totalVolume: number;
  uniqueAddresses: number;
  mostActiveAddress: string;
  averageTransactionValue: number;
  transactionFrequency: number;
  recentTransactions: TransactionData[];
  topInteractions: AddressInteraction[];
}

export interface UserAnalytics {
  address: string;
  privacyStats: PrivacyStats;
  walletStats: WalletStats;
  lastUpdated: string;
}

// Pool denomination mapping (matches contract setup)
const POOL_DENOMINATIONS = {
  0: 10,    // 10 USDC
  1: 100,   // 100 USDC  
  2: 500,   // 500 USDC
  3: 2000   // 2000 USDC
};

export async function fetchUserAnalytics(address: string): Promise<UserAnalytics> {
  try {
    console.log("Fetching real analytics for address:", address);
    
    // For now, use a simplified approach with limited block range to avoid RPC limits
    const latestBlock = await publicClient.getBlockNumber();
    const fromBlock = latestBlock - BigInt(9000); // Last 9k blocks to stay under limit
    
    // Fetch FlowShield deposits for this user
    const userDeposits = await fetchUserDeposits(address, fromBlock);
    const userWithdrawals = await fetchUserWithdrawals(address, fromBlock);
    const allTransactions = await fetchUserTransactions(address, fromBlock);
    
    // Calculate privacy metrics from real data
    const privacyStats = calculatePrivacyStats(userDeposits, userWithdrawals);
    const walletStats = calculateWalletStats(allTransactions, address);

    return {
      address,
      privacyStats,
      walletStats,
      lastUpdated: new Date().toISOString()
    };

  } catch (error) {
    console.error("Error fetching user analytics:", error);
    
    // Return empty analytics on error
    return {
      address,
      privacyStats: {
        totalDeposits: 0,
        depositsThisMonth: 0,
        totalMixed: 0,
        averageAnonymitySet: 0,
        daysSinceLastActivity: 0,
        poolUsage: [],
        privacyScore: 0
      },
      walletStats: {
        totalTransactions: 0,
        totalVolume: 0,
        uniqueAddresses: 0,
        mostActiveAddress: "",
        averageTransactionValue: 0,
        transactionFrequency: 0,
        recentTransactions: [],
        topInteractions: []
      },
      lastUpdated: new Date().toISOString()
    };
  }
}

async function fetchUserDeposits(userAddress: string, fromBlock: bigint) {
  try {
    // Get deposit events with limited block range
    const logs = await publicClient.getLogs({
      address: config.contractAddress as `0x${string}`,
      event: DEPOSIT_EVENT,
      fromBlock: fromBlock > 0 ? fromBlock : 'earliest',
      toBlock: 'latest'
    });

    // Filter transactions that came from this user by checking transaction senders
    const userDeposits = [];
    for (const log of logs.slice(0, 50)) { // Limit processing to avoid timeouts
      try {
        const transaction = await publicClient.getTransaction({
          hash: log.transactionHash
        });
        
        if (transaction.from.toLowerCase() === userAddress.toLowerCase()) {
          // Manually extract values from log since viem typing is complex
          const poolId = log.topics[1] ? parseInt(log.topics[1], 16) : 0;
          const amount = log.data ? parseInt(log.data, 16) / 1e6 : 0;
          
          userDeposits.push({
            ...log,
            transaction,
            poolId,
            amount,
            denomination: POOL_DENOMINATIONS[poolId as keyof typeof POOL_DENOMINATIONS] || 0
          });
        }
      } catch (txError) {
        console.warn("Could not fetch transaction details:", txError);
      }
    }

    return userDeposits;
  } catch (error) {
    console.error("Error fetching user deposits:", error);
    return [];
  }
}

async function fetchUserWithdrawals(userAddress: string, fromBlock: bigint) {
  try {
    // Get withdrawal events with limited block range  
    const logs = await publicClient.getLogs({
      address: config.contractAddress as `0x${string}`,
      event: WITHDRAWAL_EVENT,
      fromBlock: fromBlock > 0 ? fromBlock : 'earliest',
      toBlock: 'latest'
    });

    // Filter for this user and parse manually
    const userWithdrawals = [];
    for (const log of logs.slice(0, 50)) {
      try {
        // Extract recipient from indexed topic
        const recipient = log.topics[1] ? '0x' + log.topics[1].slice(26) : '';
        const amount = log.data ? parseInt(log.data, 16) / 1e6 : 0;
        
        if (recipient.toLowerCase() === userAddress.toLowerCase()) {
          userWithdrawals.push({
            ...log,
            amount,
            recipient
          });
        }
      } catch (parseError) {
        console.warn("Could not parse withdrawal log:", parseError);
      }
    }

    return userWithdrawals;
  } catch (error) {
    console.error("Error fetching user withdrawals:", error);
    return [];
  }
}

async function fetchUserTransactions(userAddress: string, fromBlock: bigint): Promise<TransactionData[]> {
  try {
    const transactions: TransactionData[] = [];
    
    // Get FlowShield deposit interactions
    const depositLogs = await publicClient.getLogs({
      address: config.contractAddress as `0x${string}`,
      event: DEPOSIT_EVENT,
      fromBlock: fromBlock > 0 ? fromBlock : 'earliest',
      toBlock: 'latest'
    });

    // Get FlowShield withdrawal interactions
    const withdrawalLogs = await publicClient.getLogs({
      address: config.contractAddress as `0x${string}`,
      event: WITHDRAWAL_EVENT,
      fromBlock: fromBlock > 0 ? fromBlock : 'earliest',
      toBlock: 'latest'
    });

    // Process deposit logs (limit to avoid timeouts)
    for (const log of depositLogs.slice(0, 25)) {
      try {
        const transaction = await publicClient.getTransaction({
          hash: log.transactionHash
        });
        
        if (transaction.from.toLowerCase() === userAddress.toLowerCase()) {
          const block = await publicClient.getBlock({ 
            blockHash: log.blockHash 
          });
          
          // Parse log data manually
          const poolId = log.topics[1] ? parseInt(log.topics[1], 16) : 0;
          const amount = log.data ? parseInt(log.data, 16) / 1e6 : 0;
          
          transactions.push({
            hash: log.transactionHash,
            timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
            type: 'deposit',
            amount,
            success: true,
            isFlowShield: true,
            counterparty: config.contractAddress,
            poolDenomination: POOL_DENOMINATIONS[poolId as keyof typeof POOL_DENOMINATIONS]
          });
        }
      } catch (txError) {
        console.warn("Could not process deposit transaction:", txError);
      }
    }

    // Process withdrawal logs (limit to avoid timeouts)
    for (const log of withdrawalLogs.slice(0, 25)) {
      try {
        // Parse recipient from indexed topic
        const recipient = log.topics[1] ? '0x' + log.topics[1].slice(26) : '';
        
        if (recipient.toLowerCase() === userAddress.toLowerCase()) {
          const block = await publicClient.getBlock({ 
            blockHash: log.blockHash 
          });
          
          const amount = log.data ? parseInt(log.data, 16) / 1e6 : 0;
          
          transactions.push({
            hash: log.transactionHash,
            timestamp: new Date(Number(block.timestamp) * 1000).toISOString(),
            type: 'withdraw',
            amount,
            success: true,
            isFlowShield: true,
            counterparty: config.contractAddress,
          });
        }
      } catch (txError) {
        console.warn("Could not process withdrawal transaction:", txError);
      }
    }

    return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    return [];
  }
}

function calculatePrivacyStats(deposits: any[], withdrawals: any[]): PrivacyStats {
  const totalDeposits = deposits.length;
  const totalMixed = deposits.reduce((sum, d) => sum + d.amount, 0);
  
  // Calculate pool usage distribution
  const poolCounts: { [key: number]: number } = {};
  deposits.forEach(d => {
    const denom = d.denomination || 0;
    poolCounts[denom] = (poolCounts[denom] || 0) + 1;
  });
  
  const poolUsage: PoolUsage[] = Object.entries(poolCounts).map(([denom, count]) => ({
    denomination: parseInt(denom),
    count,
    percentage: totalDeposits > 0 ? Math.round((count / totalDeposits) * 100) : 0
  }));

  // Calculate days since last activity
  const allDates = [...deposits, ...withdrawals].map(tx => 
    new Date(Number(tx.blockNumber) * 1000)
  );
  const lastActivity = allDates.length > 0 ? Math.max(...allDates.map(d => d.getTime())) : 0;
  const daysSinceLastActivity = Math.floor((Date.now() - lastActivity) / (1000 * 60 * 60 * 24));

  // Calculate deposits this month
  const thisMonth = new Date();
  thisMonth.setDate(1);
  const depositsThisMonth = deposits.filter(d => {
    const depositDate = new Date(Number(d.blockNumber) * 1000);
    return depositDate >= thisMonth;
  }).length;

  // Calculate privacy score based on usage patterns
  let privacyScore = 50; // Base score
  if (totalDeposits > 5) privacyScore += 15;
  if (poolUsage.length > 2) privacyScore += 15;
  if (totalMixed > 100) privacyScore += 10;
  if (daysSinceLastActivity < 30) privacyScore += 10;

  return {
    totalDeposits,
    depositsThisMonth,
    totalMixed,
    averageAnonymitySet: Math.max(15, Math.floor(totalDeposits * 2.5)), // Estimated
    daysSinceLastActivity: Math.max(0, daysSinceLastActivity),
    poolUsage,
    privacyScore: Math.min(100, privacyScore)
  };
}

function calculateWalletStats(transactions: TransactionData[], userAddress: string): WalletStats {
  const totalTransactions = transactions.length;
  const totalVolume = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  
  // Count unique addresses interacted with
  const uniqueAddresses = new Set(
    transactions.map(tx => tx.counterparty).filter(Boolean)
  ).size;

  const averageTransactionValue = totalTransactions > 0 ? totalVolume / totalTransactions : 0;
  
  // Calculate transaction frequency (txs per week)
  const oldestTx = transactions[transactions.length - 1];
  const newestTx = transactions[0];
  const timeSpanDays = oldestTx && newestTx ? 
    (new Date(newestTx.timestamp).getTime() - new Date(oldestTx.timestamp).getTime()) / (1000 * 60 * 60 * 24) : 1;
  const transactionFrequency = (totalTransactions / Math.max(timeSpanDays, 1)) * 7;

  // Calculate top interactions
  const interactionCounts: { [key: string]: { count: number, value: number, lastSeen: string } } = {};
  transactions.forEach(tx => {
    if (tx.counterparty) {
      if (!interactionCounts[tx.counterparty]) {
        interactionCounts[tx.counterparty] = { count: 0, value: 0, lastSeen: tx.timestamp };
      }
      interactionCounts[tx.counterparty].count++;
      interactionCounts[tx.counterparty].value += tx.amount;
      if (new Date(tx.timestamp) > new Date(interactionCounts[tx.counterparty].lastSeen)) {
        interactionCounts[tx.counterparty].lastSeen = tx.timestamp;
      }
    }
  });

  const topInteractions: AddressInteraction[] = Object.entries(interactionCounts)
    .map(([address, data]) => ({
      address,
      transactionCount: data.count,
      totalValue: data.value,
      lastInteraction: data.lastSeen,
      label: address === config.contractAddress ? "FlowShield" : 
             address === config.tokenAddress ? `${config.tokenSymbol} Token` : "Contract"
    }))
    .sort((a, b) => b.transactionCount - a.transactionCount)
    .slice(0, 10);

  return {
    totalTransactions,
    totalVolume,
    uniqueAddresses,
    mostActiveAddress: topInteractions[0]?.address || "",
    averageTransactionValue,
    transactionFrequency,
    recentTransactions: transactions.slice(0, 20),
    topInteractions
  };
}

export async function exportUserData(address: string, includePrivateData: boolean = false): Promise<string> {
  const analytics = await fetchUserAnalytics(address);
  
  const exportData = {
    exportDate: new Date().toISOString(),
    address,
    network: "Optimism Sepolia",
    privacyStats: analytics.privacyStats,
    walletStats: includePrivateData ? analytics.walletStats : {
      ...analytics.walletStats,
      recentTransactions: "Hidden for privacy",
      topInteractions: "Hidden for privacy"
    },
    disclaimer: "This data is generated for personal use only. FlowShield does not store this information."
  };

  return JSON.stringify(exportData, null, 2);
}

// Fetch actual transaction history from blockchain
export async function fetchTransactionHistory(address: string, limit: number = 50): Promise<TransactionData[]> {
  try {
    const latestBlock = await publicClient.getBlockNumber();
    const fromBlock = latestBlock - BigInt(9000);
    return await fetchUserTransactions(address, fromBlock);
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    return [];
  }
}
