// ============================================================
// RewardUnlocked — gold reward banner with progress bar
// ============================================================

export default function RewardUnlocked() {
  return (
    <div className="reward-banner">
      <div style={{
        fontSize: 28, width: 50, height: 50,
        background: 'rgba(255,255,255,0.5)',
        borderRadius: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        🏆
      </div>
      <div style={{ flex: 1 }}>
        <p className="label-tag" style={{ color: '#7A5C00' }}>Reward unlocked</p>
        <p style={{ fontSize: 14, fontWeight: 700, marginTop: 2, color: '#3A2800' }}>
          Level 1 achieved — claim now
        </p>
        <div className="progress-track" style={{ marginTop: 8, background: 'rgba(197,160,89,0.2)' }}>
          <div className="progress-fill" style={{ width: '68%', background: '#C5A059' }} />
        </div>
        <p style={{ fontSize: 11, color: '#8A6A00', marginTop: 4 }}>
          ₹32,000 more to unlock Level 2
        </p>
      </div>
      <span style={{ fontSize: 18, color: '#C5A059' }}>›</span>
    </div>
  );
}
