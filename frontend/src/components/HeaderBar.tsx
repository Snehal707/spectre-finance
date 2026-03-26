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
    <header className="flex w-full items-center justify-between gap-4">
      <div className="flex min-h-11 items-center">
        <div className="flex items-baseline gap-2">
          <span
            className={`font-cyber text-[1.4rem] font-bold leading-none sm:text-[1.55rem] ${
              isLight ? "text-sky-600" : "text-spectre-accent"
            }`}
          >
            Spectre
          </span>
          <span
            className={`font-cyber text-[1.4rem] font-bold leading-none sm:text-[1.55rem] ${
              isLight ? "text-slate-900" : "text-spectre-text"
            }`}
          >
            Finance
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          theme={theme}
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
            <div
              className={`clip-cyber-btn flex items-center gap-2 border px-4 py-2 text-sm font-semibold ${
                isLight
                  ? "border-slate-200 bg-white/90 text-slate-700"
                  : "border-spectre-border-soft bg-slate-950/60 text-spectre-accent"
              }`}
            >
              <Wallet size={16} />
              <span className="font-mono text-xs tracking-widest">
                {formatAddress(walletAddress)}
              </span>
            </div>
            <Button
              theme={theme}
              variant="ghost"
              size="sm"
              onClick={onDisconnect}
              aria-label="Disconnect wallet"
              title="Disconnect wallet"
              className="p-2.5 text-spectre-danger hover:bg-spectre-danger/10"
            >
              <LogOut size={16} />
            </Button>
          </div>
        ) : (
          <Button
            theme={theme}
            variant="primary"
            size="md"
            icon={<Wallet size={16} />}
            onClick={onConnect}
            disabled={isConnecting}
            className="clip-cyber-btn"
          >
            {isConnecting ? "Connecting..." : "Connect"}
          </Button>
        )}
      </div>
    </header>
  );
}
