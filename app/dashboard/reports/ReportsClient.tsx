'use client'

import { useState } from 'react'
import type { System } from '@/lib/demo-data'

export function ReportsClient({ systems, obligations }: { systems: System[]; obligations: any[] }) {
  const [generating, setGenerating] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)

  async function generate(systemId: string, systemName: string, vendor: string, riskLevel: string) {
    setGenerating(systemId)
    try {
      const res = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemName, vendor, riskLevel: `${riskLevel} risk`, owner: 'Compliance team' }),
      })
      if (!res.ok) throw new Error('PDF failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${systemName.replace(/\s+/g, '-').toLowerCase()}-art11-technical-doc.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setDone(systemId)
      setTimeout(() => setDone(null), 3000)
    } catch {
      alert('PDF generation failed. Make sure Supabase is connected.')
    } finally {
      setGenerating(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card !bg-coal2 !border-ash overflow-hidden">
        <div className="px-6 py-5 border-b border-ash">
          <div className="display-serif text-cream" style={{ fontSize: '1.2rem', fontWeight: 500 }}>Article 11 technical documentation</div>
          <div className="text-xs text-cream2/60 mt-1">PDF evidence pack per system — SHA-256 stamped, audit-ready</div>
        </div>
        {systems.length === 0 ? (
          <div className="p-12 text-center text-sm text-cream2/60 font-light">Register AI systems to generate reports.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-cream2/60 font-mono border-b border-ash">
                <th className="px-6 py-3 font-medium">System</th>
                <th className="px-3 py-3 font-medium">Risk</th>
                <th className="px-3 py-3 font-medium">Obligations</th>
                <th className="px-6 py-3 font-medium text-right">Export</th>
              </tr>
            </thead>
            <tbody>
              {systems.map(s => {
                const sysObs = obligations.filter((o: any) => o.system_id === s.id || (o.ai_systems as any)?.name === s.name)
                const avg = sysObs.length ? Math.round(sysObs.reduce((a: number, o: any) => a + o.pct, 0) / sysObs.length) : 0
                return (
                  <tr key={s.id} className="border-t border-ash/60 hover:bg-coal3/60 transition">
                    <td className="px-6 py-4">
                      <div className="text-cream font-medium">{s.name}</div>
                      <div className="text-xs text-cream2/60 mt-0.5 font-light">{s.vendor}</div>
                    </td>
                    <td className="px-3 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border" style={{ background: 'rgba(184,115,82,0.12)', border: '1px solid rgba(184,115,82,0.25)', color: 'var(--bronze-soft)' }}>
                        {s.risk}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-xs text-cream2/60">{sysObs.length} obligations · {avg}% avg</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => generate(s.id, s.name, s.vendor, s.risk)}
                        disabled={!!generating}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border border-ash hover:border-bronze hover:text-bronze-soft transition disabled:opacity-50"
                      >
                        {generating === s.id ? (
                          <><span className="w-2 h-2 rounded-full bg-bronze animate-pulse" />Generating</>
                        ) : done === s.id ? (
                          <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 13l4 4L19 7"/></svg>Downloaded</>
                        ) : (
                          <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>Download PDF</>
                        )}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
