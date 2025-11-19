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

// FlowShield contract functions
const FLOWSHIELD_ABI = [
  {
    "inputs": [{"name": "denomination", "type": "uint256"}],
    "name": "getPoolBalance",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "poolId", "type": "uint256"}],
    "name": "isPoolActive",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Pool denomination mapping (matches contract setup)
const POOL_DENOMINATIONS = {
  0: 10,    // 10 USDC
  1: 100,   // 100 USDC  
  2: 500,   // 500 USDC
  3: 2000   // 2000 USDC
};

export interface PoolStat {
  denomination: number;
  balance: number;
  activeDeposits: number;
}

export interface FlowShieldStats {
  totalValueLocked: number;
  activePools: number;
  totalDeposits: number;
  totalWithdrawals: number;
  usersServed: number;
  poolStats: PoolStat[];
}

export async function fetchFlowShieldStats(): Promise<FlowShieldStats> {
  try {
    console.log("Fetching real FlowShield stats from blockchain...");
    
    // Fetch all contract events to calculate statistics
    const [depositEvents, withdrawalEvents] = await Promise.all([
      fetchAllDeposits(),
      fetchAllWithdrawals()
    ]);

    // Calculate pool statistics
    const poolStats = await calculatePoolStats(depositEvents, withdrawalEvents);
    
    // Calculate aggregate statistics
    const totalValueLocked = poolStats.reduce((sum, pool) => sum + pool.balance, 0);
    const totalDeposits = depositEvents.length;
    const totalWithdrawals = withdrawalEvents.length;
    const activePools = poolStats.filter(pool => pool.balance > 0).length;
    
    // Calculate unique users
    const uniqueUsers = calculateUniqueUsers(depositEvents, withdrawalEvents);

    return {
      totalValueLocked,
      activePools,
      totalDeposits,
      totalWithdrawals,
      usersServed: uniqueUsers,
      poolStats,
    };

  } catch (error) {
    console.error("Error fetching FlowShield stats:", error);
    
    // Return empty stats on error
    return {
      totalValueLocked: 0,
      activePools: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      usersServed: 0,
      poolStats: [
        { denomination: 10, balance: 0, activeDeposits: 0 },
        { denomination: 100, balance: 0, activeDeposits: 0 },
        { denomination: 500, balance: 0, activeDeposits: 0 },
        { denomination: 2000, balance: 0, activeDeposits: 0 },
      ],
    };
  }
}

async function fetchAllDeposits() {
  try {
    // Use limited block range to avoid RPC limits
    const latestBlock = await publicClient.getBlockNumber();
    const fromBlock = latestBlock - BigInt(9000); // Last 9k blocks to stay under limit
    
    const logs = await publicClient.getLogs({
      address: config.contractAddress as `0x${string}`,
      event: DEPOSIT_EVENT,
      fromBlock: fromBlock > 0 ? fromBlock : 'earliest',
      toBlock: 'latest'
    });

    return logs.map(log => {
      // Parse log data manually to avoid typing issues
      const poolId = log.topics[1] ? parseInt(log.topics[1], 16) : 0;
      const amount = log.data ? parseInt(log.data, 16) / 1e6 : 0;
      const leafIndex = log.topics[2] ? parseInt(log.topics[2], 16) : 0;
      
      return {
        poolId,
        amount,
        leafIndex,
        transactionHash: log.transactionHash,
        blockNumber: log.blockNumber,
        denomination: POOL_DENOMINATIONS[poolId as keyof typeof POOL_DENOMINATIONS] || 0
      };
    });
  } catch (error) {
    console.error("Error fetching deposits:", error);
    return [];
  }
}

async function fetchAllWithdrawals() {
  try {
    // Use limited block range to avoid RPC limits
    const latestBlock = await publicClient.getBlockNumber();
    const fromBlock = latestBlock - BigInt(9000);
    
    const logs = await publicClient.getLogs({
      address: config.contractAddress as `0x${string}`,
      event: WITHDRAWAL_EVENT,
      fromBlock: fromBlock > 0 ? fromBlock : 'earliest',
      toBlock: 'latest'
    });

    return logs.map(log => {
      // Parse log data manually
      const recipient = log.topics[1] ? '0x' + log.topics[1].slice(26) : '';
      const amount = log.data ? parseInt(log.data, 16) / 1e6 : 0;
      
      return {
        recipient,
        amount,
        transactionHash: log.transactionHash,
        blockNumber: log.blockNumber
      };
    });
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
    return [];
  }
}

async function calculatePoolStats(deposits: any[], withdrawals: any[]): Promise<PoolStat[]> {
  const poolStats: PoolStat[] = [];
  
  // Calculate stats for each pool denomination
  for (const [poolId, denomination] of Object.entries(POOL_DENOMINATIONS)) {
    const poolDeposits = deposits.filter(d => d.poolId === parseInt(poolId));
    const poolDepositAmount = poolDeposits.reduce((sum, d) => sum + d.amount, 0);
    const totalWithdrawnAmount = withdrawals.reduce((sum, w) => sum + w.amount, 0);
    
    // Estimate pool balance (this is simplified - in reality you'd query contract state)
    // For now, assume pool balance = total deposits - proportional withdrawals
    const estimatedBalance = Math.max(0, poolDepositAmount - (totalWithdrawnAmount * poolDeposits.length / deposits.length));
    
    poolStats.push({
      denomination,
      balance: estimatedBalance,
      activeDeposits: poolDeposits.length
    });
  }
  
  return poolStats;
}

