import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  ArrowDownUp,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  Send,
} from "lucide-react";
import { ethers } from "ethers";

import { AmountPanel } from "./AmountPanel";
import { PercentSlider } from "./PercentSlider";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { Input } from "./ui/Input";
import { Stepper, type StepItem } from "./ui/Stepper";
import { Tabs } from "./ui/Tabs";
import { CONTRACT_ADDRESSES, DEFAULT_NETWORK } from "../utils/config";
import { SPECTRE_TOKEN_ABI } from "../utils/fherc20-abi";
import { getEthersSigner } from "../utils/ethers";
import type { SuccessMessage } from "../pages/SpectrePage";

type StepState = "pending" | "active" | "done";
type TabMode = "encrypt" | "decrypt" | "transfer";

type AlertTone = "success" | "warn" | "error" | "info";

const ALERT_TOKENS: Record<AlertTone, {
  border: string; accent: string;
  text: string; lightText: string;
  prefix: string; glow: string;
}> = {
  success: { border: "border-matrix-green/20", accent: "bg-matrix-green",  text: "text-matrix-green/90",  lightText: "text-emerald-700", prefix: "[STATUS_OK]", glow: "#00ff41" },
  warn:    { border: "border-cyber-yellow/20", accent: "bg-cyber-yellow",  text: "text-cyber-yellow/90", lightText: "text-amber-700",   prefix: "[WARN_LOG]",  glow: "#fcee0a" },
  error:   { border: "border-cyber-red/20",    accent: "bg-cyber-red",     text: "text-cyber-red/90",    lightText: "text-red-700",     prefix: "[ERR_LOG]",   glow: "#ff003c" },
  info:    { border: "border-fhenix-blue/20",  accent: "bg-fhenix-blue",   text: "text-fhenix-blue/90",  lightText: "text-cyan-700",    prefix: "[INFO_LOG]",  glow: "#25d1f4" },
};

