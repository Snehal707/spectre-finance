import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";

import { Button } from "../components/ui/Button";
import { EncryptDecryptCard } from "../components/EncryptDecryptCard";
import { HeaderBar } from "../components/HeaderBar";
import { HeroBlock } from "../components/HeroBlock";
import { useTheme } from "../hooks/useTheme";
import { useWallet } from "../hooks/useWallet";
import { CONTRACT_ADDRESSES } from "../utils/config";
import { SPECTRE_TOKEN_ABI } from "../utils/fherc20-abi";

export function SpectrePage() {
  const { theme, toggleTheme } = useTheme();
  const {
    wallet,
    isConnecting,
    isCorrectNetwork,
    currentNetworkName,
    connect,
    disconnect,
    switchNetwork,
    fetchBalance,
  } = useWallet();
  const isLight = theme === "light";

  const [eEthBalance, setEEthBalance] = useState("0");

  // Fetch seETH balance from FHERC20 contract
  const fetchVaultStatus = useCallback(async () => {
    if (
      !wallet.isConnected ||
      !wallet.address ||
      !CONTRACT_ADDRESSES.spectreToken ||
      !window.ethereum
    ) {
      setEEthBalance("0");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.spectreToken,
        SPECTRE_TOKEN_ABI,
        signer
      );

      // Check if user has balance in the FHERC20 token (use userHasBalance for msg.sender)
      const hasBalance = await contract.userHasBalance();

      // Normalize wallet address to lowercase for consistent localStorage keys
      const normalizedAddress = wallet.address.toLowerCase();

      if (hasBalance) {
        // We track it locally since balance is encrypted
        const stored = localStorage.getItem(
          `spectre_eeth_${normalizedAddress}`
        );
        setEEthBalance(stored || "0.0000");
      } else {
        setEEthBalance("0");
      }
    } catch (err) {
      console.error("Error fetching seETH balance:", err);
      // On error, try to use localStorage value
      const normalizedAddress = wallet.address.toLowerCase();
      const stored = localStorage.getItem(`spectre_eeth_${normalizedAddress}`);
      setEEthBalance(stored || "0");
    }
  }, [wallet.isConnected, wallet.address]);

  // Initial fetch and polling
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: initial fetch + 10s polling
    fetchVaultStatus();
    const interval = setInterval(fetchVaultStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchVaultStatus]);

  // Combined refresh function
  const handleRefresh = useCallback(() => {
    fetchVaultStatus();
    fetchBalance();
  }, [fetchVaultStatus, fetchBalance]);

  return (
    <div
      className={`min-h-screen ${
        isLight ? "bg-[#020617]" : "bg-spectre-bg"
      } bg-cyber-grid`}
    >
      {/* Top navbar – Stitch: logo, theme toggle, wallet connect, network badge */}
      <header className="sticky top-0 z-10 border-b border-spectre-border-soft/60 bg-spectre-card/50 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-10">
          <HeaderBar
            theme={theme}
            onToggleTheme={toggleTheme}
            walletAddress={wallet.address}
            isConnected={wallet.isConnected}
            onConnect={connect}
            onDisconnect={disconnect}
            isConnecting={isConnecting}
          />
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-col gap-10 px-6 pb-16 pt-8 lg:px-10">
        {wallet.isConnected && !isCorrectNetwork && (
          <div
            className={`mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 ${
              isLight
                ? "border-amber-200 bg-amber-50 text-amber-800"
                : "border-amber-700 bg-amber-900/30 text-amber-200"
            }`}
          >
            <p className="text-sm font-medium">
              You&apos;re on <strong>{currentNetworkName}</strong>. Spectre
              Finance is only on Sepolia.
            </p>
            <Button onClick={switchNetwork} size="md">
              Switch to Sepolia
            </Button>
          </div>
        )}

        {/* Stitch: 2-column grid – hero left, primary action card right */}
        <section className="grid w-full grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <HeroBlock theme={theme} />
          <div className="flex w-full justify-center lg:justify-end">
            <EncryptDecryptCard
              theme={theme}
              ethBalance={wallet.balance}
              eEthBalance={eEthBalance}
              isConnected={wallet.isConnected}
              walletAddress={wallet.address}
              isCorrectNetwork={isCorrectNetwork}
              onBalanceUpdate={handleRefresh}
            />
          </div>
        </section>

        {/* Stitch: Recent activity section – table-friendly spacing */}
        <section className="mt-12 flex flex-col gap-4">
          <h2 className="font-cyber text-sm font-semibold uppercase tracking-wider text-spectre-muted">
            Recent activity
          </h2>
          <div className="spectre-glass-soft overflow-hidden rounded-spectre-lg border border-spectre-border-soft/60">
            <div className="min-h-[120px] px-4 py-6 text-center text-sm text-spectre-muted">
              No recent transactions. Encrypt, transfer, or withdraw to see
              activity here.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
