# MetaMask/Blockaid Blocklist Removal Request

Reference doc for requesting removal of **spectre-finance.vercel.app** from the MetaMask phishing blocklist.

## Where to File

- **Issues page:** https://github.com/MetaMask/eth-phishing-detect/issues
- **Template:** Use **"Blocklist removal request"** (or "Open a blank issue" if no template).

## After You Submit (fill in below)

- **GitHub issue URL:** https://github.com/MetaMask/eth-phishing-detect/issues/222611
- **Date submitted:** 2026-02-10

---

## Issue Title (copy exactly)

```
[Blocklist removal request] spectre-finance.vercel.app - Legitimate DeFi Protocol
```

---

## Issue Body (copy-paste into the description)

## Domain Information
- **Domain:** https://spectre-finance.vercel.app
- **Type:** Legitimate DeFi dApp (Privacy-focused protocol using Fhenix CoFHE)

## Evidence of Legitimacy

### 1. Verified Smart Contract
- **Contract Address:** 0x9480557892B7e67347b105459C4b8F6B1F791A65
- **Network:** Ethereum Sepolia Testnet
- **Etherscan:** https://sepolia.etherscan.io/address/0x9480557892B7e67347b105459C4b8F6B1F791A65
- **Status:** Contract is verified and has 44+ legitimate transactions

### 2. Open Source Repository
- **GitHub:** https://github.com/Snehal707/spectre-finance
- **Code:** Fully open source with documented functionality
- **Technology:** Uses Fhenix CoFHE for Fully Homomorphic Encryption
- **License:** MIT License

### 3. Project Details
Spectre Finance is a privacy-preserving DeFi protocol that allows users to:
- Deposit ETH and receive encrypted seETH balance
- Transfer funds privately using FHE encryption
- Withdraw securely through CoFHE coprocessor decryption

### 4. Technical Documentation
- Complete README with architecture diagrams
- Deployment documentation
- Security disclosures (SECURITY.md)
- Active development with proper CI/CD workflows

### 5. Active Transaction History
The contract shows legitimate usage patterns:
- Mint/Burn operations
- Encrypted transfers
- Proper integration with Fhenix CoFHE infrastructure

## Why This is a False Positive

I believe this domain was flagged due to:
1. **Vercel subdomain** - `.vercel.app` domains are commonly abused, but this is a legitimate testnet deployment
2. **Recent deployment** - The project is new but fully documented and open source
3. **Privacy focus** - While scammers abuse "privacy" messaging, this uses actual FHE technology from Fhenix Protocol

## Request

Please remove `spectre-finance.vercel.app` from the blocklist. This is a legitimate educational/testnet project demonstrating fully homomorphic encryption in DeFi.

I'm happy to provide any additional verification needed.

Thank you!

---

## Quick reference

| Item          | Value |
| ------------- | ----- |
| Domain        | spectre-finance.vercel.app |
| Contract      | 0x9480557892B7e67347b105459C4b8F6B1F791A65 (Sepolia, verified) |
| Repo          | https://github.com/Snehal707/spectre-finance |
| Where to file | https://github.com/MetaMask/eth-phishing-detect/issues |

**Steps:** New issue → Blocklist removal request (or blank) → Paste title and body above → Submit. Expect response in 24–72 hours.
