export function HeroBlock() {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-5xl font-black leading-[0.95] text-slate-900 sm:text-6xl lg:text-7xl">
        <span className="block text-blue-600">Spectre</span>
        <span className="block text-blue-600">Finance.</span>
        <span className="block text-slate-900">Shield Your</span>
        <span className="block text-slate-900">Assets.</span>
      </h1>
      <p className="max-w-xl text-lg leading-relaxed text-slate-500">
        True on-chain privacy with <span className="font-semibold text-blue-600">FHERC20</span>. 
        Encrypted balances, private transfers, all powered by Fhenix CoFHE.
      </p>
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
          🔐 Encrypted Balances
        </span>
        <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
          🔒 Private Transfers
        </span>
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
          ⚡ CoFHE Powered
        </span>
      </div>
    </section>
  );
}
