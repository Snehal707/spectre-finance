// Sepolia Network Configuration (CoFHE supported)
export const SEPOLIA = {
  chainId: 11155111,
  chainIdHex: '0xaa36a7',
  name: 'Sepolia',
  rpcUrl: 'https://rpc.sepolia.org',
  blockExplorer: 'https://sepolia.etherscan.io',
  nativeCurrency: {
    name: 'Sepolia ETH',
    symbol: 'ETH',
    decimals: 18,
  },
};

// Arbitrum Sepolia (alternative - lower gas)
export const ARB_SEPOLIA = {
  chainId: 421614,
  chainIdHex: '0x66eee',
  name: 'Arbitrum Sepolia',
  rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
  blockExplorer: 'https://sepolia.arbiscan.io',
  nativeCurrency: {
    name: 'Arbitrum Sepolia ETH',
    symbol: 'ETH',
    decimals: 18,
  },
};

// Base Sepolia (alternative)
export const BASE_SEPOLIA = {
  chainId: 84532,
  chainIdHex: '0x14a34',
  name: 'Base Sepolia',
  rpcUrl: 'https://sepolia.base.org',
  blockExplorer: 'https://sepolia.basescan.org',
  nativeCurrency: {
    name: 'Base Sepolia ETH',
    symbol: 'ETH',
    decimals: 18,
  },
};

// Default network for the app
export const DEFAULT_NETWORK = SEPOLIA;

// Contract addresses - Deployed with official CoFHE hardhat plugin
export const CONTRACT_ADDRESSES = {
  // V7: balanceOf returns indicated balance (Redact-style) for sane MetaMask display
  spectreToken: import.meta.env.VITE_SPECTRE_TOKEN_ADDRESS || '0x751111805C4c8a014da9f040199d040788d61347',
  // V3: Original vault (for backwards compatibility)
  spectreVault: import.meta.env.VITE_SPECTRE_VAULT_ADDRESS || '0x7e3188bdB5DcE28735274389013d3b0194BDfA84',
  // Legacy contracts (for claiming old pending withdrawals)
  spectreVaultLegacy: '0x9ECdB35Fe94E0c2A8760099D770E41c477119A51',
  spectreVaultV1: '0xC96c0848040CB572F7Ed988091f788F3635e0a3c',
  spectreTokenV4: '0xE75B0516DF0a4E9D525b0DB04618FaC455369d9b', // Previous version
};

// App configuration
export const APP_CONFIG = {
  appName: 'Spectre Finance',
  appDescription: 'Privacy-preserving DeFi using Fully Homomorphic Encryption (CoFHE)',
  // Privacy Guard settings
  roundNumberWarningThreshold: 0.001, // Warn if amount is too round
};

// Supported networks list
export const SUPPORTED_NETWORKS = [SEPOLIA, ARB_SEPOLIA, BASE_SEPOLIA];
