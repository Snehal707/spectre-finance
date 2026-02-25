import { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import { SPECTRE_VAULT_ABI } from "../utils/abi";
import { CONTRACT_ADDRESSES } from "../utils/config";
import { getEthersProvider, getEthersSigner } from "../utils/ethers";
import type { VaultState, TransactionStatus } from "../types";

export function useFhenix(address: string | null) {
  const [vaultState, setVaultState] = useState<VaultState>({
    encryptedBalance: null,
    hasBalance: false,
    hasPendingWithdrawal: false,
    isWithdrawalReady: false,
    tvl: "0",
  });

  const [txStatus, setTxStatus] = useState<TransactionStatus>({
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
    txHash: null,
  });

  // Get contract instance
  const getContract = useCallback(async (needsSigner = false) => {
    if (needsSigner) {
      const signer = await getEthersSigner();
      return new ethers.Contract(
        CONTRACT_ADDRESSES.spectreVault,
        SPECTRE_VAULT_ABI,
        signer
      );
    }

    const provider = await getEthersProvider();
    return new ethers.Contract(
      CONTRACT_ADDRESSES.spectreVault,
      SPECTRE_VAULT_ABI,
      provider
    );
  }, []);

  // Fetch vault state
  const refreshVaultState = useCallback(async () => {
    if (!address || !CONTRACT_ADDRESSES.spectreVault) return;

    try {
      const contract = await getContract();

      const [tvl, hasBalance, hasPendingWithdrawal] = await Promise.all([
        contract.totalValueLocked(),
        contract.hasBalance(address),
        contract.withdrawRequested(address),
      ]);

      let isWithdrawalReady = false;
      if (hasPendingWithdrawal) {
        try {
          isWithdrawalReady = await contract.isWithdrawalReady();
        } catch {
          // Ignore error - function might revert if no pending withdrawal
        }
      }

      setVaultState({
        encryptedBalance: hasBalance ? "ENCRYPTED" : null,
        hasBalance,
        hasPendingWithdrawal,
        isWithdrawalReady,
        tvl: ethers.formatEther(tvl),
      });
    } catch (error) {
      console.error("Failed to fetch vault state:", error);
    }
  }, [address, getContract]);

  // Deposit ETH
  const deposit = useCallback(
    async (amount: string) => {
      setTxStatus({
        isLoading: true,
        isSuccess: false,
        isError: false,
        error: null,
        txHash: null,
      });

      try {
        const contract = await getContract(true);
        const tx = await contract.deposit({
          value: ethers.parseEther(amount),
        });

        setTxStatus((prev) => ({ ...prev, txHash: tx.hash }));

        await tx.wait();

        setTxStatus({
          isLoading: false,
          isSuccess: true,
          isError: false,
          error: null,
          txHash: tx.hash,
        });

        // Refresh vault state
        await refreshVaultState();

        return tx.hash;
      } catch (error: unknown) {
        setTxStatus({
          isLoading: false,
          isSuccess: false,
          isError: true,
          error:
            error instanceof Error ? error.message : "Transaction failed",
          txHash: null,
        });
        throw error;
      }
    },
    [getContract, refreshVaultState]
  );

  // Request withdrawal (Step 1)
  const requestWithdraw = useCallback(
    async (encryptedAmount: Uint8Array) => {
      setTxStatus({
        isLoading: true,
        isSuccess: false,
        isError: false,
        error: null,
        txHash: null,
      });

      try {
        const contract = await getContract(true);
        const tx = await contract.requestWithdraw(encryptedAmount);

        setTxStatus((prev) => ({ ...prev, txHash: tx.hash }));

        await tx.wait();

        setTxStatus({
          isLoading: false,
          isSuccess: true,
          isError: false,
          error: null,
          txHash: tx.hash,
        });

        await refreshVaultState();

        return tx.hash;
      } catch (error: unknown) {
        setTxStatus({
          isLoading: false,
          isSuccess: false,
          isError: true,
          error:
            error instanceof Error ? error.message : "Transaction failed",
          txHash: null,
        });
        throw error;
      }
    },
    [getContract, refreshVaultState]
  );

  // Claim withdrawal (Step 2)
  const claimWithdraw = useCallback(async () => {
    setTxStatus({
      isLoading: true,
      isSuccess: false,
      isError: false,
      error: null,
      txHash: null,
    });

    try {
      const contract = await getContract(true);
      const tx = await contract.claimWithdraw();

      setTxStatus((prev) => ({ ...prev, txHash: tx.hash }));

      await tx.wait();

      setTxStatus({
        isLoading: false,
        isSuccess: true,
        isError: false,
        error: null,
        txHash: tx.hash,
      });

      await refreshVaultState();

      return tx.hash;
    } catch (error: unknown) {
      setTxStatus({
        isLoading: false,
        isSuccess: false,
        isError: true,
        error:
          error instanceof Error ? error.message : "Transaction failed",
        txHash: null,
      });
      throw error;
    }
  }, [getContract, refreshVaultState]);

  // Transfer (requires encrypted amount from cofhejs)
  const transfer = useCallback(
    async (to: string, encryptedAmount: Uint8Array) => {
      setTxStatus({
        isLoading: true,
        isSuccess: false,
        isError: false,
        error: null,
        txHash: null,
      });

      try {
        const contract = await getContract(true);
        const tx = await contract.transfer(to, encryptedAmount);

        setTxStatus((prev) => ({ ...prev, txHash: tx.hash }));

        await tx.wait();

        setTxStatus({
          isLoading: false,
          isSuccess: true,
          isError: false,
          error: null,
          txHash: tx.hash,
        });

        await refreshVaultState();

        return tx.hash;
      } catch (error: unknown) {
        setTxStatus({
          isLoading: false,
          isSuccess: false,
          isError: true,
          error:
            error instanceof Error ? error.message : "Transaction failed",
          txHash: null,
        });
        throw error;
      }
    },
    [getContract, refreshVaultState]
  );

  // Reset transaction status
  const resetTxStatus = useCallback(() => {
    setTxStatus({
      isLoading: false,
      isSuccess: false,
      isError: false,
      error: null,
      txHash: null,
    });
  }, []);

  // Auto-refresh vault state: run once on mount then every 30s. Intentional
  // setState-in-effect (refreshVaultState updates vault state); timing unchanged.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: mount + 30s polling
    refreshVaultState();

    // Refresh every 30 seconds
    const interval = setInterval(refreshVaultState, 30000);

    return () => clearInterval(interval);
  }, [refreshVaultState]);

  return {
    vaultState,
    txStatus,
    deposit,
    requestWithdraw,
    claimWithdraw,
    transfer,
    refreshVaultState,
    resetTxStatus,
  };
}
