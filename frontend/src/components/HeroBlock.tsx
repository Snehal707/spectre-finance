type HeroBlockProps = {
  theme: "light" | "dark";
};

type FeatureBadgeProps = {
  icon: string;
  label: string;
  isLight: boolean;
};

function FeatureBadge({ icon, label, isLight }: FeatureBadgeProps) {
  return (
    <span className={`feature-badge${isLight ? " feature-badge-light" : ""} ${isLight ? "text-slate-700" : "text-fhenix-blue"}`}>
      <span className="badge-icon">{icon}</span>
      {label}
    </span>
  );
}

export function HeroBlock({ theme }: HeroBlockProps) {
  const isLight = theme === "light";
  return (
    <section className="flex flex-col gap-6">
      {/* Layer stack: shadow → glitch outline → main holograph */}
      <div className="relative">
        {/* Shadow layer — sits behind main text */}
        <h1
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[-1] select-none font-cyber text-5xl font-black leading-[0.95] sm:text-6xl lg:text-7xl blur-[10px] opacity-30 text-fhenix-blue"
        >
          <span className="block">Spectre</span>
          <span className="block">Finance.</span>
          <span className="block">Shield Your</span>
          <span className="block">Assets.</span>
        </h1>
        {/* Glitch outline layer — sits behind main text */}
        <h1
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[-1] select-none font-cyber text-5xl font-black leading-[0.95] sm:text-6xl lg:text-7xl animate-glitch opacity-15"
          style={{ WebkitTextStroke: "1px #25d1f4", color: "transparent", transform: "translate(2px, -1px)" }}
        >
          <span className="block">Spectre</span>
          <span className="block">Finance.</span>
          <span className="block">Shield Your</span>
          <span className="block">Assets.</span>
        </h1>
        {/* Main holograph — z-[0] ensures it renders above decorative layers */}
      <h1
        className={`relative z-[0] font-cyber text-5xl font-black leading-[0.95] sm:text-6xl lg:text-7xl ${
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
        . Encrypted balances, private transfers, all powered by Fhenix CoFHE.
      </p>
      <div className="flex flex-wrap gap-3">
        <FeatureBadge icon="🔐" label="Encrypted Balances" isLight={isLight} />
        <FeatureBadge icon="🔒" label="Private Transfers"  isLight={isLight} />
        <FeatureBadge icon="⚡" label="CoFHE Powered"      isLight={isLight} />
      </div>
    </section>
  );
}
