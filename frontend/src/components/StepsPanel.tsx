import { CheckCircle2 } from 'lucide-react';

type StepState = 'done' | 'active' | 'pending';

type StepItem = {
  label: string;
  state: StepState;
};

type StepsPanelProps = {
  title: string;
  items: StepItem[];
};

export function StepsPanel({ title, items }: StepsPanelProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <span className="text-blue-500">🛡️</span>
        {title}
      </div>

      <div className="relative flex items-center justify-between">
        <div className="absolute left-3 right-3 top-4 h-[2px] rounded-full bg-slate-100" />
        {items.map((item) => (
          <div key={item.label} className="relative z-10 flex flex-col items-center gap-2">
            {item.state === 'done' && (
              <CheckCircle2 size={22} className="text-green-500" />
            )}
            {item.state === 'active' && (
              <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-blue-500 bg-white">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
              </div>
            )}
            {item.state === 'pending' && (
              <div className="h-6 w-6 rounded-full border-2 border-slate-200 bg-white" />
            )}
            <span
              className={`text-[10px] font-bold uppercase tracking-widest ${
                item.state === 'done'
                  ? 'text-green-600'
                  : item.state === 'active'
                  ? 'text-blue-600'
                  : 'text-slate-300'
              }`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
