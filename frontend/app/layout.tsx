import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import Header from '@/components/ui/Header';
import BottomNav from '@/components/ui/BottomNav';
import './globals.css';
// Caveat: script/handwriting font used in CuratedDeals "handpicked by the club" subtitle
import { Caveat } from 'next/font/google';

const caveat = Caveat({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-caveat' });

// ── Metadata ────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: 'SweetRedeem.club — Unlock the True Value of Your Points',
    template: '%s | SweetRedeem.club',
  },
  description:
    'Your HDFC Infinia, Axis Atlas, and Amex points are worth 2–4× more than your bank admits. Find the best redemption sweet spots — free.',
  keywords: [
    'credit card points India',
    'HDFC Infinia redemption',
    'Axis Atlas sweet spots',
    'KrisFlyer transfer',
    'reward points maximizer India',
    'best credit card redemption 2026',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    title: 'SweetRedeem.club',
    description: 'Unlock the true value of your reward points. Instantly.',
    siteName: 'SweetRedeem.club',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SweetRedeem.club',
    description: 'Unlock the true value of your reward points. Instantly.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,   // prevent iOS zoom on input focus
  themeColor: '#FFFFFF',
};

// ── Layout ──────────────────────────────────────────────────
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={caveat.variable}>
      <body style={{ background: '#FFFFFF', minHeight: '100vh' }}>

        {/* ── Top header (client component — auth-aware) ────── */}
        <Header />

        {/* ── Page content ─────────────────────────────────── */}
        <main style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 100 }}>
          {children}
        </main>

        {/* ── Mobile bottom nav (client component — auto-highlights active tab) */}
        <BottomNav />

        {/* ── Vercel Analytics ──────────────────────────────── */}
        <Analytics />

      </body>
    </html>
  );
}
