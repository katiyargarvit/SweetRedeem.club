// ============================================================
// MilestoneTracker — 3-step progress: Earn Rewards →
// Unlock Sweet Deal → Sweet.Redeem.
// ============================================================

export default function MilestoneTracker() {
  return (
    <div style={{ padding: '24px 28px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        {/* Step 1 — Earn Rewards (done) */}
        <Step
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 9l3.5 3.5L14 6" stroke="#00C885" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
          label={"Earn\nRewards"}
          labelColor="#00C885"
          ringColor="#00C885"
          bgColor="rgba(0,200,133,0.08)"
        />

        {/* Connector 1→2 (half-filled) */}
        <div style={{ flex: 1, height: 2, background: '#EAEAEA', position: 'relative', top: -14, overflow: 'hidden' }}>
          <div style={{ width: '55%', height: '100%', background: '#00C885' }} />
        </div>

        {/* Step 2 — Unlock Sweet Deal (in-progress) */}
        <Step
          icon={
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M9 2l1.8 5.4H17l-4.9 3.5 1.8 5.5L9 13l-4.9 3.4 1.8-5.5L1 7.4h6.2z"
                fill="none" stroke="#C5A059" strokeWidth="1.5" strokeLinejoin="round"
              />
            </svg>
          }
          label={"Unlock\nSweet Deal"}
          labelColor="#C5A059"
          ringColor="#C5A059"
          bgColor="rgba(197,160,89,0.08)"
        />

        {/* Connector 2→3 (empty) */}
        <div style={{ flex: 1, height: 2, background: '#EAEAEA', position: 'relative', top: -14 }} />

        {/* Step 3 — Sweet.Redeem. (locked) */}
        <Step
          icon={
            <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
              <rect x="1" y="7" width="12" height="8" rx="2" fill="#F0EEE9" stroke="#C5A059" strokeWidth="1.5" />
              <path d="M4 7V5a3 3 0 016 0v2" stroke="#C5A059" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          }
          label={"Sweet.\nRedeem."}
          labelColor="#BBBBBB"
          ringColor="#EAEAEA"
          bgColor="#fff"
        />

      </div>
    </div>
  );
}

// ── Sub-component ─────────────────────────────────────────────
function Step({
  icon,
  label,
  labelColor,
  ringColor,
  bgColor,
}: {
  icon: React.ReactNode;
  label: string;
  labelColor: string;
  ringColor: string;
  bgColor: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
      <div style={{
        width: 44,
        height: 44,
        borderRadius: '50%',
        border: `2px solid ${ringColor}`,
        background: bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}>
        {icon}
      </div>
      <p style={{
        fontSize: 9,
        fontWeight: 700,
        color: labelColor,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        textAlign: 'center',
        whiteSpace: 'pre-line',
        lineHeight: 1.3,
      }}>
        {label}
      </p>
    </div>
  );
}
