/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SPECTRE_VAULT_ADDRESS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Ethereum window type
interface Window {
  ethereum?: {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    on: (event: string, callback: (...args: unknown[]) => void) => void;
    removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
    isMetaMask?: boolean;
  };
}
