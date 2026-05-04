// ============================================================
// SiteFooter — dark footer with links and social icons
// Figma Make design (03-May)
// ============================================================

import Link from 'next/link';

const NAVY = '#0B1120';

const PLATFORM_LINKS = [
  { label: 'Top Deals',        href: '/discover'   },
  { label: 'Sweet-spots',      href: '/sweet-spots' },
  { label: 'Destinations',     href: '/discover'   },
  { label: 'Points Calculator', href: '/calculator' },
  { label: 'Credit Cards',     href: '/cards'      },
];

const COMPANY_LINKS = [
  { label: 'About Us',       href: '#'       },
  { label: 'Blog',           href: '#'       },
  { label: 'Contact Us',     href: 'mailto:hello@sweetredeem.club' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Use',   href: '/terms'  },
];

export default function SiteFooter() {
  return (
    <footer style={{ background: NAVY, padding: '40px 24px 32px' }}>
      {/* Brand */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ marginBottom: 8 }}>
          <span style={{
            fontSize:      22,
            fontWeight:    800,
            color:         '#fff',
            letterSpacing: '-0.03em',
          }}>
            SweetRedeem
          </span>
          <span style={{
            fontSize:      17,
            fontWeight:    400,
            color:         '#60a5fa',
            fontFamily:    "Georgia, serif",
            fontStyle:     'italic',
          }}>
            .club
          </span>
        </div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.55, margin: 0 }}>
          India&apos;s premium points optimizer.<br />Fly at the front, for less.
        </p>
      </div>

      {/* Links grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 40 }}>
        <div>
          <p style={{
            fontSize:      10,
            fontWeight:    700,
            color:         'rgba(255,255,255,0.6)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            margin:        '0 0 16px',
          }}>
            Platform
          </p>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {PLATFORM_LINKS.map((l) => (
              <li key={l.label} style={{ marginBottom: 12 }}>
                <Link href={l.href} style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', textDecoration: 'none' }}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p style={{
            fontSize:      10,
            fontWeight:    700,
            color:         'rgba(255,255,255,0.6)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            margin:        '0 0 16px',
          }}>
            Company
          </p>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {COMPANY_LINKS.map((l) => (
              <li key={l.label} style={{ marginBottom: 12 }}>
                <Link href={l.href} style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', textDecoration: 'none' }}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', marginBottom: 24 }} />

      {/* Social icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        {/* X / Twitter */}
        <a href="#" style={socialBtn}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
        {/* Instagram */}
        <a href="#" style={socialBtn}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.5" fill="rgba(255,255,255,0.7)" />
          </svg>
        </a>
        {/* LinkedIn */}
        <a href="#" style={socialBtn}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
            <circle cx="4" cy="4" r="2" />
          </svg>
        </a>
        {/* YouTube */}
        <a href="#" style={socialBtn}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)">
            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
            <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill={NAVY} />
          </svg>
        </a>
      </div>

      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6, margin: 0 }}>
        © 2026 SweetRedeem Club · India<br />
        Not affiliated with any bank or airline.
      </p>
    </footer>
  );
}

const socialBtn: React.CSSProperties = {
  width:          36,
  height:         36,
  borderRadius:   9999,
  border:         '1px solid rgba(255,255,255,0.2)',
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'center',
  textDecoration: 'none',
  flexShrink:     0,
};
