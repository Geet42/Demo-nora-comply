import { fetchAllObligations } from '@/lib/data'

export const dynamic = 'force-dynamic'

const frameworkTone: Record<string, { pill: string; bar: string }> = {
  'EU AI Act': { pill: 'bg-bronze/15 text-bronze-soft border-bronze/30', bar: 'var(--bronze)' },
  GDPR: { pill: 'bg-sage/15 text-[#B5BFA3] border-sage/30', bar: 'var(--sage)' },
}

export default async function ObligationsPage() {
  const obligations = await fetchAllObligations()

  const grouped = obligations.reduce((acc: any, o: any) => {
    const sysName = o.ai_systems?.name || 'Unknown'
    if (!acc[sysName]) acc[sysName] = []
    acc[sysName].push(o)
    return acc
  }, {})

  return (
    <div className="space-y-8 fade-in">
      <div>
        <span className="eyebrow">Regulation (EU) 2024/1689 + GDPR</span>
        <h2 className="display-serif text-cream mt-3 leading-tight" style={{ fontSize: '2.4rem', fontWeight: 400 }}>
          Obligations <span className="italic font-light text-bronze">in motion</span>
        </h2>
        <p className="text-sm text-cream2/70 max-w-2xl mt-3 font-light leading-relaxed">
          Every obligation is sourced from the official text of Regulation (EU) 2024/1689 (EU AI Act) and Regulation (EU) 2016/679 (GDPR). Hover any obligation to read the actual article text.
        </p>
      </div>

      {obligations.length === 0 ? (
        <div className="card !bg-coal2 !border-ash p-16 text-center text-sm text-cream2/70 font-light">
          Register an AI system to generate obligations automatically.
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([systemName, obs]: any) => {
            const avg = Math.round(obs.reduce((s: number, o: any) => s + o.pct, 0) / obs.length)
            return (
              <div key={systemName} className="card !bg-coal2 !border-ash overflow-hidden">
                <div className="px-6 py-5 border-b border-ash flex items-center justify-between">
                  <div>
                    <div className="display-serif text-cream" style={{ fontSize: '1.2rem', fontWeight: 500 }}>{systemName}</div>
                    <div className="text-xs text-cream2/50 mt-1">{obs.length} obligations</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="display-serif text-cream tabular" style={{ fontSize: '1.8rem', fontWeight: 400 }}>{avg}<span className="text-xs text-cream2/50 ml-0.5">/100</span></div>
                    </div>
                    <div className="w-16 h-16 relative">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--ash)" strokeWidth="2.5" />
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--bronze)" strokeWidth="2.5" strokeDasharray={`${avg} ${100 - avg}`} strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>
                </div>
                <ul className="divide-y divide-ash/60">
                  {obs.map((o: any) => {
                    const tone = frameworkTone[o.framework] || frameworkTone['EU AI Act']
                    return (
                      <li key={o.id} className="px-6 py-4 group hover:bg-coal3/60 transition">
                        <div className="flex items-center justify-between gap-4 mb-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono border flex-shrink-0 ${tone.pill}`}>
                              {o.article}
                            </span>
                            <span className="text-sm text-cream truncate">{o.article_title || o.article}</span>
                          </div>
                          <span className="text-xs text-cream2/70 tabular flex-shrink-0">{o.pct}%</span>
                        </div>
                        <div className="h-[3px] bg-ash rounded-full overflow-hidden mb-2">
                          <div className="h-full rounded-full transition-all" style={{ width: `${o.pct}%`, background: tone.bar }} />
                        </div>
                        {o.article_summary && (
                          <div className="max-h-0 overflow-hidden group-hover:max-h-24 transition-all duration-300">
                            <p className="text-[11px] text-cream2/50 font-light leading-relaxed pt-1">{o.article_summary}</p>
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
