export function StatCards({ systemCount, overallScore, openObligations }: { systemCount: number; overallScore: number; openObligations: number }) {
  const days = Math.ceil((new Date('2026-08-02').getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const scoreColor = overallScore >= 75 ? '#5c9e8a' : overallScore >= 50 ? '#4a90d9' : '#d45a5a'
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { eyebrow: 'AI systems', value: String(systemCount || 0), sub: 'in your inventory', color: '#4a90d9' },
        { eyebrow: 'Compliance posture', value: `${overallScore}%`, sub: 'weighted average score', color: scoreColor },
        { eyebrow: 'Open obligations', value: String(openObligations), sub: 'below 100% coverage', color: openObligations > 0 ? '#e0a84a' : '#5c9e8a' },
        { eyebrow: 'EU AI Act deadline', value: `${days}d`, sub: '2 August 2026 · high-risk enforcement', color: days < 90 ? '#d45a5a' : '#e0a84a' },
      ].map(s => (
        <div key={s.eyebrow} className="rounded-2xl p-5 relative overflow-hidden"
          style={{ background: '#0d1a30', border: '1px solid rgba(30,51,88,0.8)' }}>
          <div className="font-mono text-[10px] uppercase tracking-widest mb-3" style={{ color: '#2a4470' }}>{s.eyebrow}</div>
          <div className="display-serif tabular leading-none mb-1" style={{ fontSize: '2rem', fontWeight: 400, color: s.color }}>{s.value}</div>
          <div className="text-[11px] font-light" style={{ color: '#5a7fa8' }}>{s.sub}</div>
        </div>
      ))}
    </div>
  )
}
