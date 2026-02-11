type HeroBlockProps = {
  theme: 'light' | 'dark';
};

export function HeroBlock({ theme }: HeroBlockProps) {
  const isLight = theme === 'light';
  return (
    <section className="flex flex-col gap-6">
      <h1 className={`text-5xl font-black leading-[0.95] sm:text-6xl lg:text-7xl ${isLight ? 'text-slate-900' : ''}`}>
        <span className={isLight ? 'block text-blue-600' : 'block text-blue-400'}>Spectre</span>
        <span className={isLight ? 'block text-blue-600' : 'block text-blue-400'}>Finance.</span>
        <span className={isLight ? 'block text-slate-900' : 'block text-white'}>Shield Your</span>
        <span className={isLight ? 'block text-slate-900' : 'block text-white'}>Assets.</span>
      </h1>
      <p className={`max-w-xl text-lg leading-relaxed ${isLight ? 'text-slate-500' : 'text-slate-300'}`}>
        True on-chain privacy with <span className={isLight ? 'font-semibold text-blue-600' : 'font-semibold text-blue-400'}>FHERC20</span>.
        Encrypted balances, private transfers, all powered by Fhenix CoFHE.
      </p>
      <div className="flex flex-wrap gap-2">
        <span className={isLight ? 'rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700' : 'rounded-full bg-blue-900/40 px-3 py-1 text-xs font-medium text-blue-200'}>
          🔐 Encrypted Balances
        </span>
        <span className={isLight ? 'rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700' : 'rounded-full bg-purple-900/40 px-3 py-1 text-xs font-medium text-purple-200'}>
          🔒 Private Transfers
        </span>
        <span className={isLight ? 'rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700' : 'rounded-full bg-green-900/40 px-3 py-1 text-xs font-medium text-green-200'}>
          ⚡ CoFHE Powered
        </span>
      </div>
    </section>
  );
}
