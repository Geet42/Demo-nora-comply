import { fetchSystems, fetchAllObligations } from '@/lib/data'
import { ReportsClient } from './ReportsClient'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const [systems, obligations] = await Promise.all([
    fetchSystems(),
    fetchAllObligations(),
  ])

  return (
    <div className="space-y-8 fade-in">
      <div>
        <span className="eyebrow">Audit-ready</span>
        <h2 className="display-serif text-cream mt-3 leading-tight" style={{ fontSize: '2.4rem', fontWeight: 400 }}>
          Reports <span className="italic font-light text-bronze">and exports</span>
        </h2>
        <p className="text-sm text-cream2/70 max-w-2xl mt-3 font-light leading-relaxed">
          Generate PDF evidence packs with SHA-256 integrity hashes. These are suitable for submission to a Data Protection Commission, notified body, or internal audit.
        </p>
      </div>
      <ReportsClient systems={systems} obligations={obligations as any[]} />
    </div>
  )
}
