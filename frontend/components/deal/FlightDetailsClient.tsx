'use client';

// ============================================================
// FlightDetailsClient — Deal / Flight Details interactive page
// Figma ref: node 8:1547  "SweetRedeem.club/flight-details"
// Rendered by: app/sweet-spots/[id]/page.tsx
// ============================================================

import { useState } from 'react';
import Link from 'next/link';
import type { SweetSpotRow } from '@/lib/database.types';
import { formatPoints, formatINRFull } from '@/lib/supabase-queries';

// ── Figma CDN icon URLs ───────────────────────────────────────
// Replace with permanent CDN URLs before production (valid ~7 days)
const ICON_PLANE      = 'https://www.figma.com/api/mcp/asset/14453c1a-dc35-476f-8855-046341b02c19';
const ICON_STAR       = 'https://www.figma.com/api/mcp/asset/2668a06d-6a02-4d8d-9810-3a3810cb6392';
const ICON_ARROW_RT   = 'https://www.figma.com/api/mcp/asset/27e25443-2e80-449a-8dd5-f8d25a82cac8';
const ICON_TRANSFER   = 'https://www.figma.com/api/mcp/asset/b615d3f6-51ec-4c54-a587-e8e6d80778c1';
const ICON_INSTANT    = 'https://www.figma.com/api/mcp/asset/0ff072d2-74e6-42ad-8235-d2b5158f756d';
const ICON_JOIN       = 'https://www.figma.com/api/mcp/asset/27e25443-2e80-449a-8dd5-f8d25a82cac8';
const ICON_STAR_GOLD  = 'https://www.figma.com/api/mcp/asset/9f934d1d-52b1-4f18-b08f-2c42b463a4e7';
const ICON_INFO       = 'https://www.figma.com/api/mcp/asset/343f87b1-cb1a-4526-8463-2f7d1dce472b';
const ICON_FLIGHT_RT  = 'https://www.figma.com/api/mcp/asset/520304dc-d4d1-4cc9-acf9-19a7ce766579';
const ICON_AMEX_ARROW = 'https://www.figma.com/api/mcp/asset/b391afb6-54c6-40f3-8c52-9cde9b02c8a6';

// RTB icons (dark section)
const RTB_ICONS = [
  'https://www.figma.com/api/mcp/asset/5cd17e7e-7d21-45b5-b734-af9f36652b7b',
  'https://www.figma.com/api/mcp/asset/dff09a4b-f640-4c89-98a2-f47c81661e89',
  'https://www.figma.com/api/mcp/asset/18d1beed-e5ff-479a-a6df-672a94132da3',
  'https://www.figma.com/api/mcp/asset/bfb1aeec-aa3d-4c63-8901-4d0e532409c1',
];

const RTB_ITEMS = [
  {
    title: 'Unlock True Award Seats',
    body:  'Stop settling for basic statement credits. Real value lives in exclusive, limited airline inventories.',
  },
  {
    title: 'Zero Math, Total Clarity',
    body:  'Airline alliances and bank transfer ratios are literally designed to confuse you. We fix that.',
  },
  {
    title: 'Verified by the Club',
    body:  "You aren't flying solo. Our community of expert optimizers actively uncovers the industry's best redemptions.",
  },
  {
    title: 'Get the Insider Edge',
    body:  'Banks want you to redeem your hard-earned points for pennies. We help you demand rupees.',
  },
];

interface TransferOption {
  id:                  string;
  sourceName:          string;
  sourceLabel:         string;
  sourceBg:            string;
  ratio:               string;
  bonus:               string | null;
  bonusColor:          string | null;
  bonusBg:             string | null;
  isInstant:           boolean;
  isSweetRedeemPick:   boolean;
  pointsRequired:      number;
}

interface Props {
  spot:            SweetSpotRow;
  progInfo:        { bg: string; text: string; label: string };
  heroImage:       string;
  origin:          string;
  dest:            string;
  isHotel:         boolean;
  transferOptions: TransferOption[];
}

// ── CPP color ─────────────────────────────────────────────────
const cppColor = (cpp: number) =>
  cpp >= 2.0 ? '#009966' : cpp >= 1.2 ? '#E08A00' : '#E03E3E';

