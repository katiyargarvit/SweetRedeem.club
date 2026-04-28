'use client';

// ============================================================
// DealDrawer — slide-up bottom sheet shown on deal card tap.
//
// Shows:
//  1. Program + CPP badge
//  2. Route / property + category
//  3. Points breakdown (points needed | cash value | CPP)
//  4. Transfer path — card → loyalty program
//  5. Redemption CTA → destination_url
//  6. Deal T&Cs
// ============================================================

import { useEffect } from 'react';
import type { SweetSpotRow, SweetSpotBestReturnRow } from '@/lib/database.types';
import { formatINR, formatPoints, cppTier } from '@/lib/supabase-queries';

// Accept both the raw sweet_spots row and the best_return view row
type DrawerSpot = SweetSpotRow | SweetSpotBestReturnRow;

interface Props {
  spot: DrawerSpot;
  onClose: () => void;
}

// Map program_id → transfer-from cards (known relationships)
const TRANSFER_CARDS: Record<string, string[]> = {
  krisflyer:   ['HDFC Infinia', 'Axis Atlas', 'Amex Platinum'],
  hyatt:       ['HDFC Infinia', 'Axis Atlas', 'Amex Platinum'],
  flyingblue:  ['HDFC Infinia', 'Axis Atlas', 'SBI Aurum'],
  aeroplan:    ['HDFC Infinia', 'Axis Atlas'],
  etihad:      ['HDFC Infinia', 'Axis Olympus'],
  airindiaone: ['HDFC Infinia', 'Axis Atlas', 'Axis Olympus', 'SBI Aurum'],
  marriott:    ['HDFC Infinia', 'Axis Atlas', 'Amex Platinum'],
  accor:       ['HDFC Infinia', 'Axis Atlas', 'Amex Platinum'],
};

const CPP_COLOURS: Record<string, { bg: string; text: string; border: string }> = {
  'Elite Value': { bg: 'rgba(0,200,133,0.12)', text: '#00A86B', border: 'rgba(0,200,133,0.25)' },
  'High Value':  { bg: 'rgba(0,200,133,0.07)', text: '#00A86B', border: 'rgba(0,200,133,0.15)' },
  'Good Value':  { bg: 'rgba(224,138,0,0.10)',  text: '#E08A00', border: 'rgba(224,138,0,0.22)' },
  'Poor Value':  { bg: 'rgba(224,62,62,0.10)',  text: '#C0392B', border: 'rgba(224,62,62,0.20)' },
};

const CATEGORY_LABELS: Record<string, string> = {
  economy:        '✈ Economy',
  business:       '👑 Business',
  first:          '✦ First Class',
  hotel_standard: '🏨 Standard Room',
  hotel_suite:    '🏨 Suite',
};

