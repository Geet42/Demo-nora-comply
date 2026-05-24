import { fetchAllObligations } from '@/lib/data'
import { EvidenceClient } from './EvidenceClient'

export const dynamic = 'force-dynamic'

export default async function EvidencePage() {
  const obligations = await fetchAllObligations()

  return (
    <div className="space-y-8 fade-in">
      <div>
        <span className="eyebrow">Tamper-evident · SHA-256</span>
        <h2 className="display-serif text-cream mt-3 leading-tight" style={{ fontSize: '2.4rem', fontWeight: 400 }}>
          Evidence <span className="italic font-light text-bronze">vault</span>
        </h2>
        <p className="text-sm text-cream2/70 max-w-2xl mt-3 font-light leading-relaxed">
          Every uploaded file is SHA-256 hashed on upload and stored separately from the file. The hash is verified on every download. Version history is immutable — old versions cannot be deleted.
        </p>
      </div>

      <div className="card !bg-coal2 !border-ash p-5">
        <div className="flex items-start gap-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(184,115,82,0.12)', border: '1px solid rgba(184,115,82,0.25)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--bronze)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <div>
            <div className="text-sm text-cream font-medium mb-1">How integrity verification works</div>
            <p className="text-xs text-cream2/60 font-light leading-relaxed max-w-2xl">
              When you upload a file, your browser computes a SHA-256 hash before sending. The server independently hashes the received bytes and compares. If they match, both hashes are stored. On every download, the server re-hashes and compares again. A mismatch shows a red tamper warning. For CSV files, you can label columns so the data is machine-readable for auditors.
            </p>
          </div>
        </div>
      </div>

      <EvidenceClient obligations={obligations as any[]} />
    </div>
  )
}
