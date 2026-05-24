import { fetchSystems, fetchHumanDecisions } from '@/lib/data'
import { HumanOversightClient } from './HumanOversightClient'

export const dynamic = 'force-dynamic'

export default async function OversightPage() {
  const [systems, decisions] = await Promise.all([
    fetchSystems(),
    fetchHumanDecisions(),
  ])

  const highRiskSystems = systems.filter(s => s.risk === 'High')
  const overrideCount = decisions.filter((d: any) => d.did_override).length
  const overrideRate = decisions.length > 0 ? Math.round((overrideCount / decisions.length) * 100) : 0

  return (
    <div className="space-y-8 fade-in">
      <div>
        <span className="eyebrow">Regulation (EU) 2024/1689</span>
        <h2 className="display-serif text-cream mt-3 leading-tight" style={{ fontSize: '2.4rem', fontWeight: 400 }}>
          Human <span className="italic font-light text-bronze">oversight</span>
        </h2>
        <p className="text-sm text-cream2/70 max-w-2xl mt-3 font-light leading-relaxed">
          Article 14 requires that deployers of high-risk AI systems assign human oversight to persons with the competence and authority to intervene. Every decision log here is tamper-evident evidence of compliance.
        </p>
      </div>

      {/* Art. 14 explanation card */}
      <div className="card !bg-coal2 !border-ash p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(184,115,82,0.15)', border: '1px solid rgba(184,115,82,0.3)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--bronze)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18M3 12h18M3 18h18"/>
            </svg>
          </div>
          <div>
            <div className="font-mono text-[11px] text-bronze mb-1 uppercase tracking-wider">Art. 14 · EU AI Act · Reg. (EU) 2024/1689</div>
            <div className="text-sm text-cream font-medium mb-2">Human oversight — what the law requires</div>
            <p className="text-xs text-cream2/70 font-light leading-relaxed max-w-3xl">
              Deployers must assign oversight to natural persons with the necessary competence, training and authority. Humans must be able to understand AI outputs, monitor operation, and retain the ability to override or refuse AI decisions. Override decisions and their reasons must be logged.
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Oversight logs', value: decisions.length, sub: 'total recorded' },
          { label: 'Override rate', value: `${overrideRate}%`, sub: 'AI decisions overridden by humans', highlight: overrideRate > 0 },
          { label: 'High-risk systems', value: highRiskSystems.length, sub: 'requiring Art. 14 compliance' },
          { label: 'Enforcement date', value: '2 Aug', sub: '2026 — EU AI Act goes live' },
        ].map(stat => (
          <div key={stat.label} className="card !bg-coal2 !border-ash p-5">
            <div className="eyebrow !text-cream2/50 mb-2">{stat.label}</div>
            <div className="display-serif text-cream" style={{ fontSize: '2rem', fontWeight: 400, color: stat.highlight ? 'var(--sage)' : undefined }}>
              {stat.value}
            </div>
            <div className="text-[11px] text-cream2/50 mt-1">{stat.sub}</div>
          </div>
        ))}
      </div>

      <HumanOversightClient systems={highRiskSystems} decisions={decisions} />
    </div>
  )
}
