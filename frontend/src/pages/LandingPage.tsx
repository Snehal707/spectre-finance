import type { ReactNode } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  LockKeyhole,
  Moon,
  RefreshCw,
  Send,
  Sun,
} from "lucide-react";

import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { useTheme } from "../hooks/useTheme";

type LandingPageProps = {
  onLaunchApp: () => void;
};

type FeatureCardProps = {
  icon: ReactNode;
  step: string;
  title: string;
  detail: string;
  theme: "light" | "dark";
};

type StackCardProps = {
  label: string;
  value: string;
  theme: "light" | "dark";
};

function FeatureCard({
  icon,
  step,
  title,
  detail,
  theme,
}: FeatureCardProps) {
  const isLight = theme === "light";

  return (
    <Card theme={theme} className="h-full">
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <span
            className={`font-mono text-[10px] font-semibold uppercase tracking-[0.28em] ${
              isLight ? "text-slate-500" : "text-spectre-muted"
            }`}
          >
            {step}
          </span>
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
              isLight
                ? "border-sky-200 bg-sky-50 text-sky-700"
                : "border-spectre-border-soft bg-slate-950/70 text-spectre-accent"
            }`}
          >
            {icon}
          </div>
        </div>

        <div className="space-y-2">
          <h2
            className={`font-cyber text-2xl font-bold ${
              isLight ? "text-slate-900" : "text-spectre-text"
            }`}
          >
            {title}
          </h2>
          <p
            className={`font-mono text-xs uppercase tracking-[0.22em] ${
              isLight ? "text-slate-600" : "text-spectre-muted"
            }`}
          >
            {detail}
          </p>
        </div>
      </div>
    </Card>
  );
}

function StackCard({ label, value, theme }: StackCardProps) {
  const isLight = theme === "light";

  return (
    <div
      className={`clip-cyber border px-4 py-4 ${
        isLight
          ? "border-slate-200 bg-white/90"
          : "border-spectre-border-soft/70 bg-slate-950/45"
      }`}
    >
      <p
        className={`font-mono text-[10px] font-semibold uppercase tracking-[0.28em] ${
          isLight ? "text-slate-500" : "text-spectre-muted"
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-2 font-cyber text-lg font-bold ${
          isLight ? "text-slate-900" : "text-spectre-text"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export function LandingPage({ onLaunchApp }: LandingPageProps) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  const scrollToFlow = () => {
    document.getElementById("flow")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className={`relative min-h-screen overflow-hidden ${
        isLight ? "bg-[#f5f7fb] text-slate-900" : "bg-spectre-bg text-spectre-text"
      }`}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className={`absolute inset-0 ${
            isLight
              ? "bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(14,165,233,0.12),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.88),rgba(241,245,249,0.96))]"
              : "bg-[radial-gradient(circle_at_top_left,rgba(37,209,244,0.18),transparent_28%),radial-gradient(circle_at_82%_14%,rgba(123,97,255,0.16),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_30%)]"
          }`}
        />
        <div
          className={`absolute inset-0 bg-cyber-grid ${
            isLight ? "opacity-[0.1]" : "opacity-100"
          }`}
        />
        <div
          className={`absolute inset-0 spectre-noise ${
            isLight ? "opacity-[0.035]" : "opacity-[0.05]"
          }`}
        />
        <div className="animate-float-slow absolute -left-24 top-16 h-72 w-72 rounded-full bg-fhenix-blue/10 blur-3xl" />
        <div className="animate-float-slow absolute right-0 top-72 h-80 w-80 rounded-full bg-fhenix-purple/10 blur-3xl [animation-delay:1.5s]" />
      </div>

      <header
        className={`relative z-20 border-b backdrop-blur-xl ${
          isLight
            ? "border-slate-200/70 bg-white/82"
            : "border-spectre-border-soft/60 bg-slate-950/60"
        }`}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4 lg:px-10">
          <div className="flex min-h-11 items-center">
            <div className="flex items-baseline gap-2">
              <span
                className={`font-cyber text-[1.4rem] font-bold leading-none sm:text-[1.55rem] ${
                  isLight ? "text-sky-600" : "text-spectre-accent"
                }`}
              >
                Spectre
              </span>
              <span
                className={`font-cyber text-[1.4rem] font-bold leading-none sm:text-[1.55rem] ${
                  isLight ? "text-slate-900" : "text-spectre-text"
                }`}
              >
                Finance
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              theme={theme}
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="rounded-full p-2.5"
            >
              {isLight ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
            <Button
              theme={theme}
              size="md"
              onClick={onLaunchApp}
              iconRight={<ArrowRight size={16} />}
            >
              Launch App
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 pb-16 pt-10 lg:px-10">
        <section className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="space-y-6">
            <span
              className={`inline-flex items-center rounded-full border px-4 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.28em] ${
                isLight
                  ? "border-sky-200 bg-sky-50 text-sky-700"
                  : "border-spectre-accent/20 bg-spectre-accent/10 text-spectre-accent"
              }`}
            >
              Encrypted ETH on Fhenix
            </span>

            <div className="space-y-4">
              <h1
                className={`max-w-4xl font-cyber text-5xl font-black leading-[0.95] sm:text-6xl lg:text-7xl ${
                  isLight ? "text-slate-900" : "text-spectre-text"
                }`}
              >
                <span className={isLight ? "text-sky-600" : "text-spectre-accent"}>
                  Spectre
                </span>{" "}
                Finance
              </h1>
              <p
                className={`max-w-xl text-lg leading-8 ${
                  isLight ? "text-slate-600" : "text-spectre-muted"
                }`}
              >
                Mint, transfer, and burn encrypted seETH on Sepolia.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                theme={theme}
                size="md"
                onClick={onLaunchApp}
                iconRight={<ArrowRight size={16} />}
              >
                Launch App
              </Button>
              <Button
                theme={theme}
                variant="secondary"
                size="md"
                onClick={scrollToFlow}
              >
                View Flow
              </Button>
            </div>

            <div className="flex flex-wrap gap-3">
              {["FHERC20", "Fhenix CoFHE", "Sepolia", "seETH"].map((item) => (
                <span
                  key={item}
                  className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm ${
                    isLight
                      ? "border-slate-200 bg-white/85 text-slate-700"
                      : "border-spectre-border-soft/70 bg-slate-950/45 text-slate-300"
                  }`}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <Card theme={theme} title="Flow" className="h-full">
            <div className="space-y-5">
              <div
                className={`clip-cyber border px-4 py-4 ${
                  isLight
                    ? "border-slate-200 bg-white/90"
                    : "border-spectre-border-soft/70 bg-slate-950/45"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p
                      className={`font-mono text-[10px] font-semibold uppercase tracking-[0.28em] ${
                        isLight ? "text-slate-500" : "text-spectre-muted"
                      }`}
                    >
                      Spectre Finance
                    </p>
                    <h2
                      className={`mt-2 font-cyber text-2xl font-bold ${
                        isLight ? "text-slate-900" : "text-spectre-text"
                      }`}
                    >
                      ETH to seETH to ETH
                    </h2>
                  </div>
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
                      isLight
                        ? "border-sky-200 bg-sky-50 text-sky-700"
                        : "border-spectre-border-soft bg-slate-900 text-spectre-accent"
                    }`}
                  >
                    <LockKeyhole size={18} />
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <StackCard label="Mint" value="ETH" theme={theme} />
                <StackCard label="Transfer" value="Private" theme={theme} />
                <StackCard label="Burn" value="Claim" theme={theme} />
              </div>

              <div
                className={`clip-cyber border px-4 py-4 ${
                  isLight
                    ? "border-violet-200 bg-violet-50/80"
                    : "border-fhenix-purple/30 bg-fhenix-purple/10"
                }`}
              >
                <p
                  className={`font-mono text-[10px] font-semibold uppercase tracking-[0.28em] ${
                    isLight ? "text-violet-700" : "text-fhenix-purple"
                  }`}
                >
                  Live app
                </p>
                <p
                  className={`mt-2 font-cyber text-lg font-bold ${
                    isLight ? "text-violet-800" : "text-violet-200"
                  }`}
                >
                  Mint. Transfer. Burn.
                </p>
              </div>
            </div>
          </Card>
        </section>

        <section id="flow" className="grid gap-4 md:grid-cols-3">
          <FeatureCard
            theme={theme}
            icon={<ArrowDownToLine size={20} />}
            step="Step 01"
            title="Mint"
            detail="ETH to seETH"
          />
          <FeatureCard
            theme={theme}
            icon={<Send size={20} />}
            step="Step 02"
            title="Transfer"
            detail="Encrypted send"
          />
          <FeatureCard
            theme={theme}
            icon={<RefreshCw size={20} />}
            step="Step 03"
            title="Burn"
            detail="Claim ETH"
          />
        </section>

        <section>
          <Card theme={theme} className={isLight ? "bg-white/92" : ""}>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <p
                  className={`font-mono text-[10px] font-semibold uppercase tracking-[0.28em] ${
                    isLight ? "text-slate-500" : "text-spectre-muted"
                  }`}
                >
                  Ready
                </p>
                <h2
                  className={`font-cyber text-3xl font-bold ${
                    isLight ? "text-slate-900" : "text-spectre-text"
                  }`}
                >
                  Open Spectre Finance
                </h2>
                <p
                  className={`max-w-xl text-sm leading-6 ${
                    isLight ? "text-slate-600" : "text-spectre-muted"
                  }`}
                >
                  Private seETH flows, without the extra noise.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  theme={theme}
                  size="md"
                  onClick={onLaunchApp}
                  iconRight={<ArrowRight size={16} />}
                >
                  Launch App
                </Button>
              </div>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}
