import { Moon, Sun, Wallet, LogOut } from 'lucide-react';

type HeaderBarProps = {
  theme: 'light' | 'dark';
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
  const isLight = theme === 'light';

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${isLight ? 'bg-blue-50' : 'bg-slate-800'}`}>
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="20" fill={isLight ? '#E0F2FE' : '#1E293B'} />
            <path
              d="M20 10C14.4772 10 10 14.4772 10 20C10 25.5228 14.4772 30 20 30"
              stroke="#0284C7"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="20" cy="20" r="3.5" fill="#0284C7" />
            <path d="M29 15L27 15" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
            <path d="M31 20L26 20" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
        <span className={`text-xl font-semibold tracking-[0.3em] ${isLight ? 'text-slate-900' : 'text-white'}`}>
          SPECTRE
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleTheme}
          className={`rounded-full p-2.5 transition ${isLight ? 'bg-white text-slate-500 shadow-sm hover:bg-slate-50' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          aria-label="Toggle theme"
        >
          {isLight ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {isConnected && walletAddress ? (
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm ${
                isLight ? 'bg-blue-50 text-blue-700' : 'bg-slate-800 text-blue-200'
              }`}
            >
              <Wallet size={16} />
              <span className="font-mono">{formatAddress(walletAddress)}</span>
            </div>
            <button
              type="button"
              onClick={onDisconnect}
              className={`rounded-xl p-2.5 transition ${
                isLight
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
              }`}
              aria-label="Disconnect wallet"
              title="Disconnect wallet"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onConnect}
            disabled={isConnecting}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition ${
              isLight
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } disabled:opacity-50`}
          >
            <Wallet size={16} />
            <span>{isConnecting ? 'Connecting...' : 'Connect'}</span>
          </button>
        )}
      </div>
    </header>
  );
}
