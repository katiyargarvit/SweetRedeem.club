'use client';

import { formatPoints } from '@/lib/api';

interface PointsInputProps {
  value: string;
  currencyName: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

/** Quick-fill buttons for common balances */
const QUICK_FILL = [10_000, 50_000, 1_00_000, 5_00_000];

export function PointsInput({ value, currencyName, onChange, disabled }: PointsInputProps) {
  const numeric = parseInt(value.replace(/,/g, ''), 10);
  const hasValue = !isNaN(numeric) && numeric > 0;

  return (
    <div className="space-y-2">
      <label htmlFor="points-input" className="block text-sm font-medium text-text-secondary">
        Your Balance
      </label>

      <div className="relative">
        <input
          id="points-input"
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => {
            // Allow only digits and commas
            const raw = e.target.value.replace(/[^0-9]/g, '');
            onChange(raw);
          }}
          placeholder="e.g. 1,00,000"
          disabled={disabled}
          className="input-field pr-28 tabular"
          aria-label={`Enter your ${currencyName} balance`}
        />
        {/* Currency label inside input */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-text-muted whitespace-nowrap">
          {currencyName || 'Points'}
        </div>
      </div>

      {/* Quick-fill chips */}
      <div className="flex flex-wrap gap-2">
        {QUICK_FILL.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(String(n))}
            disabled={disabled}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              hasValue && numeric === n
                ? 'bg-gold/20 text-gold border border-gold/30'
                : 'bg-bg-raised text-text-muted border border-bg-subtle hover:text-text-secondary hover:border-bg-raised'
            }`}
          >
            {formatPoints(n)}
          </button>
        ))}
      </div>
    </div>
  );
}
