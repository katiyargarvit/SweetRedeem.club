'use client';

// ============================================================
// BottomNav -- floating pill nav, frosted glass, Figma Make design
// Auto-hides when scrolling down; reveals on scroll-up.
// ============================================================

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function IconHome({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
      strokeWidth={active ? 2.5 : 2}
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconCompass({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
      strokeWidth={active ? 2.5 : 2}
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

function IconLayers({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
      strokeWidth={active ? 2.5 : 2}
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function IconZap({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
      strokeWidth={active ? 2.5 : 2}
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: '/',           label: 'Home',      Icon: IconHome    },
  { href: '/discover',   label: 'Discover',  Icon: IconCompass },
  { href: '/cards',      label: 'Cards',     Icon: IconLayers  },
  { href: '/calculator', label: 'Calculate', Icon: IconZap     },
];

export default function BottomNav() {
  const pathname              = usePathname();
  const [hidden, setHidden]   = useState(true);
  const [visible, setVisible] = useState(false);
  const lastScrollY           = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      if (currentY > 80) setVisible(true);
      if (currentY > lastScrollY.current && currentY > 10) setHidden(true);
      else setHidden(false);
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    const t = setTimeout(() => {
      if (window.scrollY <= 10) { setVisible(true); setHidden(false); }
    }, 800);
    return () => { window.removeEventListener('scroll', onScroll); clearTimeout(t); };
  }, []);

  const shouldShow = visible && !hidden;

  return (
    <div style={{
      position:      'fixed',
      bottom:        24,
      left:          0,
      right:         0,
      zIndex:        50,
      display:       'flex',
      justifyContent: 'center',
      padding:       '0 16px',
      transform:     shouldShow ? 'translateY(0)' : 'translateY(150%)',
      opacity:       shouldShow ? 1 : 0,
      transition:    'transform 300ms ease-out, opacity 300ms ease-out',
      pointerEvents: shouldShow ? 'auto' : 'none',
    }}>
      <nav style={{
        position:       'relative',
        width:          '100%',
        maxWidth:       340,
        height:         64,
        borderRadius:   32,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-around',
        padding:        '0 8px',
        overflow:       'hidden',
        boxShadow:      '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
      }}>
        {/* Frosted glass background */}
        <div style={{
          position:             'absolute',
          inset:                0,
          background:           'rgba(255,255,255,0.75)',
          backdropFilter:       'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border:               '1px solid rgba(255,255,255,0.85)',
          borderRadius:         32,
          pointerEvents:        'none',
        }} />

        {NAV_ITEMS.map((item) => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href);
          const { Icon } = item;

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                position:       'relative',
                display:        'flex',
                flexDirection:  'column',
                alignItems:     'center',
                justifyContent: 'center',
                width:          56,
                height:         48,
                textDecoration: 'none',
                zIndex:         1,
                borderRadius:   9999,
              }}
            >
              {isActive && (
                <div style={{
                  position:     'absolute',
                  inset:        0,
                  borderRadius: 9999,
                  background:   'rgba(15,23,42,0.08)',
                }} />
              )}
              <span style={{
                color:      isActive ? '#0f172a' : '#94a3b8',
                transition: 'color 0.15s',
                position:   'relative',
                zIndex:     1,
              }}>
                <Icon active={isActive} />
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
