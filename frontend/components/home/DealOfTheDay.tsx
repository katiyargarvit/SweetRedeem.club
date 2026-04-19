'use client';

// ============================================================
// DealOfTheDay — Figma-matched carousel
// City photo · dark info panel · points pills · VS comparison card
// ============================================================

import { useState } from 'react';
import type { SweetSpotRow } from '@/lib/database.types';

// ── Figma CDN assets (valid 7 days — swap for your own CDN URLs) ──
// City background images
const CITY_IMGS = [
  'https://www.figma.com/api/mcp/asset/86d80ae8-cc5a-4b75-bb60-618ba7d5853d',   // NYC/Times Sq
  'https://www.figma.com/api/mcp/asset/6693bc7e-ab2b-4fc1-8137-c4175cbf94de',   // City 2
  'https://www.figma.com/api/mcp/asset/6ed79fb3-741c-4337-8ea0-0f59b26a6d62',   // City 3
  'https://www.figma.com/api/mcp/asset/c83b454e-6c85-46fa-af4f-21b45deb0df2',   // City 4
];

// Airline logos
const AIRLINE_LOGOS = [
  'https://www.figma.com/api/mcp/asset/26c03025-4494-40b5-83b0-84c602ed4f3d',   // Virgin Atlantic
  'https://www.figma.com/api/mcp/asset/1538acae-9a4c-47db-8d2c-c7fe07992c13',   // Qatar Airways
  'https://www.figma.com/api/mcp/asset/145b8370-0ce2-43fb-a2cd-a3b594372e98',   // ANA
  'https://www.figma.com/api/mcp/asset/4da7a9a0-bed5-439e-9189-c6583396d1dd',   // Emirates
];

// Bank / transfer partner logos
const BANK_LOGOS = [
  'https://www.figma.com/api/mcp/asset/28c39c38-f9cf-4672-bf32-12a3393f635f',
  'https://www.figma.com/api/mcp/asset/29f859ce-9ab8-40f0-b0f8-428427d875fd',
  'https://www.figma.com/api/mcp/asset/f4301f0a-7686-417e-814b-83b6d29733fd',
  'https://www.figma.com/api/mcp/asset/de333933-e7c6-49ce-b76b-ad96bd9d3107',
];

// Arrow icon
const ARROW_ICON = 'https://www.figma.com/api/mcp/asset/79e15657-bb19-4f79-93a4-85377bd4b810';

// ── Slide data ────────────────────────────────────────────────
const SLIDES = [
  {
    ptsLabel: '29000 pts',
    sweetredeem: '29,000',
    retailPrice: '₹3,60,800',
    airline: 'VIRGIN ATLANTIC',
    airlineSub: 'flying club',
    origin: 'New Delhi',
    dest: 'London',
    cabin: 'Upper Class',
  },
  {
    ptsLabel: '72500 pts',
    sweetredeem: '72,500',
    retailPrice: '₹14,64,800',
    airline: 'QATAR AIRWAYS',
    airlineSub: 'privilege club',
    origin: 'Mumbai',
    dest: 'New York',
    cabin: 'QSuites',
  },
  {
    ptsLabel: '75000 pts',
    sweetredeem: '75,000',
    retailPrice: '₹6,15,500',
    airline: 'ANA',
    airlineSub: 'mileage club',
    origin: 'Delhi',
    dest: 'Tokyo',
    cabin: 'The Room',
  },
  {
    ptsLabel: '102000 pts',
    sweetredeem: '1,02,000',
    retailPrice: '₹11,95,200',
    airline: 'EMIRATES',
    airlineSub: 'skywards',
    origin: 'Bangalore',
    dest: 'SFO',
    cabin: 'First Class',
  },
];

interface Props {
  spots: SweetSpotRow[];
}

