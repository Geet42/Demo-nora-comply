import type { Deadline } from '@/lib/data'

const urgencyStyle: Record<string, { bg: string; color: string }> = {
  Urgent:   { bg: 'rgba(212,90,90,0.15)',  color: '#d45a5a' },
  Soon:     { bg: 'rgba(224,168,74,0.15)', color: '#e0a84a' },
  Upcoming: { bg: 'rgba(74,144,217,0.12)', color: '#4a90d9' },
}

export function DeadlineList({ deadlines }: { deadlines: Deadline[] }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#0d1a30', border: '1px solid rgba(30,51,88,0.8)' }}>
      <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(30,51,88,0.8)' }}>
        <div className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: '#2a4470' }}>Deadlines</div>
        <div className="display-serif" style={{ fontSize: '1.2rem', fontWeight: 500, color: '#dceeff' }}>Upcoming</div>
      </div>
      <ul>
        {deadlines.map((d, i) => {
          const s = urgencyStyle[d.urgency] || urgencyStyle.Upcoming
          return (
            <li key={i} className="px-6 py-4 flex items-start gap-4" style={{ borderTop: i > 0 ? '1px solid rgba(30,51,88,0.4)' : undefined }}>
              <div className="text-center min-w-[40px]">
                <div className="font-mono text-[10px] uppercase tracking-wider" style={{ color: '#5a7fa8' }}>{d.month}</div>
                <div className="display-serif tabular" style={{ fontSize: '1.6rem', fontWeight: 400, color: '#dceeff' }}>{d.day}</div>
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                    style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}40` }}>
                    {d.urgency}
                  </span>
                </div>
                <div className="text-sm font-medium" style={{ color: '#dceeff' }}>{d.name}</div>
                <div className="text-[11px] font-light mt-0.5" style={{ color: '#5a7fa8' }}>{d.desc}</div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
