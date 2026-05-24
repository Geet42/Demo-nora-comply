'use client'

import { useState } from 'react'
import type { Regulation, LawAlert, DocumentTemplate } from '@/lib/data'

type Tab = 'alerts' | 'regulations' | 'templates' | 'obligations'

export function LawClient({ regulations, alerts, templates, changedObligations, companyId }: {
  regulations: Regulation[]
  alerts: LawAlert[]
  templates: DocumentTemplate[]
  changedObligations: any[]
  companyId: string | null
}) {
  const [tab, setTab] = useState<Tab>(alerts.length > 0 ? 'alerts' : 'regulations')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  const euAct = regulations.filter(r => r.framework === 'EU AI Act')
  const gdpr = regulations.filter(r => r.framework === 'GDPR')

  const ALERT_COLORS = {
    amendment: { bg: 'rgba(181,96,78,0.10)', border: 'rgba(181,96,78,0.25)', text: 'var(--danger)', label: 'Amendment' },
    new_guidance: { bg: 'rgba(199,155,94,0.10)', border: 'rgba(199,155,94,0.25)', text: 'var(--warn)', label: 'New guidance' },
    enforcement_change: { bg: 'rgba(181,96,78,0.10)', border: 'rgba(181,96,78,0.25)', text: 'var(--danger)', label: 'Enforcement change' },
    review_due: { bg: 'rgba(127,139,111,0.10)', border: 'rgba(127,139,111,0.25)', text: 'var(--sage)', label: 'Review due' },
  }

  const TEMPLATE_ICONS: Record<string, string> = {
    human_oversight_procedure: 'Art. 14',
    risk_assessment: 'Art. 9',
    dpia: 'Art. 35',
    candidate_notice: 'Art. 22',
    records_of_processing: 'Art. 30',
    technical_documentation: 'Art. 11',
    security_policy: 'Art. 32',
  }

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'alerts', label: 'Law alerts', count: alerts.length },
    { id: 'regulations', label: 'Current law text' },
    { id: 'templates', label: 'Document templates', count: templates.length },
    { id: 'obligations', label: 'Changed obligations', count: changedObligations.length },
  ]

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium transition border ${tab === t.id ? 'bg-bronze/15 text-bronze-soft border-bronze/30' : 'bg-coal2 text-cream2/70 border-ash hover:border-ash2 hover:text-cream'}`}>
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px]" style={{ background: tab === t.id ? 'var(--bronze)' : 'var(--ash2)', color: tab === t.id ? 'var(--coal)' : 'var(--cream2)' }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ALERTS TAB */}
      {tab === 'alerts' && (
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="card !bg-coal2 !border-ash p-12 text-center">
              <div className="display-serif text-cream mb-2" style={{ fontSize: '1.4rem', fontWeight: 400 }}>No active alerts</div>
              <p className="text-sm text-cream2/60 font-light">Nora checks EUR-Lex monthly. You will be notified here and by email if a change is detected.</p>
            </div>
          ) : alerts.map(alert => {
            const style = ALERT_COLORS[alert.alertType] || ALERT_COLORS.new_guidance
            return (
              <div key={alert.id} className="card !bg-coal2 !border-ash p-5" style={{ borderLeft: `3px solid ${style.text}` }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: style.bg, border: `1px solid ${style.border}`, color: style.text }}>{style.label}</span>
                      <span className="text-[10px] text-cream2/50 font-mono">{alert.framework}</span>
                      {!alert.reviewedByNora && <span className="text-[10px] text-warn font-mono">Pending Nora review</span>}
                    </div>
                    <div className="text-sm text-cream font-medium mb-1">{alert.title}</div>
                    <p className="text-xs text-cream2/60 font-light leading-relaxed">{alert.description}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-[11px] text-cream2/50">{new Date(alert.detectedAt).toLocaleDateString('en-IE', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      {alert.sourceUrl && (
                        <a href={alert.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-bronze hover:text-bronze-soft transition flex items-center gap-1">
                          View on EUR-Lex
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* REGULATIONS TAB */}
      {tab === 'regulations' && (
        <div className="space-y-6">
          {/* Filter */}
          <div className="flex gap-2">
            {['all', 'EU AI Act', 'GDPR'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-[12px] transition border ${filter === f ? 'bg-coal3 text-cream border-ash2' : 'bg-coal2 text-cream2/60 border-ash hover:text-cream'}`}>
                {f === 'all' ? 'All frameworks' : f}
              </button>
            ))}
          </div>

          {(filter === 'all' || filter === 'EU AI Act') && (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="eyebrow !text-bronze">EU AI Act</span>
                <span className="text-[11px] text-cream2/50">Regulation (EU) 2024/1689 · OJ L 2024/1689, 12 July 2024</span>
              </div>
              <RegulationList regs={euAct} expanded={expanded} setExpanded={setExpanded} />
            </div>
          )}
          {(filter === 'all' || filter === 'GDPR') && (
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="eyebrow !text-sage">GDPR</span>
                <span className="text-[11px] text-cream2/50">Regulation (EU) 2016/679 · OJ L 2016/679, 4 May 2016</span>
              </div>
              <RegulationList regs={gdpr} expanded={expanded} setExpanded={setExpanded} />
            </div>
          )}
        </div>
      )}

      {/* TEMPLATES TAB */}
      {tab === 'templates' && (
        <div className="space-y-3">
          <div className="card !bg-coal2 !border-ash p-5">
            <p className="text-xs text-cream2/60 font-light leading-relaxed">
              These are the documents regulators and auditors will ask for. Each is required by a specific article of the EU AI Act or GDPR. Guidance notes explain what each document must contain and common mistakes.
            </p>
          </div>
          {templates.map(t => (
            <div key={t.id} className="card !bg-coal2 !border-ash overflow-hidden">
              <button className="w-full px-6 py-4 text-left flex items-center gap-4 hover:bg-coal3/40 transition" onClick={() => setExpanded(expanded === t.id ? null : t.id)}>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded flex-shrink-0" style={{ background: 'rgba(184,115,82,0.12)', border: '1px solid rgba(184,115,82,0.25)', color: 'var(--bronze-soft)' }}>
                  {TEMPLATE_ICONS[t.templateType] || t.article}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-cream font-medium">{t.name}</div>
                  <div className="text-[11px] text-cream2/50 mt-0.5">{t.framework} · {t.article} · {t.appliesToRisk.join(', ')} risk</div>
                </div>
                <span className="text-xs text-cream2/50 flex-shrink-0">{t.isMandatory ? 'Mandatory' : 'Recommended'}</span>
                <svg className={`w-4 h-4 text-cream2/50 transition-transform flex-shrink-0 ${expanded === t.id ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>
              </button>
              {expanded === t.id && (
                <div className="px-6 pb-5 border-t border-ash/60">
                  <p className="text-xs text-cream2/70 font-light leading-relaxed mt-4 mb-3">{t.description}</p>
                  {t.guidanceNotes && (
                    <div className="bg-coal3 rounded-xl p-4">
                      <div className="text-[10px] font-mono text-bronze mb-2 uppercase tracking-wider">Guidance notes</div>
                      <p className="text-xs text-cream2/70 font-light leading-relaxed">{t.guidanceNotes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* CHANGED OBLIGATIONS TAB */}
      {tab === 'obligations' && (
        <div className="space-y-3">
          {changedObligations.length === 0 ? (
            <div className="card !bg-coal2 !border-ash p-12 text-center">
              <div className="display-serif text-cream mb-2" style={{ fontSize: '1.4rem', fontWeight: 400 }}>All obligations are current</div>
              <p className="text-sm text-cream2/60 font-light">No obligations have been flagged as affected by law changes.</p>
            </div>
          ) : (
            <>
              <div className="card !bg-coal2 !border-ash p-5">
                <p className="text-xs text-cream2/60 font-light leading-relaxed">
                  These obligations were created under a previous version of the law. Review them to confirm your evidence still satisfies the updated requirements. Your existing evidence remains valid — it was submitted under the law in force at the time.
                </p>
              </div>
              {changedObligations.map((o: any) => (
                <div key={o.id} className="card !bg-coal2 !border-ash p-5" style={{ borderLeft: '3px solid var(--warn)' }}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: 'rgba(199,155,94,0.10)', border: '1px solid rgba(199,155,94,0.25)', color: 'var(--warn)' }}>Law changed</span>
                        <span className="text-[10px] font-mono text-bronze-soft">{o.article}</span>
                      </div>
                      <div className="text-sm text-cream font-medium">{o.article_title}</div>
                      <div className="text-[11px] text-cream2/50 mt-0.5">{(o.ai_systems as any)?.name} · {o.framework}</div>
                    </div>
                    <button className="text-[11px] px-3 py-1.5 rounded-full border border-ash hover:border-bronze text-cream2/60 hover:text-bronze-soft transition flex-shrink-0">
                      Mark reviewed
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function RegulationList({ regs, expanded, setExpanded }: { regs: Regulation[]; expanded: string | null; setExpanded: (id: string | null) => void }) {
  return (
    <div className="card !bg-coal2 !border-ash overflow-hidden">
      {regs.length === 0 ? (
        <div className="p-8 text-center text-sm text-cream2/60 font-light">No regulations loaded. Run the schema SQL to seed the regulations table.</div>
      ) : (
        <div className="divide-y divide-ash/60">
          {regs.map(r => (
            <div key={r.id}>
              <button className="w-full px-6 py-4 text-left flex items-center gap-4 hover:bg-coal3/40 transition" onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
                <span className="font-mono text-[11px] text-bronze-soft min-w-[60px]">{r.article}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-cream">{r.title}</div>
                  <div className="text-[11px] text-cream2/50 mt-0.5">{r.frameworkVersion}{r.enforcementDate ? ` · Enforcement: ${new Date(r.enforcementDate).toLocaleDateString('en-IE', { day: '2-digit', month: 'short', year: 'numeric' })}` : ''}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {r.isCurrent ? (
                    <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(127,139,111,0.15)', color: 'var(--sage)' }}>Current</span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded" style={{ background: 'rgba(199,155,94,0.10)', color: 'var(--warn)' }}>Superseded</span>
                  )}
                  <svg className={`w-4 h-4 text-cream2/50 transition-transform ${expanded === r.id ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>
                </div>
              </button>
              {expanded === r.id && (
                <div className="px-6 pb-5 bg-coal3/30 border-t border-ash/40">
                  <div className="mt-4 mb-3">
                    <div className="text-[10px] font-mono text-bronze uppercase tracking-wider mb-2">Plain-language summary</div>
                    <p className="text-xs text-cream2/80 font-light leading-relaxed">{r.summary}</p>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-cream2/50 uppercase tracking-wider mb-2">Regulatory text · {r.frameworkVersion}</div>
                    <div className="bg-coal rounded-xl p-4 border border-ash/60">
                      <p className="text-[11px] text-cream2/60 font-light leading-relaxed font-mono">{r.fullText}</p>
                    </div>
                  </div>
                  {r.sourceUrl && (
                    <div className="mt-3">
                      <a href={r.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-bronze hover:text-bronze-soft transition inline-flex items-center gap-1">
                        View on EUR-Lex (official source)
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
