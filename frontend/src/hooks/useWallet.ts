import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { DEFAULT_NETWORK } from '../utils/config';
import type { WalletState } from '../types';

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    chainId: null,
    balance: '0',
  });
  const [isConnecting, setIsConnecting] = useState(false);

  // Check if on correct network
  const isCorrectNetwork = wallet.chainId === DEFAULT_NETWORK.chainId;

  // Connect wallet
  const connect = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask to use Spectre Finance');
      return;
    }

    setIsConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const network = await provider.getNetwork();
      const balance = await provider.getBalance(accounts[0]);

      setWallet({
        address: accounts[0],
        isConnected: true,
        chainId: Number(network.chainId),
        balance: ethers.formatEther(balance),
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    setWallet({
      address: null,
      isConnected: false,
      chainId: null,
      balance: '0',
    });
  }, []);

  // Fetch balance
  const fetchBalance = useCallback(async () => {
    if (typeof window.ethereum === 'undefined' || !wallet.address) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(wallet.address);
      setWallet((prev) => ({ ...prev, balance: ethers.formatEther(balance) }));
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  }, [wallet.address]);

  // Switch to correct network (Sepolia)
  const switchNetwork = useCallback(async () => {
    if (typeof window.ethereum === 'undefined') return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: DEFAULT_NETWORK.chainIdHex }],
      });
    } catch (switchError: any) {
      // Chain not added, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: DEFAULT_NETWORK.chainIdHex,
                chainName: DEFAULT_NETWORK.name,
                nativeCurrency: DEFAULT_NETWORK.nativeCurrency,
                rpcUrls: [DEFAULT_NETWORK.rpcUrl],
                blockExplorerUrls: [DEFAULT_NETWORK.blockExplorer],
              },
            ],
          });
        } catch (addError) {
          console.error('Failed to add network:', addError);
        }
      }
    }
  }, []);

  // Listen for account/network changes
  useEffect(() => {
    if (typeof window.ethereum === 'undefined') return;

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (accounts.length === 0) {
        disconnect();
      } else {
        setWallet((prev) => ({ ...prev, address: accounts[0] }));
      }
    };

    const handleChainChanged = (...args: unknown[]) => {
      const chainId = args[0] as string;
      setWallet((prev) => ({ ...prev, chainId: parseInt(chainId, 16) }));
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [disconnect]);

  // Auto-connect if previously connected
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum === 'undefined') return;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();

      if (accounts.length > 0) {
        connect();
      }
    };

    checkConnection();
  }, [connect]);

  return {
    wallet,
    isConnecting,
    isCorrectNetwork,
    connect,
    disconnect,
    switchNetwork,
    fetchBalance,
  };
}
