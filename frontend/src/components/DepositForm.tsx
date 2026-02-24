import { useState } from "react";
import {
  Lock,
  ArrowDown,
  Loader2,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { PrivacyGuard } from "./PrivacyGuard";
import { DEFAULT_NETWORK } from "../utils/config";
import type { TransactionStatus } from "../types";

interface DepositFormProps {
  walletBalance: string;
  onDeposit: (amount: string) => Promise<string>;
  txStatus: TransactionStatus;
  onReset: () => void;
}

export function DepositForm({
  walletBalance,
  onDeposit,
  txStatus,
  onReset,
}: DepositFormProps) {
  const [amount, setAmount] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    try {
      await onDeposit(amount);
      setAmount("");
    } catch (error) {
      console.error("Deposit failed:", error);
    }
  };

  const handleMaxClick = () => {
    // Leave some gas for the transaction
    const maxAmount = Math.max(0, parseFloat(walletBalance) - 0.01);
    setAmount(maxAmount.toFixed(4));
  };

  const handleSuggestedAmount = (suggested: string) => {
    setAmount(suggested);
  };

  // Show success state
  if (txStatus.isSuccess && txStatus.txHash) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Deposit Successful!
        </h3>
        <p className="text-gray-400 mb-4">
          Your ETH has been encrypted and deposited into the Spectre Vault.
        </p>
        <div className="flex items-center justify-center gap-2 text-fhenix-blue mb-6">
          <Lock className="w-4 h-4" />
          <span className="text-sm">Balance is now encrypted with FHE</span>
        </div>
        <div className="flex gap-3 justify-center">
          <a
            href={`${DEFAULT_NETWORK.blockExplorer}/tx/${txStatus.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-spectre-card border border-spectre-border rounded-lg 
                     text-gray-300 hover:text-white flex items-center gap-2"
          >
            View Transaction <ExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={onReset}
            className="px-4 py-2 bg-fhenix-blue text-black font-semibold rounded-lg 
                     hover:bg-fhenix-blue/80"
          >
            Make Another Deposit
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* From: Wallet */}
      <div className="space-y-2">
        <label className="text-sm text-gray-400 flex justify-between">
          <span>From Wallet</span>
          <span>Balance: {parseFloat(walletBalance).toFixed(4)} ETH</span>
        </label>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            step="0.0001"
            min="0"
            className="w-full px-4 py-4 bg-spectre-dark border border-spectre-border rounded-lg 
                     text-white text-2xl font-mono focus:outline-none focus:border-fhenix-blue
                     placeholder-gray-600"
            disabled={txStatus.isLoading}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button
              type="button"
              onClick={handleMaxClick}
              className="px-2 py-1 bg-fhenix-blue/20 text-fhenix-blue text-xs font-semibold 
                       rounded hover:bg-fhenix-blue/30"
            >
              MAX
            </button>
            <span className="text-gray-400 font-semibold">ETH</span>
          </div>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex justify-center">
        <div
          className="w-10 h-10 rounded-full bg-spectre-card border border-spectre-border 
                      flex items-center justify-center"
        >
          <ArrowDown className="w-5 h-5 text-fhenix-blue" />
        </div>
      </div>

      {/* To: Encrypted Vault */}
      <div className="space-y-2">
        <label className="text-sm text-gray-400">
          To Spectre Vault (Encrypted)
        </label>
        <div className="px-4 py-4 bg-spectre-dark border border-spectre-border rounded-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-fhenix-blue/20 flex items-center justify-center">
            <Lock className="w-5 h-5 text-fhenix-blue" />
          </div>
          <div>
            <div className="text-white font-mono text-lg">
              {amount || "0.0"} eETH
            </div>
            <div className="text-xs text-fhenix-blue flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-fhenix-blue animate-pulse" />
              Encrypted with FHE
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Guard Warning */}
      <PrivacyGuard amount={amount} onSuggestedAmount={handleSuggestedAmount} />

      {/* Error Display */}
      {txStatus.isError && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {txStatus.error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!amount || parseFloat(amount) <= 0 || txStatus.isLoading}
        className="w-full py-4 bg-gradient-to-r from-fhenix-blue to-fhenix-purple rounded-lg 
                 font-semibold text-white text-lg btn-cyber neon-glow
                 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-600 
                 disabled:to-gray-700 disabled:shadow-none"
      >
        {txStatus.isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Encrypting & Depositing...
          </span>
        ) : (
          "Deposit & Encrypt"
        )}
      </button>

      {/* Info Text */}
      <p className="text-xs text-gray-500 text-center">
        Your deposit will be encrypted using Fully Homomorphic Encryption (FHE).
        <br />
        Only you can see your actual balance.
      </p>
    </form>
  );
}
