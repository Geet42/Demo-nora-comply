'use client'

import { useState } from 'react'

type Result = { sent: number; failed: number; errors?: string[] }

export function BroadcastClient() {
  const [subject, setSubject] = useState('')
  const [heading, setHeading] = useState('')
  const [body, setBody] = useState('')
  const [ctaText, setCtaText] = useState('Open your dashboard')
  const [ctaUrl, setCtaUrl] = useState('https://demo-nora-comply.vercel.app/dashboard')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [error, setError] = useState('')
  const [previewing, setPreviewing] = useState(false)

  async function send() {
    if (!subject || !heading || !body) { setError('Subject, heading and body are required.'); return }
    setSending(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/broadcast-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, heading, body, ctaText, ctaUrl }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to send.'); return }
      setResult(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Compose */}
      <div className="card !bg-coal2 !border-ash p-6 space-y-5">
        <div className="eyebrow !text-cream2/60">Compose</div>

        <div>
          <label className="eyebrow !text-cream2/60 block mb-2">Email subject</label>
          <input value={subject} onChange={e => setSubject(e.target.value)}
            placeholder="e.g. Important: EU AI Act enforcement in 60 days"
            className="w-full bg-coal border border-ash rounded-xl px-4 py-3 text-sm text-cream placeholder:text-cream2/40 focus:outline-none focus:border-glacier-blue transition" />
        </div>

        <div>
          <label className="eyebrow !text-cream2/60 block mb-2">Heading</label>
          <input value={heading} onChange={e => setHeading(e.target.value)}
            placeholder="e.g. 60 days to EU AI Act enforcement"
            className="w-full bg-coal border border-ash rounded-xl px-4 py-3 text-sm text-cream placeholder:text-cream2/40 focus:outline-none focus:border-glacier-blue transition" />
        </div>

        <div>
          <label className="eyebrow !text-cream2/60 block mb-2">Body</label>
          <textarea value={body} onChange={e => setBody(e.target.value)} rows={6}
            placeholder="Write your message here. Plain text — will be rendered with Nora's email theme."
            className="w-full bg-coal border border-ash rounded-xl px-4 py-3 text-sm text-cream placeholder:text-cream2/40 focus:outline-none focus:border-glacier-blue transition resize-none" />
          <p className="text-[10px] text-cream2/40 mt-1">Use line breaks for paragraphs. They will render correctly.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="eyebrow !text-cream2/60 block mb-2">CTA button text</label>
            <input value={ctaText} onChange={e => setCtaText(e.target.value)}
              className="w-full bg-coal border border-ash rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-glacier-blue transition" />
          </div>
          <div>
            <label className="eyebrow !text-cream2/60 block mb-2">CTA button URL</label>
            <input value={ctaUrl} onChange={e => setCtaUrl(e.target.value)}
              className="w-full bg-coal border border-ash rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-glacier-blue transition" />
          </div>
        </div>

        {error && (
          <div className="text-xs px-3 py-2.5 rounded-xl" style={{ background: 'rgba(212,90,90,0.08)', border: '1px solid rgba(212,90,90,0.25)', color: '#d45a5a' }}>
            {error}
          </div>
        )}

        {result && (
          <div className="rounded-xl p-4" style={{ background: 'rgba(127,139,111,0.08)', border: '1px solid rgba(127,139,111,0.25)' }}>
            <div className="text-sm text-sage font-medium">{result.sent} emails sent successfully</div>
            {result.failed > 0 && <div className="text-xs text-danger mt-1">{result.failed} failed</div>}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button onClick={() => setPreviewing(!previewing)}
            className="btn-ghost !py-2.5 !px-5 text-[13px]">
            {previewing ? 'Hide preview' : 'Preview email'}
          </button>
          <button onClick={send} disabled={sending}
            className="btn-primary !py-2.5 !px-5 text-[13px] disabled:opacity-60">
            {sending ? 'Sending...' : 'Send to all users'}
          </button>
        </div>
      </div>

      {/* Warning */}
      <div className="rounded-xl p-4 text-xs" style={{ background: 'rgba(212,90,90,0.05)', border: '1px solid rgba(212,90,90,0.2)', color: '#d45a5a' }}>
        This will send to every registered user in Nora Comply. There is no undo. Use the preview before sending.
      </div>

      {/* Preview */}
      {previewing && subject && heading && body && (
        <div className="card !bg-coal2 !border-ash overflow-hidden">
          <div className="px-6 py-3 border-b border-ash eyebrow !text-cream2/60">Email preview</div>
          <div className="p-4">
            <iframe
              srcDoc={buildPreviewHtml(heading, body, ctaText, ctaUrl)}
              style={{ width: '100%', height: 600, border: 'none', borderRadius: 8 }}
              title="Email preview"
            />
          </div>
        </div>
      )}
    </div>
  )
}

function buildPreviewHtml(heading: string, body: string, ctaText: string, ctaUrl: string) {
  const paragraphs = body.split('\n').filter(Boolean)
    .map(p => `<p style="color:#9bbce0;font-size:14px;line-height:1.7;margin:0 0 14px;">${p}</p>`)
    .join('')

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0a1628;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:32px 16px;">
<div style="background:#0d1a30;border:1px solid #1e3358;border-radius:20px;overflow:hidden;">
<div style="background:linear-gradient(135deg,#070e1c 0%,#0f2240 50%,#1a3a6b 100%);padding:32px 32px 24px;position:relative;overflow:hidden;">
<div style="position:absolute;bottom:0;left:0;right:0;opacity:0.15;"><svg viewBox="0 0 600 80" preserveAspectRatio="none" style="display:block;width:100%;height:50px;"><polygon points="0,80 100,30 200,55 300,15 400,45 500,10 600,35 600,80" fill="#4a90d9"/></svg></div>
<div style="position:relative;"><div style="font-size:22px;font-weight:700;color:#dceeff;">nora<span style="color:#4a90d9;">.</span>comply</div><div style="font-family:monospace;font-size:10px;color:#5c85b8;text-transform:uppercase;letter-spacing:2px;margin-top:4px;">EU AI Act Compliance</div></div>
</div>
<div style="padding:28px 32px;">
<h2 style="font-size:24px;font-weight:700;color:#dceeff;margin:0 0 16px;line-height:1.2;">${heading}</h2>
${paragraphs}
${ctaText ? `<a href="${ctaUrl}" style="display:inline-block;background:linear-gradient(135deg,#1a3a6b 0%,#2563b0 100%);color:#ffffff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:600;font-size:14px;margin-top:8px;">${ctaText} &rarr;</a>` : ''}
<div style="font-family:monospace;font-size:10px;color:#2a4a72;border-top:1px solid #1e3358;padding-top:14px;margin-top:24px;">Nora Comply &middot; Built in Ireland &middot; Regulation (EU) 2024/1689</div>
</div></div></div>
</body></html>`
}
