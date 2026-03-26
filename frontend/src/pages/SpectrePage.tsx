import { useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";
import { ArrowRightLeft } from "lucide-react";
import type { MouseEvent } from "react";

import { Button } from "../components/ui/Button";
import { EncryptDecryptCard } from "../components/EncryptDecryptCard";
import { HeaderBar } from "../components/HeaderBar";
import { HeroBlock } from "../components/HeroBlock";
import { useTheme } from "../hooks/useTheme";
import { useWallet } from "../hooks/useWallet";
import { CONTRACT_ADDRESSES, DEFAULT_NETWORK } from "../utils/config";
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
    <div className="pointer-events-none fixed inset-0 z-[150] flex items-center justify-center">
      <div className="absolute inset-0 bg-white animate-white-out" />
      <div className="relative text-center">
        <h2 className="font-cyber text-5xl font-black text-spectre-accent animate-glitch">
          {heading}
        </h2>
        <p className="font-mono text-[10px] tracking-[0.4em] text-spectre-muted">
          {subtext}
        </p>
      </div>
    </div>
  );
}

type TxRecord = { type: string; amount: string; hash: string; ts: number };

const TX_LABELS: Record<string, { label: string; token: string }> = {
  encrypt: { label: "MINT", token: "ETH → seETH" },
  transfer: { label: "TRANSFER", token: "seETH" },
  decrypt: { label: "BURN", token: "seETH → ETH" },
};

type ActivityStatProps = {
  label: string;
  value: string;
  theme: "light" | "dark";
};

