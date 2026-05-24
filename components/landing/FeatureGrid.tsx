"use client"
const features = [
  { n: '01', title: 'AI system registry', body: 'Every model, vendor, and pipeline in one place. Each gets a risk class with Annex III category selection and purpose documented.' },
  { n: '02', title: 'Obligation tracker', body: 'EU AI Act and GDPR obligations sourced from EUR-Lex official text. Structured tasks with owners, evidence, and deadlines.' },
  { n: '03', title: 'Evidence vault', body: 'SHA-256 hash on upload, verified on download. CSV column labelling makes AI scores and human decisions machine-readable for auditors.' },
  { n: '04', title: 'Human oversight log', body: 'Every AI shortlist review logged with AI recommendation, human decision, and override reason. Override rate is your Art. 14 metric.' },
  { n: '05', title: 'Living law tracker', body: 'Nora queries EUR-Lex monthly via SPARQL. If the EU AI Act is amended, affected obligations are flagged and you are emailed within 24 hours.' },
  { n: '06', title: 'Document templates', body: '6 mandatory documents for high-risk AI. DPIA, human oversight procedure, candidate notice, ROPA — with DPC guidance notes.' },
  { n: '07', title: 'Team and roles', body: 'Owner, admin, uploader, reviewer, auditor, viewer. Supabase invite emails. Evidence approval workflow. Art. 14 requires a named overseer.' },
  { n: '08', title: 'Audit-ready reports', body: 'PDF evidence packs with SHA-256 integrity stamps, the regulation version in force, and your obligation coverage at export time.' },
]

export function FeatureGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px rounded-3xl overflow-hidden"
      style={{ background: '#c8ddf2', border: '1px solid #c8ddf2' }}>
      {features.map(f => (
        <div key={f.n} className="p-7 lg:p-8 relative group transition" style={{ background: '#fff' }}
          onMouseOver={e => (e.currentTarget.style.background = '#f4f8fd')}
          onMouseOut={e => (e.currentTarget.style.background = '#fff')}>
          <div className="flex items-baseline justify-between mb-5">
            <span className="display-serif italic" style={{ fontSize: 20, fontWeight: 400, color: '#2563b0' }}>{f.n}</span>
            <span className="h-px flex-1 ml-4" style={{ background: '#c8ddf2' }} />
          </div>
          <h3 className="display-serif text-ink mb-2 leading-tight" style={{ fontSize: 17, fontWeight: 500 }}>{f.title}</h3>
          <p className="text-sm font-light leading-relaxed" style={{ color: '#2a4a72' }}>{f.body}</p>
        </div>
      ))}
    </div>
  )
}
