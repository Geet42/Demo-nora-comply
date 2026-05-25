'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useFormState, useFormStatus } from 'react-dom'
import { registerSystem } from '@/app/dashboard/actions'
import { useRouter } from 'next/navigation'
import { ANNEX_III_CATEGORIES } from '@/lib/eu-ai-act-data'

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="btn-primary !py-2.5 !px-5 text-[13px] disabled:opacity-60">
      {pending ? 'Registering...' : 'Register system'}
    </button>
  )
}

export function RegisterSystemButton({ label = 'Register system' }: { label?: string }) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [state, action] = useFormState(registerSystem, undefined)
  const [selectedRisk, setSelectedRisk] = useState('Limited')
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (state?.ok) {
      setOpen(false)
      formRef.current?.reset()
      setSelectedRisk('Limited')
      router.refresh()
    }
  }, [state, router])

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [open])

  const obligationCount: Record<string, number> = {
    Unacceptable: 0,
    High: 9,
    Limited: 3,
    Minimal: 2,
  }

  const modal = open ? (
    <div
      className="theme-dark"
      style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
      onClick={() => setOpen(false)}
    >
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'rgba(7,14,28,0.88)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }} />
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 560,
          maxHeight: 'calc(100vh - 48px)',
          overflowY: 'auto',
          borderRadius: 18,
          padding: 28,
          boxShadow: '0 24px 60px -20px rgba(0,0,0,0.6)',
          background: 'var(--coal2)',
          border: '1px solid var(--ash)',
        }}
      >
        <div className="flex items-start justify-between mb-5">
          <div>
            <span className="eyebrow !text-cream2/60">New system</span>
            <h2 className="display-serif text-cream mt-2 leading-tight" style={{ fontSize: '1.6rem', fontWeight: 400 }}>
              Register an <span className="italic font-light text-glacier-light">AI system</span>
            </h2>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="text-cream2/60 hover:text-cream text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-coal3" aria-label="Close">×</button>
        </div>

        <form ref={formRef} action={action} className="space-y-4">
          <Field label="System name" name="name" placeholder="e.g. Recruitment Screening Engine" required />
          <Field label="Vendor or model" name="vendor" placeholder="e.g. Internal · logistic regression + NLP" />
          <Field label="Purpose (what it does)" name="purpose" placeholder="e.g. Automated shortlisting of job applicants" />

          <div>
            <label className="eyebrow !text-cream2/60 block mb-2">EU AI Act risk level</label>
            <select
              name="risk"
              defaultValue="Limited"
              onChange={e => setSelectedRisk(e.target.value)}
              className="w-full bg-coal border border-ash rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-glacier-blue transition"
            >
              <option value="Unacceptable">Unacceptable risk — prohibited</option>
              <option value="High">High risk — Annex III categories</option>
              <option value="Limited">Limited risk — transparency obligations only</option>
              <option value="Minimal">Minimal risk — GDPR records only</option>
            </select>
            {selectedRisk !== 'Unacceptable' && (
              <p className="text-[11px] text-cream2/60 mt-2 font-light leading-relaxed">
                Nora will pre-load <strong className="text-cream2/80">{obligationCount[selectedRisk]} obligations</strong> from Regulation (EU) 2024/1689 and GDPR.
              </p>
            )}
            {selectedRisk === 'Unacceptable' && (
              <p className="text-[11px] mt-2 font-light leading-relaxed" style={{ color: '#d45a5a' }}>
                Unacceptable risk AI is prohibited under Art. 5 of Regulation (EU) 2024/1689. Registering this system will flag it for review.
              </p>
            )}
          </div>

          {selectedRisk === 'High' && (
            <div>
              <label className="eyebrow !text-cream2/60 block mb-2">Annex III category</label>
              <select
                name="annexCategory"
                className="w-full bg-coal border border-ash rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-glacier-blue transition"
              >
                <option value="">Select category...</option>
                {ANNEX_III_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}

          {state?.error && (
            <div className="text-xs px-3 py-2.5 rounded-xl" style={{ background: 'rgba(212,90,90,0.08)', border: '1px solid rgba(212,90,90,0.25)', color: '#d45a5a' }}>
              {state.error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost !py-2 !px-4 text-[13px]">Cancel</button>
            <Submit />
          </div>
        </form>
      </div>
    </div>
  ) : null

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-primary !py-2.5 !px-5 text-[13px]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        {label}
      </button>
      {mounted && modal && createPortal(modal, document.body)}
    </>
  )
}

function Field({ label, name, placeholder, required }: { label: string; name: string; placeholder: string; required?: boolean }) {
  return (
    <div>
      <label className="eyebrow !text-cream2/60 block mb-2">{label}</label>
      <input
        name={name}
        placeholder={placeholder}
        required={required}
        className="w-full bg-coal border border-ash rounded-xl px-4 py-3 text-sm text-cream placeholder:text-cream2/40 focus:outline-none focus:border-glacier-blue transition"
      />
    </div>
  )
}
