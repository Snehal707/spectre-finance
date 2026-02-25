import { getConnectorClient } from "@wagmi/core";
import { ethers } from "ethers";
import { wagmiConfig } from "./wagmi";

/**
 * Returns an ethers.js BrowserProvider + Signer from whichever wallet
 * the user connected via RainbowKit (MetaMask, OKX, Rainbow, Coinbase, etc.).
 *
 * Replaces all direct `window.ethereum` usage so every wallet works.
 */
export async function getEthersSigner() {
  const client = await getConnectorClient(wagmiConfig);
  const { chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
  };
  const provider = new ethers.BrowserProvider(transport, network);
  const signer = await provider.getSigner();
  return signer;
}

export async function getEthersProvider() {
  const client = await getConnectorClient(wagmiConfig);
  const { chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
  };
  return new ethers.BrowserProvider(transport, network);
}
