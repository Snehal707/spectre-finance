import { LogOut, Moon, Sun, Wallet } from "lucide-react";

import { Button } from "./ui/Button";

type HeaderBarProps = {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  walletAddress: string | null;
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  isConnecting: boolean;
};

export function HeaderBar({
  theme,
  onToggleTheme,
  walletAddress,
  isConnected,
  onConnect,
  onDisconnect,
  isConnecting,
}: HeaderBarProps) {
  const isLight = theme === "light";

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full ${
            isLight
              ? "bg-blue-50"
              : "bg-spectre-card-soft border border-spectre-border-soft"
          }`}
        >
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <circle
              cx="20"
              cy="20"
              r="20"
              fill={isLight ? "#E0F2FE" : "#1E293B"}
            />
            <path
              d="M20 10C14.4772 10 10 14.4772 10 20C10 25.5228 14.4772 30 20 30"
              stroke="#00D4FF"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="20" cy="20" r="3.5" fill="#00D4FF" />
            <path
              d="M29 15L27 15"
              stroke="#00D4FF"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M31 20L26 20"
              stroke="#00D4FF"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <span
          className={`font-cyber text-xl font-semibold tracking-[0.3em] ${
            isLight ? "text-slate-900" : "text-spectre-text"
          }`}
        >
          SPECTRE
        </span>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="rounded-full p-2.5"
        >
          {isLight ? <Sun size={18} /> : <Moon size={18} />}
        </Button>

        {isConnected && walletAddress ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-spectre-border-soft bg-spectre-card-soft/90 px-4 py-2 text-sm font-semibold text-spectre-accent">
              <Wallet size={16} />
              <span className="font-mono">{formatAddress(walletAddress)}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDisconnect}
              aria-label="Disconnect wallet"
              title="Disconnect wallet"
              className="rounded-xl p-2.5 text-spectre-danger hover:bg-spectre-danger/10"
            >
              <LogOut size={16} />
            </Button>
          </div>
        ) : (
          <Button
            variant="primary"
            size="md"
            icon={<Wallet size={16} />}
            onClick={onConnect}
            disabled={isConnecting}
          >
            {isConnecting ? "Connecting..." : "Connect"}
          </Button>
        )}
      </div>
    </header>
  );
}
