'use client';

import { Card } from '@/lib/types';

interface CardSelectorProps {
  cards: Card[];
  selectedId: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}

/** Groups cards by issuer for a cleaner dropdown UX */
function groupByIssuer(cards: Card[]): Record<string, Card[]> {
  return cards.reduce<Record<string, Card[]>>((acc, card) => {
    if (!acc[card.issuer]) acc[card.issuer] = [];
    acc[card.issuer].push(card);
    return acc;
  }, {});
}

export function CardSelector({ cards, selectedId, onChange, disabled }: CardSelectorProps) {
  const groups = groupByIssuer(cards);

  return (
    <div className="space-y-2">
      <label htmlFor="card-select" className="block text-sm font-medium text-text-secondary">
        Your Card
      </label>
      <div className="relative">
        <select
          id="card-select"
          value={selectedId}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="input-field appearance-none pr-10 cursor-pointer"
        >
          <option value="" disabled>Select your card…</option>
          {Object.entries(groups).map(([issuer, issuerCards]) => (
            <optgroup key={issuer} label={issuer}>
              {issuerCards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {/* Chevron icon */}
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </div>

      {/* Selected card metadata pill */}
      {selectedId && (() => {
        const card = cards.find((c) => c.id === selectedId);
        if (!card) return null;
        return (
          <div className="flex items-center gap-2 mt-2 text-xs text-text-muted">
            <span className="px-2 py-0.5 rounded-md bg-bg-raised border border-bg-subtle">
              {card.points_currency_name}
            </span>
            <span>·</span>
            <span>Earns {card.base_earn_rate} pts/₹100</span>
            <span>·</span>
            <span>Statement credit = ₹{card.cash_redemption_cpp}/pt</span>
          </div>
        );
      })()}
    </div>
  );
}
