import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import type { MouseEvent } from "react";

import { Button } from "../components/ui/Button";
import { EncryptDecryptCard } from "../components/EncryptDecryptCard";
import { HeaderBar } from "../components/HeaderBar";
import { HeroBlock } from "../components/HeroBlock";
import { useTheme } from "../hooks/useTheme";
import { useWallet } from "../hooks/useWallet";
import { CONTRACT_ADDRESSES } from "../utils/config";
import { SPECTRE_TOKEN_ABI } from "../utils/fherc20-abi";
import { getEthersSigner } from "../utils/ethers";

const BOOT_LINES = [
  "INIT_SPECTRE_OS...",
  "MOUNTING_VAULT...",
  "BYPASSING_NODES...",
  "LINK_STABLE.",
  "WELCOME.",
];

type SystemBootProps = {
  onComplete: () => void;
};

function SystemBoot({ onComplete }: SystemBootProps) {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < BOOT_LINES.length) {
        setLogs((prev) => [...prev, BOOT_LINES[index]]);
        index += 1;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 800);
      }
    }, 300);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black font-mono text-[10px] text-spectre-accent">
      <div className="space-y-1">
        {logs.map((line) => (
          <div key={line}>{"> "}{line}</div>
        ))}
      </div>
    </div>
  );
}

export type SuccessMessage = { heading: string; subtext: string };

type SuccessEffectProps = {
  heading: string;
  subtext: string;
  onComplete: () => void;
};