function fmt(n: number) {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1).replace(/\.0$/, '')}L`;
  if (n >= 1000)   return `₹${Math.round(n / 1000)}K`;
  return `₹${Math.round(n)}`;
}

export default function DealDrawer({ spot, onClose }: Props) {
  const { label: tierLabel } = cppTier(spot.cpp);
  const cppColour = CPP_COLOURS[tierLabel] ?? CPP_COLOURS['Good Value'];
  const isHotel   = spot.program_type === 'hotel';
  const transferCards = TRANSFER_CARDS[spot.program_id] ?? ['HDFC Infinia', 'Axis Atlas'];

  // Parse route
  const parts   = (spot.route_or_property ?? '').split('→');
  const origin  = parts[0]?.trim() ?? '';
  const arrival = parts[1]?.trim() ?? '';

  // Lock body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      {/* ── Backdrop ──────────────────────────────────────────── */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(3px)',
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* ── Sheet ─────────────────────────────────────────────── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 101,
        background: '#FAFAF8',
        borderRadius: '20px 20px 0 0',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
        maxHeight: '90vh',
        overflowY: 'auto',
        animation: 'slideUp 0.28s cubic-bezier(0.34,1.12,0.64,1)',
      }}>

        {/* Handle */}
        <div style={{ padding: '12px 0 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#D0CEC8' }} />
        </div>

        {/* ── Header ─────────────────────────────────────────── */}
        <div style={{ padding: '14px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{
              fontSize: 10, fontWeight: 700, color: '#C5A059',
              textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4,
            }}>
              {spot.program_name}
            </p>
            <h2 style={{
              fontFamily: '"Playfair Display", Georgia, serif',
              fontSize: 20, fontWeight: 700, color: '#000', lineHeight: 1.25,
              maxWidth: 280,
            }}>
              {spot.title}
            </h2>
          </div>

          {/* CPP badge */}
          <span style={{
            padding: '5px 12px', borderRadius: 9999, flexShrink: 0,
            background: cppColour.bg,
            border: `1px solid ${cppColour.border}`,
            fontSize: 11, fontWeight: 700, color: cppColour.text,
            marginTop: 4,
          }}>
            {tierLabel}
          </span>
        </div>

        {/* Category + route */}
        <div style={{ padding: '10px 20px 0', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{
            padding: '3px 10px', borderRadius: 9999,
            background: 'rgba(197,160,89,0.1)', color: '#8A6800',
            border: '1px solid rgba(197,160,89,0.25)',
            fontSize: 11, fontWeight: 700,
          }}>
            {CATEGORY_LABELS[spot.category] ?? spot.category}
          </span>

          {!isHotel && origin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#000' }}>{origin}</span>
              <span style={{ fontSize: 12, color: '#C5A059' }}>✈</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#000' }}>{arrival}</span>
            </div>
          )}
          {isHotel && (
            <span style={{ fontSize: 13, color: '#666' }}>{spot.route_or_property}</span>
          )}
        </div>

        {/* ── Points breakdown ───────────────────────────────── */}
        <div style={{
          margin: '16px 20px 0',
          background: '#fff',
          borderRadius: 14,
          border: '1px solid #EAEAEA',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          overflow: 'hidden',
        }}>
          {[
            { label: 'Points', value: formatPoints(spot.points_required), color: '#000' },
            { label: 'Worth',  value: formatINR(spot.est_cash_value_inr), color: '#00A86B' },
            { label: 'CPP',    value: `₹${spot.cpp.toFixed(2)}`,          color: cppColour.text },
          ].map((item, i) => (
            <div key={i} style={{
              padding: '14px 10px',
              borderRight: i < 2 ? '1px solid #EAEAEA' : 'none',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: 9, color: '#999', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>
                {item.label}
              </p>
              <p style={{ fontSize: 17, fontWeight: 800, color: item.color }}>
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Transfer path ──────────────────────────────────── */}
        <div style={{ margin: '16px 20px 0' }}>
          <p style={{
            fontSize: 11, fontWeight: 700, color: '#000',
            textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10,
          }}>
            Transfer from your card
          </p>

          {/* Already have points in the program */}
          <div style={{
            background: '#fff', borderRadius: 12, border: '1px solid #EAEAEA',
            padding: '12px 14px', marginBottom: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#000' }}>
                Already have {spot.program_name} points?
              </p>
              <p style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
                Book directly at {formatPoints(spot.points_required)} pts
              </p>
            </div>
            {spot.destination_url ? (
              <a
                href={spot.destination_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  padding: '7px 14px', borderRadius: 9999,
                  background: '#00A86B', color: '#fff',
                  fontSize: 12, fontWeight: 700, textDecoration: 'none',
                  flexShrink: 0,
                }}
              >
                Book →
              </a>
            ) : (
              <span style={{ fontSize: 11, color: '#999' }}>Link soon</span>
            )}
          </div>

          {/* Transfer options */}
          <p style={{ fontSize: 11, fontWeight: 700, color: '#666', marginBottom: 8 }}>
            Or transfer credit card points →
          </p>
          {transferCards.map((cardName) => (
            <div key={cardName} style={{
              background: '#fff', borderRadius: 12, border: '1px solid #EAEAEA',
              padding: '11px 14px', marginBottom: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Card icon placeholder */}
                <div style={{
                  width: 28, height: 28, borderRadius: 7,
                  background: 'linear-gradient(135deg, #1a3a5c, #2563eb)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 800, color: '#93C5FD', flexShrink: 0,
                }}>
                  {cardName[0]}
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#000' }}>{cardName}</p>
                  <p style={{ fontSize: 10, color: '#666' }}>→ {spot.program_name}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#000' }}>
                  {formatPoints(spot.points_required)} pts
                </p>
                <p style={{ fontSize: 10, color: '#999' }}>1:1 ratio</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Deal T&Cs ──────────────────────────────────────── */}
        <div style={{
          margin: '16px 20px 0',
          background: 'rgba(249,246,240,0.8)',
          borderRadius: 12,
          border: '1px solid #EAEAEA',
          padding: '12px 14px',
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#8A6A00', marginBottom: 6 }}>
            ⚠ Before you transfer
          </p>
          <p style={{ fontSize: 11, color: '#666', lineHeight: 1.6 }}>
            • Redemption values are estimates based on typical cash rates — actual value may vary.<br />
            • Award space is subject to availability and can change without notice.<br />
            • Point transfers are <strong>irreversible</strong>. Verify availability on {spot.program_name} before initiating a transfer.<br />
            {spot.last_verified_at && (
              <>• Data last verified: {new Date(spot.last_verified_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}.</>
            )}
          </p>
        </div>

        {/* ── Primary CTA ────────────────────────────────────── */}
        <div style={{ padding: '16px 20px 32px' }}>
          {spot.destination_url ? (
            <a
              href={spot.destination_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block', textAlign: 'center',
                padding: '15px', borderRadius: 14,
                background: '#121212', color: '#fff',
                fontSize: 15, fontWeight: 800,
                textDecoration: 'none', letterSpacing: '-0.01em',
              }}
            >
              Go to {spot.program_name} →
            </a>
          ) : (
            <div style={{
              padding: '15px', borderRadius: 14,
              background: '#F0EDE8',
              fontSize: 14, fontWeight: 700, color: '#999',
              textAlign: 'center',
            }}>
              Redemption link coming soon
            </div>
          )}

          <button
            onClick={onClose}
            style={{
              display: 'block', width: '100%', marginTop: 10,
              padding: '12px', borderRadius: 14,
              border: 'none', background: 'transparent',
              fontSize: 13, fontWeight: 700, color: '#999',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
    </>
  );
}