// ── Cabin badge ───────────────────────────────────────────────
const cabinLabel = (cat: string) => {
  if (cat === 'first')         return 'First Class 🌟';
  if (cat === 'business')      return 'Business 👑';
  if (cat.startsWith('hotel')) return 'Hotel Suite 🏨';
  return 'Economy ✈';
};

export default function FlightDetailsClient({
  spot, progInfo, heroImage, origin, dest, isHotel, transferOptions,
}: Props) {
  const [showAllOptions, setShowAllOptions] = useState(false);
  const [joined, setJoined] = useState(false);

  const pick = transferOptions.find(o => o.isSweetRedeemPick);
  const rest = transferOptions.filter(o => !o.isSweetRedeemPick);
  const visibleOptions = showAllOptions ? rest : [];

  const retailPrice = formatINRFull(spot.est_cash_value_inr);

  return (
    <>
      {/* ── Hero image ───────────────────────────────────────── */}
      <div style={{ position: 'relative', height: 320, overflow: 'hidden', marginTop: -1 }}>
        <img
          src={heroImage}
          alt={`${origin} to ${dest}`}
          onError={(e) => {
            // Fallback: gradient if CDN image expires
            (e.target as HTMLImageElement).style.display = 'none';
          }}
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
        {/* Gradient overlay for readability */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.0) 60%, rgba(0,0,0,0.35) 100%)',
          pointerEvents: 'none',
        }} />
        {/* Back button */}
        <Link
          href="/discover"
          style={{
            position: 'absolute', top: 16, left: 16,
            width: 36, height: 36,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            textDecoration: 'none',
            fontSize: 18, color: '#0f172b',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          ‹
        </Link>
      </div>

      {/* ── White card slides up over hero ─────────────────────── */}
      <div style={{
        background: '#fff',
        borderRadius: '28px 28px 0 0',
        marginTop: -28,
        position: 'relative',
        zIndex: 2,
        boxShadow: '0 -10px 40px 0 rgba(0,0,0,0.10)',
        paddingBottom: 48,
      }}>
        {/* Drag handle */}
        <div style={{
          display: 'flex', justifyContent: 'center',
          paddingTop: 12, paddingBottom: 4,
        }}>
          <div style={{
            width: 40, height: 4,
            borderRadius: 9999,
            background: '#e2e8f0',
          }} />
        </div>

        {/* ── Header: title + CPP + club wins ───────────────── */}
        <div style={{ padding: '8px 20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Row 1: title + plane icon */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <h1 style={{
              fontSize: 24, fontWeight: 800, color: '#0f172b',
              letterSpacing: '-0.6px', margin: 0, lineHeight: 1.25,
            }}>
              Your dream getaway
            </h1>
            <div style={{
              width: 40, height: 40,
              borderRadius: '50%',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              marginLeft: 12,
            }}>
              <img
                src={ICON_PLANE}
                alt="flight"
                width={20} height={20}
                onError={(e) => { (e.target as HTMLImageElement).replaceWith(Object.assign(document.createTextNode('✈'), {})); }}
                style={{ display: 'block' }}
              />
            </div>
          </div>

          {/* Row 2: Club Wins + CPP badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Club Wins avatars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ display: 'flex', position: 'relative', width: 88, height: 28 }}>
                {[0,1,2].map((i) => (
                  <div key={i} style={{
                    position: 'absolute',
                    left: i * 20,
                    width: 28, height: 28,
                    borderRadius: '50%',
                    background: `hsl(${200 + i * 40}, 60%, 50%)`,
                    border: '2px solid #fff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  }} />
                ))}
                <div style={{
                  position: 'absolute', left: 60,
                  width: 28, height: 28,
                  borderRadius: '50%',
                  background: '#ff8904',
                  border: '2px solid #fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  fontSize: 9, fontWeight: 800, color: '#fff',
                }}>+9</div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 500, color: '#62748e', whiteSpace: 'nowrap' }}>
                Club Wins
              </span>
            </div>

            {/* CPP Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <img
                src={ICON_STAR}
                alt="star"
                width={14} height={14}
                onError={(e) => { (e.target as HTMLImageElement).replaceWith(Object.assign(document.createTextNode('⭐'), {})); }}
                style={{ display: 'block' }}
              />
              <span style={{
                fontSize: 15, fontWeight: 800,
                color: cppColor(spot.cpp),
              }}>
                {spot.cpp.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Comparison card: SweetRedeem pts vs Retail ───────── */}
        <div style={{ padding: '16px 20px 0' }}>
          <div style={{
            background: '#fff',
            border: '0.75px solid #e2e8f0',
            borderRadius: 20,
            boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
            overflow: 'visible',
            position: 'relative',
          }}>
            {/* Top: points vs retail price */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              padding: '18px 18px 0',
            }}>
              {/* Left: SweetRedeem points */}
              <div>
                <p style={{
                  fontSize: 9, fontWeight: 700, color: '#90a1b9',
                  textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px',
                }}>SWEETREDEEM</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                  <span style={{
                    fontSize: 28, fontWeight: 800, color: '#0f172b',
                    letterSpacing: '-0.7px',
                  }}>
                    {formatPoints(spot.points_required)}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#90a1b9' }}>pts</span>
                </div>
              </div>

              {/* Right: Retail price with strikethrough */}
              <div style={{ textAlign: 'right' }}>
                <p style={{
                  fontSize: 9, fontWeight: 700, color: '#90a1b9',
                  textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px',
                }}>RETAIL PRICE</p>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <span style={{
                    fontSize: 20, fontWeight: 700, color: '#0f172b',
                    letterSpacing: '-0.5px',
                  }}>
                    {retailPrice}
                  </span>
                  {/* Pink strikethrough */}
                  <div style={{
                    position: 'absolute',
                    top: '54%', left: -2, right: -2,
                    height: 2,
                    background: '#e91e63',
                    borderRadius: 9999,
                    boxShadow: '0 1px 2px rgba(233,30,99,0.2)',
                    transform: 'translateY(-50%)',
                  }} />
                </div>
              </div>
            </div>

            {/* VS badge — centered absolutely */}
            <div style={{
              position: 'absolute',
              top: 38, left: '50%', transform: 'translateX(-50%)',
              zIndex: 3,
              width: 30, height: 30,
              borderRadius: '50%',
              background: '#fff',
              border: '0.75px solid #e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#62748e' }}>VS</span>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: '#f1f5f9', margin: '14px 18px 0' }} />

            {/* Bottom: airline logo + route + flight info */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 18px 18px',
            }}>
              {/* Airline logo + name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <div style={{
                  width: 40, height: 40,
                  borderRadius: 6,
                  background: progInfo.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                  {/* Diagonal stripe overlay like Figma */}
                  <div style={{
                    position: 'absolute', inset: 0, opacity: 0.2,
                    background: 'linear-gradient(45deg, transparent 45%, #fff 45%, #fff 55%, transparent 55%)',
                  }} />
                  <span style={{
                    fontSize: progInfo.label.length > 2 ? 8 : 11,
                    fontWeight: 900, color: progInfo.text,
                    letterSpacing: '0.8px', position: 'relative',
                  }}>
                    {progInfo.label}
                  </span>
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172b', margin: 0 }}>
                    {(spot.program_name ?? '').split(' ')[0]}
                  </p>
                  <p style={{ fontSize: 11, color: '#90a1b9', margin: '2px 0 0' }}>
                    {(spot.program_name ?? '').split(' ').slice(1).join(' ') || 'mileage club'}
                  </p>
                </div>
              </div>

              {/* Route + date + cabin */}
              <div style={{ textAlign: 'right', flex: 1, marginLeft: 8 }}>
                {/* Route */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#1d293d' }}>{origin}</span>
                  <img
                    src={ICON_FLIGHT_RT}
                    alt="→"
                    width={12} height={12}
                    onError={(e) => { (e.target as HTMLImageElement).replaceWith(Object.assign(document.createTextNode('✈'), {})); }}
                  />
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#1d293d' }}>{dest}</span>
                </div>
                {/* Date + cabin */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3 }}>
                  <span style={{ fontSize: 10, color: '#62748e' }}>April 16, 2026 · 1 stop ·</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#e69b00' }}>
                    {cabinLabel(spot.category).split(' ')[0]}
                  </span>
                  <span style={{ fontSize: 11 }}>
                    {cabinLabel(spot.category).split(' ')[1]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Options to book ────────────────────────────────── */}
        <div style={{ padding: '28px 20px 0' }}>
          <h2 style={{
            fontSize: 20, fontWeight: 300, color: '#45556c',
            letterSpacing: '-0.5px', margin: '0 0 16px',
          }}>
            Options to book
          </h2>

          {/* Already have points — direct booking */}
          <p style={{
            fontSize: 13, fontWeight: 700, color: '#0f172b',
            lineHeight: 1.45, margin: '0 0 14px',
          }}>
            Already have enough points? Book directly with your loyalty account
          </p>

          {/* Direct book row */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 40, height: 40,
                borderRadius: 6,
                background: progInfo.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                overflow: 'hidden', position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', inset: 0, opacity: 0.2,
                  background: 'linear-gradient(45deg, transparent 45%, #fff 45%, #fff 55%, transparent 55%)',
                }} />
                <span style={{
                  fontSize: progInfo.label.length > 2 ? 8 : 11,
                  fontWeight: 900, color: progInfo.text,
                  letterSpacing: '0.8px', position: 'relative',
                }}>
                  {progInfo.label}
                </span>
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172b', margin: 0 }}>
                  {(spot.program_name ?? '').split(' ')[0]}
                </p>
                <p style={{ fontSize: 11, color: '#90a1b9', margin: '2px 0 0' }}>
                  {(spot.program_name ?? '').split(' ').slice(1).join(' ') || 'mileage club'}
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172b', margin: 0 }}>
                {formatPoints(spot.points_required)} pts
              </p>
              <p style={{ fontSize: 10, color: '#90a1b9', margin: '2px 0 0' }}>
                + ₹ 2,599 taxes &amp; fees
              </p>
            </div>

            <a
              href={spot.destination_url ?? '#'}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '10px 20px',
                borderRadius: 9999,
                background: '#0f172b',
                color: '#fff',
                fontSize: 13, fontWeight: 600,
                textDecoration: 'none',
                marginLeft: 10,
                flexShrink: 0,
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                whiteSpace: 'nowrap',
              }}
            >
              Book
            </a>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: '#f1f5f9', marginBottom: 20 }} />

          {/* Transfer section heading */}
          <h3 style={{
            fontSize: 18, fontWeight: 500, color: '#0f172b',
            margin: '0 0 16px',
          }}>
            Transfer points from a credit card
          </h3>

          {/* SweetRedeem Pick card */}
          {pick && (
            <TransferCard
              option={pick}
              progInfo={progInfo}
              spot={spot}
            />
          )}

          {/* Show more options */}
          <button
            onClick={() => setShowAllOptions(!showAllOptions)}
            style={{
              background: 'none', border: 'none',
              width: '100%', textAlign: 'center',
              padding: '14px 0',
              fontSize: 13, fontWeight: 700, color: '#6b42f5',
              cursor: 'pointer',
            }}
          >
            {showAllOptions ? 'Show fewer options ↑' : 'Show more options'}
          </button>

          {/* Additional options */}
          {visibleOptions.map((opt) => (
            <div key={opt.id} style={{ marginBottom: 12 }}>
              <TransferCard option={opt} progInfo={progInfo} spot={spot} />
            </div>
          ))}

          {/* Disclaimer */}
          <div style={{
            display: 'flex', gap: 10, alignItems: 'flex-start',
            padding: '8px 0 4px',
          }}>
            <img
              src={ICON_INFO}
              alt="info"
              width={14} height={14}
              style={{ flexShrink: 0, marginTop: 2, opacity: 0.5 }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <p style={{
              fontSize: 11, color: '#45556c', lineHeight: 1.65, margin: 0,
            }}>
              This is a cached result that may still not be available. Club members get live availability &amp; exclusive access to such deals.
            </p>
          </div>
        </div>

        {/* ── Join The Club CTA ────────────────────────────────── */}
        <div style={{ padding: '28px 20px 0' }}>
          <button
            onClick={() => setJoined(true)}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: 14,
              border: 'none',
              background: joined
                ? '#00a86b'
                : 'linear-gradient(90deg, #6b42f5 0%, #2bbcc4 100%)',
              color: '#fff',
              fontSize: 16, fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '-0.15px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 8px 20px 0 rgba(44,188,196,0.35)',
              transition: 'all 0.2s',
            }}
          >
            {joined ? '🎉 You\'re in the club!' : (
              <>
                <img
                  src={ICON_JOIN}
                  alt=""
                  width={18} height={18}
                  style={{ display: 'block' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                Join The Club
              </>
            )}
          </button>

          {/* Exclusive access pill */}
          <div style={{
            background: '#f8fafc',
            borderRadius: 9999,
            padding: '7px 0',
            textAlign: 'center',
            marginTop: 10,
          }}>
            <span style={{
              fontSize: 11, fontWeight: 700, color: '#314158',
              letterSpacing: '0.25px',
            }}>
              Exclusive access · Members unlock 3–4× more value
            </span>
          </div>
        </div>
      </div>

      {/* ── Dark RTB section ─────────────────────────────────── */}
      <DarkRTBSection />
    </>
  );
}

