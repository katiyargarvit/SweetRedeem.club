'use client';

/** The headline "X× better than statement credit" badge */
interface MultiplierBadgeProps {
  multiplier: number;
}

export function MultiplierBadge({ multiplier }: MultiplierBadgeProps) {
  return (
    <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-gold-muted border border-gold/20">
      <span className="text-display-lg text-gradient-gold tabular">
        {multiplier.toFixed(1)}×
      </span>
      <div className="text-left">
        <p className="text-sm font-semibold text-gold leading-tight">better than</p>
        <p className="text-sm font-semibold text-gold leading-tight">statement credit</p>
      </div>
    </div>
  );
}