function SuccessEffect({ heading, subtext, onComplete }: SuccessEffectProps) {
  useEffect(() => {
    const timeout = setTimeout(onComplete, 2000);
    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 bg-white animate-white-out" />
      <div className="relative text-center">
        <h2 className="font-cyber text-5xl font-black text-spectre-accent animate-glitch">
          {heading}
        </h2>
        <p className="font-mono text-[10px] text-spectre-muted tracking-[0.4em]">
          {subtext}
        </p>
      </div>
    </div>
  );
}

type TxRecord = { type: string; amount: string; hash: string; ts: number };

const TX_LABELS: Record<string, { label: string; token: string }> = {
  encrypt:  { label: "MINT",     token: "ETH → seETH" },
  transfer: { label: "TRANSFER", token: "seETH" },
  decrypt:  { label: "BURN",     token: "seETH → ETH" },
};

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
  const [isBooting, setIsBooting] = useState(true);
  const [successMessage, setSuccessMessage] = useState<SuccessMessage | null>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const [txHistory, setTxHistory] = useState<TxRecord[]>([]);

  // Fetch seETH balance from FHERC20 contract
  const fetchVaultStatus = useCallback(async () => {
    if (
      !wallet.isConnected ||
      !wallet.address ||
      !CONTRACT_ADDRESSES.spectreToken
    ) {
      setEEthBalance("0");
      return;
    }

    try {
      const signer = await getEthersSigner();
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

  // Boot overlay - run once per session
  /* eslint-disable react-hooks/set-state-in-effect -- intentional: read sessionStorage on mount to skip boot */
  useEffect(() => {
    if (sessionStorage.getItem("spectre_booted") === "true") {
      setIsBooting(false);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleBootComplete = () => {
    sessionStorage.setItem("spectre_booted", "true");
    setIsBooting(false);
  };

  // Reload tx history from localStorage whenever wallet or a new success fires
  const loadTxHistory = useCallback(() => {
    if (!wallet.address) { setTxHistory([]); return; }
    const key = `spectre_txs_${wallet.address.toLowerCase()}`;
    const stored = localStorage.getItem(key);
    setTxHistory(stored ? (JSON.parse(stored) as TxRecord[]) : []);
  }, [wallet.address]);

  /* eslint-disable react-hooks/set-state-in-effect -- derived from localStorage on wallet/success change */
  useEffect(() => { loadTxHistory(); }, [loadTxHistory, successMessage]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const { innerWidth, innerHeight } = window;
    setParallax({
      x: (event.clientX - innerWidth / 2) / 50,
      y: (event.clientY - innerHeight / 2) / 50,
    });
  };

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

  if (isBooting) {
    return <SystemBoot onComplete={handleBootComplete} />;
  }

  return (
    <div
      className={`min-h-screen ${
        isLight ? "bg-slate-100" : "bg-spectre-bg bg-cyber-grid"
      }`}
      onMouseMove={handleMouseMove}
    >
      {successMessage && (
        <SuccessEffect
          heading={successMessage.heading}
          subtext={successMessage.subtext}
          onComplete={() => setSuccessMessage(null)}
        />
      )}
      {/* Top navbar – Stitch: logo, theme toggle, wallet connect, network badge */}
      <header className={`sticky top-0 z-10 border-b backdrop-blur-xl overflow-hidden ${isLight ? "border-slate-200 bg-white/80" : "border-spectre-border-soft/60 bg-spectre-card/50"}`}>
        {/* Hazard strip — spec: border-hazard bottom edge */}
        <div className="absolute bottom-0 left-0 h-[2px] w-full border-hazard opacity-25" />
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

        {/* Stitch: 2-column grid – hero left, primary action card right with subtle parallax */}
        <section className="grid w-full grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div
            className="relative transition-transform duration-75"
            style={{
              transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)`,
            }}
          >
            <HeroBlock theme={theme} />
          </div>
          <div className="flex w-full justify-center lg:justify-end">
            <EncryptDecryptCard
              theme={theme}
              ethBalance={wallet.balance}
              eEthBalance={eEthBalance}
              isConnected={wallet.isConnected}
              walletAddress={wallet.address}
              isCorrectNetwork={isCorrectNetwork}
              onBalanceUpdate={handleRefresh}
              onSuccess={(msg) => setSuccessMessage(msg)}
            />
          </div>
        </section>

        {/* Recent activity – reads from localStorage, no new network calls */}
        <section className="mt-12 flex flex-col gap-4">
          <h2 className={`font-cyber text-sm font-semibold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-spectre-muted"}`}>
            Recent activity
          </h2>
          <div className={`overflow-hidden border ${isLight ? "border-slate-200 bg-white/60" : "spectre-glass-soft border-spectre-border-soft/60"}`}>
            {txHistory.length === 0 ? (
              <div className={`min-h-[120px] px-4 py-6 text-center text-sm ${isLight ? "text-slate-400" : "text-spectre-muted"}`}>
                {wallet.isConnected
                  ? "No recent transactions. Encrypt, transfer, or withdraw to see activity here."
                  : "Connect your wallet to see activity."}
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className={`border-b font-mono uppercase tracking-widest ${isLight ? "border-slate-200 text-slate-400" : "border-spectre-border-soft/40 text-spectre-muted"}`}>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Amount</th>
                    <th className="px-4 py-2 text-left hidden sm:table-cell">Token</th>
                    <th className="px-4 py-2 text-left hidden md:table-cell">Tx Hash</th>
                    <th className="px-4 py-2 text-right">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {txHistory.map((tx, i) => {
                    const meta = TX_LABELS[tx.type] ?? { label: tx.type.toUpperCase(), token: "" };
                    const date = new Date(tx.ts);
                    const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                    const dateStr = date.toLocaleDateString([], { month: "short", day: "numeric" });
                    return (
                      <tr key={i} className={`border-b last:border-0 ${isLight ? "border-slate-100 hover:bg-slate-50" : "border-spectre-border-soft/20 hover:bg-white/5"}`}>
                        <td className="px-4 py-3">
                          <span className={`font-mono font-bold text-[10px] px-1.5 py-0.5 ${
                            tx.type === "encrypt"  ? "bg-fhenix-blue/10 text-fhenix-blue" :
                            tx.type === "transfer" ? "bg-fhenix-purple/10 text-fhenix-purple" :
                                                     "bg-matrix-green/10 text-matrix-green"
                          }`}>
                            {meta.label}
                          </span>
                        </td>
                        <td className={`px-4 py-3 font-mono ${isLight ? "text-slate-800" : "text-spectre-text"}`}>
                          {tx.amount}
                        </td>
                        <td className={`px-4 py-3 hidden sm:table-cell ${isLight ? "text-slate-500" : "text-spectre-muted"}`}>
                          {meta.token}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <a
                            href={`https://explorer.sepolia.fhenix.zone/tx/${tx.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-fhenix-blue hover:underline"
                          >
                            {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                          </a>
                        </td>
                        <td className={`px-4 py-3 text-right font-mono ${isLight ? "text-slate-400" : "text-spectre-muted"}`}>
                          <span className="block">{timeStr}</span>
                          <span className="block text-[10px] opacity-60">{dateStr}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