// ── Transfer Card ─────────────────────────────────────────────
function TransferCard({
  option, progInfo, spot,
}: {
  option: { id: string; sourceName: string; sourceLabel: string; sourceBg: string; ratio: string; bonus: string | null; bonusColor: string | null; bonusBg: string | null; isInstant: boolean; isSweetRedeemPick: boolean; pointsRequired: number };
  progInfo: { bg: string; text: string; label: string };
  spot: SweetSpotRow;
}) {
  return (
    <div style={{
      border: '0.75px solid #cad5e2',
      borderRadius: 20,
      overflow: 'hidden',
      marginBottom: 4,
      position: 'relative',
    }}>
      {/* SweetRedeem Pick banner */}
      {option.isSweetRedeemPick && (
        <div style={{
          background: '#0f172b',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '7px 14px',
        }}>
          <span style={{
            fontSize: 9, fontWeight: 700, color: '#facc15',
            textTransform: 'uppercase', letterSpacing: '1px',
          }}>
            SweetRedeem Pick
          </span>
          <img
            src={ICON_STAR_GOLD}
            alt="★"
            width={10} height={10}
            style={{ display: 'block' }}
            onError={(e) => { (e.target as HTMLImageElement).replaceWith(Object.assign(document.createTextNode('★'), {})); }}
          />
        </div>
      )}

      {/* Card body */}
      <div style={{ padding: '14px 14px 12px', background: '#fff' }}>
        {/* Transfer path row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 16,
        }}>
          {/* Source → Program transfer row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
            {/* Source chip */}
            <div style={{
              width: 28, height: 28,
              borderRadius: 4,
              background: option.sourceBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 7, fontWeight: 800, color: '#fff', lineHeight: 1.2, textAlign: 'center' }}>
                {option.sourceLabel}
              </span>
            </div>
            {/* Source name */}
            <div>
              {option.sourceName.split('\n').map((line, i) => (
                <p key={i} style={{
                  fontSize: 10, fontWeight: 700, color: '#1d293d',
                  margin: 0, lineHeight: 1.3,
                }}>
                  {line}
                </p>
              ))}
            </div>

            {/* Arrow icon */}
            <img
              src={ICON_ARROW_RT}
              alt="→"
              width={14} height={14}
              style={{ flexShrink: 0 }}
              onError={(e) => { (e.target as HTMLImageElement).replaceWith(Object.assign(document.createTextNode('→'), {})); }}
            />

            {/* Dest program chip */}
            <div style={{
              width: 28, height: 28,
              borderRadius: 4,
              background: progInfo.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden', position: 'relative', flexShrink: 0,
            }}>
              <div style={{
                position: 'absolute', inset: 0, opacity: 0.2,
                background: 'linear-gradient(45deg, transparent 45%, #fff 45%, #fff 55%, transparent 55%)',
              }} />
              <span style={{
                fontSize: 7, fontWeight: 900, color: progInfo.text,
                letterSpacing: '0.5px', position: 'relative',
              }}>
                {progInfo.label}
              </span>
            </div>

            {/* Program name */}
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#0f172b', margin: 0 }}>
                {spot.program_name?.split(' ')[0] ?? progInfo.label}
              </p>
              <p style={{ fontSize: 9, color: '#90a1b9', margin: '1px 0 0' }}>
                mileage club
              </p>
            </div>
          </div>

          {/* Transfer button */}
          <button style={{
            padding: '8px 16px',
            borderRadius: 9999,
            border: '0.75px solid #cad5e2',
            background: '#fff',
            color: '#314158',
            fontSize: 13, fontWeight: 600,
            cursor: 'pointer',
            flexShrink: 0,
            marginLeft: 8,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            Transfer
          </button>
        </div>

        {/* Points + badges row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          {/* Points */}
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172b', margin: 0 }}>
              {formatPoints(option.pointsRequired)} pts
            </p>
            <p style={{ fontSize: 10, color: '#90a1b9', margin: '2px 0 0' }}>
              + ₹ 2,599 taxes &amp; fees
            </p>
          </div>

          {/* Ratio + instant + bonus badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* Ratio badge */}
            <span style={{
              padding: '2px 6px',
              background: '#f1f5f9',
              borderRadius: 4,
              fontSize: 10, fontWeight: 700, color: '#45556c',
            }}>
              {option.ratio}
            </span>

            {/* Instant badge */}
            {option.isInstant && (
              <span style={{
                display: 'flex', alignItems: 'center', gap: 2,
                fontSize: 10, color: '#90a1b9',
              }}>
                <img
                  src={ICON_INSTANT}
                  alt="⚡"
                  width={12} height={12}
                  onError={(e) => { (e.target as HTMLImageElement).replaceWith(Object.assign(document.createTextNode('⚡'), {})); }}
                />
                instant
              </span>
            )}

            {/* Bonus badge */}
            {option.bonus && option.bonusBg && (
              <span style={{
                padding: '2px 7px',
                background: option.bonusBg,
                borderRadius: 4,
                fontSize: 10, fontWeight: 700,
                color: option.bonusColor ?? '#137333',
                letterSpacing: '0.25px',
              }}>
                {option.bonus}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Dark RTB Section (dark variant — matches Figma) ────────────
function DarkRTBSection() {
  return (
    <div style={{
      background: '#0b1120',
      overflow: 'hidden',
      position: 'relative',
      paddingBottom: 48,
    }}>
      {/* Radial glow */}
      <div style={{
        position: 'absolute', top: 0, left: '16%',
        width: 300, height: 180,
        borderRadius: 9999,
        background: 'radial-gradient(ellipse, rgba(59,130,246,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ padding: '40px 20px 0' }}>
        {/* Label */}
        <p style={{
          fontSize: 10, fontWeight: 700,
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: '1.1px', textTransform: 'uppercase',
          margin: '0 0 8px',
        }}>
          THE SWEETREDEEM EDGE
        </p>

        {/* Watermark heading */}
        <h2 style={{
          fontSize: 40, fontWeight: 800,
          color: 'rgba(255,255,255,0.14)',
          letterSpacing: '-0.84px',
          margin: '0 0 32px',
          lineHeight: 1.1,
        }}>
          Why it works.
        </h2>

        {/* RTB items */}
        {RTB_ITEMS.map((item, i) => (
          <div
            key={i}
            style={{
              borderBottom: i < RTB_ITEMS.length - 1
                ? '0.75px solid rgba(255,255,255,0.10)' : 'none',
              paddingBottom: 24,
              marginBottom: 24,
              display: 'flex',
              gap: 16,
            }}
          >
            {/* Icon circle */}
            <div style={{
              width: 38, height: 38,
              borderRadius: '50%',
              border: '0.75px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, marginTop: 2,
            }}>
              <img
                src={RTB_ICONS[i]}
                alt=""
                width={18} height={18}
                style={{ display: 'block' }}
                onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
              />
            </div>

            {/* Text */}
            <div style={{ flex: 1 }}>
              {/* Watermark title */}
              <p style={{
                fontSize: 18, fontWeight: 800,
                color: 'rgba(255,255,255,0.14)',
                letterSpacing: '-0.2px', margin: '0 0 8px',
              }}>
                {item.title}
              </p>
              <p style={{
                fontSize: 12, color: 'rgba(255,255,255,0.48)',
                lineHeight: 1.65, margin: '0 0 8px',
              }}>
                {item.body}
              </p>
              <button style={{
                background: 'none', border: 'none',
                padding: 0, cursor: 'pointer',
                fontSize: 11, fontWeight: 700,
                color: '#bfff00',
                letterSpacing: '0.5px',
              }}>
                See how? ↓
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
