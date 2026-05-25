'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { logHumanDecision, bulkImportDecisions } from '@/app/dashboard/actions'
import { createPortal } from 'react-dom'
import type { System } from '@/lib/demo-data'

// ─── helpers ──────────────────────────────────────────────────────────────────

function SubmitBtn({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn-primary !py-2.5 !px-5 text-[13px] disabled:opacity-60">
      {pending ? 'Working...' : label}
    </button>
  )
}

function TextArea({ label, name, placeholder, required }: { label: string; name: string; placeholder: string; required?: boolean }) {
  return (
    <div>
      <label className="eyebrow !text-cream2/60 block mb-2">{label}</label>
      <textarea name={name} placeholder={placeholder} required={required} rows={3}
        className="w-full bg-coal border border-ash rounded-xl px-4 py-3 text-sm text-cream placeholder:text-cream2/40 focus:outline-none focus:border-bronze transition resize-none" />
    </div>
  )
}

// ─── CSV parser ────────────────────────────────────────────────────────────────

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''))
  return lines.slice(1).map(line => {
    const cols: string[] = []
    let cur = '', inQuote = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') { inQuote = !inQuote }
      else if (ch === ',' && !inQuote) { cols.push(cur.trim()); cur = '' }
      else { cur += ch }
    }
    cols.push(cur.trim())
    const row: Record<string, string> = {}
    headers.forEach((h, i) => { row[h] = (cols[i] || '').replace(/^"|"$/g, '') })
    return row
  }).filter(r => Object.values(r).some(v => v !== ''))
}

// ─── Export helpers ────────────────────────────────────────────────────────────

function exportCSV(decisions: any[]) {
  const headers = ['candidate_ref', 'decision_context', 'ai_recommendation', 'human_decision', 'did_override', 'override_reason', 'decided_at', 'session_ref']
  const rows = decisions.map(d => headers.map(h => {
    const val = String(d[h] ?? '')
    return val.includes(',') || val.includes('"') || val.includes('\n') ? `"${val.replace(/"/g, '""')}"` : val
  }).join(','))
  const csv = [headers.join(','), ...rows].join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `oversight-decisions-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Decision detail drawer ────────────────────────────────────────────────────

function DecisionDrawer({ d, onClose }: { d: any; onClose: () => void }) {
  return (
    <div className="theme-dark" style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'rgba(7,14,28,0.7)', backdropFilter: 'blur(4px)' }} />
      <div
        onClick={e => e.stopPropagation()}
        style={{ position: 'relative', width: '100%', maxWidth: 640, maxHeight: '80vh', overflowY: 'auto', borderRadius: '18px 18px 0 0', padding: 28, background: 'var(--coal2)', border: '1px solid var(--ash)', borderBottom: 'none', boxShadow: '0 -20px 60px -10px rgba(0,0,0,0.6)' }}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <span className="eyebrow !text-bronze text-[10px]">Art. 14 · Decision record</span>
            <h3 className="display-serif text-cream mt-1" style={{ fontSize: '1.3rem', fontWeight: 400 }}>
              {d.candidate_ref || 'No reference'}
            </h3>
            <div className="text-[11px] text-cream2/50 font-mono mt-0.5">
              {new Date(d.decided_at).toLocaleString('en-IE')} · {d.session_ref?.startsWith('bulk-') ? 'bulk import' : 'manual entry'}
            </div>
          </div>
          <button onClick={onClose} className="text-cream2/60 hover:text-cream text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-coal3">×</button>
        </div>

        <div className="space-y-4">
          <Field label="Decision context" value={d.decision_context} />
          {d.ai_recommendation && <Field label="AI recommendation" value={d.ai_recommendation} />}
          <Field label="Human decision" value={d.human_decision} />

          <div className="flex items-center gap-2">
            <span className="eyebrow !text-cream2/60">Override:</span>
            {d.did_override ? (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(199,155,94,0.15)', color: 'var(--warn)', border: '1px solid rgba(199,155,94,0.3)' }}>Yes — AI overridden</span>
            ) : (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(127,139,111,0.15)', color: 'var(--sage)', border: '1px solid rgba(127,139,111,0.3)' }}>No — agreed with AI</span>
            )}
          </div>

          {d.did_override && d.override_reason && <Field label="Override reason" value={d.override_reason} highlight />}
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className="eyebrow !text-cream2/50 mb-1">{label}</div>
      <div className="text-sm leading-relaxed rounded-xl px-4 py-3" style={{
        background: highlight ? 'rgba(199,155,94,0.06)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${highlight ? 'rgba(199,155,94,0.2)' : 'var(--ash)'}`,
        color: highlight ? 'var(--warn)' : 'var(--cream)',
      }}>
        {value}
      </div>
    </div>
  )
}

