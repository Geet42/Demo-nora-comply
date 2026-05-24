import { fetchActiveLawAlerts } from '@/lib/data'
import { getUserCompanyId, isDemoMode } from '@/lib/auth'
import Link from 'next/link'

export async function AlertBanner() {
  const days = Math.ceil((new Date('2026-08-02').getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const companyId = !isDemoMode() ? await getUserCompanyId() : null
  const alerts = !isDemoMode() ? await fetchActiveLawAlerts(companyId || undefined) : []

  return (
    <div className="space-y-3">
      <div className="rounded-2xl px-5 py-4 flex items-start gap-4"
        style={{ background: 'rgba(37,99,176,0.10)', border: '1px solid rgba(74,144,217,0.25)' }}>
        <div className="flex-shrink-0 mt-0.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4a90d9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: '#4a90d9' }}>EU AI Act · Art. 9, 12, 13, 14, 26</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
              style={{ background: 'rgba(212,90,90,0.15)', color: '#d45a5a', border: '1px solid rgba(212,90,90,0.25)' }}>
              {days} days
            </span>
          </div>
          <p className="text-sm font-medium" style={{ color: '#dceeff' }}>High-risk AI obligations enforceable from 2 August 2026 under Regulation (EU) 2024/1689.</p>
          <p className="text-xs mt-0.5 font-light" style={{ color: '#5a7fa8' }}>Deployers of Annex III AI systems must have risk management, human oversight, logging, and transparency documentation in place.</p>
        </div>
      </div>
      {alerts.length > 0 && (
        <div className="rounded-2xl px-5 py-4 flex items-start gap-4"
          style={{ background: 'rgba(212,90,90,0.08)', border: '1px solid rgba(212,90,90,0.3)' }}>
          <div className="flex-shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full mt-2 animate-pulse flex-shrink-0" style={{ background: '#d45a5a' }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium" style={{ color: '#dceeff' }}>{alerts[0].title}</p>
            <p className="text-xs mt-0.5 font-light" style={{ color: '#5a7fa8' }}>{alerts[0].description.slice(0, 120)}...</p>
            <Link href="/dashboard/law" className="text-[11px] mt-1.5 inline-block transition" style={{ color: '#4a90d9' }}>Review in Law tracker →</Link>
          </div>
        </div>
      )}
    </div>
  )
}
