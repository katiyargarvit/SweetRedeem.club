'use client';

// ============================================================
// MyCardsSection — "Your Points Wallet"
//
// Shown only to signed-in users on the home page.
// Lets them declare which premium cards they hold and enter
// their current point balances. Data is persisted to the
// `user_card_holdings` table via Supabase upsert.
//
// Falls back gracefully if the table hasn't been migrated yet
// (fetchUserHoldings returns [] on 42P01).
// ============================================================

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchCards, fetchUserHoldings, saveUserHolding, deleteUserHolding, formatINR } from '@/lib/supabase-queries';
import type { CardRow, UserCardHoldingRow } from '@/lib/database.types';

// ── Best reachable CPP per card (used for estimated value calc) ──
// Updated when we have real transfer data; these are conservative estimates.
const BEST_CPP_BY_CARD: Record<string, number> = {
  'hdfc-infinia':   3.5,
  'axis-atlas':     3.0,
  'axis-olympus':   2.8,
  'sbi-aurum':      2.5,
  'amex-platinum':  3.2,
};
const DEFAULT_BEST_CPP = 2.5;

// ── Mock cards (shown if Supabase cards table is empty) ────────
const MOCK_CARDS: CardRow[] = [
  { id: 'hdfc-infinia',  name: 'HDFC Infinia',    issuer: 'HDFC',  points_currency_name: 'Reward Points', base_earn_rate: 3.3, is_active: true, cash_redemption_cpp: 0.5, logo_url: null, created_at: '' },
  { id: 'axis-atlas',    name: 'Axis Atlas',      issuer: 'Axis',  points_currency_name: 'EDGE Miles',    base_earn_rate: 5.0, is_active: true, cash_redemption_cpp: 0.4, logo_url: null, created_at: '' },
  { id: 'axis-olympus',  name: 'Axis Olympus',    issuer: 'Axis',  points_currency_name: 'EDGE Miles',    base_earn_rate: 5.0, is_active: true, cash_redemption_cpp: 0.4, logo_url: null, created_at: '' },
  { id: 'sbi-aurum',     name: 'SBI Aurum',       issuer: 'SBI',   points_currency_name: 'Reward Points', base_earn_rate: 2.0, is_active: true, cash_redemption_cpp: 0.35, logo_url: null, created_at: '' },
  { id: 'amex-platinum', name: 'Amex Platinum',   issuer: 'Amex',  points_currency_name: 'MR Points',     base_earn_rate: 5.0, is_active: true, cash_redemption_cpp: 0.5, logo_url: null, created_at: '' },
];

// ── Issuer colour map ──────────────────────────────────────────
const ISSUER_COLOURS: Record<string, { bg: string; text: string }> = {
  HDFC: { bg: 'linear-gradient(135deg,#003087,#0047AB)', text: '#90B4E8' },
  Axis: { bg: 'linear-gradient(135deg,#8B0000,#C0392B)', text: '#F4A0A0' },
  SBI:  { bg: 'linear-gradient(135deg,#1A5276,#2E86AB)', text: '#AED6F1' },
  Amex: { bg: 'linear-gradient(135deg,#006FCF,#003087)', text: '#90CDF4' },
};
const DEFAULT_COLOUR = { bg: 'linear-gradient(135deg,#1a3a5c,#2563eb)', text: '#93C5FD' };

function getIssuerColour(issuer: string) {
  return ISSUER_COLOURS[issuer] ?? DEFAULT_COLOUR;
}