// ─── Bulk Import Modal ─────────────────────────────────────────────────────────

function BulkImportModal({ systems, onClose }: { systems: System[]; onClose: () => void }) {
  const [state, action] = useFormState(bulkImportDecisions, undefined)
  const [rows, setRows] = useState<Record<string, string>[]>([])
  const [parseError, setParseError] = useState('')
  const [fileName, setFileName] = useState('')
  const [overrideCount, setOverrideCount] = useState(0)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setParseError('')
    setRows([])
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const parsed = parseCSV(ev.target?.result as string)
        if (parsed.length === 0) { setParseError('No data rows found.'); return }
        const missing = ['human_decision'].filter(r => !Object.keys(parsed[0]).includes(r))
        if (missing.length) { setParseError(`Missing column(s): ${missing.join(', ')}`); return }
        setOverrideCount(parsed.filter(r => r.did_override === 'true' || r.did_override === '1').length)
        setRows(parsed)
      } catch { setParseError('Could not read file.') }
    }
    reader.readAsText(file)
  }

  return (
    <div className="theme-dark" style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={onClose}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'rgba(7,14,28,0.88)', backdropFilter: 'blur(6px)' }} />
      <div onClick={e => e.stopPropagation()} style={{ position: 'relative', width: '100%', maxWidth: 600, maxHeight: 'calc(100vh - 48px)', overflowY: 'auto', borderRadius: 18, padding: 28, background: 'var(--coal2)', border: '1px solid var(--ash)', boxShadow: '0 24px 60px -20px rgba(0,0,0,0.7)' }}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <span className="eyebrow !text-bronze text-[10px]">Art. 14 · Bulk import</span>
            <h2 className="display-serif text-cream mt-2" style={{ fontSize: '1.5rem', fontWeight: 400 }}>
              Import <span className="italic font-light text-bronze">oversight decisions</span>
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-cream2/60 hover:text-cream text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-coal3">×</button>
        </div>

        <div className="rounded-xl p-4 mb-5 text-xs font-mono" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--ash)' }}>
          <div className="eyebrow !text-cream2/40 mb-2">Required CSV format</div>
          <div className="text-cream2/60 overflow-x-auto whitespace-nowrap">candidate_ref, ai_recommendation, human_decision, did_override, override_reason</div>
          <div className="text-cream2/40 mt-1 overflow-x-auto whitespace-nowrap">APP-001, Shortlist, Rejected, true, No relevant experience despite keyword match</div>
        </div>

        <a href="/api/oversight-csv-template" download="nora-oversight-template.csv"
          className="inline-flex items-center gap-2 text-[12px] px-3 py-2 rounded-lg mb-5 transition"
          style={{ background: 'rgba(74,144,217,0.08)', border: '1px solid rgba(74,144,217,0.2)', color: 'var(--glacier-light)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 19h14M12 19l-5-5M12 19l5-5"/></svg>
          Download CSV template
        </a>

        {state?.ok ? (
          <div className="rounded-xl p-5 text-center space-y-2" style={{ background: 'rgba(127,139,111,0.08)', border: '1px solid rgba(127,139,111,0.25)' }}>
            <div className="display-serif text-cream" style={{ fontSize: '2rem' }}>{state.imported?.toLocaleString()}</div>
            <div className="text-sm text-cream2/80">decisions imported</div>
            <div className="text-xs text-cream2/60">{state.overrides?.toLocaleString()} overrides logged</div>
            <button onClick={onClose} className="btn-primary !py-2 !px-5 text-[13px] mt-2">Done</button>
          </div>
        ) : (
          <form action={action} className="space-y-4">
            <div>
              <label className="eyebrow !text-cream2/60 block mb-2">AI system</label>
              <select name="systemId" required className="w-full bg-coal border border-ash rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-bronze transition">
                <option value="">Select system...</option>
                {systems.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="eyebrow !text-cream2/60 block mb-2">Cycle label</label>
              <input name="cycle" placeholder="e.g. Admissions 2026 — Round 1" className="w-full bg-coal border border-ash rounded-xl px-4 py-3 text-sm text-cream placeholder:text-cream2/40 focus:outline-none focus:border-bronze transition" />
            </div>
            <div>
              <label className="eyebrow !text-cream2/60 block mb-2">CSV file</label>
              <div onClick={() => fileRef.current?.click()} className="w-full rounded-xl px-4 py-6 text-center cursor-pointer transition"
                style={{ background: 'rgba(255,255,255,0.02)', border: `2px dashed ${rows.length > 0 ? 'rgba(127,139,111,0.5)' : 'var(--ash)'}` }}>
                {rows.length > 0 ? (
                  <div className="space-y-1">
                    <div className="text-sm text-cream font-medium">{fileName}</div>
                    <div className="text-xs text-sage">{rows.length.toLocaleString()} rows — {overrideCount.toLocaleString()} overrides</div>
                    <div className="text-[10px] text-cream2/40">Click to replace</div>
                  </div>
                ) : (
                  <div className="text-sm text-cream2/60">Click to upload CSV</div>
                )}
              </div>
              <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
              <input type="hidden" name="rowsJson" value={rows.length > 0 ? JSON.stringify(rows) : ''} />
            </div>
            {parseError && <div className="text-xs px-3 py-2.5 rounded-xl" style={{ background: 'rgba(212,90,90,0.08)', border: '1px solid rgba(212,90,90,0.25)', color: '#d45a5a' }}>{parseError}</div>}
            {rows.length > 0 && (
              <div className="rounded-xl p-4 text-xs" style={{ background: 'rgba(74,144,217,0.05)', border: '1px solid rgba(74,144,217,0.15)' }}>
                <div className="text-glacier-light font-medium mb-1">Preview — first 3 rows</div>
                <div className="space-y-1 text-cream2/60 font-mono">
                  {rows.slice(0, 3).map((r, i) => (
                    <div key={i} className="truncate">{r.candidate_ref || `Row ${i + 1}`} — {r.human_decision} {r.did_override === 'true' || r.did_override === '1' ? '(override)' : ''}</div>
                  ))}
                  {rows.length > 3 && <div className="text-cream2/30">...and {(rows.length - 3).toLocaleString()} more</div>}
                </div>
              </div>
            )}
            {state?.error && <div className="text-xs px-3 py-2.5 rounded-xl" style={{ background: 'rgba(212,90,90,0.08)', border: '1px solid rgba(212,90,90,0.25)', color: '#d45a5a' }}>{state.error}</div>}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="btn-ghost !py-2 !px-4 text-[13px]">Cancel</button>
              <SubmitBtn label={rows.length > 0 ? `Import ${rows.length.toLocaleString()} decisions` : 'Import decisions'} />
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ─── Single Decision Modal ─────────────────────────────────────────────────────

function SingleDecisionModal({ systems, onClose }: { systems: System[]; onClose: () => void }) {
  const [didOverride, setDidOverride] = useState(false)
  const [state, action] = useFormState(logHumanDecision, undefined)
  useEffect(() => { if (state?.ok) { onClose(); setDidOverride(false) } }, [state])

  return (
    <div className="theme-dark" style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={onClose}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'rgba(28,22,18,0.82)', backdropFilter: 'blur(6px)' }} />
      <div onClick={e => e.stopPropagation()} className="bg-coal2 border border-ash" style={{ position: 'relative', width: '100%', maxWidth: 560, maxHeight: 'calc(100vh - 48px)', overflowY: 'auto', borderRadius: 18, padding: 28, boxShadow: '0 24px 60px -20px rgba(0,0,0,0.6)' }}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <span className="eyebrow !text-bronze text-[10px]">Art. 14 · EU AI Act</span>
            <h2 className="display-serif text-cream mt-2" style={{ fontSize: '1.5rem', fontWeight: 400 }}>Log <span className="italic font-light text-bronze">human decision</span></h2>
          </div>
          <button type="button" onClick={onClose} className="text-cream2/60 hover:text-cream text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-coal3">×</button>
        </div>
        <form action={action} className="space-y-4">
          <div>
            <label className="eyebrow !text-cream2/60 block mb-2">AI system</label>
            <select name="systemId" required className="w-full bg-coal border border-ash rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-bronze transition">
              <option value="">Select system...</option>
              {systems.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <TextArea label="Decision context" name="decisionContext" placeholder="e.g. Admissions 2026 Round 1 — 50 applications reviewed." required />
          <TextArea label="AI recommendation" name="aiRecommendation" placeholder="e.g. AI shortlisted 27 of 50. Confidence scores 0.61–0.94." />
          <TextArea label="Human decision" name="humanDecision" placeholder="e.g. Panel approved 25 of 27 AI shortlisted. Added 6 below threshold." required />
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="didOverride" value="true" onChange={e => setDidOverride(e.target.checked)} className="w-4 h-4 rounded accent-bronze" />
              <span className="text-sm text-cream">Human overrode AI recommendation</span>
            </label>
            <input type="hidden" name="didOverride" value={didOverride ? 'true' : 'false'} />
          </div>
          {didOverride && <TextArea label="Override reason (required)" name="overrideReason" placeholder="e.g. 15 overrides — full detail in bulk CSV import." required={didOverride} />}
          <div>
            <label className="eyebrow !text-cream2/60 block mb-2">Candidate / Batch reference</label>
            <input name="candidateRef" placeholder="e.g. BATCH-2026-ROUND1" className="w-full bg-coal border border-ash rounded-xl px-4 py-3 text-sm text-cream placeholder:text-cream2/40 focus:outline-none focus:border-bronze transition" />
          </div>
          {state?.error && <div className="text-xs px-3 py-2.5 rounded-xl" style={{ background: 'rgba(181,96,78,0.10)', border: '1px solid rgba(181,96,78,0.30)', color: 'var(--danger)' }}>{state.error}</div>}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost !py-2 !px-4 text-[13px]">Cancel</button>
            <SubmitBtn label="Log decision" />
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main export ───────────────────────────────────────────────────────────────

export function HumanOversightClient({
  systems, decisions: initialDecisions, totalCount,
}: {
  systems: System[]
  decisions: any[]
  totalCount: number
}) {
  const [modal, setModal] = useState<'single' | 'bulk' | null>(null)
  const [mounted, setMounted] = useState(false)
  const [decisions, setDecisions] = useState(initialDecisions)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedDecision, setSelectedDecision] = useState<any>(null)
  const PAGE_SIZE = 50

  useEffect(() => { setMounted(true) }, [])

  async function loadMore() {
    setLoading(true)
    try {
      const res = await fetch(`/api/oversight-decisions?page=${page + 1}&pageSize=${PAGE_SIZE}`)
      const data = await res.json()
      setDecisions(prev => [...prev, ...data])
      setPage(p => p + 1)
    } catch {}
    setLoading(false)
  }

  const hasMore = decisions.length < totalCount

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="display-serif text-cream" style={{ fontSize: '1.25rem', fontWeight: 500 }}>Oversight decision log</div>
          <div className="text-xs text-cream2/60 mt-1">{totalCount.toLocaleString()} total records</div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {decisions.length > 0 && (
            <button
              onClick={() => exportCSV(decisions)}
              className="flex items-center gap-2 text-[13px] px-4 py-2.5 rounded-xl transition"
              style={{ background: 'rgba(127,139,111,0.08)', border: '1px solid rgba(127,139,111,0.2)', color: 'var(--sage)' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Export CSV
            </button>
          )}
          <button onClick={() => setModal('bulk')} className="flex items-center gap-2 text-[13px] px-4 py-2.5 rounded-xl transition"
            style={{ background: 'rgba(74,144,217,0.08)', border: '1px solid rgba(74,144,217,0.2)', color: 'var(--glacier-light)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Bulk import CSV
          </button>
          <button onClick={() => setModal('single')} className="btn-primary !py-2.5 !px-5 text-[13px]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            Log decision
          </button>
        </div>
      </div>

      {decisions.length === 0 ? (
        <div className="card !bg-coal2 !border-ash p-14 text-center">
          <div className="display-serif text-cream mb-2" style={{ fontSize: '1.4rem', fontWeight: 400 }}>No oversight logs yet</div>
          <p className="text-sm text-cream2/60 font-light mb-6 max-w-md mx-auto">Log a single decision or bulk-import a review CSV to begin your Art. 14 evidence trail.</p>
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => setModal('bulk')} className="btn-ghost !py-2.5 !px-5 text-[13px]">Bulk import CSV</button>
            <button onClick={() => setModal('single')} className="btn-primary !py-2.5 !px-5 text-[13px]">Log first decision</button>
          </div>
        </div>
      ) : (
        <>
          <div className="card !bg-coal2 !border-ash overflow-hidden">
            <div className="px-6 py-3 border-b border-ash text-[10px] text-cream2/40 font-mono">
              Click any row to view full details
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-cream2/60 font-mono border-b border-ash">
                  <th className="px-6 py-3 font-medium">Context / Ref</th>
                  <th className="px-3 py-3 font-medium hidden md:table-cell">Decision</th>
                  <th className="px-3 py-3 font-medium">Override</th>
                  <th className="px-6 py-3 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {decisions.map((d: any) => (
                  <tr
                    key={d.id}
                    onClick={() => setSelectedDecision(d)}
                    className="border-t border-ash/60 hover:bg-coal3/60 transition cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="text-cream text-sm line-clamp-1">{d.decision_context}</div>
                      {d.candidate_ref && <div className="text-xs text-cream2/50 mt-0.5 font-mono">{d.candidate_ref}</div>}
                      {d.session_ref?.startsWith('bulk-') && <div className="text-[10px] text-glacier-ice/40 mt-0.5 font-mono">bulk</div>}
                    </td>
                    <td className="px-3 py-4 text-xs text-cream2/70 max-w-[180px] hidden md:table-cell">
                      <div className="line-clamp-1">{d.human_decision}</div>
                    </td>
                    <td className="px-3 py-4">
                      {d.did_override ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: 'rgba(199,155,94,0.15)', color: 'var(--warn)', border: '1px solid rgba(199,155,94,0.3)' }}>Overridden</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: 'rgba(127,139,111,0.15)', color: 'var(--sage)', border: '1px solid rgba(127,139,111,0.3)' }}>Agreed</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-cream2/60 font-mono whitespace-nowrap">
                      {new Date(d.decided_at).toLocaleDateString('en-IE', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hasMore && (
            <div className="text-center pt-2">
              <button
                onClick={loadMore}
                disabled={loading}
                className="btn-ghost !py-2.5 !px-6 text-[13px] disabled:opacity-50"
              >
                {loading ? 'Loading...' : `Load more (${(totalCount - decisions.length).toLocaleString()} remaining)`}
              </button>
            </div>
          )}
        </>
      )}

      {mounted && modal === 'single' && createPortal(<SingleDecisionModal systems={systems} onClose={() => setModal(null)} />, document.body)}
      {mounted && modal === 'bulk' && createPortal(<BulkImportModal systems={systems} onClose={() => setModal(null)} />, document.body)}
      {mounted && selectedDecision && createPortal(<DecisionDrawer d={selectedDecision} onClose={() => setSelectedDecision(null)} />, document.body)}
    </div>
  )
}
