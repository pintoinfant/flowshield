# FlowShield 

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Ethereum](https://img.shields.io/badge/Ethereum-3C3C3D?logo=ethereum&logoColor=white)](https://ethereum.org/)
[![Next.js](https://img.shields.io/badge/Next.js-black?logo=next.js&logoColor=white)](https://nextjs.org/)

**FlowShield** is an open-source privacy protocol for Ethereum and EVM-compatible chains. Break the on-chain link between deposits and withdrawals using cryptographic commitments and anonymity sets.

>  Deploy on any EVM chain • Earn fees as a relayer • Provide privacy infrastructure

##  Overview

FlowShield consists of two main components:

- **Smart Contracts** (`/contracts`) - Solidity contracts for privacy mixing with pool management
- **Web Application** (`/web`) - Next.js frontend with wallet integration and analytics

Users deposit tokens with secret commitments and withdraw to different addresses, achieving financial privacy through anonymity sets.

##  Quick Start

### Prerequisites
- Node.js v18+
- npm or pnpm
- MetaMask or Web3 wallet

### Installation

```bash
# Clone repository
git clone https://github.com/pintoinfant/flowshield.git
cd flowshield

# Install contracts dependencies
cd contracts
npm install

# Install web dependencies
cd ../web
npm install
```

### Run Locally

**Terminal 1 - Start blockchain:**
```bash
cd contracts
npx hardhat node
```

**Terminal 2 - Deploy contracts:**
```bash
cd contracts
npx hardhat run scripts/deploy-and-setup.ts --network localhost
```

**Terminal 3 - Start web app:**
```bash
cd web
npm run dev
```

Visit `http://localhost:3000` 🎉

## 📁 Project Structure

```
flowshield/
├── contracts/           # Smart contract workspace
│   ├── contracts/      # Solidity contracts
│   │   ├── Flowshield.sol  # Core privacy mixer
│   │   └── USDC.sol       # ERC20 test token
│   ├── scripts/        # Deployment scripts
│   ├── test/           # Contract tests
│   └── README.md       # Detailed contract documentation
│
└── web/                # Next.js web application
    ├── app/            # Pages (App Router)
    │   ├── page.tsx           # Landing page
    │   ├── shield/page.tsx    # Deposit/Withdraw interface
    │   ├── analytics/page.tsx # Stats dashboard
    │   └── mint/page.tsx      # Token minting
    ├── components/     # React components
    └── lib/            # Contract ABIs & utilities
```

##  How Privacy Works

1. **Deposit** - Users deposit tokens with a secret commitment (hash of secret phrase)
2. **Anonymity Set** - Multiple deposits create an anonymity set in the pool
3. **Withdraw** - Users withdraw to different addresses using their secret
4. **Privacy** - On-chain observers cannot link deposits to withdrawals

```typescript
// Deposit
const secret = "my_secret_phrase"
const commitment = keccak256(secret)
await flowshield.deposit(commitment, amount)

// Withdraw later to different address
await flowshield.withdrawViaRelayer(commitment, amount, newAddress)
```

##  Key Features

### For Users
-  **Complete Privacy** - Break transaction links
-  **Multi-Chain** - Works on any EVM chain
-  **Self-Custody** - Only you control your funds via secret notes

### For Developers/Relayers
-  **Earn Fees** - 2% on relayer-assisted withdrawals
-  **Easy Deploy** - Launch on any EVM chain in minutes
- **Analytics** - Track TVL and transaction metrics
-  **Customizable** - MIT licensed, modify as needed

##  Documentation

- **[Smart Contracts Documentation](./contracts/README.md)** - Detailed contract docs, API reference, deployment guides
- **Web Application** - See `/web` folder for frontend details

##  Testing

### Smart Contracts
```bash
cd contracts
npx hardhat test
npx hardhat coverage
```

### Web Application
```bash
cd web
npm run lint
npm run build
```

##  Deployment

### Deploy Smart Contracts

1. Configure `.env` in `/contracts`:
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=your_private_key
```

2. Deploy:
```bash
cd contracts
npx hardhat ignition deploy ignition/modules/Flowshield.ts --network sepolia
```

See [contracts/README.md](./contracts/README.md) for detailed deployment instructions.

### Deploy Web Application

1. Configure `/web/.env.local`:
```env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_FLOWSHIELD_ADDRESS=0x...
NEXT_PUBLIC_USDC_ADDRESS=0x...
```

2. Deploy to Vercel:
```bash
cd web
vercel
```

##  Revenue Model

Run relayers and earn fees:
- **2% fee** on relayer-assisted withdrawals
- **Multi-chain deployment** multiplies revenue
- **Example:** 5,000 monthly txs × $0.50 fee = **$2,500/month**

##  Security

⚠️ **Important:** This is educational/hackathon code - NOT audited for production use.

**Implemented Security:**
-  Reentrancy protection
-  Access control
-  Commitment replay prevention
-  Balance validation

**Before Production:**
- Get professional security audit
- Test extensively on testnets
- Implement emergency pause mechanisms
- Use multi-sig for operator role

##  Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Submit a pull request

See [contracts/README.md](./contracts/README.md) for development guidelines.

##  License

MIT License - see [LICENSE](LICENSE) file for details.

You are free to use, modify, and distribute this software commercially or privately.

##  Links

- **GitHub:** [github.com/pintoinfant/flowshield](https://github.com/pintoinfant/flowshield)
- **Contracts Docs:** [contracts/README.md](./contracts/README.md)
- **Author:** [@pintoinfant](https://github.com/pintoinfant)
- **Email:** pintoinfant5650@gmail.com

## ⚠️ Disclaimer

This software is provided "as is" without warranty. This is experimental educational code. Use at your own risk.

**DO NOT** use in production without:
- Professional security audit
- Thorough testnet testing
- Proper key management
- Legal compliance

---

<div align="center">

**Built with ❤️ for Financial Privacy**

[ Star](https://github.com/pintoinfant/flowshield) • [ Issues](https://github.com/pintoinfant/flowshield/issues) • [ Docs](./contracts/README.md)