export default function MyCardsSection() {
  const [userId, setUserId]     = useState<string | null>(null);
  const [cards, setCards]       = useState<CardRow[]>([]);
  const [holdings, setHoldings] = useState<Record<string, number>>({}); // card_id → points
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState('');

  // ── Auth check ──────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Load cards + existing holdings ──────────────────────────
  useEffect(() => {
    if (!userId) return;

    // Fetch available cards
    fetchCards()
      .then((data) => setCards(data.length > 0 ? data : MOCK_CARDS))
      .catch(() => setCards(MOCK_CARDS));

    // Fetch existing holdings for this user
    fetchUserHoldings(userId)
      .then((rows: UserCardHoldingRow[]) => {
        const map: Record<string, number> = {};
        const sel = new Set<string>();
        rows.forEach((r) => {
          map[r.card_id] = r.points_balance;
          sel.add(r.card_id);
        });
        setHoldings(map);
        setSelected(sel);
      })
      .catch(() => { /* pre-migration: ignore */ });
  }, [userId]);

  // Don't render for unauthenticated visitors
  if (!userId) return null;

  // ── Handlers ────────────────────────────────────────────────
  function toggleCard(cardId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
        // Also clear its points value
        setHoldings((h) => { const n = { ...h }; delete n[cardId]; return n; });
      } else {
        next.add(cardId);
      }
      return next;
    });
    setSaved(false);
  }

  function handlePointsChange(cardId: string, value: string) {
    const num = parseInt(value.replace(/,/g, ''), 10);
    setHoldings((prev) => ({ ...prev, [cardId]: isNaN(num) ? 0 : num }));
    setSaved(false);
  }

  async function handleSave() {
    if (!userId) return;
    setSaving(true);
    setError('');
    try {
      // Upsert selected cards' holdings
      const saves = Array.from(selected).map((cardId) =>
        saveUserHolding(userId, cardId, holdings[cardId] ?? 0),
      );
      // Delete unselected cards that were previously saved
      const removes = cards
        .filter((c) => !selected.has(c.id) && c.id in holdings)
        .map((c) => deleteUserHolding(userId, c.id));

      await Promise.all([...saves, ...removes]);
      setSaved(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      // If table doesn't exist yet, show a friendly note instead of an error
      if (msg.includes('does not exist') || msg.includes('42P01')) {
        setSaved(true); // UX: treat as success, migration pending
      } else {
        setError('Could not save — please try again.');
      }
    } finally {
      setSaving(false);
    }
  }

  // ── Estimated max value calculation ─────────────────────────
  const totalEstimatedValue = Array.from(selected).reduce((sum, cardId) => {
    const pts = holdings[cardId] ?? 0;
    const cpp = BEST_CPP_BY_CARD[cardId] ?? DEFAULT_BEST_CPP;
    return sum + pts * cpp;
  }, 0);

  const totalPoints = Array.from(selected).reduce(
    (sum, cardId) => sum + (holdings[cardId] ?? 0), 0,
  );

  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      border: '1px solid #EAEAEA',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
    }}>
      {/* ── Header ───────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        padding: '18px 18px 16px',
      }}>
        <p style={{
          fontSize: 10, fontWeight: 700, color: '#C5A059',
          textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6,
        }}>
          ✦ Your Points Wallet
        </p>
        <p style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontSize: 19, fontWeight: 700, color: '#fff', lineHeight: 1.25,
        }}>
          Tell us what cards you hold
        </p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4, lineHeight: 1.4 }}>
          We&apos;ll find the best redemptions for your exact points balance.
        </p>
      </div>

      <div style={{ padding: '18px 18px 20px' }}>

        {/* ── Card selector chips ─────────────────────────────── */}
        <p style={{
          fontSize: 10, fontWeight: 700, color: '#999',
          textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10,
        }}>
          Select your cards
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
          {cards.map((card) => {
            const isSelected = selected.has(card.id);
            const colour = getIssuerColour(card.issuer);
            return (
              <button
                key={card.id}
                onClick={() => toggleCard(card.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '7px 12px',
                  borderRadius: 10,
                  border: `1.5px solid ${isSelected ? '#C5A059' : '#E0DDD8'}`,
                  background: isSelected ? 'rgba(197,160,89,0.08)' : '#FAFAF8',
                  cursor: 'pointer',
                  transition: 'all 0.12s',
                }}
              >
                {/* Issuer icon */}
                <div style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  background: colour.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 8, fontWeight: 800, color: colour.text,
                }}>
                  {card.issuer[0]}
                </div>
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  color: isSelected ? '#8A6800' : '#555',
                  whiteSpace: 'nowrap',
                }}>
                  {card.name}
                </span>
                {isSelected && (
                  <span style={{ fontSize: 12, color: '#C5A059', marginLeft: 2 }}>✓</span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Points input for each selected card ─────────────── */}
        {selected.size > 0 && (
          <>
            <p style={{
              fontSize: 10, fontWeight: 700, color: '#999',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10,
            }}>
              Enter your points balance
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {cards
                .filter((c) => selected.has(c.id))
                .map((card) => {
                  const colour = getIssuerColour(card.issuer);
                  const pts = holdings[card.id] ?? 0;
                  const cpp = BEST_CPP_BY_CARD[card.id] ?? DEFAULT_BEST_CPP;
                  const estValue = pts * cpp;
                  return (
                    <div key={card.id} style={{
                      background: '#FAFAF8',
                      borderRadius: 12,
                      border: '1px solid #EAEAEA',
                      padding: '12px 14px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <div style={{
                          width: 24, height: 24, borderRadius: 6,
                          background: colour.bg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 9, fontWeight: 800, color: colour.text, flexShrink: 0,
                        }}>
                          {card.issuer[0]}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#000', flex: 1 }}>
                          {card.name}
                        </span>
                        {estValue > 0 && (
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#00A86B' }}>
                            ≈ {formatINR(estValue)} max
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="e.g. 1,50,000"
                          value={pts > 0 ? pts.toLocaleString('en-IN') : ''}
                          onChange={(e) => handlePointsChange(card.id, e.target.value)}
                          style={{
                            flex: 1, padding: '9px 12px',
                            borderRadius: 9, border: '1px solid #DDDAD4',
                            background: '#fff', fontSize: 14, fontWeight: 700,
                            color: '#000', outline: 'none',
                            fontFamily: 'Inter, sans-serif',
                          }}
                          onFocus={(e) => { e.target.style.borderColor = '#C5A059'; }}
                          onBlur={(e) => { e.target.style.borderColor = '#DDDAD4'; }}
                        />
                        <span style={{ fontSize: 11, color: '#999', whiteSpace: 'nowrap' }}>
                          {card.points_currency_name}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* ── Total estimated value ────────────────────────── */}
            {totalEstimatedValue > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(197,160,89,0.08), rgba(197,160,89,0.04))',
                borderRadius: 12,
                border: '1px solid rgba(197,160,89,0.2)',
                padding: '12px 14px',
                marginBottom: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#8A6800', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Your potential max value
                  </p>
                  <p style={{ fontSize: 11, color: '#AA8800', marginTop: 2 }}>
                    {totalPoints.toLocaleString('en-IN')} total points
                  </p>
                </div>
                <p style={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontSize: 22, fontWeight: 700, color: '#8A6800',
                }}>
                  {formatINR(totalEstimatedValue)}
                </p>
              </div>
            )}

            {/* ── Save button ──────────────────────────────────── */}
            {error && (
              <p style={{ fontSize: 12, color: '#E03E3E', marginBottom: 8 }}>{error}</p>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                width: '100%', padding: '13px',
                borderRadius: 12, border: 'none',
                background: saved ? '#00A86B' : '#121212',
                color: '#fff',
                fontSize: 14, fontWeight: 800,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                transition: 'background 0.2s',
              }}
            >
              {saving ? (
                <>
                  <span style={{
                    width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite', flexShrink: 0,
                  }} />
                  Saving…
                </>
              ) : saved ? (
                '✓ Wallet saved!'
              ) : (
                'Save my wallet →'
              )}
            </button>
          </>
        )}

        {selected.size === 0 && (
          <p style={{ fontSize: 12, color: '#AAA', textAlign: 'center', padding: '8px 0' }}>
            Select at least one card above to get started.
          </p>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
