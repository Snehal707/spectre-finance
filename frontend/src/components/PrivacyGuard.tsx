import { useState, useEffect } from 'react';
import { AlertTriangle, Shield, X } from 'lucide-react';

interface PrivacyGuardProps {
  amount: string;
  onSuggestedAmount: (amount: string) => void;
}

/**
 * Privacy Guard - AI-powered privacy assistant
 * Warns users about round number deposits that could leak metadata
 * Suggests randomized amounts for better privacy
 */
export function PrivacyGuard({ amount, onSuggestedAmount }: PrivacyGuardProps) {
  const [warning, setWarning] = useState<string | null>(null);
  const [suggestedAmount, setSuggestedAmount] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!amount || dismissed) {
      setWarning(null);
      setSuggestedAmount(null);
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setWarning(null);
      setSuggestedAmount(null);
      return;
    }

    // Check if amount is too "round" (potential metadata leakage)
    const isRoundNumber = 
      numAmount === Math.floor(numAmount) || // Whole number
      (numAmount * 10) === Math.floor(numAmount * 10) || // One decimal
      numAmount % 0.5 === 0; // Half values

    if (isRoundNumber && numAmount >= 0.1) {
      // Generate a random offset (0.1% to 5% of the amount)
      const randomOffset = numAmount * (0.001 + Math.random() * 0.049);
      const randomDirection = Math.random() > 0.5 ? 1 : -1;
      const suggested = numAmount + (randomOffset * randomDirection);
      
      setWarning(
        `Round numbers like ${amount} can leak metadata about your transaction. ` +
        `Consider using a randomized amount for better privacy.`
      );
      setSuggestedAmount(suggested.toFixed(4));
    } else {
      setWarning(null);
      setSuggestedAmount(null);
    }
  }, [amount, dismissed]);

  const handleUseSuggested = () => {
    if (suggestedAmount) {
      onSuggestedAmount(suggestedAmount);
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  // Reset dismissed state when amount changes significantly
  useEffect(() => {
    setDismissed(false);
  }, [Math.floor(parseFloat(amount) * 10)]);

  if (!warning) return null;

  return (
    <div className="mt-4 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 relative">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-yellow-500/70 hover:text-yellow-500"
      >
        <X size={16} />
      </button>
      
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-fhenix-blue" />
            <span className="text-sm font-semibold text-yellow-500">
              Privacy Guard
            </span>
          </div>
          
          <p className="text-sm text-gray-300 mb-3">
            {warning}
          </p>
          
          {suggestedAmount && (
            <button
              onClick={handleUseSuggested}
              className="px-4 py-2 bg-fhenix-blue/20 border border-fhenix-blue/50 rounded-lg 
                       text-fhenix-blue text-sm font-medium hover:bg-fhenix-blue/30 
                       transition-colors"
            >
              Use suggested: {suggestedAmount} ETH
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
