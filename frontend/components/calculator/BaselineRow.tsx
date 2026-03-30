'use client';

import { BaselineComparison } from '@/lib/types';
import { formatINR } from '@/lib/api';

interface BaselineRowProps {
  baselineComparisons: BaselineComparison[];
  bestInr: number;
}

/** Shows statement credit / bank portal vs our best recommendation */
export function BaselineRow({ baselineComparisons, bestInr }: BaselineRowProps) {
  const statementCredit = baselineComparisons.find(
    (b) => b.label === 'Statement Credit'
  );
  const bankPortal = baselineComparisons.find(
    (b) => b.label === 'Bank Rewards Portal'
  );

  const columns = [
    {
      label: 'Bank Portal',
      value: bankPortal?.total_value_inr ?? 0,
      color: 'text-value-poor',
      barColor: 'bg-value-poor',
    },
    {
      label: 'Statement Credit',
      value: statementCredit?.total_value_inr ?? 0,
      color: 'text-value-low',
      barColor: 'bg-value-low',
    },
    {
      label: 'Best Transfer',
      value: bestInr,
      color: 'text-value-elite',
      barColor: 'bg-value-elite',
    },
  ];

  return (
    <div className="rounded-2xl border border-bg-subtle bg-bg-raised p-4">
      <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-4">
        What your bank offers vs. what you could get
      </p>
      <div className="grid grid-cols-3 gap-4">
        {columns.map((col) => (
          <div key={col.label} className="text-center">
            <div className={`text-lg font-bold tabular ${col.color}`}>
              {formatINR(col.value)}
            </div>
            <div className="text-xs text-text-muted mt-0.5 leading-tight">
              {col.label}
            </div>
            {/* Progress bar — relative to bestInr */}
            <div className="w-full bg-bg-subtle rounded-full h-1 mt-2">
              <div
                className={`${col.barColor} h-1 rounded-full transition-all duration-500`}
                style={{
                  width: bestInr > 0
                    ? `${Math.min(100, (col.value / bestInr) * 100).toFixed(1)}%`
                    : '0%',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
