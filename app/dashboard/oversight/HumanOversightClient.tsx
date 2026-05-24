'use client'

import { useState, useEffect } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { logHumanDecision } from '@/app/dashboard/actions'
import { createPortal } from 'react-dom'
import type { System } from '@/lib/demo-data'

function SubmitBtn() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn-primary !py-2.5 !px-5 text-[13px] disabled:opacity-60">
      {pending ? 'Saving...' : 'Log decision'}
    </button>
  )
}

export function HumanOversightClient({ systems, decisions }: { systems: System[]; decisions: any[] }) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [didOverride, setDidOverride] = useState(false)
  const [state, action] = useFormState(logHumanDecision, undefined)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    if (state?.ok) {
      setOpen(false)
      setDidOverride(false)
    }
  }, [state])

  const modal = open ? (
    <div className="theme-dark" style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => setOpen(false)}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'rgba(28,22,18,0.82)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }} />
      <div onClick={e => e.stopPropagation()} className="bg-coal2 border border-ash" style={{ position: 'relative', width: '100%', maxWidth: 560, maxHeight: 'calc(100vh - 48px)', overflowY: 'auto', borderRadius: 18, padding: 28, boxShadow: '0 24px 60px -20px rgba(0,0,0,0.6)' }}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <span className="eyebrow !text-bronze text-[10px]">Art. 14 · EU AI Act</span>
            <h2 className="display-serif text-cream mt-2 leading-tight" style={{ fontSize: '1.5rem', fontWeight: 400 }}>
              Log <span className="italic font-light text-bronze">human decision</span>
            </h2>
            <p className="text-xs text-cream2/60 mt-1.5 font-light">This record is timestamped and immutable — it serves as evidence of human oversight.</p>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="text-cream2/60 hover:text-cream text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-coal3">×</button>
        </div>

        <form action={action} className="space-y-4">
          <div>
            <label className="eyebrow !text-cream2/60 block mb-2">AI system</label>
            <select name="systemId" required className="w-full bg-coal border border-ash rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-bronze transition">
              <option value="">Select system...</option>
              {systems.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <TextArea label="Decision context" name="decisionContext" placeholder="e.g. Recruitment shortlist review — Engineering roles, batch Q3 2025. 24 candidates reviewed." required />
          <TextArea label="AI recommendation" name="aiRecommendation" placeholder="e.g. AI shortlisted 8 of 24 candidates. Confidence scores ranged 0.71–0.94." />
          <TextArea label="Human decision" name="humanDecision" placeholder="e.g. Approved 6 of 8 AI shortlisted. Added 2 candidates the AI ranked below threshold." required />

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="didOverride" value="true" onChange={e => setDidOverride(e.target.checked)} className="w-4 h-4 rounded accent-bronze" />
              <span className="text-sm text-cream">Human overrode AI recommendation</span>
            </label>
            <input type="hidden" name="didOverride" value={didOverride ? 'true' : 'false'} />
          </div>

          {didOverride && (
            <TextArea label="Override reason (required)" name="overrideReason" placeholder="e.g. AI underweighted relevant non-traditional experience. Candidate C had strong project portfolio not captured in CV keywords." required={didOverride} />
          )}

          <div>
            <label className="eyebrow !text-cream2/60 block mb-2">Candidate reference (anonymised)</label>
            <input name="candidateRef" placeholder="e.g. BATCH-2025-Q3-ENG or leave blank" className="w-full bg-coal border border-ash rounded-xl px-4 py-3 text-sm text-cream placeholder:text-cream2/40 focus:outline-none focus:border-bronze transition" />
            <p className="text-[10px] text-cream2/50 mt-1.5">Do not enter real names or personal identifiers. Use batch IDs or role codes only.</p>
          </div>

          {state?.error && <div className="text-xs px-3 py-2.5 rounded-xl" style={{ background: 'rgba(181,96,78,0.10)', border: '1px solid rgba(181,96,78,0.30)', color: 'var(--danger)' }}>{state.error}</div>}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost !py-2 !px-4 text-[13px]">Cancel</button>
            <SubmitBtn />
          </div>
        </form>
      </div>
    </div>
  ) : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="display-serif text-cream" style={{ fontSize: '1.25rem', fontWeight: 500 }}>Oversight decision log</div>
          <div className="text-xs text-cream2/60 mt-1">Every entry is SHA-256 anchored via session reference</div>
        </div>
        <button onClick={() => setOpen(true)} className="btn-primary !py-2.5 !px-5 text-[13px]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          Log decision
        </button>
      </div>

      {decisions.length === 0 ? (
        <div className="card !bg-coal2 !border-ash p-14 text-center">
          <div className="display-serif text-cream mb-2" style={{ fontSize: '1.4rem', fontWeight: 400 }}>No oversight logs yet</div>
          <p className="text-sm text-cream2/60 font-light mb-6 max-w-md mx-auto">
            Log your first human decision to begin building your Art. 14 evidence trail. Auditors will want to see these records.
          </p>
        </div>
      ) : (
        <div className="card !bg-coal2 !border-ash overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-cream2/60 font-mono border-b border-ash">
                <th className="px-6 py-3 font-medium">Context</th>
                <th className="px-3 py-3 font-medium">Decision</th>
                <th className="px-3 py-3 font-medium">Override</th>
                <th className="px-6 py-3 font-medium text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {decisions.map((d: any) => (
                <tr key={d.id} className="border-t border-ash/60 hover:bg-coal3/60 transition">
                  <td className="px-6 py-4">
                    <div className="text-cream text-sm">{d.decision_context}</div>
                    {d.candidate_ref && <div className="text-xs text-cream2/50 mt-0.5 font-mono">{d.candidate_ref}</div>}
                  </td>
                  <td className="px-3 py-4 text-xs text-cream2/70 max-w-[200px]">
                    <div className="line-clamp-2">{d.human_decision}</div>
                  </td>
                  <td className="px-3 py-4">
                    {d.did_override ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: 'rgba(199,155,94,0.15)', color: 'var(--warn)', border: '1px solid rgba(199,155,94,0.3)' }}>
                        Overridden
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: 'rgba(127,139,111,0.15)', color: 'var(--sage)', border: '1px solid rgba(127,139,111,0.3)' }}>
                        Agreed
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-cream2/60 font-mono">
                    {new Date(d.decided_at).toLocaleDateString('en-IE', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {mounted && modal && createPortal(modal, document.body)}
    </div>
  )
}

function TextArea({ label, name, placeholder, required }: { label: string; name: string; placeholder: string; required?: boolean }) {
  return (
    <div>
      <label className="eyebrow !text-cream2/60 block mb-2">{label}</label>
      <textarea
        name={name}
        placeholder={placeholder}
        required={required}
        rows={3}
        className="w-full bg-coal border border-ash rounded-xl px-4 py-3 text-sm text-cream placeholder:text-cream2/40 focus:outline-none focus:border-bronze transition resize-none"
      />
    </div>
  )
}
