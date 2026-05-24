"use client"
const aiActArticles = [
  { code: 'Art. 9',  title: 'Risk management system' },
  { code: 'Art. 10', title: 'Data governance' },
  { code: 'Art. 11', title: 'Technical documentation' },
  { code: 'Art. 13', title: 'Transparency to users' },
  { code: 'Art. 14', title: 'Human oversight' },
  { code: 'Art. 26', title: 'Deployer obligations' },
]
const gdprArticles = [
  { code: 'Art. 5',    title: 'Lawfulness, minimisation' },
  { code: 'Art. 22',   title: 'Automated decision-making' },
  { code: 'Art. 30',   title: 'Records of processing' },
  { code: 'Art. 32',   title: 'Security of processing' },
  { code: 'Art. 35',   title: 'Data protection impact assessment' },
  { code: 'DPC',       title: '72-hour breach notification' },
]

function Column({ label, title, rows, blue }: { label: string; title: string; rows: { code: string; title: string }[]; blue?: boolean }) {
  return (
    <div className="card p-8 lg:p-10" style={{ borderColor: blue ? '#c8ddf2' : '#c8ddf2' }}>
      <div className="flex items-center gap-3 mb-7">
        <span className="pill" style={{ background: blue ? 'rgba(37,99,176,0.08)' : 'rgba(92,158,138,0.08)', borderColor: blue ? 'rgba(37,99,176,0.2)' : 'rgba(92,158,138,0.2)', color: blue ? '#2563b0' : '#5c9e8a' }}>
          {label}
        </span>
        <span className="display-serif text-ink" style={{ fontSize: 20, fontWeight: 500 }}>{title}</span>
      </div>
      <div className="space-y-px rounded-2xl overflow-hidden" style={{ background: '#c8ddf2', border: '1px solid #c8ddf2' }}>
        {rows.map(a => (
          <div key={a.code} className="flex items-center gap-5 px-5 py-3.5 transition" style={{ background: '#fff' }}
            onMouseOver={e => (e.currentTarget.style.background = '#f4f8fd')}
            onMouseOut={e => (e.currentTarget.style.background = '#fff')}>
            <span className="font-mono text-[11px] min-w-[78px]" style={{ color: blue ? '#2563b0' : '#5c9e8a' }}>{a.code}</span>
            <span className="text-sm font-light" style={{ color: '#2a4a72' }}>{a.title}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ComplianceMap() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <Column label="EU AI Act" title="High-risk obligations" rows={aiActArticles} blue />
      <Column label="GDPR Ireland" title="Data protection layer" rows={gdprArticles} />
    </div>
  )
}
