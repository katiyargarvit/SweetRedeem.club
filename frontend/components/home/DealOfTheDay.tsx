'use client';

// ============================================================
// DealOfTheDay — interactive 2×2 points selector grid
// tapping a tile swaps the deal card below.
// ============================================================

import { useState } from 'react';
import type { SweetSpotRow } from '@/lib/database.types';
import { formatINRFull, formatPoints } from '@/lib/supabase-queries';

const SELECTOR_OPTIONS = [
  { pts: 10000,  label: '10,000 pts',   value: 15000,   sublabel: 'DEL → BKK Economy',  tier: 'warn'    },
  { pts: 20000,  label: '20,000 pts',   value: 10000,   sublabel: 'Statement Credit',    tier: 'error'   },
  { pts: 45000,  label: '45,000 pts',   value: 85000,   sublabel: 'BOM → CDG Economy',  tier: 'success' },
  { pts: 100000, label: '1,00,000 pts', value: 240000,  sublabel: 'BOM → SIN Business', tier: 'success' },
];

const DEST_GRADIENTS: string[] = [
  'linear-gradient(160deg, #360033, #0b8793)',
  'linear-gradient(160deg, #1c1c1c, #374151)',
  'linear-gradient(160deg, #1a1a2e, #16213e, #533483)',
  'linear-gradient(160deg, #0f2027, #203a43, #2c5364)',
];

const ROUTE_LABELS = [
  'Air France · Economy',
  'HDFC Bank Portal',
  'Air France · Economy',
  'Singapore Airlines · Business Class',
];

const PARTNER_LABELS = ['Flying Blue', '', 'Flying Blue', 'KrisFlyer'];

interface Props {
  spots: SweetSpotRow[];
}

export default function DealOfTheDay({ spots: _spots }: Props) {
  const [active, setActive] = useState(2);

  const opt = SELECTOR_OPTIONS[active];

  const valueColor =
    opt.tier === 'success' ? '#00C885'
    : opt.tier === 'warn'  ? '#E08A00'
    : '#E03E3E';

  const badgeText =
    opt.tier === 'success'
      ? (active === 3 ? '⭐ Elite deal' : '✨ High Value')
      : opt.tier === 'warn'
        ? '⚡ Flash Deal'
        : '⚠ Poor value — avoid';

  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '3px 10px', borderRadius: 9999,
    fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
    border: 'none', color: '#fff',
    background:
      opt.tier === 'success' ? 'rgba(0,200,133,0.9)'
      : opt.tier === 'warn'  ? 'rgba(197,160,89,0.9)'
      : 'rgba(224,62,62,0.9)',
  };

  const cppVal = +(opt.value / opt.pts).toFixed(2);
  const vsBank = +(cppVal / 0.5).toFixed(1);

  return (
    <>
      {/* Section header */}
      <div className="section-head" style={{ marginTop: 28 }}>
        <span className="section-title">🎯 Deal of the Day</span>
        <span style={{ fontSize: 13, color: '#00C885', fontWeight: 600 }}>HDFC Infinia</span>
      </div>

      {/* 2×2 selector grid */}
      <div style={{ padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {SELECTOR_OPTIONS.map((o, i) => {
            const isActive = active === i;
            const vColor =
              o.tier === 'success' ? '#00C885'
              : o.tier === 'warn'  ? '#E08A00'
              : '#E03E3E';
            return (
              <button
                key={i}
                onClick={() => setActive(i)}
                style={{
                  background: isActive ? '#121212' : '#fff',
                  border: `1.5px solid ${isActive ? '#121212' : '#EAEAEA'}`,
                  borderRadius: 14,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.15s',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                }}
              >
                <p style={{ fontSize: 12, fontWeight: 700, color: isActive ? 'rgba(255,255,255,0.65)' : '#666', marginBottom: 4 }}>
                  {o.label}
                </p>
                <p style={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontSize: 18, fontWeight: 700,
                  color: isActive ? '#fff' : vColor,
                }}>
                  {formatINRFull(o.value)}
                </p>
                <p style={{ fontSize: 10, color: isActive ? 'rgba(255,255,255,0.45)' : '#999', marginTop: 3 }}>
                  {o.sublabel} ›
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic deal card */}
      <div style={{ margin: '14px 20px 0' }}>
        <div style={{
          background: '#fff', borderRadius: 16,
          overflow: 'hidden', border: '1px solid #EAEAEA',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)', cursor: 'pointer',
        }}>
          {/* Image / gradient area */}
          <div style={{ height: 175, background: DEST_GRADIENTS[active], position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55), transparent 55%)' }} />
            {/* Badges */}
            <div style={{ position: 'absolute', top: 14, left: 14, right: 14, display: 'flex', justifyContent: 'space-between' }}>
              <span style={badgeStyle}>{badgeText}</span>
              {PARTNER_LABELS[active] && (
                <span style={{
                  background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)',
                  padding: '5px 12px', borderRadius: 9999,
                  fontSize: 11, fontWeight: 700, color: '#fff',
                }}>
                  {PARTNER_LABELS[active]}
                </span>
              )}
            </div>
            {/* Route */}
            <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16 }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>{ROUTE_LABELS[active]}</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                {opt.sublabel.replace(' Economy', '').replace(' Business', '')}
              </p>
            </div>
          </div>

          {/* Data row */}
          <div style={{ padding: '16px 16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <p className="label-tag">Points required</p>
                <p style={{ fontSize: 22, fontWeight: 800, marginTop: 2 }}>{formatPoints(opt.pts)}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p className="label-tag">Cash value</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: valueColor, marginTop: 2 }}>{formatINRFull(opt.value)}</p>
              </div>
            </div>

            {active !== 1 ? (
              <>
                <div className="progress-track" style={{ marginTop: 12 }}>
                  <div className="progress-fill" style={{ width: active === 3 ? '100%' : active === 2 ? '80%' : '60%' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <p style={{ fontSize: 12, color: '#666' }}>₹{cppVal.toFixed(2)} per point</p>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center',
                    padding: '3px 10px', borderRadius: 9999,
                    fontSize: 10, fontWeight: 700,
                    background: 'rgba(0,200,133,0.1)', color: '#00A86B',
                    border: '1px solid rgba(0,200,133,0.2)',
                  }}>
                    {vsBank}× vs bank portal
                  </span>
                </div>
              </>
            ) : (
              <p style={{ fontSize: 12, color: '#E03E3E', marginTop: 10, fontWeight: 600, lineHeight: 1.5 }}>
                ₹0.50/pt — worst option. Use a transfer partner instead to get 2–4× more value ↑
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