export default function DealOfTheDay({ spots: _spots }: Props) {
  const [active, setActive] = useState(1); // default slide 2 (Qatar) as per Figma
  const slide = SLIDES[active];

  return (
    <div style={{ marginTop: 28 }}>

      {/* ── Card ────────────────────────────────────────────── */}
      <div style={{ padding: '0 16px' }}>
        <div style={{
          borderRadius: 28,
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
          border: '0.75px solid #f1f5f9',
        }}>

          {/* City photo */}
          <div style={{ height: 210, overflow: 'hidden', position: 'relative' }}>
            <img
              src={CITY_IMGS[active]}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
                // Gradient fallback background while image loads
              }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
                (e.currentTarget.parentElement as HTMLElement).style.background =
                  ['linear-gradient(160deg,#1c1c1c,#374151)',
                   'linear-gradient(160deg,#1a1a2e,#16213e,#533483)',
                   'linear-gradient(160deg,#0f2027,#203a43,#2c5364)',
                   'linear-gradient(160deg,#360033,#0b8793)'][active];
              }}
            />
          </div>

          {/* ── Dark info panel ─────────────────────────────── */}
          <div style={{ background: '#111', padding: '20px 20px 0' }}>

            {/* Heading */}
            <h2 style={{
              fontSize: 26, fontWeight: 800, color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: '-0.26px',
              lineHeight: 1.25,
              margin: '0 0 8px',
            }}>
              Exceptional Value,<br />Right Now
            </h2>

            <p style={{
              fontSize: 11, color: '#90a1b9',
              margin: '0 0 16px',
            }}>
              Hand-picked premium sweetspots updated daily!
            </p>

            {/* Points selector pills */}
            <div style={{
              display: 'flex', gap: 6,
              overflowX: 'auto', paddingBottom: 4,
              marginBottom: 16,
              // hide scrollbar
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}>
              {SLIDES.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 14,
                    border: 'none',
                    background: active === i ? '#2d2d2d' : 'transparent',
                    color: active === i ? '#fff' : '#62748e',
                    fontSize: 13, fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'all 0.15s',
                  }}
                >
                  {s.ptsLabel}
                </button>
              ))}
            </div>

            {/* ── White comparison card ────────────────────── */}
            <div style={{
              background: '#fff',
              borderRadius: 16,
              padding: '16px',
              marginBottom: 0,
            }}>

              {/* SweetRedeem pts ← VS → Retail Price */}
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}>
                {/* Left: SweetRedeem */}
                <div>
                  <p style={{
                    fontSize: 9, fontWeight: 700, color: '#90a1b9',
                    letterSpacing: '0.9px', textTransform: 'uppercase',
                    margin: '0 0 4px',
                  }}>Sweetredeem</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{
                      fontSize: 26, fontWeight: 800, color: '#0f172b',
                      letterSpacing: '-0.5px',
                    }}>{slide.sweetredeem}</span>
                    <span style={{ fontSize: 13, color: '#90a1b9' }}>pts</span>
                  </div>
                </div>

                {/* VS badge */}
                <div style={{
                  width: 36, height: 36, borderRadius: 9999,
                  background: '#0f172b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#fff' }}>VS</span>
                </div>

                {/* Right: Retail Price (strikethrough) */}
                <div style={{ textAlign: 'right' }}>
                  <p style={{
                    fontSize: 9, fontWeight: 700, color: '#90a1b9',
                    letterSpacing: '0.9px', textTransform: 'uppercase',
                    margin: '0 0 4px',
                  }}>Retail Price</p>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <span style={{
                      fontSize: 22, fontWeight: 800, color: '#0f172b',
                      letterSpacing: '-0.5px', display: 'block',
                    }}>{slide.retailPrice}</span>
                    <div style={{
                      position: 'absolute', left: 0, right: 0,
                      top: '48%',
                      height: 2, background: '#ff2e93',
                    }} />
                  </div>
                </div>
              </div>

              <div style={{ height: 1, background: '#f1f5f9', margin: '0 0 12px' }} />

              {/* Transfer path: Bank → Airline */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                {/* Bank */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, overflow: 'hidden',
                    background: '#f1f5f9', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <img
                      src={BANK_LOGOS[active]}
                      alt="Bank"
                      style={{ width: 32, height: 32, objectFit: 'contain' }}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#314158', lineHeight: 1.2, margin: 0 }}>Membership</p>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#314158', lineHeight: 1.2, margin: 0 }}>Rewards</p>
                  </div>
                </div>

                {/* Arrow */}
                <div style={{ width: 16, height: 16, flexShrink: 0 }}>
                  <img
                    src={ARROW_ICON}
                    alt="→"
                    style={{ width: 16, height: 16 }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).outerHTML =
                        '<span style="font-size:14px;color:#90a1b9">→</span>';
                    }}
                  />
                </div>

                {/* Airline */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, overflow: 'hidden',
                    background: '#f1f5f9', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <img
                      src={AIRLINE_LOGOS[active]}
                      alt={slide.airline}
                      style={{ width: 32, height: 32, objectFit: 'contain' }}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div>
                    <p style={{
                      fontSize: 12, fontWeight: 700, color: '#314158',
                      textTransform: 'uppercase', lineHeight: 1.2, margin: 0,
                    }}>{slide.airline}</p>
                    <p style={{ fontSize: 11, color: '#90a1b9', lineHeight: 1.2, margin: 0 }}>{slide.airlineSub}</p>
                  </div>
                </div>
              </div>

              {/* Route + cabin */}
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#314158' }}>{slide.origin}</span>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>✈</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#314158' }}>{slide.dest}</span>
                </div>
                <span style={{ fontSize: 11, color: '#90a1b9' }}>{slide.cabin}</span>
              </div>
            </div>
          </div>

          {/* ── Navigation dots + counter ────────────────────── */}
          <div style={{
            background: '#111',
            padding: '12px 20px 16px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            {/* Dots */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  style={{
                    width: i === active ? 28 : 8,
                    height: 8,
                    borderRadius: 100,
                    background: i === active ? '#e55a2b' : '#cbd5e1',
                    border: 'none', cursor: 'pointer', padding: 0,
                    transition: 'width 0.2s ease',
                  }}
                />
              ))}
            </div>

            {/* Slide counter button */}
            <button
              onClick={() => setActive((active + 1) % SLIDES.length)}
              style={{
                width: 40, height: 40, borderRadius: 9999,
                background: '#111',
                border: '2px solid #333',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>
                {active + 1}
              </span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
