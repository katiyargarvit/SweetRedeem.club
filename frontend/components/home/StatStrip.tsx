// ============================================================
// StatStrip — Routes / Avg Uplift / Cards stat row
// ============================================================

export default function StatStrip() {
  const stats = [
    { val: '93',  lbl: 'Routes'     },
    { val: '3.2×', lbl: 'Avg Uplift' },
    { val: '14',  lbl: 'Cards'      },
  ];
  return (
    <div className="stat-strip">
      {stats.map((s, i) => (
        <div key={i} className="stat-cell">
          <div className="stat-val">{s.val}</div>
          <div className="stat-lbl">{s.lbl}</div>
        </div>
      ))}
    </div>
  );
}
