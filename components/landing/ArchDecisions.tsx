"use client"
const DECISIONS = [
  { n:'01', tag:'Changing laws',        title:'Living law system',           body:'Law text lives in the database, versioned with a supersedes pointer. When Art. 14 is amended, the old row stays — obligations pinned to it remain valid. New systems get the updated text. Nora checks EUR-Lex SPARQL monthly.', detail:'CELEX 32024R1689 · Monthly cron · Version-pinned obligations' },
  { n:'02', tag:'Human oversight',      title:'Decision log as evidence',     body:'For recruitment AI, every shortlist review is logged: AI recommendation, human decision, whether overridden and why. Override rate > 0% proves to auditors that humans are not rubber-stamping. Session reference + timestamp makes each entry tamper-evident.', detail:'Art. 14 · GDPR Art. 22 · Immutable log' },
  { n:'03', tag:'Document correctness', title:'SHA-256 integrity chain',      body:'Every uploaded file is hashed client-side before sending. Server rehashes and compares. Both hashes stored separately from the file. On download, rehashed again. Mismatch fires tamper warning. Version history is append-only — nothing can be deleted.', detail:'SHA-256 · Version append-only · Reg. version at upload' },
  { n:'04', tag:'Required templates',   title:'Risk-mapped document set',     body:'EU AI Act Annex IV and GDPR specify exactly which documents are required per risk level. High risk: risk assessment, DPIA, human oversight procedure, candidate transparency notice, technical documentation, ROPA, security policy. Each has guidance notes from the DPC.', detail:'Annex IV · DPC DPIA template · 6 mandatory documents' },
  { n:'05', tag:'Screening challenges', title:'Bias, Art. 22 + Art. 9 cross', body:'Recruitment AI has three compounding risks: (1) GDPR Art. 22 — automated decision-making rights require human review on request; (2) EU AI Act Art. 14 — override mechanism must exist and be used; (3) GDPR Art. 9 — special category data inferred from CVs needs explicit legal basis.', detail:'Art. 22 · Art. 14 · Art. 9 · Annex III.4' },
  { n:'06', tag:'Scalability',          title:'Multi-tenant from row one',    body:"Every table has company_id. Supabase Row Level Security means every query is automatically scoped — no application-layer filtering needed. Each company's evidence is path-isolated in storage. Adding the 1,000th tenant is the same as adding the first.", detail:'Supabase RLS · company_id isolation · Vercel edge' },
  { n:'07', tag:'Data + GDPR',          title:'Minimal, purposeful, disclosed', body:'Nora collects: company name and email (contract performance), uploaded compliance documents (contract), activity logs (legitimate interest), human decision logs (legal obligation — Art. 14). Never stores candidate names. All data EU-hosted. Cookie consent logged per session.', detail:'GDPR Art. 5 · data minimisation · EU-west-1 hosting' },
  { n:'08', tag:'Self-compliance',      title:'Nora complies with itself',    body:'If Nora uses AI features (e.g. compliance text generation), it registers them as Minimal risk in its own inventory. Content generation is not Annex III so only GDPR records apply. Irish DPC is the supervisory authority. No third-party audit needed at Minimal risk.', detail:'Art. 5 risk assessment · GDPR Art. 30 · DPC Ireland' },
  { n:'09', tag:'Cookie policy',        title:'Consent as compliance signal', body:'Nora stores one essential cookie (Supabase auth session — no consent required) and logs consent per session in the database. Cookie policy matters because your customers are compliance teams — if your own handling is sloppy, it undermines trust in everything else.', detail:'GDPR Art. 7 · essential vs analytics · consent log table' },
  { n:'10', tag:'App versions',         title:'Version pinning for audit trails', body:'Every evidence upload records which app version was running. Every obligation records which law version it was created under. An auditor looking at a 2025 evidence pack sees the exact law text and app version in force at that time.', detail:'app_versions table · regulation_version_at_upload · immutable trail' },
  { n:'11', tag:'vs Vanta / Drata',     title:'EU AI Act native, not bolted on', body:'Vanta and Drata are SOC 2 / ISO 27001 tools that added EU AI Act as a module. Nora was built specifically for Reg. (EU) 2024/1689 with Annex III employment AI as the primary use case. We have the Art. 14 human oversight log, the Art. 22 candidate notice, and Annex III.4 category selection. At a fraction of the price.', detail:'EU AI Act first · recruitment AI focus · mid-market pricing' },
]

export function ArchDecisions() {
  return (
    <section className="px-6 lg:px-10 py-32 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #e8f2fc 0%, #f4f8fd 100%)' }}>
      {/* Mountain silhouette */}
      <svg className="absolute bottom-0 left-0 right-0 w-full pointer-events-none" viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ opacity: 0.06 }}>
        <polygon points="0,80 160,30 340,55 520,15 700,45 880,12 1060,40 1240,18 1440,35 1440,80" fill="#0f2240"/>
      </svg>
      <div className="max-w-7xl mx-auto relative">
        <div className="mb-16 max-w-2xl">
          <span className="eyebrow" style={{ color: '#5c85b8' }}>Architectural decisions</span>
          <h2 className="display-serif text-ink mt-4 leading-[1.05]" style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', fontWeight: 400 }}>
            Every hard question,{' '}
            <span className="italic font-light" style={{ color: '#2563b0' }}>answered in the product.</span>
          </h2>
          <p className="font-light leading-relaxed mt-5" style={{ color: '#2a4a72' }}>Not a feature list. The actual engineering and legal decisions baked into how Nora works.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px rounded-3xl overflow-hidden"
          style={{ background: '#c8ddf2', border: '1px solid #c8ddf2' }}>
          {DECISIONS.map(d => (
            <div key={d.n} className="p-8 lg:p-9 relative group flex flex-col transition" style={{ background: '#fff' }}
              onMouseOver={e => (e.currentTarget.style.background = '#f4f8fd')}
              onMouseOut={e => (e.currentTarget.style.background = '#fff')}>
              <div className="flex items-baseline justify-between mb-4">
                <span className="display-serif italic" style={{ fontSize: 20, fontWeight: 400, color: '#2563b0' }}>{d.n}</span>
                <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: '#5c85b8' }}>{d.tag}</span>
              </div>
              <h3 className="display-serif text-ink mb-3 leading-tight flex-1" style={{ fontSize: 19, fontWeight: 500 }}>{d.title}</h3>
              <p className="text-sm font-light leading-relaxed" style={{ color: '#2a4a72' }}>{d.body}</p>
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid #c8ddf2' }}>
                <p className="font-mono text-[10px]" style={{ color: '#5c85b8' }}>{d.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
