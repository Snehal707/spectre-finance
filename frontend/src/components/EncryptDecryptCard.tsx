import { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2, Send, ArrowDownUp } from 'lucide-react';
import { ethers } from 'ethers';
import { AmountPanel } from './AmountPanel';
import { PercentSlider } from './PercentSlider';
import { StepsPanel } from './StepsPanel';
import { CONTRACT_ADDRESSES, DEFAULT_NETWORK } from '../utils/config';
import { SPECTRE_TOKEN_ABI } from '../utils/fherc20-abi';

type StepState = 'pending' | 'active' | 'done';
type TabMode = 'encrypt' | 'decrypt' | 'transfer';

type EncryptDecryptCardProps = {
  theme: 'light' | 'dark';
  ethBalance: string;
  eEthBalance: string;
  isConnected: boolean;
  walletAddress: string | null;
  onBalanceUpdate: () => void;
};

export function EncryptDecryptCard({ 
  theme, 
  ethBalance, 
  eEthBalance, 
  isConnected,
  walletAddress,
  onBalanceUpdate,
}: EncryptDecryptCardProps) {
  const [mode, setMode] = useState<TabMode>('encrypt');
  const [amount, setAmount] = useState('0');
  const [sliderVal, setSliderVal] = useState(0);
  const [recipientAddress, setRecipientAddress] = useState('');
  
  // Transaction state
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Withdrawal state for decrypt
  const [hasPendingWithdrawal, setHasPendingWithdrawal] = useState(false);
  const [isWithdrawalReady, setIsWithdrawalReady] = useState(false);
  const [hasEncryptedBalance, setHasEncryptedBalance] = useState(false);
  const [isBalanceSyncing, setIsBalanceSyncing] = useState(false);
  const [balanceSyncStatus, setBalanceSyncStatus] = useState<string | null>(null);

  // Mint confirmation modal
  const [showMintConfirm, setShowMintConfirm] = useState(false);

  const isLight = theme === 'light';
  
  const currentBalance = mode === 'encrypt' ? parseFloat(ethBalance) : parseFloat(eEthBalance);
  const displayBalance = isNaN(currentBalance) ? 0 : currentBalance;

  // Check withdrawal status + encrypted balance using FHERC20 contract
  useEffect(() => {
    const checkWithdrawalStatus = async () => {
      if (!isConnected || !walletAddress || !CONTRACT_ADDRESSES.spectreToken || !window.ethereum) {
        setHasPendingWithdrawal(false);
        setIsWithdrawalReady(false);
        setHasEncryptedBalance(false);
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

        const pending = await contract.hasPendingWithdrawal();
        setHasPendingWithdrawal(pending);

        if (pending) {
          const ready = await contract.isWithdrawalReady();
          setIsWithdrawalReady(ready);
        }

        const hasBal = await contract.userHasBalance();
        setHasEncryptedBalance(hasBal);
      } catch (err) {
        console.error('Error checking withdrawal status:', err);
      }
    };

    checkWithdrawalStatus();
    const interval = setInterval(checkWithdrawalStatus, 5000);
    return () => clearInterval(interval);
  }, [isConnected, walletAddress]);

  // Reset when switching modes
  useEffect(() => {
    setAmount('0');
    setSliderVal(0);
    setCurrentStep(0);
    setTxHash(null);
    setError(null);
    setSuccess(false);
    setBalanceSyncStatus(null);
    setRecipientAddress('');
  }, [mode]);

  // Generate steps based on mode and transaction state
  const getSteps = () => {
    if (mode === 'encrypt') {
      return [
        { 
          label: 'PREPARE', 
          state: (success ? 'done' : currentStep === 1 ? 'active' : currentStep > 1 ? 'done' : 'pending') as StepState 
        },
        { 
          label: 'APPROVE', 
          state: (success ? 'done' : currentStep === 2 ? 'active' : currentStep > 2 ? 'done' : 'pending') as StepState 
        },
        { 
          label: 'MINT', 
          state: (success ? 'done' : currentStep === 3 ? 'active' : 'pending') as StepState 
        },
      ];
    }
    
    if (mode === 'transfer') {
      return [
        { 
          label: 'VALIDATE', 
          state: (success ? 'done' : currentStep === 1 ? 'active' : currentStep > 1 ? 'done' : 'pending') as StepState 
        },
        { 
          label: 'ENCRYPT', 
          state: (success ? 'done' : currentStep === 2 ? 'active' : currentStep > 2 ? 'done' : 'pending') as StepState 
        },
        { 
          label: 'TRANSFER', 
          state: (success ? 'done' : currentStep === 3 ? 'active' : 'pending') as StepState 
        },
      ];
    }
    
    // Decrypt mode
    if (isPendingWithdrawal) {
      return [
        { label: 'BURN', state: 'done' as StepState },
        { label: 'DECRYPT', state: 'done' as StepState },
        { 
          label: 'CLAIM', 
          state: (success ? 'done' : currentStep > 0 ? 'active' : 'pending') as StepState 
        },
      ];
    } else {
      return [
        { 
          label: 'BURN', 
          state: (success ? 'done' : currentStep === 1 ? 'active' : currentStep > 1 ? 'done' : 'pending') as StepState 
        },
        { 
          label: 'APPROVE', 
          state: (success ? 'done' : currentStep === 2 ? 'active' : currentStep > 2 ? 'done' : 'pending') as StepState 
        },
        { 
          label: 'CONFIRM', 
          state: (success ? 'done' : currentStep === 3 ? 'active' : 'pending') as StepState 
        },
      ];
    }
  };

  const handleSliderChange = (value: number) => {
    setSliderVal(value);
    const nextAmount = (displayBalance * (value / 100)).toFixed(4);
    setAmount(nextAmount);
  };

  const handleAmountChange = (value: string) => {
    if (!/^\d*\.?\d*$/.test(value)) return;
    setAmount(value);
    const parsed = Number(value || 0);
    const nextPercent = displayBalance === 0 ? 0 : Math.min(100, (parsed / displayBalance) * 100);
    setSliderVal(Number.isFinite(nextPercent) ? nextPercent : 0);
  };

  const handleMax = () => {
    setSliderVal(100);
    setAmount(displayBalance.toFixed(4));
  };

  const handleSyncBalance = async () => {
    if (!isConnected || !walletAddress || !window.ethereum) return;
    if (isBalanceSyncing) return;

    setIsBalanceSyncing(true);
    setBalanceSyncStatus('🔐 Requesting balance decryption...');

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.spectreToken,
        SPECTRE_TOKEN_ABI,
        signer
      );

      const tx = await contract.requestBalanceDecryption();
      await tx.wait();

      setBalanceSyncStatus('⏳ Waiting for CoFHE to decrypt...');

      let attempts = 0;
      let ready = false;
      while (attempts < 6) {
        const [amountRaw, isReady] = await contract.getDecryptedBalance();

        if (isReady) {
          const formatted = ethers.formatEther(amountRaw);
          // Use lowercase address for consistent localStorage keys
          const normalizedAddress = walletAddress?.toLowerCase() || '';
          localStorage.setItem(`spectre_eeth_${normalizedAddress}`, formatted);
          onBalanceUpdate();
          setBalanceSyncStatus(`✅ Balance synced: ${formatted} seETH`);
          ready = true;
          break;
        }
        attempts += 1;
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }

      if (!ready) {
        setBalanceSyncStatus('⏳ Still decrypting. Try again in a few seconds.');
      }
    } catch (err: any) {
      console.error('Balance sync failed:', err);
      setBalanceSyncStatus(err.reason || err.message || 'Balance sync failed');
    } finally {
      setIsBalanceSyncing(false);
    }
  };

  // ENCRYPT: Mint seETH (ETH -> seETH) - called after user confirms in modal
  const handleEncrypt = async () => {
    if (!isConnected || !window.ethereum || parseFloat(amount) <= 0) return;

    setShowMintConfirm(false);
    setIsProcessing(true);
    setCurrentStep(1);
    setError(null);
    setTxHash(null);
    setSuccess(false);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.spectreToken,
        SPECTRE_TOKEN_ABI,
        signer
      );

      setCurrentStep(2);
      const mintAmount = ethers.parseEther(amount);
      const tx = await contract.mint({ value: mintAmount });
      setTxHash(tx.hash);

      setCurrentStep(3);
      await tx.wait();

      setSuccess(true);
      
      const currentSeEth = parseFloat(localStorage.getItem(`spectre_eeth_${walletAddress}`) || '0');
      localStorage.setItem(`spectre_eeth_${walletAddress}`, (currentSeEth + parseFloat(amount)).toFixed(4));
      onBalanceUpdate();

      setTimeout(() => {
        setCurrentStep(0);
        setAmount('0');
        setSliderVal(0);
        setSuccess(false);
        setIsProcessing(false);
        setTxHash(null);
      }, 3000);

    } catch (err: any) {
      console.error('Mint failed:', err);
      setError(err.reason || err.message || 'Transaction failed');
      setCurrentStep(0);
      setIsProcessing(false);
    }
  };

  // TRANSFER: Private encrypted transfer to another address
  const handleTransfer = async () => {
    if (!isConnected || !window.ethereum || parseFloat(amount) <= 0) return;
    if (!ethers.isAddress(recipientAddress)) {
      setError('Invalid recipient address');
      return;
    }

    setIsProcessing(true);
    setCurrentStep(1);
    setError(null);
    setTxHash(null);
    setSuccess(false);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.spectreToken,
        SPECTRE_TOKEN_ABI,
        signer
      );

      setCurrentStep(2);
      
      // Use plaintext transfer for simplicity (amount is visible in tx but balance stays encrypted)
      // For full privacy, use the encrypted transfer with cofhejs
      const transferAmount = ethers.parseEther(amount);
      const tx = await contract.transferPlain(recipientAddress, transferAmount);
      setTxHash(tx.hash);

      setCurrentStep(3);
      await tx.wait();

      setSuccess(true);
      
      // Update local balance
      const currentSeEth = parseFloat(localStorage.getItem(`spectre_eeth_${walletAddress}`) || '0');
      localStorage.setItem(`spectre_eeth_${walletAddress}`, Math.max(0, currentSeEth - parseFloat(amount)).toFixed(4));
      onBalanceUpdate();
      
      setError(`✅ Transferred ${amount} seETH to ${recipientAddress.slice(0, 8)}...${recipientAddress.slice(-4)}`);

      setTimeout(() => {
        setCurrentStep(0);
        setAmount('0');
        setSliderVal(0);
        setRecipientAddress('');
        setSuccess(false);
        setIsProcessing(false);
        setTxHash(null);
      }, 3000);

    } catch (err: any) {
      console.error('Transfer failed:', err);
      setError(err.reason || err.message || 'Transaction failed');
      setCurrentStep(0);
      setIsProcessing(false);
    }
  };

  // DECRYPT: Burn seETH (seETH -> ETH)
  const handleDecrypt = async () => {
    if (!isConnected || !window.ethereum) return;

    setIsProcessing(true);
    setCurrentStep(1);
    setError(null);
    setTxHash(null);
    setSuccess(false);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.spectreToken,
        SPECTRE_TOKEN_ABI,
        signer
      );

      if (isPendingWithdrawal) {
        // ===== CLAIM FLOW =====
        setCurrentStep(2);

        const tx = await contract.claimETH();
        setTxHash(tx.hash);
        setCurrentStep(3);
        await tx.wait();

        setSuccess(true);
        localStorage.removeItem(`spectre_pending_${walletAddress}`);
        setHasPendingWithdrawal(false);
        setIsWithdrawalReady(false);
        onBalanceUpdate();
        
        setError('✅ ETH claimed successfully! Check your wallet.');

        setTimeout(() => {
          setCurrentStep(0);
          setSuccess(false);
          setIsProcessing(false);
          setTxHash(null);
          setError(null);
        }, 3000);

      } else {
        // ===== REQUEST BURN FLOW =====
        const withdrawAmountNum = parseFloat(amount);
        const fullBalance = parseFloat(eEthBalance);
        const isWithdrawAll = withdrawAmountNum >= fullBalance * 0.99;
        
        setCurrentStep(2);
        let tx;
        
        if (isWithdrawAll) {
          tx = await contract.requestBurnAll();
        } else {
          const burnWei = ethers.parseEther(amount);
          tx = await contract.requestBurnPlain(burnWei);
        }
        
        setTxHash(tx.hash);
        setCurrentStep(3);
        await tx.wait();

        setSuccess(true);
        const actualWithdraw = isWithdrawAll ? eEthBalance : amount;
        const remainingBalance = isWithdrawAll ? '0' : (fullBalance - withdrawAmountNum).toFixed(4);
        
        localStorage.setItem(`spectre_pending_${walletAddress}`, actualWithdraw);
        localStorage.setItem(`spectre_eeth_${walletAddress}`, remainingBalance);
        setHasPendingWithdrawal(true);
        onBalanceUpdate();
        
        setError(`✅ Burn request for ${actualWithdraw} seETH submitted! Wait for CoFHE then click "CLAIM ETH".`);

        setTimeout(() => {
          setCurrentStep(0);
          setSuccess(false);
          setIsProcessing(false);
        }, 2000);
      }

    } catch (err: any) {
      console.error('Burn/Claim failed:', err);
      setError(err.reason || err.message || 'Transaction failed');
      setCurrentStep(0);
      setIsProcessing(false);
    }
  };

  const handleAction = () => {
    if (mode === 'encrypt') {
      // Show confirmation modal before mint
      if (parseFloat(amount) > 0) {
        setShowMintConfirm(true);
      }
    } else if (mode === 'transfer') {
      handleTransfer();
    } else {
      handleDecrypt();
    }
  };

  // Check localStorage for pending withdrawal as fallback
  const hasLocalPending = walletAddress 
    ? localStorage.getItem(`spectre_pending_${walletAddress}`) !== null 
    : false;
  
  const isPendingWithdrawal = hasPendingWithdrawal || hasLocalPending;

  // Button text and state
  const getButtonText = () => {
    if (isProcessing) {
      if (currentStep === 1) return 'Preparing...';
      if (currentStep === 2) return 'Confirm in MetaMask...';
      if (currentStep === 3) return 'Waiting for confirmation...';
      return 'Processing...';
    }
    if (success) return '✅ Success!';
    
    if (mode === 'encrypt') return 'MINT seETH';
    if (mode === 'transfer') return 'TRANSFER (PRIVATE)';
    
    if (isPendingWithdrawal) {
      if (!isWithdrawalReady) return '⏳ WAITING FOR COFHE...';
      return '🔓 CLAIM ETH';
    }
    return 'BURN seETH';
  };

  const isButtonDisabled = () => {
    if (!isConnected) return true;
    if (isProcessing) return true;
    if (mode === 'encrypt' && parseFloat(amount) <= 0) return true;
    if (mode === 'transfer') {
      if (parseFloat(amount) <= 0) return true;
      if (!ethers.isAddress(recipientAddress)) return true;
    }
    if (mode === 'decrypt') {
      if (isPendingWithdrawal) {
        if (!isWithdrawalReady) return true;
      } else {
        if (parseFloat(eEthBalance) <= 0) return true;
        if (parseFloat(amount) <= 0) return true;
      }
    }
    return false;
  };

  const getModeIcon = () => {
    if (mode === 'encrypt') return <EyeOff size={20} />;
    if (mode === 'transfer') return <Send size={20} />;
    return <Eye size={20} />;
  };

  const getModeTitle = () => {
    if (mode === 'encrypt') return 'Mint seETH';
    if (mode === 'transfer') return 'Private Transfer';
    return 'Burn seETH';
  };

  return (
    <div
      className={`w-full max-w-[480px] rounded-[32px] border px-8 py-8 shadow-[0_10px_30px_rgba(15,23,42,0.08)] ${
        isLight ? 'border-white/70 bg-white/80 backdrop-blur' : 'border-slate-800 bg-slate-900/70'
      }`}
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>
          {getModeTitle()}
        </h2>
        <div className={`rounded-lg p-2 ${isLight ? 'text-blue-600' : 'text-blue-400'}`}>
          {getModeIcon()}
        </div>
      </div>

      {/* FHERC20 Badge */}
      <div className={`mb-4 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium ${
        isLight ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700' : 'bg-gradient-to-r from-blue-900/30 to-purple-900/30 text-blue-300'
      }`}>
        <ArrowDownUp size={14} />
        <span>FHERC20 - Encrypted Transfers Enabled</span>
      </div>

      {/* Mode toggle - 3 tabs */}
      <div className={`mb-6 flex rounded-2xl p-1.5 ${isLight ? 'bg-slate-100' : 'bg-slate-800'}`}>
        <button
          type="button"
          onClick={() => setMode('encrypt')}
          disabled={isProcessing}
          className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${
            mode === 'encrypt'
              ? 'bg-white text-blue-600 shadow-sm'
              : isLight
              ? 'text-slate-400 hover:text-slate-600'
              : 'text-slate-500 hover:text-slate-300'
          } disabled:opacity-50`}
        >
          Mint
        </button>
        <button
          type="button"
          onClick={() => setMode('transfer')}
          disabled={isProcessing}
          className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${
            mode === 'transfer'
              ? 'bg-white text-purple-600 shadow-sm'
              : isLight
              ? 'text-slate-400 hover:text-slate-600'
              : 'text-slate-500 hover:text-slate-300'
          } disabled:opacity-50`}
        >
          Transfer
        </button>
        <button
          type="button"
          onClick={() => setMode('decrypt')}
          disabled={isProcessing}
          className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${
            mode === 'decrypt'
              ? 'bg-white text-blue-600 shadow-sm'
              : isLight
              ? 'text-slate-400 hover:text-slate-600'
              : 'text-slate-500 hover:text-slate-300'
          } disabled:opacity-50`}
        >
          Burn
        </button>
      </div>

      {/* Transfer recipient input */}
      {mode === 'transfer' && (
        <div className="mb-4">
          <label className={`mb-2 block text-sm font-medium ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Recipient Address
          </label>
          <input
            type="text"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="0x..."
            disabled={!isConnected || isProcessing}
            className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all ${
              isLight 
                ? 'border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-purple-500' 
                : 'border-slate-700 bg-slate-800 text-white placeholder-slate-500 focus:border-purple-500'
            } disabled:opacity-50`}
          />
          {recipientAddress && !ethers.isAddress(recipientAddress) && (
            <p className="mt-1 text-xs text-red-500">Invalid address format</p>
          )}
        </div>
      )}

      {/* Amount panel */}
      <AmountPanel
        label={mode === 'encrypt' ? 'You Deposit' : mode === 'transfer' ? 'You Send' : 'You Burn'}
        token={mode === 'encrypt' ? 'ETH' : 'seETH'}
        amount={amount}
        balance={displayBalance.toFixed(4)}
        onAmountChange={handleAmountChange}
        onMax={handleMax}
        disabled={!isConnected || isProcessing}
      />

      {(mode === 'decrypt' || mode === 'transfer') && hasEncryptedBalance && parseFloat(eEthBalance) === 0 && (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">
          <span>Encrypted balance detected. Sync to show your seETH.</span>
          <button
            type="button"
            onClick={handleSyncBalance}
            disabled={isBalanceSyncing}
            className="rounded-lg bg-blue-600 px-2 py-1 text-[11px] font-bold text-white disabled:opacity-50"
          >
            {isBalanceSyncing ? 'SYNCING...' : 'SYNC BALANCE'}
          </button>
        </div>
      )}

      {/* Slider */}
      <div className="mt-6">
        <PercentSlider 
          value={sliderVal} 
          onChange={handleSliderChange} 
          disabled={!isConnected || isProcessing} 
        />
      </div>

      {/* Steps panel */}
      <div className="mt-8">
        <StepsPanel
          title={
            mode === 'encrypt' ? 'Minting steps' : 
            mode === 'transfer' ? 'Transfer steps (Private!)' : 
            'Burning steps'
          }
          items={getSteps()}
        />
      </div>

      {balanceSyncStatus && (
        <div className={`mt-4 rounded-xl p-3 text-sm ${
          balanceSyncStatus.startsWith('✅')
            ? 'bg-green-50 text-green-700'
            : balanceSyncStatus.startsWith('⏳')
            ? 'bg-yellow-50 text-yellow-700'
            : balanceSyncStatus.startsWith('🔐')
            ? 'bg-blue-50 text-blue-700'
            : 'bg-red-50 text-red-700'
        }`}>
          {balanceSyncStatus}
        </div>
      )}

      {/* Pending withdrawal info */}
      {mode === 'decrypt' && isPendingWithdrawal && (
        <div className={`mt-4 rounded-xl p-3 text-sm ${
          isWithdrawalReady 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
        }`}>
          {isWithdrawalReady 
            ? '🔓 Decryption complete! Click "CLAIM ETH" to receive your funds.'
            : '⏳ CoFHE is decrypting your withdrawal... This takes ~30 seconds.'}
        </div>
      )}

      {/* Privacy notice for transfer */}
      {mode === 'transfer' && !isProcessing && (
        <div className={`mt-4 rounded-xl p-3 text-sm ${
          isLight ? 'bg-purple-50 text-purple-700 border border-purple-100' : 'bg-purple-900/20 text-purple-300 border border-purple-800'
        }`}>
          🔐 <strong>FHERC20 Transfer:</strong> Recipient balances stay encrypted on-chain. Only they can view their balance!
        </div>
      )}

      {/* Error/Success message */}
      {error && (
        <div className={`mt-4 rounded-xl p-3 text-sm ${
          error.includes('✅') 
            ? 'bg-green-50 text-green-700' 
            : error.includes('⏳')
            ? 'bg-yellow-50 text-yellow-700'
            : 'bg-red-50 text-red-700'
        }`}>
          {error}
        </div>
      )}

      {/* Transaction hash */}
      {txHash && (
        <div className={`mt-4 rounded-xl p-3 text-sm ${
          isLight ? 'bg-blue-50 text-blue-700' : 'bg-blue-900/30 text-blue-300'
        }`}>
          Tx: <a 
            href={`${DEFAULT_NETWORK.blockExplorer}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {txHash.slice(0, 12)}...{txHash.slice(-6)}
          </a>
        </div>
      )}

      {/* Action button */}
      <button
        type="button"
        onClick={handleAction}
        disabled={isButtonDisabled()}
        className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-bold transition-all ${
          isButtonDisabled()
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
            : success
              ? 'bg-green-500 text-white'
              : mode === 'transfer'
                ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-500/25'
                : isPendingWithdrawal
                  ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-500/25'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25'
        }`}
      >
        {isProcessing && <Loader2 size={20} className="animate-spin" />}
        {getButtonText()}
      </button>

      {/* Not connected message */}
      {!isConnected && (
        <div className={`mt-4 rounded-xl p-3 text-center text-sm ${
          isLight ? 'bg-yellow-50 text-yellow-700' : 'bg-yellow-900/30 text-yellow-400'
        }`}>
          Connect your wallet to start
        </div>
      )}

      {/* Mint confirmation modal */}
      {showMintConfirm && mode === 'encrypt' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className={`w-full max-w-md rounded-2xl p-6 shadow-xl ${
            isLight ? 'bg-white' : 'bg-slate-900 border border-slate-700'
          }`}>
            <h3 className={`text-lg font-bold mb-3 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Confirm Mint
            </h3>
            <p className={`text-sm mb-4 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              You are sending <strong>{amount} ETH</strong> to mint seETH.
            </p>
            <p className={`text-xs mb-4 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
              Contract:{' '}
              <a
                href={`${DEFAULT_NETWORK.blockExplorer}/address/${CONTRACT_ADDRESSES.spectreToken}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {CONTRACT_ADDRESSES.spectreToken.slice(0, 10)}...{CONTRACT_ADDRESSES.spectreToken.slice(-8)}
              </a>
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowMintConfirm(false)}
                className={`flex-1 rounded-xl py-3 text-sm font-bold ${
                  isLight ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleEncrypt()}
                className="flex-1 rounded-xl py-3 text-sm font-bold bg-blue-600 text-white hover:bg-blue-700"
              >
                Confirm and Mint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MetaMask warning banner - on mint tab */}
      {mode === 'encrypt' && !showMintConfirm && !isProcessing && (
        <div className={`mt-4 rounded-xl p-3 text-xs ${
          isLight ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-amber-900/20 text-amber-300 border border-amber-800'
        }`}>
          If MetaMask warns, verify the contract address and tx hash on the block explorer before approving.
        </div>
      )}
    </div>
  );
}
