export function ScoreRing({ pct }: { pct: number }) {
  const color = pct >= 75 ? '#5c9e8a' : pct >= 50 ? '#4a90d9' : '#d45a5a'
  return (
    <div className="rounded-2xl p-6 flex flex-col items-center justify-center"
      style={{ background: '#0d1a30', border: '1px solid rgba(30,51,88,0.8)' }}>
      <div className="font-mono text-[10px] uppercase tracking-widest mb-4" style={{ color: '#2a4470' }}>Overall posture</div>
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(30,51,88,0.8)" strokeWidth="2.5"/>
          <circle cx="18" cy="18" r="15.9" fill="none" stroke={color} strokeWidth="2.5"
            strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(0.2,0.7,0.2,1)' }}/>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="display-serif tabular" style={{ fontSize: '1.8rem', fontWeight: 400, color: '#dceeff' }}>{pct}</span>
          <span className="text-[11px] font-mono" style={{ color: '#5a7fa8' }}>/100</span>
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className="text-xs font-light" style={{ color: '#5a7fa8' }}>
          {pct < 50 ? 'Action required — multiple obligations incomplete' : pct < 75 ? 'In progress — check Art. 14 oversight' : 'Good posture — maintain evidence updates'}
        </div>
      </div>
    </div>
  )
}
