'use client';

// ============================================================
// BottomNav — mobile fixed navigation with active highlighting.
// Uses usePathname() so the active tab auto-updates on route change.
// ============================================================

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/',           icon: '🏠', label: 'Home'      },
  { href: '/discover',   icon: '🔍', label: 'Discover'  },
  { href: '/calculator', icon: '⚡', label: 'Calculate' },
  { href: '/cards',      icon: '💳', label: 'Cards'     },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      zIndex: 50,
      background: 'rgba(249,246,240,0.95)',
      backdropFilter: 'blur(14px)',
      borderTop: '1px solid #EAEAEA',
      display: 'flex',
      height: 68,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {NAV_ITEMS.map((item) => {
        const isActive = item.href === '/'
          ? pathname === '/'
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              textDecoration: 'none',
              paddingTop: 8,
              borderTop: isActive ? '2px solid #C5A059' : '2px solid transparent',
              transition: 'border-color 0.15s',
            }}
          >
            <span style={{
              fontSize: 20,
              opacity: isActive ? 1 : 0.45,
              transition: 'opacity 0.15s',
            }}>
              {item.icon}
            </span>
            <span style={{
              fontSize: 10, fontWeight: isActive ? 800 : 600,
              color: isActive ? '#C5A059' : '#999',
              letterSpacing: '-0.01em',
              transition: 'color 0.15s',
            }}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
