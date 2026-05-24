import type { Obligation } from '@/lib/demo-data'

export function ObligationsList({ obligations }: { obligations: Obligation[] }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#0d1a30', border: '1px solid rgba(30,51,88,0.8)' }}>
      <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(30,51,88,0.8)' }}>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: '#2a4470' }}>Tracker</div>
          <div className="display-serif" style={{ fontSize: '1.2rem', fontWeight: 500, color: '#dceeff' }}>Open obligations</div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[11px] font-medium"
          style={{ background: 'rgba(74,144,217,0.12)', color: '#4a90d9', border: '1px solid rgba(74,144,217,0.2)' }}>
          {obligations.length}
        </span>
      </div>
      <ul>
        {obligations.map((o, i) => {
          const isEU = o.framework === 'EU AI Act'
          return (
            <li key={o.id} className="px-6 py-4 transition" style={{ borderTop: i > 0 ? '1px solid rgba(30,51,88,0.4)' : undefined }}>
              <div className="flex items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono flex-shrink-0"
                    style={{ background: isEU ? 'rgba(74,144,217,0.12)' : 'rgba(92,158,138,0.12)', color: isEU ? '#8bb8e8' : '#7fc4b0', border: `1px solid ${isEU ? 'rgba(74,144,217,0.2)' : 'rgba(92,158,138,0.2)'}` }}>
                    {o.article}
                  </span>
                  <span className="text-sm truncate" style={{ color: '#dceeff' }}>{o.name}</span>
                </div>
                <span className="text-xs tabular flex-shrink-0" style={{ color: '#5a7fa8' }}>{o.pct}%</span>
              </div>
              <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(30,51,88,0.8)' }}>
                <div className="h-full rounded-full" style={{ width: `${o.pct}%`, background: isEU ? '#4a90d9' : '#5c9e8a', transition: 'width 1s cubic-bezier(0.2,0.7,0.2,1)' }} />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
