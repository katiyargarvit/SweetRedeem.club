// ============================================================
// Terms of Service — placeholder
// Full legal copy to be added before public launch.
// ============================================================

import Link from 'next/link';

export const metadata = { title: 'Terms of Service — SweetRedeem.club' };

export default function TermsPage() {
  return (
    <div style={{ padding: '32px 24px', background: '#F9F6F0', minHeight: '100vh', maxWidth: 600, margin: '0 auto' }}>
      <Link href="/" style={{ fontSize: 12, fontWeight: 700, color: '#999', textDecoration: 'none', display: 'inline-block', marginBottom: 32 }}>
        ← Back
      </Link>

      <p style={{ fontSize: 10, fontWeight: 700, color: '#C5A059', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
        Legal
      </p>
      <h1 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 28, fontWeight: 700, color: '#000', lineHeight: 1.2, marginBottom: 16 }}>
        Terms of Service
      </h1>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #EAEAEA', padding: '20px 24px' }}>
        <p style={{ fontSize: 13, color: '#666', lineHeight: 1.7, marginBottom: 12 }}>
          <strong style={{ color: '#000' }}>Last updated:</strong> March 2026
        </p>
        <p style={{ fontSize: 13, color: '#666', lineHeight: 1.7, marginBottom: 12 }}>
          SweetRedeem.club is currently in private beta. Full terms of service will be published before the public launch.
        </p>
        <p style={{ fontSize: 13, color: '#666', lineHeight: 1.7, marginBottom: 12 }}>
          By using this service you agree that: all redemption values shown are estimates based on publicly available data,
          points transfers are irreversible and you should independently verify all values before transferring,
          and SweetRedeem.club is not affiliated with any bank, airline, or loyalty programme.
        </p>
        <p style={{ fontSize: 13, color: '#666', lineHeight: 1.7 }}>
          Questions? Email us at <a href="mailto:hello@sweetredeem.club" style={{ color: '#C5A059', textDecoration: 'none', fontWeight: 600 }}>hello@sweetredeem.club</a>
        </p>
      </div>
    </div>
  );
}
