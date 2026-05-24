const frameworks = ['EU AI Act · Reg. (EU) 2024/1689', 'GDPR · Reg. (EU) 2016/679', 'DPC Ireland', 'EUR-Lex SPARQL', 'ENISA Guidelines', 'OECD AI Principles', 'ISO 42001', 'NIST AI RMF']

export function TrustStrip() {
  return (
    <section className="py-6 overflow-hidden" style={{ background: '#f4f8fd', borderBottom: '1px solid #c8ddf2' }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-10">
          <span className="eyebrow whitespace-nowrap" style={{ color: '#5c85b8' }}>Mapped to</span>
          <div className="flex-1 overflow-hidden relative">
            <div className="flex gap-10 marquee">
              {[...frameworks, ...frameworks].map((f, i) => (
                <span key={i} className="text-sm whitespace-nowrap font-medium"
                  style={{ color: '#2a4a72', letterSpacing: '0.06em', fontVariant: 'small-caps' }}>
                  {f}
                </span>
              ))}
            </div>
            <div aria-hidden className="absolute inset-y-0 left-0 w-16 pointer-events-none" style={{ background: 'linear-gradient(to right, #f4f8fd, transparent)' }} />
            <div aria-hidden className="absolute inset-y-0 right-0 w-16 pointer-events-none" style={{ background: 'linear-gradient(to left, #f4f8fd, transparent)' }} />
          </div>
        </div>
      </div>
    </section>
  )
}
