import { parseAbi } from 'viem';

// Flowshield contract ABI
export const FLOWSHIELD_ABI = parseAbi([
  // Events
  'event DepositEvent(bytes32 indexed commitment, uint256 amount)',
  'event WithdrawEvent(address indexed recipient, uint256 amount)',
  'event PoolCreatedEvent(uint256 indexed denomination, string label)',

  // Read functions
  'function operator() view returns (address)',
  'function token() view returns (address)',
  'function usedSecrets(bytes32) view returns (bool)',
  'function poolExists(uint256 denomination) view returns (bool)',
  'function poolBalance(uint256 denomination) view returns (uint256)',
  'function isDeposited(uint256 denomination, bytes32 commitment) view returns (bool)',

  // Write functions
  'function addPool(uint256 denomination, string calldata label)',
  'function deposit(bytes32 commitment, uint256 denomination)',
  'function withdrawDirect(bytes32 commitment, uint256 denomination)',
  'function withdrawViaRelayer(bytes32 commitment, uint256 denomination, address recipient)',
  'function setOperator(address newOperator)',
]);

// ERC20 ABI (minimal - for USDC interactions)
export const ERC20_ABI = parseAbi([
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function mint(address to, uint256 amount) returns (bool)',
  
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
]);
