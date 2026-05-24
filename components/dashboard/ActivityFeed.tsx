import type { Activity } from '@/lib/demo-data'

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  const dotColors: Record<string, string> = {
    'var(--bronze)': '#4a90d9',
    'var(--sage)': '#5c9e8a',
    'var(--warn)': '#e0a84a',
    'var(--bronze-deep)': '#2563b0',
  }
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#0d1a30', border: '1px solid rgba(30,51,88,0.8)' }}>
      <div className="px-6 py-5" style={{ borderBottom: '1px solid rgba(30,51,88,0.8)' }}>
        <div className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: '#2a4470' }}>Activity</div>
        <div className="display-serif" style={{ fontSize: '1.2rem', fontWeight: 500, color: '#dceeff' }}>Recent events</div>
      </div>
      <ul className="px-6 py-4 space-y-4">
        {activities.map((a, i) => (
          <li key={i} className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: dotColors[a.color] || '#4a90d9' }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-light leading-relaxed" style={{ color: '#9bbce0' }}>{a.text}</p>
              <p className="text-[11px] mt-0.5 font-mono" style={{ color: '#2a4470' }}>{a.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