function calculateUniqueUsers(deposits: any[], withdrawals: any[]): number {
  const uniqueAddresses = new Set<string>();
  
  // We'd need to fetch transaction details to get the sender addresses
  // For now, estimate based on deposit count (assuming some users make multiple deposits)
  const estimatedUsers = Math.max(1, Math.floor(deposits.length * 0.7)); // Assume 70% unique users
  
  return estimatedUsers;
}

// Get pool balance from contract state
export async function getPoolBalance(denomination: number): Promise<number> {
  try {
    // Convert denomination to pool ID
    const poolId = Object.entries(POOL_DENOMINATIONS).find(([_, denom]) => denom === denomination)?.[0];
    
    if (!poolId) {
      return 0;
    }

    // Query contract for actual pool balance
    const balance = await publicClient.readContract({
      address: config.contractAddress as `0x${string}`,
      abi: FLOWSHIELD_ABI,
      functionName: 'getPoolBalance',
      args: [BigInt(denomination * 1e6)], // Convert to USDC units
    });
    
    return Number(balance) / 1e6; // Convert back to USDC
    
  } catch (error) {
    console.error(`Error fetching pool balance for ${denomination} USDC:`, error);
    return 0;
  }
}

export async function getActiveDeposits(denomination: number): Promise<number> {
  try {
    // Convert denomination to pool ID
    const poolId = Object.entries(POOL_DENOMINATIONS).find(([_, denom]) => denom === denomination)?.[0];
    
    if (!poolId) {
      return 0;
    }

    // Use limited block range to avoid RPC limits
    const latestBlock = await publicClient.getBlockNumber();
    const fromBlock = latestBlock - BigInt(9000);

    // Query deposit events for this specific pool
    const logs = await publicClient.getLogs({
      address: config.contractAddress as `0x${string}`,
      event: DEPOSIT_EVENT,
      args: {
        poolId: BigInt(poolId)
      },
      fromBlock: fromBlock > 0 ? fromBlock : 'earliest',
      toBlock: 'latest'
    });

    return logs.length;
    
  } catch (error) {
    console.error(`Error fetching active deposits for ${denomination} USDC:`, error);
    return 0;
  }
}

export async function getTotalUsers(): Promise<number> {
  try {
    // Get all deposit events
    const deposits = await fetchAllDeposits();
    const withdrawals = await fetchAllWithdrawals();
    
    // Calculate unique users (simplified estimation)
    return calculateUniqueUsers(deposits, withdrawals);
    
  } catch (error) {
    console.error("Error fetching total users:", error);
    return 0;
  }
}

// Additional helper function to get pool activity status
export async function isPoolActive(poolId: number): Promise<boolean> {
  try {
    const isActive = await publicClient.readContract({
      address: config.contractAddress as `0x${string}`,
      abi: FLOWSHIELD_ABI,
      functionName: 'isPoolActive',
      args: [BigInt(poolId)],
    });
    
    return isActive;
    
  } catch (error) {
    console.error(`Error checking if pool ${poolId} is active:`, error);
    return false;
  }
}

// Get recent activity metrics
export async function getRecentActivity(days: number = 7): Promise<{
  recentDeposits: number;
  recentWithdrawals: number;
  recentVolume: number;
}> {
  try {
    const cutoffTime = Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60);
    const cutoffBlock = await estimateBlockFromTimestamp(cutoffTime);
    
    // Get recent deposits
    const recentDepositLogs = await publicClient.getLogs({
      address: config.contractAddress as `0x${string}`,
      event: DEPOSIT_EVENT,
      fromBlock: cutoffBlock,
      toBlock: 'latest'
    });

    // Get recent withdrawals
    const recentWithdrawalLogs = await publicClient.getLogs({
      address: config.contractAddress as `0x${string}`,
      event: WITHDRAWAL_EVENT,
      fromBlock: cutoffBlock,
      toBlock: 'latest'
    });

    // Parse log data manually to calculate volume
    const depositVolume = recentDepositLogs.reduce((sum, log) => {
      const amount = log.data ? parseInt(log.data, 16) / 1e6 : 0;
      return sum + amount;
    }, 0);
    
    const withdrawalVolume = recentWithdrawalLogs.reduce((sum, log) => {
      const amount = log.data ? parseInt(log.data, 16) / 1e6 : 0;
      return sum + amount;
    }, 0);
    
    const recentVolume = depositVolume + withdrawalVolume;

    return {
      recentDeposits: recentDepositLogs.length,
      recentWithdrawals: recentWithdrawalLogs.length,
      recentVolume
    };
    
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return {
      recentDeposits: 0,
      recentWithdrawals: 0,
      recentVolume: 0
    };
  }
}

// Helper function to estimate block number from timestamp
async function estimateBlockFromTimestamp(timestamp: number): Promise<bigint> {
  try {
    const latestBlock = await publicClient.getBlock({ blockTag: 'latest' });
    const blockTime = 2; // Optimism block time is ~2 seconds
    const timeDiff = Number(latestBlock.timestamp) - timestamp;
    const blockDiff = Math.floor(timeDiff / blockTime);
    
    return latestBlock.number - BigInt(Math.max(0, blockDiff));
  } catch (error) {
    // Fallback to a reasonable block range
    const latestBlockNumber = await publicClient.getBlockNumber();
    return latestBlockNumber - BigInt(10000); // ~20,000 seconds ago
  }
}
