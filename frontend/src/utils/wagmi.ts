import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";

// Get a free WalletConnect projectId at https://cloud.walletconnect.com
// Without a real projectId, WalletConnect (mobile QR) won't work but all
// browser-extension wallets (MetaMask, Rainbow, Coinbase, etc.) will.
const PROJECT_ID =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "spectrefinance";

export const wagmiConfig = getDefaultConfig({
  appName: "Spectre Finance",
  projectId: PROJECT_ID,
  chains: [sepolia],
  ssr: false,
});
