# Spectre Finance - Deployment Guide

## Prerequisites

1. **Node.js 18+** installed
2. **MetaMask** browser extension
3. **Fhenix Helium testnet ETH** from faucet

## Step 1: Get Testnet ETH

1. Go to [Fhenix Faucet](https://faucet.fhenix.zone)
2. Connect your MetaMask wallet
3. Request testnet tFHE tokens
4. Wait for tokens to arrive (usually ~30 seconds)

## Step 2: Configure Environment

Create a `.env` file in the project root:

```bash
# Your wallet private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here
```

> ⚠️ **NEVER commit your private key to git!**

## Step 3: Deploy Contract

```bash
# Compile contracts
npm run compile

# Deploy to Fhenix Helium testnet
npm run deploy
```

Expected output:
```
🔐 Deploying SpectreVault to fhenixHelium ...

📍 Deploying with account: 0x...
💰 Account balance: X.XXX ETH

⏳ Deploying SpectreVault contract...
✅ SpectreVault deployed to: 0x...

========================================
📋 DEPLOYMENT SUMMARY
========================================
Network: fhenixHelium
Contract Address: 0x...
Deployer: 0x...
========================================

📝 Add this to your frontend .env file:
VITE_SPECTRE_VAULT_ADDRESS=0x...
```

## Step 4: Configure Frontend

Create `frontend/.env`:

```bash
VITE_SPECTRE_VAULT_ADDRESS=your_deployed_contract_address
```

## Step 5: Deploy Frontend to Vercel

### Option A: Vercel CLI

```bash
cd frontend
npm install -g vercel
vercel
```

### Option B: GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Set environment variable: `VITE_SPECTRE_VAULT_ADDRESS`
5. Deploy

### Environment Variables for Vercel

In Vercel dashboard → Settings → Environment Variables:

| Name | Value |
|------|-------|
| `VITE_SPECTRE_VAULT_ADDRESS` | Your deployed contract address |

## Step 6: Verify Deployment

1. Open your Vercel deployment URL
2. Connect MetaMask to Fhenix Helium network
3. Test deposit functionality

## Network Configuration (MetaMask)

If MetaMask doesn't auto-add the network:

| Setting | Value |
|---------|-------|
| Network Name | Fhenix Helium |
| RPC URL | https://api.helium.fhenix.zone |
| Chain ID | 8008135 |
| Currency Symbol | tFHE |
| Explorer | https://explorer.helium.fhenix.zone |

## Troubleshooting

### "Insufficient funds"
→ Get more testnet ETH from the faucet

### "Network not found"
→ Add Fhenix Helium network manually to MetaMask

### "Transaction failed"
→ Check the Fhenix explorer for error details

### "Contract address not set"
→ Ensure `VITE_SPECTRE_VAULT_ADDRESS` is set in frontend `.env`

## Verify Contract on Explorer

After deployment, you can verify your contract at:
`https://explorer.helium.fhenix.zone/address/YOUR_CONTRACT_ADDRESS`
