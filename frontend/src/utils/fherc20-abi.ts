// SpectreToken (FHERC20) ABI - Full privacy with encrypted transfers
export const SPECTRE_TOKEN_ABI = [
  // ============ Token Metadata ============
  {
    inputs: [],
    name: "name",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },

  // ============ View Functions ============
  {
    inputs: [],
    name: "totalValueLocked",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "encryptedBalanceOf",
    outputs: [{ internalType: "euint128", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [{ internalType: "euint128", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "userHasBalance",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "addressHasBalance",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "indicatedBalanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
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
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ internalType: "euint128", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },

  // ============ Mint (ETH -> seETH) ============
  {
    inputs: [],
    name: "mint",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },

  // ============ Transfer Functions (Encrypted!) ============
  // Plain version for simpler testing
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "uint128", name: "amount", type: "uint128" },
    ],
    name: "transferPlain",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  // Encrypted transfer (true privacy)
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      {
        components: [
          { internalType: "uint256", name: "ctHash", type: "uint256" },
          { internalType: "uint8", name: "securityZone", type: "uint8" },
          { internalType: "uint8", name: "utype", type: "uint8" },
          { internalType: "bytes", name: "signature", type: "bytes" },
        ],
        internalType: "struct InEuint128",
        name: "encryptedAmount",
        type: "tuple",
      },
    ],
    name: "transfer",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },

  // ============ Approve Functions ============
  {
    inputs: [
      { internalType: "address", name: "spender", type: "address" },
      { internalType: "uint128", name: "amount", type: "uint128" },
    ],
    name: "approvePlain",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },

  // ============ Burn Functions (seETH -> ETH) ============
  {
    // Burn specific amount (plaintext for testing)
    inputs: [{ internalType: "uint128", name: "amount", type: "uint128" }],
    name: "requestBurnPlain",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    // Burn ALL tokens
    inputs: [],
    name: "requestBurnAll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    // Claim ETH after CoFHE decryption
    inputs: [],
    name: "claimETH",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  // ============ Balance Viewing ============
  {
    inputs: [],
    name: "requestBalanceDecryption",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getDecryptedBalance",
    outputs: [
      { internalType: "uint256", name: "amount", type: "uint256" },
      { internalType: "bool", name: "isReady", type: "bool" },
    ],
    stateMutability: "view",
    type: "function",
  },

  // ============ Events ============
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      { indexed: true, internalType: "address", name: "to", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "to", type: "address" },
    ],
    name: "Mint",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
    ],
    name: "Burn",
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
    ],
    name: "WithdrawalClaimed",
    type: "event",
  },
] as const;
