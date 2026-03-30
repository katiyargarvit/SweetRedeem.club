'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getCards, calculate } from '@/lib/api';
import { Card, CalculateResponse } from '@/lib/types';

interface HeroCalculatorProps {
  onResult?: (result: CalculateResponse, card: Card) => void;
}

// Animated number counter
function useCounter(target: number, duration = 800) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (target === 0) { setCurrent(0); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      // Ease out expo
      const eased = 1 - Math.pow(1 - progress, 4);
      setCurrent(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return current;
}

// Format INR with Indian number system
function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000)   return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n.toLocaleString('en-IN')}`;
}

const CARD_GROUPS: Record<string, string[]> = {
  'HDFC Bank':       ['HDFC Infinia', 'HDFC Diners Club Black', 'HDFC Regalia Gold', 'HDFC BizBlack'],
  'Axis Bank':       ['Axis Atlas', 'Axis Olympus', 'Axis Magnus (Burgundy)', 'Axis Magnus', 'Axis Reserve'],
  'American Express':['Amex Platinum Travel'],
  'HSBC Bank':       ['HSBC Premier', 'HSBC TravelOne'],
  'ICICI Bank':      ['ICICI Emeralde Private'],
  'SBI Card':        ['SBI Aurum'],
};

export function HeroCalculator({ onResult }: HeroCalculatorProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [cardId, setCardId] = useState('');
  const [pointsRaw, setPointsRaw] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalculateResponse | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const maxValue = result?.max_value_inr ?? 0;
  const animatedValue = useCounter(maxValue, 900);

  // Load cards
  useEffect(() => {
    getCards().then(setCards).catch(() => {});
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const points = parseInt(pointsRaw.replace(/,/g, ''), 10);
  const canCalc = !!cardId && !isNaN(points) && points >= 1000;

  const handleCalc = useCallback(async () => {
    if (!canCalc || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await calculate({ card_id: cardId, points_balance: points });
      setResult(data);
      onResult?.(data, selectedCard!);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [canCalc, loading, cardId, points, selectedCard, onResult]);

  // Format input with commas as user types
  const handlePointsChange = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '');
    setPointsRaw(digits ? Number(digits).toLocaleString('en-IN') : '');
    setResult(null);
  };

  const selectCard = (card: Card) => {
    setCardId(card.id);
    setSelectedCard(card);
    setDropdownOpen(false);
    setResult(null);
  };

  // Group cards by issuer
  const grouped = cards.reduce<Record<string, Card[]>>((acc, c) => {
    if (!acc[c.issuer]) acc[c.issuer] = [];
    acc[c.issuer].push(c);
    return acc;
  }, {});

  return (
    <div style={{ width: '100%', maxWidth: 600, margin: '0 auto' }}>

      {/* ── Inputs ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Card selector — NeoPOP dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
            Select Card
          </label>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            style={{
              width: '100%',
              padding: '16px 18px',
              background: '#141414',
              border: `1px solid ${dropdownOpen ? '#7C3AED' : '#222222'}`,
              borderBottom: `2px solid ${dropdownOpen ? '#7C3AED' : '#222222'}`,
              borderRadius: '4px 4px 0 0',
              color: selectedCard ? '#fff' : '#4B5563',
              fontSize: 16, fontWeight: 700,
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              transition: 'border-color 0.15s',
            }}
          >
            <span>{selectedCard?.name ?? 'Select your card…'}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: '#9CA3AF' }}>
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>

          {/* Dropdown list */}
          {dropdownOpen && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
              background: '#141414',
              border: '1px solid #7C3AED',
              borderTop: 'none',
              borderRadius: '0 0 4px 4px',
              maxHeight: 280, overflowY: 'auto',
              boxShadow: '4px 4px 0px #000',
            }}>
              {Object.entries(grouped).map(([issuer, issuerCards]) => (
                <div key={issuer}>
                  <div style={{ padding: '8px 16px 4px', fontSize: 10, fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {issuer}
                  </div>
                  {issuerCards.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => selectCard(card)}
                      style={{
                        width: '100%', textAlign: 'left',
                        padding: '11px 16px',
                        fontSize: 14, fontWeight: 600,
                        color: card.id === cardId ? '#10B981' : '#fff',
                        background: card.id === cardId ? 'rgba(16,185,129,0.06)' : 'transparent',
                        border: 'none', cursor: 'pointer',
                        transition: 'background 0.1s',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      }}
                      onMouseEnter={(e) => { (e.target as HTMLElement).style.background = 'rgba(124,58,237,0.08)'; }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLElement).style.background =
                          card.id === cardId ? 'rgba(16,185,129,0.06)' : 'transparent';
                      }}
                    >
                      {card.name}
                      <span style={{ fontSize: 11, color: '#4B5563', fontFamily: 'monospace' }}>
                        ₹{card.cash_redemption_cpp}/pt base
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Points input */}
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
            Current Balance
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              inputMode="numeric"
              value={pointsRaw}
              onChange={(e) => handlePointsChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCalc(); }}
              placeholder="e.g. 1,00,000"
              disabled={!cardId}
              className="input-neopop tabular"
              style={{ fontSize: 20, paddingRight: 120 }}
            />
            <span style={{
              position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
              fontSize: 11, fontWeight: 700, color: '#4B5563', whiteSpace: 'nowrap',
            }}>
              {selectedCard?.points_currency_name ?? 'Points'}
            </span>
          </div>
          {/* Quick chips */}
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            {[10000, 50000, 100000, 500000].map((n) => {
              const isActive = parseInt(pointsRaw.replace(/,/g, ''), 10) === n;
              return (
                <button
                  key={n}
                  onClick={() => { setPointsRaw(n.toLocaleString('en-IN')); setResult(null); }}
                  disabled={!cardId}
                  style={{
                    padding: '4px 10px', fontSize: 11, fontWeight: 700,
                    borderRadius: 100,
                    border: `1px solid ${isActive ? '#7C3AED' : '#222222'}`,
                    background: isActive ? 'rgba(124,58,237,0.12)' : 'transparent',
                    color: isActive ? '#8B5CF6' : '#4B5563',
                    cursor: cardId ? 'pointer' : 'default',
                    fontFamily: 'monospace',
                    transition: 'all 0.12s',
                  }}
                >
                  {n.toLocaleString('en-IN')}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── CTA button ─────────────────────────────────────────── */}
      <button
        onClick={handleCalc}
        disabled={!canCalc || loading}
        className="btn-neopop"
        style={{ width: '100%', marginTop: 20, fontSize: 15, padding: '16px 24px', letterSpacing: '0.02em' }}
      >
        {loading ? (
          <>
            <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
            Calculating…
          </>
        ) : (
          '⚡ Calculate True Value'
        )}
      </button>

      {/* ── Result ─────────────────────────────────────────────── */}
      {result && !loading && (
        <div
          style={{
            marginTop: 24,
            padding: '24px 24px 20px',
            background: '#0D2818',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: 8,
            boxShadow: '4px 4px 0px #000, 0 0 32px rgba(16,185,129,0.08)',
            animation: 'ticker 0.7s cubic-bezier(0.16,1,0.3,1) forwards',
          }}
        >
          <p style={{ fontSize: 11, fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Your points are worth up to
          </p>
          <div
            style={{
              fontSize: 56, fontWeight: 800, lineHeight: 1,
              letterSpacing: '-0.04em', marginTop: 8,
              fontFamily: 'JetBrains Mono, monospace',
              background: 'linear-gradient(135deg, #34D399, #10B981)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {fmt(animatedValue)}
          </div>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 8 }}>
            via{' '}
            <span style={{ color: '#fff', fontWeight: 700 }}>
              {result.results[0]?.program.name ?? 'transfer'}
            </span>
            {' '}— vs only{' '}
            <span style={{ color: '#EF4444', fontWeight: 700 }}>
              {fmt(result.baseline_comparisons[0]?.total_value_inr ?? 0)}
            </span>
            {' '}as statement credit
          </p>

          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 22, fontWeight: 800,
              color: '#10B981', fontFamily: 'monospace',
            }}>
              {result.vs_baseline_multiplier.toFixed(1)}×
            </span>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>
              better than your bank's portal
            </span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
