# Flowshield Privacy Mixer

A privacy-preserving smart contract system built on Ethereum that allows users to break the link between deposit and withdrawal addresses, providing transaction anonymity through commitment-based mixing pools.

## 🎯 Overview

Flowshield is a privacy mixer that enables users to:
- Deposit tokens with secret commitments
- Withdraw funds to different addresses using their secrets
- Maintain transaction privacy through anonymity sets
- Support multiple denomination pools
- Include operator fees for relayer-based withdrawals

## 📋 Contracts

### USDC.sol
Standard ERC20 token contract used for testing the privacy mixer functionality.
- **Features**: Mint, burn, transfer, approve, permit functionality
- **Owner**: Can mint tokens to any address
- **Standard**: ERC20 with OpenZeppelin extensions

### Flowshield.sol
The core privacy mixer contract that handles deposit/withdrawal operations.
- **Features**: Pool management, commitment-based deposits, privacy-preserving withdrawals
- **Security**: Reentrancy protection, access control, duplicate prevention
- **Fee Structure**: 2% operator fee on relayer withdrawals

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Hardhat development environment

### Installation
```bash
npm install
```

### Compilation
```bash
npx hardhat compile
```

### Testing
```bash
npx hardhat test
```

## 📜 Deployment Scripts

### Using Hardhat Ignition
Deploy contracts using the Ignition modules:

```bash
# Deploy USDC token
npx hardhat ignition deploy ignition/modules/USDC.ts

# Deploy complete system (USDC + Flowshield)
npx hardhat ignition deploy ignition/modules/Flowshield.ts
```

### Using Direct Scripts
Deploy and setup the complete system:

```bash
# Deploy contracts and setup initial pools
npx hardhat run scripts/deploy-and-setup.ts

# Run full privacy flow demonstration
npx hardhat run scripts/demo-privacy-flow.ts

# Interactive demonstration (requires user input)
npx hardhat run scripts/interactive-demo.ts
```

## 🎭 How Privacy Mixing Works

### 1. Deposit Phase
Users deposit tokens with secret commitments:
```solidity
// Generate a secret commitment
bytes32 commitment = keccak256(abi.encodePacked("your_secret"));

// Deposit tokens to a pool
flowshield.deposit(commitment, denomination);
```

### 2. Anonymity Set Creation
Multiple users deposit into the same pool, creating an anonymity set where individual deposits cannot be linked to specific users.

### 3. Withdrawal Phase
Users can withdraw using their secrets:

**Direct Withdrawal** (to caller's address):
```solidity
flowshield.withdrawDirect(commitment, denomination);
```

**Relayer Withdrawal** (to any address with 2% fee):
```solidity
flowshield.withdrawViaRelayer(commitment, denomination, recipient);
```

## 🔧 Configuration

### Pool Management
Only the operator can create new pools:
```solidity
// Create a new denomination pool
flowshield.addPool(parseEther("100"), "100 USDC Privacy Pool");
```

### Operator Management
The operator can be changed by the current operator:
```solidity
flowshield.setOperator(newOperatorAddress);
```

## 📊 Usage Examples

### Basic Privacy Flow
```typescript
// 1. Deploy contracts
const usdc = await deployContract("USDC", [owner]);
const flowshield = await deployContract("Flowshield", [usdc.address]);

// 2. Create pools
await flowshield.addPool(parseEther("100"), "100 USDC Pool");

// 3. User deposits with commitment
const secret = "user_secret_123";
const commitment = keccak256(toBytes(secret));
await flowshield.deposit(commitment, parseEther("100"));

// 4. User withdraws to different address (privacy achieved!)
await flowshield.withdrawDirect(commitment, parseEther("100"));
```

### Relayer-Assisted Withdrawal
```typescript
// Relayer helps user withdraw to specific address
await flowshield.withdrawViaRelayer(
  commitment,
  parseEther("100"),
  recipientAddress
);
// Result: 98 USDC to recipient, 2 USDC fee to operator
```

## 🛡️ Security Features

### Commitment System
- Users generate secret commitments (hashed secrets)
- Only commitment holders can withdraw their deposits
- Prevents double-spending and unauthorized access

### Reentrancy Protection
- Critical functions protected against reentrancy attacks
- State updates before external calls
- Mutex-style protection mechanism

### Access Control
- Pool creation restricted to operators
- Operator role management
- Protected administrative functions

### Duplicate Prevention
- Prevents duplicate commitments in pools
- Tracks used secrets to prevent replay attacks
- Validates pool existence before operations

## 📈 Gas Optimization

- Efficient storage layout
- Minimal external calls
- Batch operations where possible
- Optimized for common use cases

## 🧪 Testing

The project includes comprehensive test coverage:

- **Unit Tests**: Individual contract functionality
- **Integration Tests**: Cross-contract interactions
- **Security Tests**: Reentrancy, access control, edge cases
- **Gas Tests**: Transaction cost analysis

Run specific test suites:
```bash
# All tests
npx hardhat test

# Specific test file
npx hardhat test test/Flowshield.ts

# With gas reporting
REPORT_GAS=true npx hardhat test
```

## 🌐 Network Support

### Local Development
```bash
npx hardhat node
```

### Testnet Deployment
Configure networks in `hardhat.config.ts`:
```typescript
networks: {
  sepolia: {
    url: process.env.SEPOLIA_RPC_URL,
    accounts: [process.env.PRIVATE_KEY]
  }
}
```

## 📚 API Reference

### Flowshield Contract

#### Core Functions
- `deposit(bytes32 commitment, uint256 denomination)` - Deposit tokens with commitment
- `withdrawDirect(bytes32 commitment, uint256 denomination)` - Direct withdrawal to caller
- `withdrawViaRelayer(bytes32 commitment, uint256 denomination, address recipient)` - Relayer withdrawal

#### Administrative Functions
- `addPool(uint256 denomination, string calldata label)` - Create new pool (operator only)
- `setOperator(address newOperator)` - Change operator (operator only)

#### View Functions
- `poolExists(uint256 denomination)` - Check if pool exists
- `poolBalance(uint256 denomination)` - Get pool balance
- `isDeposited(uint256 denomination, bytes32 commitment)` - Check if commitment exists

### Events
- `DepositEvent(bytes32 indexed commitment, uint256 amount)` - Emitted on deposits
- `WithdrawEvent(address indexed recipient, uint256 amount)` - Emitted on withdrawals
- `PoolCreatedEvent(uint256 indexed denomination, string label)` - Emitted when pools are created

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This is experimental software for educational purposes. Use at your own risk. Not audited for production use.

## 🔗 Links

- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Ethereum Privacy Research](https://ethereum.org/en/privacy)
