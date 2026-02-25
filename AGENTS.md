# AGENTS.md

## Cursor Cloud specific instructions

### Project overview
Spectre Finance is a privacy-preserving DeFi protocol with two sub-projects:
- **Root** (`/workspace`): Hardhat/Solidity smart contracts (FHERC20 token using Fhenix CoFHE)
- **Frontend** (`/workspace/frontend`): React 19 + Vite 7 + TypeScript SPA with RainbowKit wallet integration

### Known issues

- **`@fhenixprotocol/cofhe-contracts@^0.2.0`** (root `package.json`) does not exist in npm. The lockfile resolves it to `0.0.13` transitively. **Never delete `package-lock.json`** in the root — `npm install` will fail without it. Always use `npm install` (not `npm ci`) for the root project.
- **Hardhat HH18 / native module**: After `npm install`, the platform-specific module `@nomicfoundation/solidity-analyzer-linux-x64-gnu` is not installed automatically (lockfile bug). You must manually install it:
  ```
  npm pack @nomicfoundation/solidity-analyzer-linux-x64-gnu@0.1.2 --pack-destination /tmp
  mkdir -p node_modules/@nomicfoundation/solidity-analyzer-linux-x64-gnu
  cd /tmp && tar xzf nomicfoundation-solidity-analyzer-linux-x64-gnu-0.1.2.tgz
  cp -r /tmp/package/* node_modules/@nomicfoundation/solidity-analyzer-linux-x64-gnu/
  rm -rf /tmp/package /tmp/nomicfoundation-solidity-analyzer-linux-x64-gnu-0.1.2.tgz
  ```
- **`@fhenixprotocol/cofhe-contracts` not hoisted**: The Solidity import requires a symlink at the top level:
  ```
  ln -sf node_modules/@fhenixprotocol/cofhe-mock-contracts/node_modules/@fhenixprotocol/cofhe-contracts node_modules/@fhenixprotocol/cofhe-contracts
  ```
- **Hardhat tests fail** with EVM compatibility errors (mock contracts use `tstore`/`tload`/`mcopy` which need Cancun EVM, but `hardhat.config.js` targets Paris). CI marks tests `continue-on-error: true`.

### Standard commands

See `README.md` for full docs. Quick reference:

| Task | Command | Directory |
|------|---------|-----------|
| Install root deps | `npm install` | `/workspace` |
| Install frontend deps | `npm install` | `/workspace/frontend` |
| Compile contracts | `npx hardhat compile` | `/workspace` |
| Run contract tests | `npm test` | `/workspace` |
| Frontend lint | `npm run lint` | `/workspace/frontend` |
| Frontend build | `npm run build` | `/workspace/frontend` |
| Frontend dev server | `npm run dev` | `/workspace/frontend` |

### Frontend dev server
- Runs on port **5173** by default (`npm run dev` in `frontend/`)
- Use `npm run dev -- --host 0.0.0.0` to expose to the network
- Connects to already-deployed contracts on Sepolia testnet (hardcoded in `src/utils/config.ts`)
- No local blockchain node needed for frontend development
- Wallet interaction requires a browser wallet extension (MetaMask, etc.) with Sepolia ETH
