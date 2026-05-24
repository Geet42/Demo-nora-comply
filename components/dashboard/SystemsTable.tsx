'use client'
import type { System } from '@/lib/demo-data'
import { useState } from 'react'

const riskStyle: Record<string, { bg: string; color: string }> = {
  Unacceptable: { bg: 'rgba(212,90,90,0.15)',  color: '#d45a5a' },
  High:         { bg: 'rgba(224,168,74,0.15)', color: '#e0a84a' },
  Limited:      { bg: 'rgba(74,144,217,0.12)', color: '#4a90d9' },
  Minimal:      { bg: 'rgba(92,158,138,0.12)', color: '#5c9e8a' },
}
const statusColor: Record<string, string> = {
  'Compliant':       '#5c9e8a',
  'In review':       '#e0a84a',
  'Action required': '#d45a5a',
}

export function SystemsTable({ systems }: { systems: System[] }) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#0d1a30', border: '1px solid rgba(30,51,88,0.8)' }}>
      <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(30,51,88,0.8)' }}>
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: '#2a4470' }}>Registry</div>
          <div className="display-serif" style={{ fontSize: '1.2rem', fontWeight: 500, color: '#dceeff' }}>AI systems</div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[11px] font-medium"
          style={{ background: 'rgba(74,144,217,0.12)', color: '#4a90d9', border: '1px solid rgba(74,144,217,0.2)' }}>
          {systems.length} tracked
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(30,51,88,0.6)' }}>
              {['System', 'Risk', 'Status', 'Score', 'Dossier'].map((h, i) => (
                <th key={h} className="px-5 py-3 font-mono text-[10px] uppercase tracking-wider"
                  style={{ color: '#2a4470', textAlign: i > 2 ? 'right' : 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {systems.map(s => <Row key={s.id} system={s} />)}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Row({ system: s }: { system: System }) {
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const rs = riskStyle[s.risk] || riskStyle.Limited

  async function generate() {
    setBusy(true)
    try {
      const res = await fetch('/api/generate-pdf', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ systemName: s.name, vendor: s.vendor, riskLevel: `${s.risk} risk`, owner: 'Compliance team' }) })
      if (!res.ok) throw new Error('PDF failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `${s.name.replace(/\s+/g, '-').toLowerCase()}-art11.pdf`
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
      setDone(true); setTimeout(() => setDone(false), 2500)
    } catch {} finally { setBusy(false) }
  }

  return (
    <tr style={{ borderTop: '1px solid rgba(30,51,88,0.4)' }}>
      <td className="px-5 py-4">
        <div className="font-medium" style={{ color: '#dceeff' }}>{s.name}</div>
        <div className="text-xs font-light mt-0.5" style={{ color: '#5a7fa8' }}>{s.vendor}</div>
      </td>
      <td className="px-4 py-4">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium"
          style={{ background: rs.bg, color: rs.color, border: `1px solid ${rs.color}30` }}>
          {s.risk}
        </span>
      </td>
      <td className="px-4 py-4 text-xs font-medium" style={{ color: statusColor[s.status] }}>{s.status}</td>
      <td className="px-4 py-4 text-right">
        <div className="inline-flex items-baseline gap-1">
          <span className="display-serif tabular" style={{ fontSize: '1.4rem', fontWeight: 400, color: '#dceeff' }}>{s.score}</span>
          <span className="text-xs" style={{ color: '#2a4470' }}>/100</span>
        </div>
        <div className="h-1 w-20 ml-auto mt-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(30,51,88,0.8)' }}>
          <div className="h-full rounded-full" style={{ width: `${s.score}%`, background: s.score >= 80 ? '#5c9e8a' : s.score >= 60 ? '#4a90d9' : '#d45a5a' }} />
        </div>
      </td>
      <td className="px-5 py-4 text-right">
        <button onClick={generate} disabled={busy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition disabled:opacity-50"
          style={{ border: '1px solid rgba(42,68,112,0.8)', color: '#5a7fa8' }}>
          {busy ? <><span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#4a90d9' }} />Generating</>
           : done ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#5c9e8a" strokeWidth="2.5" strokeLinecap="round"><path d="M5 13l4 4L19 7"/></svg>Downloaded</>
           : <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>Generate</>}
        </button>
      </td>
    </tr>
  )
}
