const steps = [
  { week: 'Week 1', title: 'Inventory and risk-classify', body: 'Every AI system gets mapped to an EU AI Act risk class with reasoning recorded. Annex III category selected. Obligations pre-loaded from the official EUR-Lex text.' },
  { week: 'Week 2', title: 'Obligations and ownership', body: 'Article-level obligations land in the tracker. Each gets a named owner, a deadline, and the evidence template the regulator expects — Art. 14 human oversight first.' },
  { week: 'Week 3', title: 'First audit packet', body: 'Article 11 technical documentation, GDPR Article 30 records, and DPIA drafts generate from your data. SHA-256 stamped and ready for board review.' },
]

export function HowItWorks() {
  return (
    <section id="process" className="px-6 lg:px-10 py-32" style={{ background: '#f4f8fd' }}>
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mb-16">
          <span className="eyebrow" style={{ color: '#5c85b8' }}>Three weeks</span>
          <h2 className="display-serif text-ink mt-4 leading-[1.05]" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', fontWeight: 400, letterSpacing: '-0.01em' }}>
            From scattered notes to <span className="italic font-light" style={{ color: '#2563b0' }}>audit-ready</span>.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px rounded-3xl overflow-hidden" style={{ background: '#c8ddf2', border: '1px solid #c8ddf2' }}>
          {steps.map((s, i) => (
            <div key={s.week} className="p-9 lg:p-10 relative" style={{ background: '#fff' }}>
              <div className="flex items-center justify-between mb-6">
                <span className="eyebrow" style={{ color: '#2563b0' }}>{s.week}</span>
                <span className="display-serif italic tabular" style={{ fontSize: 28, fontWeight: 300, color: '#c8ddf2' }}>0{i + 1}</span>
              </div>
              <h3 className="display-serif text-ink mb-4 leading-tight" style={{ fontSize: 22, fontWeight: 500 }}>{s.title}</h3>
              <p className="text-sm font-light leading-relaxed" style={{ color: '#2a4a72' }}>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
