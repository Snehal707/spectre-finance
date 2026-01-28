import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { HeaderBar } from '../components/HeaderBar';
import { HeroBlock } from '../components/HeroBlock';
import { EncryptDecryptCard } from '../components/EncryptDecryptCard';
import { useTheme } from '../hooks/useTheme';
import { useWallet } from '../hooks/useWallet';
import { CONTRACT_ADDRESSES } from '../utils/config';
import { SPECTRE_TOKEN_ABI } from '../utils/fherc20-abi';

export function SpectrePage() {
  const { theme, toggleTheme } = useTheme();
  const { wallet, isConnecting, connect, disconnect, fetchBalance } = useWallet();
  const isLight = theme === 'light';

  const [eEthBalance, setEEthBalance] = useState('0');

  // Fetch seETH balance from FHERC20 contract
  const fetchVaultStatus = useCallback(async () => {
    if (!wallet.isConnected || !wallet.address || !CONTRACT_ADDRESSES.spectreToken || !window.ethereum) {
      setEEthBalance('0');
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
        const stored = localStorage.getItem(`spectre_eeth_${normalizedAddress}`);
        setEEthBalance(stored || '0.0000');
      } else {
        setEEthBalance('0');
      }
    } catch (err) {
      console.error('Error fetching seETH balance:', err);
      // On error, try to use localStorage value
      const normalizedAddress = wallet.address.toLowerCase();
      const stored = localStorage.getItem(`spectre_eeth_${normalizedAddress}`);
      setEEthBalance(stored || '0');
    }
  }, [wallet.isConnected, wallet.address]);

  // Initial fetch and polling
  useEffect(() => {
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
      className={`min-h-screen ${isLight ? 'bg-[#f0f7ff]' : 'bg-slate-950'}`}
      style={{
        backgroundImage: `linear-gradient(${isLight ? 'rgba(37, 99, 235, 0.08)' : 'rgba(59, 130, 246, 0.08)'} 1px, transparent 1px),
                          linear-gradient(90deg, ${isLight ? 'rgba(37, 99, 235, 0.08)' : 'rgba(59, 130, 246, 0.08)'} 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-10 px-6 pb-16 pt-8 lg:px-10">
        <HeaderBar
          theme={theme}
          onToggleTheme={toggleTheme}
          walletAddress={wallet.address}
          isConnected={wallet.isConnected}
          onConnect={connect}
          onDisconnect={disconnect}
          isConnecting={isConnecting}
        />

        <div className="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <HeroBlock />
          <div className="flex w-full justify-center lg:justify-end">
            <EncryptDecryptCard
              theme={theme}
              ethBalance={wallet.balance}
              eEthBalance={eEthBalance}
              isConnected={wallet.isConnected}
              walletAddress={wallet.address}
              onBalanceUpdate={handleRefresh}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
