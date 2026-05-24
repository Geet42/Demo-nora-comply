import { fetchCurrentRegulations, fetchActiveLawAlerts, fetchDocumentTemplates, fetchObligationsWithLawChanges } from '@/lib/data'
import { getUserCompanyId, isDemoMode } from '@/lib/auth'
import { LawClient } from './LawClient'

export const dynamic = 'force-dynamic'

export default async function LawPage() {
  const companyId = !isDemoMode() ? await getUserCompanyId() : undefined
  const [regulations, alerts, templates, changedObligations] = await Promise.all([
    fetchCurrentRegulations(),
    fetchActiveLawAlerts(companyId || undefined),
    fetchDocumentTemplates(),
    fetchObligationsWithLawChanges(),
  ])

  return (
    <div className="space-y-8 fade-in">
      <div>
        <span className="eyebrow">EUR-Lex · OJ L 2024/1689 · OJ L 2016/679</span>
        <h2 className="display-serif text-cream mt-3 leading-tight" style={{ fontSize: '2.4rem', fontWeight: 400 }}>
          Living <span className="italic font-light text-bronze">law</span>
        </h2>
        <p className="text-sm text-cream2/70 max-w-2xl mt-3 font-light leading-relaxed">
          All regulation text is stored in the database, versioned, and never deleted. When a law is amended, the old version is preserved so historical evidence remains valid. Nora checks EUR-Lex monthly for changes.
        </p>
      </div>

      {/* Architectural decision card */}
      <div className="card !bg-coal2 !border-ash p-6">
        <div className="flex items-start gap-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(127,139,111,0.15)', border: '1px solid rgba(127,139,111,0.3)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--sage)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <div className="text-sm text-cream font-medium mb-1">How law versioning works</div>
            <p className="text-xs text-cream2/60 font-light leading-relaxed max-w-3xl">
              Every obligation is pinned to the regulation version that existed when it was created. If Art. 14 is amended in 2027, obligations created in 2025 still reference the 2024 text — your 2025 evidence pack remains valid under the law that was in force. New systems registered after the amendment get the updated text. Nora checks EUR-Lex monthly using the CELEX SPARQL API and alerts you if a change is detected.
            </p>
          </div>
        </div>
      </div>

      <LawClient
        regulations={regulations}
        alerts={alerts}
        templates={templates}
        changedObligations={changedObligations as any[]}
        companyId={companyId || null}
      />
    </div>
  )
}
