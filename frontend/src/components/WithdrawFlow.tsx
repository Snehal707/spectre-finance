import { useState } from 'react';
import { Unlock, Clock, CheckCircle, Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { DEFAULT_NETWORK } from '../utils/config';
import type { TransactionStatus, VaultState } from '../types';

interface WithdrawFlowProps {
  vaultState: VaultState;
  onRequestWithdraw: (amount: Uint8Array) => Promise<string>;
  onClaimWithdraw: () => Promise<string>;
  txStatus: TransactionStatus;
  onReset: () => void;
}

export function WithdrawFlow({
  vaultState,
  onClaimWithdraw,
  txStatus,
  onReset,
}: WithdrawFlowProps) {
  const [step, setStep] = useState<'request' | 'waiting' | 'claim' | 'success'>(
    vaultState.hasPendingWithdrawal 
      ? (vaultState.isWithdrawalReady ? 'claim' : 'waiting')
      : 'request'
  );

  const handleRequestWithdraw = async () => {
    // Note: In a full implementation, this would use cofhejs to encrypt the amount
    // For demo purposes, we show the flow
    alert(
      'Withdrawal requires encrypting the amount using cofhejs SDK.\n\n' +
      'In production, you would:\n' +
      '1. Use cofhejs to encrypt the withdrawal amount\n' +
      '2. Send the encrypted amount to requestWithdraw()\n' +
      '3. Wait for decryption to complete\n' +
      '4. Call claimWithdraw() to receive your ETH'
    );
  };

  const handleClaimWithdraw = async () => {
    try {
      await onClaimWithdraw();
      setStep('success');
    } catch (error) {
      console.error('Claim failed:', error);
    }
  };

  // Success state
  if (step === 'success' && txStatus.isSuccess && txStatus.txHash) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Withdrawal Complete!</h3>
        <p className="text-gray-400 mb-4">
          Your encrypted balance has been decrypted and ETH sent to your wallet.
        </p>
        <div className="flex gap-3 justify-center">
          <a
            href={`${DEFAULT_NETWORK.blockExplorer}/tx/${txStatus.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-spectre-card border border-spectre-border rounded-lg 
                     text-gray-300 hover:text-white flex items-center gap-2"
          >
            View Transaction <ExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={() => { onReset(); setStep('request'); }}
            className="px-4 py-2 bg-fhenix-blue text-black font-semibold rounded-lg 
                     hover:bg-fhenix-blue/80"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {['Request', 'Decrypt', 'Claim'].map((label, index) => {
          const stepNumber = index + 1;
          const isActive = 
            (step === 'request' && stepNumber === 1) ||
            (step === 'waiting' && stepNumber === 2) ||
            (step === 'claim' && stepNumber === 3);
          const isComplete = 
            (step === 'waiting' && stepNumber === 1) ||
            (step === 'claim' && stepNumber <= 2);

          return (
            <div key={label} className="flex flex-col items-center flex-1">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2
                  ${isComplete ? 'bg-green-500/20 text-green-500' : 
                    isActive ? 'bg-fhenix-blue/20 text-fhenix-blue animate-pulse' : 
                    'bg-spectre-card text-gray-500'}`}
              >
                {isComplete ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span className="font-semibold">{stepNumber}</span>
                )}
              </div>
              <span className={`text-sm ${isActive ? 'text-fhenix-blue' : 'text-gray-500'}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      {step === 'request' && (
        <div className="space-y-4">
          <div className="p-4 bg-spectre-dark rounded-lg border border-spectre-border">
            <div className="flex items-center gap-3 mb-3">
              <Unlock className="w-5 h-5 text-fhenix-blue" />
              <span className="font-semibold text-white">Request Withdrawal</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Enter the amount you want to withdraw. The amount will be encrypted
              before sending to maintain privacy.
            </p>

            {!vaultState.hasBalance ? (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg 
                            flex items-center gap-2 text-yellow-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                You don't have any encrypted balance to withdraw.
              </div>
            ) : (
              <button
                onClick={handleRequestWithdraw}
                disabled={txStatus.isLoading}
                className="w-full py-3 bg-gradient-to-r from-fhenix-blue to-fhenix-purple 
                         rounded-lg font-semibold text-white btn-cyber"
              >
                {txStatus.isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  'Request Withdrawal'
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {step === 'waiting' && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-fhenix-blue/20 flex items-center justify-center">
            <Clock className="w-8 h-8 text-fhenix-blue animate-pulse" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Decryption in Progress</h3>
          <p className="text-gray-400 mb-4">
            The CoFHE coprocessor is decrypting your withdrawal amount.
            <br />
            This usually completes within the next block.
          </p>
          <div className="inline-flex items-center gap-2 text-fhenix-blue text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Waiting for decryption...
          </div>
        </div>
      )}

      {step === 'claim' && (
        <div className="space-y-4">
          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-semibold text-white">Ready to Claim!</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Your withdrawal has been decrypted and is ready to claim.
              Click below to receive your ETH.
            </p>
            <button
              onClick={handleClaimWithdraw}
              disabled={txStatus.isLoading}
              className="w-full py-3 bg-green-500 hover:bg-green-600 
                       rounded-lg font-semibold text-white transition-colors"
            >
              {txStatus.isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Claiming...
                </span>
              ) : (
                'Claim ETH'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {txStatus.isError && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {txStatus.error}
        </div>
      )}

      {/* Info */}
      <div className="p-3 bg-spectre-card rounded-lg border border-spectre-border">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">How Withdrawal Works</h4>
        <ol className="text-xs text-gray-500 space-y-1 list-decimal list-inside">
          <li>Request withdrawal with encrypted amount</li>
          <li>CoFHE coprocessor decrypts the amount off-chain</li>
          <li>Claim your ETH once decryption completes</li>
        </ol>
      </div>
    </div>
  );
}
