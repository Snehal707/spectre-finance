import type { ReactNode } from "react";
import { Cpu, LockKeyhole, Radar } from "lucide-react";

type HeroBlockProps = {
  theme: "light" | "dark";
};

type FeatureBadgeProps = {
  icon: ReactNode;
  label: string;
  isLight: boolean;
};

function FeatureBadge({ icon, label, isLight }: FeatureBadgeProps) {
  return (
    <span
      className={`feature-badge${isLight ? " feature-badge-light" : ""} ${
        isLight ? "text-slate-700" : "text-fhenix-blue"
      }`}
    >
      <span className="badge-icon" aria-hidden="true">
        {icon}
      </span>
      {label}
    </span>
  );
}

export function HeroBlock({ theme }: HeroBlockProps) {
  const isLight = theme === "light";

  return (
    <section className="flex flex-col gap-6">
      <div className="relative max-w-4xl">
        <h1
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[-1] select-none font-cyber text-5xl font-black leading-[0.95] blur-[10px] opacity-30 text-fhenix-blue sm:text-6xl lg:text-7xl"
        >
          <span className="block">Spectre</span>
          <span className="block">Finance.</span>
          <span className="block">Shield Your</span>
          <span className="block">Assets.</span>
        </h1>
        <h1
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[-1] select-none font-cyber text-5xl font-black leading-[0.95] opacity-15 sm:text-6xl lg:text-7xl animate-glitch"
          style={{
            WebkitTextStroke: "1px #25d1f4",
            color: "transparent",
            transform: "translate(2px, -1px)",
          }}
        >
          <span className="block">Spectre</span>
          <span className="block">Finance.</span>
          <span className="block">Shield Your</span>
          <span className="block">Assets.</span>
        </h1>
        <h1
          className={`relative z-[1] font-cyber text-5xl font-black leading-[0.95] sm:text-6xl lg:text-7xl ${
            isLight ? "text-slate-900" : "text-spectre-text"
          }`}
        >
          <span className={isLight ? "block text-blue-600" : "block text-spectre-accent"}>
            Spectre
          </span>
          <span className={isLight ? "block text-blue-600" : "block text-spectre-accent"}>
            Finance.
          </span>
          <span className="block">Shield Your</span>
          <span className="block">Assets.</span>
        </h1>
      </div>

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
        , powered by{" "}
        <span
          className={
            isLight
              ? "font-semibold text-blue-600"
              : "font-semibold text-spectre-accent"
          }
        >
          Fhenix CoFHE
        </span>
        . Encrypted balances, private transfers, and secure withdrawals in one
        interface.
      </p>

      <div className="flex flex-wrap gap-3">
        <FeatureBadge
          icon={<LockKeyhole className="h-3.5 w-3.5" />}
          label="Encrypted Balances"
          isLight={isLight}
        />
        <FeatureBadge
          icon={<Radar className="h-3.5 w-3.5" />}
          label="Private Transfers"
          isLight={isLight}
        />
        <FeatureBadge
          icon={<Cpu className="h-3.5 w-3.5" />}
          label="Fhenix CoFHE"
          isLight={isLight}
        />
      </div>
    </section>
  );
}