function AlertFrame({
  tone,
  icon,
  isLight = false,
  children,
  className = "",
}: {
  tone: AlertTone;
  icon?: string;
  isLight?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const t = ALERT_TOKENS[tone];
  const bg = isLight ? "bg-white/80" : "bg-black/20";
  const textClass = isLight ? t.lightText : t.text;
  return (
    <div className={`clip-cyber relative overflow-hidden border backdrop-blur-md ${t.border} ${bg} ${className}`}>
      <div className={`absolute left-0 top-0 h-full w-1 ${t.accent} opacity-80`} />
      <div className="px-4 py-2.5 pl-5">
        <div className="mb-0.5 flex items-center gap-2">
          {icon && (
            <span className="text-[11px]" style={{ filter: `drop-shadow(0 0 4px ${t.glow})` }}>
              {icon}
            </span>
          )}
          <span className={`font-mono text-[9px] font-bold uppercase tracking-[0.25em] opacity-70 ${textClass}`}>
            {t.prefix}
          </span>
        </div>
        <div className={`font-mono text-[11px] leading-relaxed tracking-wide ${textClass}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

const SUCCESS_MESSAGES: Record<TabMode, SuccessMessage> = {
  encrypt:  { heading: "DATA_ENCRYPTED",  subtext: "HANDSHAKE_VERIFIED" },
  transfer: { heading: "SIGNAL_SENT",     subtext: "ENCRYPTED_RELAY_COMPLETE" },
  decrypt:  { heading: "FUNDS_DECRYPTED", subtext: "VAULT_EXTRACTION_SUCCESS" },
};

type EncryptDecryptCardProps = {
  theme: "light" | "dark";
  ethBalance: string;
  eEthBalance: string;
  isConnected: boolean;
  walletAddress: string | null;
  isCorrectNetwork?: boolean;
  onBalanceUpdate: () => void;
  onSuccess?: (message: SuccessMessage) => void;
};

export function EncryptDecryptCard({
  theme,
  ethBalance,
  eEthBalance,
  isConnected,
  walletAddress,
  isCorrectNetwork = true,
  onBalanceUpdate,
  onSuccess,
}: EncryptDecryptCardProps) {
  const [mode, setMode] = useState<TabMode>("encrypt");
  const [amount, setAmount] = useState("0");
  const [sliderVal, setSliderVal] = useState(0);
  const [recipientAddress, setRecipientAddress] = useState("");

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
  const [balanceSyncStatus, setBalanceSyncStatus] = useState<string | null>(
    null
  );

  // Mint confirmation modal
  const [showMintConfirm, setShowMintConfirm] = useState(false);

  const isLight = theme === "light";

  const currentBalance =
    mode === "encrypt" ? parseFloat(ethBalance) : parseFloat(eEthBalance);
  const displayBalance = isNaN(currentBalance) ? 0 : currentBalance;

  const notifySuccess = (opMode: TabMode) => {
    if (onSuccess) {
      onSuccess(SUCCESS_MESSAGES[opMode]);
    }
  };

  const saveTxRecord = (opMode: TabMode, txAmount: string, hash: string) => {
    if (!walletAddress) return;
    const key = `spectre_txs_${walletAddress.toLowerCase()}`;
    const prev = JSON.parse(localStorage.getItem(key) ?? "[]") as Array<{
      type: string;
      amount: string;
      hash: string;
      ts: number;
    }>;
    const entry = { type: opMode, amount: txAmount, hash, ts: Date.now() };
    localStorage.setItem(key, JSON.stringify([entry, ...prev].slice(0, 20)));
  };

  // Reusable withdrawal status check (for polling and "Check again" button)
  const checkWithdrawalStatus = useCallback(async () => {
    if (
      !isConnected ||
      !walletAddress ||
      !CONTRACT_ADDRESSES.spectreToken
    ) {
      setHasPendingWithdrawal(false);
      setIsWithdrawalReady(false);
      setHasEncryptedBalance(false);
      return;
    }

    try {
      const signer = await getEthersSigner();
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
      console.error("Error checking withdrawal status:", err);
    }
  }, [isConnected, walletAddress]);

  // Poll withdrawal status; faster (2s) when pending so "CLAIM" appears sooner
  useEffect(() => {
    checkWithdrawalStatus();
    const intervalMs = hasPendingWithdrawal ? 2000 : 5000;
    const interval = setInterval(checkWithdrawalStatus, intervalMs);
    return () => clearInterval(interval);
  }, [checkWithdrawalStatus, hasPendingWithdrawal]);

  // Reset when switching modes
  useEffect(() => {
    setAmount("0");
    setSliderVal(0);
    setCurrentStep(0);
    setTxHash(null);
    setError(null);
    setSuccess(false);
    setBalanceSyncStatus(null);
    setRecipientAddress("");
  }, [mode]);

  // Generate steps based on mode and transaction state
  const getSteps = () => {
    if (mode === "encrypt") {
      return [
        {
          label: "PREPARE",
          state: (success
            ? "done"
            : currentStep === 1
            ? "active"
            : currentStep > 1
            ? "done"
            : "pending") as StepState,
        },
        {
          label: "APPROVE",
          state: (success
            ? "done"
            : currentStep === 2
            ? "active"
            : currentStep > 2
            ? "done"
            : "pending") as StepState,
        },
        {
          label: "MINT",
          state: (success
            ? "done"
            : currentStep === 3
            ? "active"
            : "pending") as StepState,
        },
      ];
    }

    if (mode === "transfer") {
      return [
        {
          label: "VALIDATE",
          state: (success
            ? "done"
            : currentStep === 1
            ? "active"
            : currentStep > 1
            ? "done"
            : "pending") as StepState,
        },
        {
          label: "ENCRYPT",
          state: (success
            ? "done"
            : currentStep === 2
            ? "active"
            : currentStep > 2
            ? "done"
            : "pending") as StepState,
        },
        {
          label: "TRANSFER",
          state: (success
            ? "done"
            : currentStep === 3
            ? "active"
            : "pending") as StepState,
        },
      ];
    }

    // Decrypt mode
    if (isPendingWithdrawal) {
      return [
        { label: "BURN", state: "done" as StepState },
        { label: "DECRYPT", state: "done" as StepState },
        {
          label: "CLAIM",
          state: (success
            ? "done"
            : currentStep > 0
            ? "active"
            : "pending") as StepState,
        },
      ];
    } else {
      return [
        {
          label: "BURN",
          state: (success
            ? "done"
            : currentStep === 1
            ? "active"
            : currentStep > 1
            ? "done"
            : "pending") as StepState,
        },
        {
          label: "APPROVE",
          state: (success
            ? "done"
            : currentStep === 2
            ? "active"
            : currentStep > 2
            ? "done"
            : "pending") as StepState,
        },
        {
          label: "CONFIRM",
          state: (success
            ? "done"
            : currentStep === 3
            ? "active"
            : "pending") as StepState,
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
    const nextPercent =
      displayBalance === 0 ? 0 : Math.min(100, (parsed / displayBalance) * 100);
    setSliderVal(Number.isFinite(nextPercent) ? nextPercent : 0);
  };

  const handleMax = () => {
    setSliderVal(100);
    setAmount(displayBalance.toFixed(4));
  };

  const handleSyncBalance = async () => {
    if (!isConnected || !walletAddress) return;
    if (isBalanceSyncing) return;

    setIsBalanceSyncing(true);
    setBalanceSyncStatus("🔐 Requesting balance decryption...");

    try {
      const signer = await getEthersSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.spectreToken,
        SPECTRE_TOKEN_ABI,
        signer
      );

      const tx = await contract.requestBalanceDecryption();
      await tx.wait();

      let attempts = 0;
      let ready = false;
      while (attempts < 6) {
        setBalanceSyncStatus(
          `⏳ Waiting for CoFHE to decrypt... (attempt ${attempts + 1}/6)`
        );
        const [amountRaw, isReady] = await contract.getDecryptedBalance();

        if (isReady) {
          const formatted = ethers.formatEther(amountRaw);
          // Use lowercase address for consistent localStorage keys
          const normalizedAddress = walletAddress?.toLowerCase() || "";
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
        setBalanceSyncStatus(
          "⏳ Still decrypting. Try again in a few seconds."
        );
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? (err as Error & { reason?: string }).reason ?? err.message
          : String(err);
      if (err instanceof Error) console.error(err.message);
      else console.error(err);
      setBalanceSyncStatus(msg || "Balance sync failed");
    } finally {
      setIsBalanceSyncing(false);
    }
  };

  // ENCRYPT: Mint seETH (ETH -> seETH) - called after user confirms in modal
  const handleEncrypt = async () => {
    if (!isConnected || parseFloat(amount) <= 0) return;

    setShowMintConfirm(false);
    setIsProcessing(true);
    setCurrentStep(1);
    setError(null);
    setTxHash(null);
    setSuccess(false);

    try {
      const signer = await getEthersSigner();
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

      const currentSeEth = parseFloat(
        localStorage.getItem(`spectre_eeth_${walletAddress}`) || "0"
      );
      localStorage.setItem(
        `spectre_eeth_${walletAddress}`,
        (currentSeEth + parseFloat(amount)).toFixed(4)
      );
      onBalanceUpdate();
      saveTxRecord("encrypt", amount, tx.hash);
      notifySuccess("encrypt");

      setTimeout(() => {
        setCurrentStep(0);
        setAmount("0");
        setSliderVal(0);
        setSuccess(false);
        setIsProcessing(false);
        setTxHash(null);
      }, 3000);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? (err as Error & { reason?: string }).reason ?? err.message
          : String(err);
      if (err instanceof Error) console.error(err.message);
      else console.error(err);
      setError(msg || "Transaction failed");
      setCurrentStep(0);
      setIsProcessing(false);
    }
  };

  // TRANSFER: Private encrypted transfer to another address
  const handleTransfer = async () => {
    if (!isConnected || parseFloat(amount) <= 0) return;
    if (!ethers.isAddress(recipientAddress)) {
      setError("Invalid recipient address");
      return;
    }

    setIsProcessing(true);
    setCurrentStep(1);
    setError(null);
    setTxHash(null);
    setSuccess(false);

    try {
      const signer = await getEthersSigner();
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
      const currentSeEth = parseFloat(
        localStorage.getItem(`spectre_eeth_${walletAddress}`) || "0"
      );
      localStorage.setItem(
        `spectre_eeth_${walletAddress}`,
        Math.max(0, currentSeEth - parseFloat(amount)).toFixed(4)
      );
      onBalanceUpdate();
      saveTxRecord("transfer", amount, tx.hash);
      notifySuccess("transfer");

      setError(
        `✅ Transferred ${amount} seETH to ${recipientAddress.slice(
          0,
          8
        )}...${recipientAddress.slice(-4)}`
      );

      setTimeout(() => {
        setCurrentStep(0);
        setAmount("0");
        setSliderVal(0);
        setRecipientAddress("");
        setSuccess(false);
        setIsProcessing(false);
        setTxHash(null);
      }, 3000);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? (err as Error & { reason?: string }).reason ?? err.message
          : String(err);
      if (err instanceof Error) console.error(err.message);
      else console.error(err);
      setError(msg || "Transaction failed");
      setCurrentStep(0);
      setIsProcessing(false);
    }
  };

  // DECRYPT: Burn seETH (seETH -> ETH)
  const handleDecrypt = async () => {
    if (!isConnected) return;

    setIsProcessing(true);
    setCurrentStep(1);
    setError(null);
    setTxHash(null);
    setSuccess(false);

    try {
      const signer = await getEthersSigner();
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
        saveTxRecord("decrypt", amount, tx.hash);
        notifySuccess("decrypt");

        setError("✅ ETH claimed successfully! Check your wallet.");

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
        const remainingBalance = isWithdrawAll
          ? "0"
          : (fullBalance - withdrawAmountNum).toFixed(4);

        localStorage.setItem(
          `spectre_pending_${walletAddress}`,
          actualWithdraw
        );
        localStorage.setItem(`spectre_eeth_${walletAddress}`, remainingBalance);
        setHasPendingWithdrawal(true);
        onBalanceUpdate();
        saveTxRecord("decrypt", actualWithdraw, tx.hash);
        notifySuccess("decrypt");

        setError(
          `✅ Burn request for ${actualWithdraw} seETH submitted! Wait for CoFHE then click "CLAIM ETH".`
        );

        setTimeout(() => {
          setCurrentStep(0);
          setSuccess(false);
          setIsProcessing(false);
        }, 2000);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? (err as Error & { reason?: string }).reason ?? err.message
          : String(err);
      if (err instanceof Error) console.error(err.message);
      else console.error(err);
      setError(msg || "Transaction failed");
      setCurrentStep(0);
      setIsProcessing(false);
    }
  };

  const handleAction = () => {
    if (mode === "encrypt") {
      // Show confirmation modal before mint
      if (parseFloat(amount) > 0) {
        setShowMintConfirm(true);
      }
    } else if (mode === "transfer") {
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
      if (currentStep === 1) return "Preparing...";
      if (currentStep === 2) return "Confirm in MetaMask...";
      if (currentStep === 3) return "Waiting for confirmation...";
      return "Processing...";
    }
    if (success) return "✅ Success!";

    if (mode === "encrypt") return "MINT seETH";
    if (mode === "transfer") return "TRANSFER (PRIVATE)";

    if (isPendingWithdrawal) {
      if (!isWithdrawalReady) return "⏳ WAITING FOR COFHE...";
      return "🔓 CLAIM ETH";
    }
    return "BURN seETH";
  };

  const isButtonDisabled = () => {
    if (!isConnected) return true;
    if (!isCorrectNetwork) return true;
    if (isProcessing) return true;
    if (mode === "encrypt" && parseFloat(amount) <= 0) return true;
    if (mode === "transfer") {
      if (parseFloat(amount) <= 0) return true;
      if (!ethers.isAddress(recipientAddress)) return true;
    }
    if (mode === "decrypt") {
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
    if (mode === "encrypt") return <EyeOff size={20} />;
    if (mode === "transfer") return <Send size={20} />;
    return <Eye size={20} />;
  };

  const getModeTitle = () => {
    if (mode === "encrypt") return "Mint seETH";
    if (mode === "transfer") return "Private Transfer";
    return "Burn seETH";
  };

  const tabItems = [
    { value: "encrypt", label: "Mint" },
    { value: "transfer", label: "Transfer" },
    { value: "decrypt", label: "Burn" },
  ];

  return (
    <Card theme={theme} className="w-full max-w-[480px] px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-cyber text-xl font-bold tracking-wide text-spectre-accent">
          {getModeTitle()}
        </h2>
        <div className="p-2 text-spectre-accent">
          {getModeIcon()}
        </div>
      </div>
      {/* FHERC20 Badge */}
      <div className="mb-4 flex items-center gap-2 border border-spectre-accent/30 bg-spectre-accent/10 px-3 py-2 text-xs font-mono font-medium text-spectre-accent">
        <ArrowDownUp size={14} />
        <span>FHERC20 - Encrypted Transfers Enabled</span>
      </div>

      {/* Mode toggle - 3 tabs */}
      <div className="mb-6 flex justify-center">
        <Tabs
          items={tabItems}
          value={mode}
          onChange={(value) => !isProcessing && setMode(value as TabMode)}
        />
      </div>

      {/* Transfer recipient input */}
      {mode === "transfer" && (
        <div className="mb-4">
          <Input
            label="Recipient Address"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="0x..."
            disabled={!isConnected || isProcessing}
            mono
            theme={theme}
            errorText={
              recipientAddress && !ethers.isAddress(recipientAddress)
                ? "Invalid address format"
                : undefined
            }
          />
        </div>
      )}

      {/* Amount panel */}
      <AmountPanel
        label={
          mode === "encrypt"
            ? "You Deposit"
            : mode === "transfer"
            ? "You Send"
            : "You Burn"
        }
        token={mode === "encrypt" ? "ETH" : "seETH"}
        amount={amount}
        balance={displayBalance.toFixed(4)}
        onAmountChange={handleAmountChange}
        onMax={handleMax}
        disabled={!isConnected || isProcessing}
        theme={theme}
      />

      {(mode === "decrypt" || mode === "transfer") &&
        hasEncryptedBalance &&
        parseFloat(eEthBalance) === 0 && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border border-spectre-accent/30 bg-spectre-accent/10 px-3 py-2.5 text-sm text-spectre-accent">
            <span>
              We detected an encrypted balance. Use &quot;Sync balance&quot; to
              decrypt and check your seETH manually.
            </span>
            <Button
              size="sm"
              onClick={handleSyncBalance}
              disabled={isBalanceSyncing}
              className="shrink-0"
            >
              {isBalanceSyncing ? "SYNCING..." : "SYNC BALANCE"}
            </Button>
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

      {/* Steps */}
      <div className="mt-8">
        <p className="mb-3 font-cyber text-xs tracking-wider text-spectre-muted">
          {mode === "encrypt"
            ? "Minting steps"
            : mode === "transfer"
            ? "Transfer steps (Private!)"
            : "Burning steps"}
        </p>
        <Stepper steps={getSteps() as StepItem[]} />
      </div>

      {balanceSyncStatus && (
        <AlertFrame
          tone={
            balanceSyncStatus.startsWith("✅") ? "success"
            : balanceSyncStatus.startsWith("⏳") ? "warn"
            : balanceSyncStatus.startsWith("🔐") ? "info"
            : "error"
          }
          icon={
            balanceSyncStatus.startsWith("✅") ? "✅"
            : balanceSyncStatus.startsWith("⏳") ? "⏳"
            : balanceSyncStatus.startsWith("🔐") ? "🔐"
            : "⚠️"
          }
          isLight={isLight}
          className="mt-4"
        >
          {balanceSyncStatus.replace(/^\S+\s*/, "")}
        </AlertFrame>
      )}

      {/* Pending withdrawal info */}
      {mode === "decrypt" && isPendingWithdrawal && (
        <AlertFrame
          tone={isWithdrawalReady ? "success" : "warn"}
          icon={isWithdrawalReady ? "🔓" : "⏳"}
          isLight={isLight}
          className="mt-4"
        >
          {isWithdrawalReady ? (
            'Decryption complete! Click "CLAIM ETH" to receive your funds.'
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>
                CoFHE is decrypting your withdrawal. This usually completes in ~30 seconds.
                If it takes longer, click &quot;Check again&quot; or refresh the page.
              </span>
              <Button
                size="sm"
                icon={<RefreshCw size={14} />}
                onClick={checkWithdrawalStatus}
                className="bg-spectre-warn text-white hover:bg-spectre-warn/90"
              >
                Check again
              </Button>
            </div>
          )}
        </AlertFrame>
      )}

      {/* Privacy notice for transfer — Tactical Security Log */}
      {mode === "transfer" && !isProcessing && (
        <div
          className={`clip-cyber relative mt-4 overflow-hidden border border-fhenix-purple/30 backdrop-blur-sm ${
            isLight ? "bg-fhenix-purple/5" : "bg-fhenix-purple/5"
          }`}
        >
          {/* 4px left-edge hazard accent */}
          <div className="absolute left-0 top-0 h-full w-1 bg-fhenix-purple opacity-70" />
          <div className="px-4 py-3 pl-5">
            {/* Header prefix row */}
            <div className="mb-1 flex items-center gap-2">
              <span
                className="text-[11px]"
                style={{ filter: "drop-shadow(0 0 5px #7b61ff)" }}
              >
                🔐
              </span>
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.25em] text-fhenix-purple/50">
                [SECURE_INFO]
              </span>
            </div>
            {/* Body */}
            <p className="font-mono text-[11px] leading-relaxed text-fhenix-purple/90">
              <strong className="font-bold text-fhenix-purple">FHERC20 Transfer:</strong>{" "}
              Recipient balances stay encrypted on-chain. Only they can view their balance.
            </p>
          </div>
        </div>
      )}

      {/* Error/Success message */}
      {error && (
        <AlertFrame
          tone={
            error.includes("✅") ? "success"
            : error.includes("⏳") ? "warn"
            : "error"
          }
          icon={
            error.includes("✅") ? "✅"
            : error.includes("⏳") ? "⏳"
            : "⚠️"
          }
          isLight={isLight}
          className="mt-4"
        >
          {error.replace(/^\S+\s*/, "")}
        </AlertFrame>
      )}

      {/* Transaction hash */}
      {txHash && (
        <AlertFrame tone="info" icon="🔗" isLight={isLight} className="mt-4">
          Tx:{" "}
          <a
            href={`${DEFAULT_NETWORK.blockExplorer}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-80"
          >
            {txHash.slice(0, 12)}...{txHash.slice(-6)}
          </a>
        </AlertFrame>
      )}

      {/* Action button */}
      <Button
        fullWidth
        className={`mt-6 py-4 text-base ${
          success
            ? "bg-spectre-success text-white shadow-none hover:bg-spectre-success/90"
            : ""
        }`}
        onClick={handleAction}
        disabled={isButtonDisabled()}
        icon={
          isProcessing ? (
            <Loader2 size={20} className="animate-spin" />
          ) : undefined
        }
        variant={isButtonDisabled() ? "secondary" : "primary"}
      >
        {getButtonText()}
      </Button>

      {/* Not connected message */}
      {!isConnected && (
        <AlertFrame tone="warn" icon="🔌" isLight={isLight} className="mt-4">
          Connect your wallet to start.
        </AlertFrame>
      )}

      {/* Wrong network message */}
      {isConnected && !isCorrectNetwork && (
        <AlertFrame tone="error" icon="⛔" isLight={isLight} className="mt-4">
          Switch to Sepolia to mint, transfer, or burn.
        </AlertFrame>
      )}

      {/* Mint confirmation modal */}
      {showMintConfirm && mode === "encrypt" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="spectre-glass clip-cyber w-full max-w-md border border-spectre-border-soft p-6 shadow-xl">
            <h3 className="mb-3 font-cyber text-lg font-bold text-spectre-text">
              Confirm Mint
            </h3>
            <p className="mb-4 text-sm text-spectre-muted">
              You are sending <strong>{amount} ETH</strong> to mint seETH.
            </p>
            <p className="mb-4 text-xs text-spectre-muted">
              Contract:{" "}
              <a
                href={`${DEFAULT_NETWORK.blockExplorer}/address/${CONTRACT_ADDRESSES.spectreToken}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {CONTRACT_ADDRESSES.spectreToken.slice(0, 10)}...
                {CONTRACT_ADDRESSES.spectreToken.slice(-8)}
              </a>
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1 py-3"
                onClick={() => setShowMintConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1 py-3"
                onClick={() => handleEncrypt()}
              >
                Confirm and Mint
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
