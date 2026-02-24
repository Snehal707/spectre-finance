// SpectreVault ABI - Key functions only
export const SPECTRE_VAULT_ABI = [
  // View functions
  {
    inputs: [],
    name: "totalValueLocked",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "hasBalance",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "", type: "address" }],
    name: "withdrawRequested",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getBalance",
    outputs: [{ internalType: "euint128", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "hasPendingWithdrawal",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "isWithdrawalReady",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  // Write functions
  {
    inputs: [],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "bytes", name: "amount", type: "bytes" },
    ],
    name: "transfer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    // Partial withdrawal - specify amount to withdraw
    inputs: [{ internalType: "uint128", name: "amount", type: "uint128" }],
    name: "requestWithdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    // Withdraw ALL balance (convenience)
    inputs: [],
    name: "requestWithdrawAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "claimWithdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    // Request balance decryption for UI display
    inputs: [],
    name: "requestBalanceDecryption",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    // Get decrypted balance (amount, isReady)
    inputs: [],
    name: "getDecryptedBalance",
    outputs: [
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "bool", name: "isReady", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    // TESTNET ONLY: Force claim without FHE decryption check
    inputs: [{ internalType: "uint128", name: "amount", type: "uint128" }],
    name: "forceClaimWithdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "Deposited",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
    ],
    name: "TransferInitiated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
    ],
    name: "WithdrawalRequested",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "WithdrawalClaimed",
    type: "event",
  },
] as const;
