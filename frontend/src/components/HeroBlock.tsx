import { Badge } from "./ui/Badge";

type HeroBlockProps = {
  theme: "light" | "dark";
};

export function HeroBlock({ theme }: HeroBlockProps) {
  const isLight = theme === "light";
  return (
    <section className="flex flex-col gap-6">
      <h1
        className={`font-cyber text-5xl font-black leading-[0.95] sm:text-6xl lg:text-7xl ${
          isLight ? "text-slate-900" : ""
        }`}
      >
        <span
          className={
            isLight ? "block text-blue-600" : "block text-spectre-accent"
          }
        >
          Spectre
        </span>
        <span
          className={
            isLight ? "block text-blue-600" : "block text-spectre-accent"
          }
        >
          Finance.
        </span>
        <span
          className={
            isLight ? "block text-slate-900" : "block text-spectre-text"
          }
        >
          Shield Your
        </span>
        <span
          className={
            isLight ? "block text-slate-900" : "block text-spectre-text"
          }
        >
          Assets.
        </span>
      </h1>
      <p
        className={`max-w-xl text-lg leading-relaxed ${
          isLight ? "text-slate-500" : "text-spectre-muted"
        }`}
      >
        True on-chain privacy with{" "}
        <span
          className={
            isLight
              ? "font-semibold text-blue-600"
              : "font-semibold text-spectre-accent"
          }
        >
          FHERC20
        </span>
        . Encrypted balances, private transfers, all powered by Fhenix CoFHE.
      </p>
      <div className="flex flex-wrap gap-2">
        <Badge tone="accent">🔐 Encrypted Balances</Badge>
        <Badge tone="neutral">🔒 Private Transfers</Badge>
        <Badge tone="success">⚡ CoFHE Powered</Badge>
      </div>
    </section>
  );
}
