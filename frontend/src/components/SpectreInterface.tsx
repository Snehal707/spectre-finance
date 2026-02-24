import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { useWallet } from "../hooks/useWallet";
import { useTheme } from "../hooks/useTheme";
import { DEFAULT_NETWORK, CONTRACT_ADDRESSES } from "../utils/config";
import { SPECTRE_VAULT_ABI } from "../utils/abi";

export function SpectreInterface() {
  const {
    wallet,
    isConnecting,
    isCorrectNetwork,
    connect,
    switchNetwork,
    fetchBalance,
  } = useWallet();
  const { theme, toggleTheme } = useTheme();

  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  const [amount, setAmount] = useState("0");
  const [sliderVal, setSliderVal] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(0);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [eEthBalance, setEEthBalance] = useState("0");
  const [hasPendingWithdrawal, setHasPendingWithdrawal] = useState(false);
  const [isWithdrawalReady, setIsWithdrawalReady] = useState(false);
  const [isLoadingVault, setIsLoadingVault] = useState(false);

  const isLight = theme === "light";
  const ethBalance = parseFloat(wallet.balance || "0");
  const activeBalance =
    mode === "encrypt" ? ethBalance : parseFloat(eEthBalance);

  // Fetch vault status
  const fetchVaultStatus = useCallback(async () => {
    if (
      !wallet.isConnected ||
      !wallet.address ||
      !CONTRACT_ADDRESSES.spectreVault ||
      !window.ethereum
    ) {
      setEEthBalance("0");
      return;
    }

    setIsLoadingVault(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.spectreVault,
        SPECTRE_VAULT_ABI,
        provider
      );

      const hasBalance = await contract.hasBalance(wallet.address);
      if (hasBalance) {
        const stored = localStorage.getItem(
          `spectre_balance_${wallet.address}`
        );
        setEEthBalance(stored || "0.0000");
      } else {
        setEEthBalance("0");
        localStorage.removeItem(`spectre_balance_${wallet.address}`);
      }

      try {
        const pending = await contract.hasPendingWithdrawal();
        setHasPendingWithdrawal(pending);
        if (pending) {
          const ready = await contract.isWithdrawalReady();
          setIsWithdrawalReady(ready);
        } else {
          setIsWithdrawalReady(false);
        }
      } catch {
        setHasPendingWithdrawal(false);
        setIsWithdrawalReady(false);
      }
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setIsLoadingVault(false);
    }
  }, [wallet.isConnected, wallet.address]);

  useEffect(() => {
    fetchVaultStatus();
    const interval = setInterval(fetchVaultStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchVaultStatus]);

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setSliderVal(val);
    if (activeBalance > 0) setAmount((activeBalance * (val / 100)).toFixed(4));
  };

  const switchMode = (newMode: "encrypt" | "decrypt") => {
    setMode(newMode);
    setAmount("0");
    setSliderVal(0);
    setStep(0);
    setError(null);
    setTxHash(null);
  };

  const handleMax = () => {
    setSliderVal(100);
    setAmount(activeBalance.toFixed(4));
  };

  const handleEncrypt = async () => {
    if (!wallet.isConnected || !window.ethereum || parseFloat(amount) <= 0)
      return;
    setIsProcessing(true);
    setStep(1);
    setError(null);
    setTxHash(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.spectreVault,
        SPECTRE_VAULT_ABI,
        signer
      );

      setStep(1);
      await new Promise((r) => setTimeout(r, 500));

      setStep(2);
      const tx = await contract.deposit({ value: ethers.parseEther(amount) });
      setTxHash(tx.hash);

      setStep(3);
      await tx.wait();

      const currentEEth = parseFloat(
        localStorage.getItem(`spectre_balance_${wallet.address}`) || "0"
      );
      localStorage.setItem(
        `spectre_balance_${wallet.address}`,
        (currentEEth + parseFloat(amount)).toFixed(4)
      );

      await fetchVaultStatus();
      await fetchBalance();

      setTimeout(() => {
        setIsProcessing(false);
        setStep(0);
        setSliderVal(0);
        setAmount("0");
      }, 1500);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : String(err);
      if (err instanceof Error) console.error(err.message);
      else console.error(err);
      setError(msg || "Transaction failed");
      setIsProcessing(false);
      setStep(0);
    }
  };

  const handleDecrypt = async () => {
    if (!wallet.isConnected || !window.ethereum) return;
    setIsProcessing(true);
    setStep(1);
    setError(null);
    setTxHash(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.spectreVault,
        SPECTRE_VAULT_ABI,
        signer
      );

      if (hasPendingWithdrawal && isWithdrawalReady) {
        setStep(1);
        await new Promise((r) => setTimeout(r, 500));
        setStep(2);
        const tx = await contract.claimWithdraw();
        setTxHash(tx.hash);
        setStep(3);
        await tx.wait();
        localStorage.removeItem(`spectre_balance_${wallet.address}`);
        await fetchVaultStatus();
        await fetchBalance();
        setTimeout(() => {
          setIsProcessing(false);
          setStep(0);
          setSliderVal(0);
          setAmount("0");
        }, 1500);
      } else if (hasPendingWithdrawal && !isWithdrawalReady) {
        setError("⏳ Withdrawal is processing. Please wait and try again.");
        setIsProcessing(false);
        setStep(0);
      } else {
        setStep(1);
        await new Promise((r) => setTimeout(r, 500));
        setStep(2);
        const tx = await contract.requestWithdraw("0x");
        setTxHash(tx.hash);
        setStep(3);
        await tx.wait();
        setError(
          "✅ Withdrawal requested! Please wait ~30 seconds, then click CLAIM."
        );
        await fetchVaultStatus();
        setTimeout(() => {
          setIsProcessing(false);
          setStep(0);
        }, 1500);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : String(err);
      if (err instanceof Error) console.error(err.message);
      else console.error(err);
      setError(msg || "Transaction failed");
      setIsProcessing(false);
      setStep(0);
    }
  };

  const handleAction = () =>
    mode === "encrypt" ? handleEncrypt() : handleDecrypt();

  const getButtonText = () => {
    if (isProcessing) return "PROCESSING...";
    if (mode === "encrypt") return "ENCRYPT ASSETS";
    if (hasPendingWithdrawal && isWithdrawalReady) return "✅ CLAIM ETH";
    if (hasPendingWithdrawal) return "⏳ WAITING...";
    return "DECRYPT ASSETS";
  };

  const isButtonDisabled = () => {
    if (!wallet.isConnected || isProcessing || !isCorrectNetwork) return true;
    if (mode === "encrypt" && parseFloat(amount) <= 0) return true;
    if (
      mode === "decrypt" &&
      !hasPendingWithdrawal &&
      parseFloat(eEthBalance) <= 0
    )
      return true;
    if (mode === "decrypt" && hasPendingWithdrawal && !isWithdrawalReady)
      return true;
    return false;
  };

  const steps =
    mode === "encrypt"
      ? ["Deploy", "Approve", "Encrypt"]
      : hasPendingWithdrawal && isWithdrawalReady
      ? ["Auth", "Process", "Claim"]
      : ["Auth", "Approve", "Request"];

  return (
    <div
      className={`min-h-screen w-full ${
        isLight ? "bg-blue-50" : "bg-slate-900"
      }`}
      style={{
        backgroundImage: `linear-gradient(${
          isLight ? "#e0f2fe" : "rgba(30,58,138,0.2)"
        } 1px, transparent 1px), linear-gradient(90deg, ${
          isLight ? "#e0f2fe" : "rgba(30,58,138,0.2)"
        } 1px, transparent 1px)`,
        backgroundSize: "50px 50px",
      }}
    >
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle
              cx="20"
              cy="20"
              r="20"
              fill={isLight ? "#E0F2FE" : "#1e3a5f"}
            />
            <path
              d="M20 10C14.4772 10 10 14.4772 10 20C10 25.5228 14.4772 30 20 30"
              stroke="#0284C7"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="20" cy="20" r="3.5" fill="#0284C7" />
            <path
              d="M29 15L27 15"
              stroke="#0284C7"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M31 20L26 20"
              stroke="#0284C7"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <span
            className={`text-xl font-bold tracking-widest ${
              isLight ? "text-slate-900" : "text-white"
            }`}
          >
            SPECTRE
          </span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-full ${
              isLight
                ? "bg-white hover:bg-gray-100 text-gray-600"
                : "bg-slate-800 hover:bg-slate-700 text-gray-400"
            }`}
          >
            {isLight ? "☀️" : "🌙"}
          </button>
          {!wallet.isConnected ? (
            <button
              onClick={connect}
              disabled={isConnecting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm"
            >
              {isConnecting ? "..." : "Connect"}
            </button>
          ) : (
            <div className="flex gap-2">
              {!isCorrectNetwork && (
                <button
                  onClick={switchNetwork}
                  className="bg-yellow-500 text-white px-3 py-2 rounded-lg text-xs font-bold"
                >
                  Switch
                </button>
              )}
              <div
                className={`px-4 py-2 rounded-xl font-mono text-sm ${
                  isLight
                    ? "bg-white text-slate-700"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left */}
          <div className="space-y-6">
            <h1
              className={`text-5xl lg:text-6xl font-extrabold leading-tight ${
                isLight ? "text-slate-900" : "text-white"
              }`}
            >
              <span className="text-blue-500">Spectre Finance.</span>
              <br />
              Shield Your Assets.
            </h1>
            <p
              className={`text-lg max-w-md ${
                isLight ? "text-slate-500" : "text-slate-400"
              }`}
            >
              The privacy layer for the modern web. Encrypt your assets and
              transact with complete confidentiality on-chain.
            </p>

            {wallet.isConnected && (
              <div
                className={`flex flex-wrap gap-6 p-4 rounded-2xl ${
                  isLight ? "bg-white/60" : "bg-slate-800/60"
                }`}
              >
                <div>
                  <p
                    className={`text-xs font-bold uppercase ${
                      isLight ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    ETH Balance
                  </p>
                  <p
                    className={`text-2xl font-mono font-bold ${
                      isLight ? "text-slate-800" : "text-white"
                    }`}
                  >
                    {ethBalance.toFixed(4)}
                  </p>
                </div>
                <div
                  className={`w-px ${
                    isLight ? "bg-slate-200" : "bg-slate-700"
                  }`}
                ></div>
                <div>
                  <p className="text-xs font-bold uppercase text-blue-500">
                    eETH Balance {isLoadingVault && "⏳"}
                  </p>
                  <p className="text-2xl font-mono font-bold text-blue-600">
                    {parseFloat(eEthBalance).toFixed(4)}
                  </p>
                </div>
                {hasPendingWithdrawal && (
                  <>
                    <div
                      className={`w-px ${
                        isLight ? "bg-slate-200" : "bg-slate-700"
                      }`}
                    ></div>
                    <div>
                      <p
                        className={`text-xs font-bold uppercase ${
                          isWithdrawalReady
                            ? "text-green-500"
                            : "text-yellow-500"
                        }`}
                      >
                        Withdrawal
                      </p>
                      <p
                        className={`text-lg font-bold ${
                          isWithdrawalReady
                            ? "text-green-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {isWithdrawalReady ? "✅ Ready" : "⏳ Processing"}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={wallet.isConnected ? undefined : connect}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg"
              >
                Launch App
              </button>
              <a
                href="https://cofhe-docs.fhenix.zone"
                target="_blank"
                rel="noreferrer"
                className={`px-8 py-3.5 rounded-xl font-bold border ${
                  isLight
                    ? "bg-white text-slate-700 border-slate-200"
                    : "bg-slate-800 text-slate-300 border-slate-700"
                }`}
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Right - Card */}
          <div
            className={`rounded-3xl p-8 shadow-xl ${
              isLight
                ? "bg-white/80 border border-white"
                : "bg-slate-800/80 border border-slate-700"
            }`}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2
                className={`text-2xl font-bold ${
                  isLight ? "text-slate-800" : "text-white"
                }`}
              >
                {mode === "encrypt" ? "Encrypt" : "Decrypt"}
              </h2>
              <span className="text-2xl">
                {mode === "encrypt" ? "🔒" : "👁️"}
              </span>
            </div>

            {/* Toggle */}
            <div
              className={`p-1.5 rounded-2xl flex mb-6 ${
                isLight ? "bg-slate-100" : "bg-slate-700"
              }`}
            >
              <button
                onClick={() => switchMode("encrypt")}
                disabled={isProcessing}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex justify-center items-center gap-2 ${
                  mode === "encrypt"
                    ? "bg-white text-blue-600 shadow"
                    : "text-slate-400"
                }`}
              >
                🔒 Encrypt
              </button>
              <button
                onClick={() => switchMode("decrypt")}
                disabled={isProcessing}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex justify-center items-center gap-2 ${
                  mode === "decrypt"
                    ? "bg-white text-blue-600 shadow"
                    : "text-slate-400"
                }`}
              >
                👁️ Decrypt
              </button>
            </div>

            {/* Input */}
            <div
              className={`rounded-2xl p-5 mb-4 ${
                isLight
                  ? "bg-slate-50 border border-slate-200"
                  : "bg-slate-900/50 border border-slate-600"
              }`}
            >
              <div className="flex justify-between mb-3">
                <span
                  className={`text-xs font-bold uppercase ${
                    isLight ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  {mode === "encrypt" ? "You Deposit" : "You Withdraw"}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-1 rounded ${
                    isLight
                      ? "bg-white text-slate-700"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {mode === "encrypt" ? "ETH" : "eETH"}
                </span>
              </div>
              <input
                type="text"
                value={amount}
                onChange={(e) => {
                  if (/^\d*\.?\d*$/.test(e.target.value)) {
                    setAmount(e.target.value);
                    if (activeBalance > 0)
                      setSliderVal(
                        Math.min(
                          100,
                          (parseFloat(e.target.value || "0") / activeBalance) *
                            100
                        )
                      );
                  }
                }}
                disabled={!wallet.isConnected || isProcessing}
                className={`w-full text-4xl font-mono font-bold bg-transparent outline-none ${
                  isLight ? "text-slate-800" : "text-white"
                }`}
              />
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200">
                <span
                  className={`text-xs ${
                    isLight ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Balance:{" "}
                  <span className="font-mono">{activeBalance.toFixed(4)}</span>
                </span>
                <button
                  onClick={handleMax}
                  disabled={
                    !wallet.isConnected || isProcessing || activeBalance <= 0
                  }
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs px-3 py-1 rounded font-bold"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Slider */}
            <div className="mb-6">
              <input
                type="range"
                min="0"
                max="100"
                value={sliderVal}
                onChange={handleSlider}
                disabled={
                  !wallet.isConnected || isProcessing || activeBalance <= 0
                }
                className="w-full h-2 rounded-full appearance-none cursor-pointer disabled:opacity-50"
                style={{
                  background: `linear-gradient(to right, #2563eb ${sliderVal}%, ${
                    isLight ? "#bfdbfe" : "#1e3a5f"
                  } ${sliderVal}%)`,
                }}
              />
              <div className="flex justify-between mt-2 text-xs text-slate-400">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div
                className={`rounded-xl p-3 mb-4 text-sm ${
                  error.includes("✅")
                    ? "bg-green-50 text-green-700"
                    : error.includes("⏳")
                    ? "bg-yellow-50 text-yellow-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {error}
              </div>
            )}
            {txHash && (
              <div
                className={`rounded-xl p-3 mb-4 text-sm ${
                  isLight
                    ? "bg-blue-50 text-blue-700"
                    : "bg-blue-900/30 text-blue-300"
                }`}
              >
                Tx:{" "}
                <a
                  href={`${DEFAULT_NETWORK.blockExplorer}/tx/${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  {txHash.slice(0, 12)}...
                </a>
              </div>
            )}

            {/* Steps */}
            <div
              className={`rounded-2xl p-5 mb-6 ${
                isLight
                  ? "bg-white border border-blue-50"
                  : "bg-slate-800 border border-slate-700"
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                <span>🛡️</span>
                <span
                  className={`text-sm font-bold ${
                    isLight ? "text-slate-800" : "text-white"
                  }`}
                >
                  {mode === "encrypt" ? "Encryption" : "Decryption"} Steps
                </span>
              </div>
              <div className="flex justify-between items-center relative">
                <div
                  className={`absolute top-3 left-4 right-4 h-0.5 ${
                    isLight ? "bg-slate-100" : "bg-slate-700"
                  }`}
                ></div>
                {steps.map((label, idx) => {
                  const stepNum = idx + 1;
                  const isCompleted =
                    step > stepNum || (step === 3 && !isProcessing);
                  const isActive = step === stepNum && isProcessing;
                  return (
                    <div
                      key={label}
                      className="relative z-10 flex flex-col items-center gap-2"
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? "bg-green-500 text-white"
                            : isActive
                            ? "bg-blue-500 text-white animate-pulse"
                            : isLight
                            ? "bg-slate-200"
                            : "bg-slate-700"
                        }`}
                      >
                        {isCompleted ? "✓" : ""}
                      </div>
                      <span
                        className={`text-xs font-bold uppercase ${
                          isCompleted || isActive
                            ? "text-blue-600"
                            : "text-slate-400"
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Button */}
            <button
              onClick={handleAction}
              disabled={isButtonDisabled()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg shadow-lg flex justify-center items-center gap-2"
            >
              {isProcessing && <span className="animate-spin">⏳</span>}
              {getButtonText()}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
