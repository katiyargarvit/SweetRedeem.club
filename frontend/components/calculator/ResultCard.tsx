'use client';

import { useState } from 'react';
import { ProgramResult } from '@/lib/types';
import { formatINR, formatPoints, cppTier, categoryLabel } from '@/lib/api';
import { ValueBadge } from '@/components/ui/ValueBadge';
import { ProgramIcon } from '@/components/ui/ProgramIcon';

interface ResultCardProps {
  result: ProgramResult;
  rank: number;
  cardCashCpp: number;    // card's cash_redemption_cpp for vs-baseline multiplier
}

export function ResultCard({ result, rank, cardCashCpp }: ResultCardProps) {
  const [expanded, setExpanded] = useState(rank === 1);

  // best_value_inr is the headline — use it for tier badge
  const bestCpp = result.categories.find(
    (c) => c.category === result.best_category
  )?.effective_cpp_inr ?? 0;

  const tier = cppTier(bestCpp);
  const vsBaseline = cardCashCpp > 0
    ? result.best_value_inr / (result.program_points * cardCashCpp)
    : 1;

  return (
    <div
      className={`card-surface transition-all duration-200 ${
        rank === 1 ? 'ring-1 ring-gold/30' : ''
      }`}
    >
      {/* Header row — always visible */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-start gap-3 p-5 text-left"
        aria-expanded={expanded}
      >
        {/* Rank bubble */}
        <span
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
            rank === 1
              ? 'bg-gold text-bg-base'
              : 'bg-bg-raised text-text-muted border border-bg-subtle'
          }`}
        >
          {rank}
        </span>

        {/* Program name + type icon */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <ProgramIcon type={result.program.type} size={15} />
            <span className="font-semibold text-text-primary">
              {result.program.name}
            </span>
            {result.has_active_bonus && (
              <span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-value-elite/10 text-value-elite">
                🔥 {result.bonus_pct}% Bonus
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-text-muted flex-wrap">
            <span>Transfer ratio: {
              // Derive ratio from program_points — show as "1 : X" from the data
              // best category's effective_cpp divided by bestCategory cpp = dest/source
              // But we don't have source/dest qty directly in the result.
              // Show program_points vs points_balance instead as a proxy.
              'see breakdown'
            }</span>
            <span>·</span>
            <span className="tabular">
              {formatPoints(result.program_points)} {result.program.currency_name ?? 'miles'}
            </span>
          </div>
        </div>

        {/* Headline value */}
        <div className="text-right shrink-0">
          <div className="text-xl font-bold text-text-primary tabular">
            {formatINR(result.best_value_inr)}
          </div>
          <ValueBadge cpp={bestCpp} />
        </div>

        {/* Chevron */}
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2"
          className={`text-text-muted shrink-0 mt-1.5 transition-transform duration-200 ${
            expanded ? 'rotate-180' : ''
          }`}
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {/* Expanded: per-category breakdown */}
      {expanded && (
        <div className="px-5 pb-5 animate-fade-in">
          <div className="border-t border-bg-subtle pt-4">
            <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
              Value by redemption category
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {result.categories.map((cat) => {
                const catTier = cppTier(cat.effective_cpp_inr);
                const isBest = cat.category === result.best_category;
                return (
                  <div
                    key={cat.category}
                    className={`rounded-xl p-3 border ${
                      isBest
                        ? 'bg-gold-muted border-gold/20'
                        : 'bg-bg-raised border-bg-subtle'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-text-secondary font-medium">
                        {categoryLabel(cat.category)}
                      </span>
                      {isBest && (
                        <span className="text-xs text-gold font-semibold">Best ✦</span>
                      )}
                    </div>
                    <div className="flex items-end justify-between">
                      <span className={`text-lg font-bold tabular ${catTier.color}`}>
                        {formatINR(cat.total_value_inr)}
                      </span>
                      <div className="text-right">
                        <div className="text-xs text-text-muted tabular">
                          ₹{cat.effective_cpp_inr.toFixed(2)}/pt
                        </div>
                        <div className="text-xs text-text-muted tabular">
                          {cat.cpp_inr.toFixed(2)} program CPP
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Link to partner site */}
            {result.program.website_url && (
              <a
                href={result.program.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-gold transition-colors"
              >
                Transfer at {result.program.name} →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
