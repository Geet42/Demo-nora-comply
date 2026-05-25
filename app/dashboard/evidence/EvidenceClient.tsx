'use client'

import { useState, useEffect, useRef } from 'react'
import { uploadEvidence } from '@/app/dashboard/obligations/actions'
import { useFormState, useFormStatus } from 'react-dom'
import { createPortal } from 'react-dom'

function UploadBtn() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn-primary !py-2.5 !px-5 text-[13px] disabled:opacity-60">
      {pending ? 'Uploading...' : 'Upload & hash'}
    </button>
  )
}

const CSV_COLUMN_TYPES = [
  'AI score / confidence',
  'Human decision',
  'Override reason',
  'Candidate reference',
  'Timestamp',
  'Reviewer ID',
  'Decision outcome',
  'Notes',
  'Other',
]

export function EvidenceClient({ obligations, uploaded }: { obligations: any[]; uploaded: any[] }) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [columnLabels, setColumnLabels] = useState<Record<string, string>>({})
  const [state, action] = useFormState(uploadEvidence, undefined)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => {
    if (state?.ok) {
      setOpen(false)
      setSelectedFile(null)
      setCsvHeaders([])
      setColumnLabels({})
      formRef.current?.reset()
    }
  }, [state])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    setCsvHeaders([])

    if (file.name.endsWith('.csv')) {
      const text = await file.text()
      const firstLine = text.split('\n')[0]
      const headers = firstLine.split(',').map(h => h.replace(/['"]/g, '').trim())
      setCsvHeaders(headers)
      const initial: Record<string, string> = {}
      headers.forEach(h => { initial[h] = '' })
      setColumnLabels(initial)
    }
  }

  const modal = open ? (
    <div className="theme-dark" style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => setOpen(false)}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'rgba(28,22,18,0.82)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }} />
      <div onClick={e => e.stopPropagation()} className="bg-coal2 border border-ash" style={{ position: 'relative', width: '100%', maxWidth: 560, maxHeight: 'calc(100vh - 48px)', overflowY: 'auto', borderRadius: 18, padding: 28, boxShadow: '0 24px 60px -20px rgba(0,0,0,0.6)' }}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <span className="eyebrow !text-cream2/60">SHA-256 verified</span>
            <h2 className="display-serif text-cream mt-2 leading-tight" style={{ fontSize: '1.5rem', fontWeight: 400 }}>Upload <span className="italic font-light text-bronze">evidence</span></h2>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="text-cream2/60 hover:text-cream text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-coal3">×</button>
        </div>

        <form ref={formRef} action={action} className="space-y-4">
          <div>
            <label className="eyebrow !text-cream2/60 block mb-2">Obligation</label>
            <select name="obligationId" required className="w-full bg-coal border border-ash rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-bronze transition">
              <option value="">Select obligation...</option>
              {obligations.map(o => (
                <option key={o.id} value={o.id}>
                  {o.article} — {o.article_title || o.name} ({(o.ai_systems as any)?.name || 'System'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="eyebrow !text-cream2/60 block mb-2">File</label>
            <input type="file" name="file" required onChange={handleFileChange} accept=".pdf,.docx,.csv,.xlsx,.png,.jpg,.jpeg" className="w-full text-sm text-cream2/80 bg-coal border border-ash rounded-xl px-4 py-3 cursor-pointer focus:outline-none" />
            <p className="text-[10px] text-cream2/50 mt-1.5">PDF, DOCX, CSV, XLSX, PNG, JPG — max 20MB</p>
          </div>

          {/* CSV column labelling */}
          {csvHeaders.length > 0 && (
            <div>
              <label className="eyebrow !text-cream2/60 block mb-2">Label CSV columns <span className="normal-case font-normal text-cream2/50 ml-1">(makes data machine-readable for auditors)</span></label>
              <div className="space-y-2">
                {csvHeaders.map(header => (
                  <div key={header} className="flex items-center gap-3">
                    <div className="text-xs text-cream2/70 font-mono flex-1 truncate bg-coal px-3 py-2 rounded-lg border border-ash">{header}</div>
                    <select
                      value={columnLabels[header] || ''}
                      onChange={e => setColumnLabels(prev => ({ ...prev, [header]: e.target.value }))}
                      className="bg-coal border border-ash rounded-lg px-3 py-2 text-xs text-cream focus:outline-none focus:border-bronze transition"
                    >
                      <option value="">Label this column...</option>
                      {CSV_COLUMN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <input type="hidden" name="columnLabels" value={JSON.stringify(columnLabels)} />
            </div>
          )}

          {state?.error && <div className="text-xs px-3 py-2.5 rounded-xl" style={{ background: 'rgba(181,96,78,0.10)', border: '1px solid rgba(181,96,78,0.30)', color: 'var(--danger)' }}>{state.error}</div>}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost !py-2 !px-4 text-[13px]">Cancel</button>
            <UploadBtn />
          </div>
        </form>
      </div>
    </div>
  ) : null

  function formatSize(bytes: number) {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const pending = obligations.filter((o: any) => o.pct < 100)
  const complete = obligations.filter((o: any) => o.pct >= 100)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="display-serif text-cream" style={{ fontSize: '1.25rem', fontWeight: 500 }}>Upload evidence</div>
        <button onClick={() => setOpen(true)} className="btn-primary !py-2.5 !px-5 text-[13px]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
          Upload evidence
        </button>
      </div>

      {obligations.length === 0 ? (
        <div className="card !bg-coal2 !border-ash p-12 text-center text-sm text-cream2/60 font-light">
          Register an AI system first to generate obligations you can upload evidence against.
        </div>
      ) : (
        <>
          {/* Uploaded evidence */}
          {uploaded.length > 0 && (
            <div className="card !bg-coal2 !border-ash overflow-hidden">
              <div className="px-6 py-4 border-b border-ash flex items-center justify-between">
                <div className="eyebrow !text-cream2/60">Uploaded evidence ({uploaded.length})</div>
                <div className="text-[11px] text-sage">{complete.length} of {obligations.length} obligations complete</div>
              </div>
              <div className="divide-y divide-ash/60">
                {uploaded.map((e: any) => (
                  <div key={e.id} className="px-6 py-4 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(127,139,111,0.12)', border: '1px solid rgba(127,139,111,0.25)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--sage)" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-cream font-medium truncate">{e.file_name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ background: 'rgba(127,139,111,0.12)', color: 'var(--sage)', border: '1px solid rgba(127,139,111,0.2)' }}>v{e.version}</span>
                        {e.review_status === 'pending' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(199,155,94,0.12)', color: 'var(--warn)', border: '1px solid rgba(199,155,94,0.25)' }}>Pending review</span>
                        )}
                        {e.review_status === 'approved' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(127,139,111,0.12)', color: 'var(--sage)', border: '1px solid rgba(127,139,111,0.25)' }}>Approved</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(184,115,82,0.12)', color: 'var(--bronze-soft)', border: '1px solid rgba(184,115,82,0.2)' }}>
                          {e.obligations?.article}
                        </span>
                        <span className="text-[11px] text-cream2/60">{e.obligations?.article_title}</span>
                        <span className="text-[11px] text-cream2/40">·</span>
                        <span className="text-[11px] text-cream2/50">{e.obligations?.ai_systems?.name}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] font-mono text-cream2/40 truncate max-w-[180px]">SHA-256: {e.content_hash?.slice(0,16)}...</span>
                        <span className="text-[10px] text-cream2/40">{formatSize(e.file_size_bytes)}</span>
                        <span className="text-[10px] text-cream2/40">{new Date(e.uploaded_at).toLocaleDateString('en-IE', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending obligations */}
          {pending.length > 0 && (
            <div className="card !bg-coal2 !border-ash overflow-hidden">
              <div className="px-6 py-4 border-b border-ash eyebrow !text-cream2/60">Obligations awaiting evidence ({pending.length})</div>
              <div className="divide-y divide-ash/60">
                {pending.map((o: any) => (
                  <div key={o.id} className="px-6 py-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(184,115,82,0.15)', color: 'var(--bronze-soft)', border: '1px solid rgba(184,115,82,0.25)' }}>{o.article}</span>
                        <span className="text-xs text-cream truncate">{o.article_title || o.name}</span>
                      </div>
                      <div className="text-[11px] text-cream2/50">{(o.ai_systems as any)?.name || ''} · {o.framework}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-xs text-cream2/60 tabular">{o.pct}%</div>
                      <div className="w-20 h-1.5 bg-ash rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${o.pct}%`, background: o.pct >= 80 ? 'var(--sage)' : o.pct >= 40 ? 'var(--bronze)' : 'var(--danger)' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pending.length === 0 && uploaded.length > 0 && (
            <div className="rounded-xl p-5 text-center" style={{ background: 'rgba(127,139,111,0.06)', border: '1px solid rgba(127,139,111,0.2)' }}>
              <div className="text-sage font-medium text-sm mb-1">All obligations have evidence uploaded</div>
              <div className="text-xs text-cream2/50">Go to Reports to generate your full compliance evidence pack.</div>
            </div>
          )}
        </>
      )}
      {mounted && modal && createPortal(modal, document.body)}
    </div>
  )
}