function ActivityStat({ label, value, theme }: ActivityStatProps) {
  const isLight = theme === "light";

  return (
    <div
      className={`clip-cyber border px-4 py-3 ${
        isLight
          ? "border-slate-200 bg-white/75"
          : "border-spectre-border-soft/70 bg-slate-950/40"
      }`}
    >
      <p
        className={`font-mono text-[10px] font-semibold uppercase tracking-[0.28em] ${
          isLight ? "text-slate-400" : "text-spectre-muted"
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-2 font-cyber text-lg font-bold tracking-[0.08em] ${
          isLight ? "text-slate-900" : "text-spectre-text"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

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

      const hasBalance = await contract.userHasBalance();
      const normalizedAddress = wallet.address.toLowerCase();

      if (hasBalance) {
        const stored = localStorage.getItem(
          `spectre_eeth_${normalizedAddress}`
        );
        setEEthBalance(stored || "0.0000");
      } else {
        setEEthBalance("0");
      }
    } catch (err) {
      console.error("Error fetching seETH balance:", err);
      const normalizedAddress = wallet.address.toLowerCase();
      const stored = localStorage.getItem(`spectre_eeth_${normalizedAddress}`);
      setEEthBalance(stored || "0");
    }
  }, [wallet.isConnected, wallet.address]);

  useEffect(() => {
    if (sessionStorage.getItem("spectre_booted") === "true") {
      setIsBooting(false);
    }
  }, []);

  const handleBootComplete = () => {
    sessionStorage.setItem("spectre_booted", "true");
    setIsBooting(false);
  };

  const loadTxHistory = useCallback(() => {
    if (!wallet.address) {
      setTxHistory([]);
      return;
    }

    const key = `spectre_txs_${wallet.address.toLowerCase()}`;
    const stored = localStorage.getItem(key);
    setTxHistory(stored ? (JSON.parse(stored) as TxRecord[]) : []);
  }, [wallet.address]);

  useEffect(() => {
    loadTxHistory();
  }, [loadTxHistory, successMessage]);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const { innerWidth, innerHeight } = window;
    setParallax({
      x: (event.clientX - innerWidth / 2) / 50,
      y: (event.clientY - innerHeight / 2) / 50,
    });
  };

  useEffect(() => {
    fetchVaultStatus();
    const interval = setInterval(fetchVaultStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchVaultStatus]);

  const handleRefresh = useCallback(() => {
    fetchVaultStatus();
    fetchBalance();
  }, [fetchVaultStatus, fetchBalance]);

  const latestTx = txHistory[0];
  const latestTxLabel = latestTx
    ? TX_LABELS[latestTx.type]?.label ?? "EVENT"
    : "IDLE";

  if (isBooting) {
    return <SystemBoot onComplete={handleBootComplete} />;
  }

  return (
    <div
      className={`relative min-h-screen overflow-hidden ${
        isLight ? "bg-[#f5f7fb] text-slate-900" : "bg-spectre-bg text-spectre-text"
      }`}
      onMouseMove={handleMouseMove}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className={`absolute inset-0 ${
            isLight
              ? "bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_32%),radial-gradient(circle_at_82%_12%,rgba(14,165,233,0.14),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.8),rgba(241,245,249,0.9))]"
              : "bg-[radial-gradient(circle_at_top_left,rgba(37,209,244,0.18),transparent_30%),radial-gradient(circle_at_82%_14%,rgba(123,97,255,0.18),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_28%)]"
          }`}
        />
        <div
          className={`absolute inset-0 bg-cyber-grid ${
            isLight ? "opacity-[0.12]" : "opacity-100"
          }`}
        />
        <div
          className={`absolute inset-0 spectre-noise ${
            isLight ? "opacity-[0.04]" : "opacity-[0.05]"
          }`}
        />
        <div className="animate-float-slow absolute -left-24 top-24 h-72 w-72 rounded-full bg-fhenix-blue/10 blur-3xl" />
        <div className="animate-float-slow absolute right-0 top-64 h-80 w-80 rounded-full bg-fhenix-purple/10 blur-3xl [animation-delay:1.8s]" />
      </div>

      {successMessage && (
        <SuccessEffect
          heading={successMessage.heading}
          subtext={successMessage.subtext}
          onComplete={() => setSuccessMessage(null)}
        />
      )}

      <header
        className={`sticky top-0 z-20 overflow-hidden backdrop-blur-xl ${
          isLight
            ? "bg-white/82 shadow-[0_10px_30px_rgba(148,163,184,0.14)]"
            : "bg-slate-950/60 shadow-[0_14px_34px_rgba(2,6,23,0.34)]"
        }`}
      >
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

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 pb-16 pt-8 lg:px-10">
        {wallet.isConnected && !isCorrectNetwork && (
          <div
            className={`clip-cyber relative flex flex-wrap items-center justify-between gap-3 overflow-hidden border px-4 py-4 ${
              isLight
                ? "border-amber-200 bg-amber-50/90 text-amber-800"
                : "border-amber-700/60 bg-amber-900/20 text-amber-200"
            }`}
          >
            <div className="absolute inset-y-0 left-0 w-1 bg-cyber-yellow" />
            <p className="text-sm font-medium">
              You&apos;re on <strong>{currentNetworkName}</strong>. Spectre
              Finance is only on Sepolia.
            </p>
            <Button theme={theme} onClick={switchNetwork} size="md">
              Switch to Sepolia
            </Button>
          </div>
        )}

        <section className="grid w-full grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div
            className="relative transition-transform duration-75"
            style={{
              transform: `translate3d(${parallax.x}px, ${parallax.y}px, 0)`,
            }}
          >
            <HeroBlock theme={theme} />
          </div>
          <div className="flex w-full justify-center lg:sticky lg:top-28 lg:justify-end">
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

        <section className="mt-4 flex flex-col gap-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <h2
                className={`font-cyber text-2xl font-bold tracking-[0.08em] ${
                  isLight ? "text-slate-900" : "text-spectre-text"
                }`}
              >
                Recent activity
              </h2>
              <p className={`max-w-2xl text-sm ${isLight ? "text-slate-500" : "text-spectre-muted"}`}>
                Local history for the current wallet session. Mint, transfer,
                and burn events appear here after each transaction completes.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <ActivityStat
                label="Entries"
                value={txHistory.length.toString().padStart(2, "0")}
                theme={theme}
              />
              <ActivityStat
                label="Latest Event"
                value={latestTxLabel}
                theme={theme}
              />
              <ActivityStat
                label="Wallet State"
                value={wallet.isConnected ? "Live" : "Offline"}
                theme={theme}
              />
            </div>
          </div>

          <div
            className={`clip-cyber relative overflow-hidden border ${
              isLight
                ? "border-slate-200 bg-white/70"
                : "border-spectre-border-soft/60 spectre-glass-soft"
            }`}
          >
            <div className="spectre-frame-line absolute inset-x-0 top-0 h-px" />
            {txHistory.length === 0 ? (
              <div
                className={`flex min-h-[180px] flex-col items-center justify-center gap-4 px-6 py-8 text-center ${
                  isLight ? "text-slate-400" : "text-spectre-muted"
                }`}
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center border ${
                    isLight
                      ? "border-slate-200 bg-slate-50 text-slate-400"
                      : "border-spectre-border-soft/70 bg-slate-950/60 text-spectre-muted"
                  }`}
                >
                  <ArrowRightLeft size={22} />
                </div>
                <div className="space-y-1">
                  <p className={`font-cyber text-lg ${isLight ? "text-slate-700" : "text-spectre-text"}`}>
                    No activity yet
                  </p>
                  <p className="max-w-md text-sm">
                    {wallet.isConnected
                      ? "Encrypt, transfer, or withdraw to populate this ledger."
                      : "Connect your wallet to see session history."}
                  </p>
                </div>
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr
                    className={`border-b font-mono uppercase tracking-widest ${
                      isLight
                        ? "border-slate-200 text-slate-400"
                        : "border-spectre-border-soft/40 text-spectre-muted"
                    }`}
                  >
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Amount</th>
                    <th className="hidden px-4 py-2 text-left sm:table-cell">
                      Token
                    </th>
                    <th className="hidden px-4 py-2 text-left md:table-cell">
                      Tx Hash
                    </th>
                    <th className="px-4 py-2 text-right">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {txHistory.map((tx, i) => {
                    const meta = TX_LABELS[tx.type] ?? {
                      label: tx.type.toUpperCase(),
                      token: "",
                    };
                    const date = new Date(tx.ts);
                    const timeStr = date.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    const dateStr = date.toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    });

                    return (
                      <tr
                        key={i}
                        className={`border-b last:border-0 ${
                          isLight
                            ? "border-slate-100 hover:bg-slate-50"
                            : "border-spectre-border-soft/20 hover:bg-white/5"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <span
                            className={`px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                              tx.type === "encrypt"
                                ? "bg-fhenix-blue/10 text-fhenix-blue"
                                : tx.type === "transfer"
                                ? "bg-fhenix-purple/10 text-fhenix-purple"
                                : "bg-matrix-green/10 text-matrix-green"
                            }`}
                          >
                            {meta.label}
                          </span>
                        </td>
                        <td
                          className={`px-4 py-3 font-mono ${
                            isLight ? "text-slate-800" : "text-spectre-text"
                          }`}
                        >
                          {tx.amount}
                        </td>
                        <td
                          className={`hidden px-4 py-3 sm:table-cell ${
                            isLight ? "text-slate-500" : "text-spectre-muted"
                          }`}
                        >
                          {meta.token}
                        </td>
                        <td className="hidden px-4 py-3 md:table-cell">
                          <a
                            href={`${DEFAULT_NETWORK.blockExplorer}/tx/${tx.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-fhenix-blue hover:underline"
                          >
                            {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                          </a>
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-mono ${
                            isLight ? "text-slate-400" : "text-spectre-muted"
                          }`}
                        >
                          <span className="block">{timeStr}</span>
                          <span className="block text-[10px] opacity-60">
                            {dateStr}
                          </span>
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
