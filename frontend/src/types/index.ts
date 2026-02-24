export interface WalletState {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
  balance: string;
}

export interface VaultState {
  encryptedBalance: string | null;
  hasBalance: boolean;
  hasPendingWithdrawal: boolean;
  isWithdrawalReady: boolean;
  tvl: string;
}

export interface TransactionStatus {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: string | null;
  txHash: string | null;
}

export interface PrivacyWarning {
  show: boolean;
  message: string;
  suggestedAmount: string | null;
}

export type TabType = "deposit" | "transfer" | "withdraw";
