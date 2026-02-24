import { useEffect, useState } from "react";
import { AlertTriangle, Shield, X } from "lucide-react";

import { Button } from "./ui/Button";

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

  // Derive warning/suggested from amount and dismissed; intentional setState-in-effect to sync UI with props.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- derived state from amount/dismissed */
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
      numAmount * 10 === Math.floor(numAmount * 10) || // One decimal
      numAmount % 0.5 === 0; // Half values

    if (isRoundNumber && numAmount >= 0.1) {
      // Generate a random offset (0.1% to 5% of the amount)
      const randomOffset = numAmount * (0.001 + Math.random() * 0.049);
      const randomDirection = Math.random() > 0.5 ? 1 : -1;
      const suggested = numAmount + randomOffset * randomDirection;

      setWarning(
        `Round numbers like ${amount} can leak metadata about your transaction. ` +
          `Consider using a randomized amount for better privacy.`
      );
      setSuggestedAmount(suggested.toFixed(4));
    } else {
      setWarning(null);
      setSuggestedAmount(null);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
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

  // Reset dismissed state when amount changes significantly (bucket by 0.1)
  const amountBucket = Number.isNaN(parseFloat(amount))
    ? 0
    : Math.floor(parseFloat(amount) * 10);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset dismissed when amount bucket changes
    setDismissed(false);
  }, [amountBucket]);

  if (!warning) return null;

  return (
    <div className="spectre-glass-soft relative mt-4 rounded-xl border border-spectre-warn/30 p-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDismiss}
        aria-label="Dismiss"
        className="absolute right-2 top-2 min-w-0 p-1 text-spectre-warn hover:bg-spectre-warn/10"
      >
        <X size={16} />
      </Button>

      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-spectre-warn/20">
          <AlertTriangle className="h-5 w-5 text-spectre-warn" />
        </div>

        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <Shield className="h-4 w-4 text-spectre-accent" />
            <span className="text-sm font-semibold text-spectre-warn">
              Privacy Guard
            </span>
          </div>

          <p className="mb-3 text-sm text-spectre-muted">{warning}</p>

          {suggestedAmount && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleUseSuggested}
              className="border-spectre-accent/50 bg-spectre-accent/10 text-spectre-accent hover:bg-spectre-accent/20"
            >
              Use suggested: {suggestedAmount} ETH
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
