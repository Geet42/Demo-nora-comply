export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-paper text-ink px-6 lg:px-10 py-20">
      <div className="max-w-3xl mx-auto">
        <span className="eyebrow">GDPR Art. 7 · ePrivacy Directive</span>
        <h1 className="display-serif text-ink mt-4 mb-8 leading-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400 }}>
          Cookie policy
        </h1>

        <div className="prose-nora space-y-8">
          <section>
            <h2 className="display-serif text-ink mb-3" style={{ fontSize: '1.4rem', fontWeight: 500 }}>What cookies Nora uses</h2>
            <p className="text-ink2 font-light leading-relaxed">Nora uses a single essential cookie to maintain your authenticated session. We do not use advertising, tracking, or analytics cookies.</p>
          </section>

          <div className="card p-6 space-y-4">
            {[
              { name: 'sb-[project]-auth-token', type: 'Essential', purpose: 'Supabase authentication session. Keeps you signed in across page loads.', duration: 'Session / up to 7 days', consentRequired: 'No — essential for the service to function' },
            ].map(c => (
              <div key={c.name} className="border-b border-line pb-4 last:border-0 last:pb-0">
                <div className="font-mono text-sm text-ink mb-1">{c.name}</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted">Type: </span><span className="font-medium text-ink">{c.type}</span></div>
                  <div><span className="text-muted">Consent: </span><span className="text-ink">{c.consentRequired}</span></div>
                  <div className="col-span-2"><span className="text-muted">Purpose: </span><span className="text-ink2">{c.purpose}</span></div>
                  <div><span className="text-muted">Duration: </span><span className="text-ink2">{c.duration}</span></div>
                </div>
              </div>
            ))}
          </div>

          <section>
            <h2 className="display-serif text-ink mb-3" style={{ fontSize: '1.4rem', fontWeight: 500 }}>If we add analytics in future</h2>
            <p className="text-ink2 font-light leading-relaxed">If Nora ever adds non-essential cookies (e.g. Posthog analytics), we will display a consent banner before setting any such cookies, log your consent decision in the database per GDPR Art. 7, and allow withdrawal at any time. This policy will be updated before that happens.</p>
          </section>

          <section>
            <h2 className="display-serif text-ink mb-3" style={{ fontSize: '1.4rem', fontWeight: 500 }}>Why this matters for our customers</h2>
            <p className="text-ink2 font-light leading-relaxed">Nora sells to compliance teams. If our own cookie handling is not in order, it undermines trust in everything else we do. Our cookie consent is logged per session in the <code className="font-mono text-bronze-deep text-sm">cookie_consents</code> table — a live example of GDPR Art. 7 consent records in practice.</p>
          </section>

          <section>
            <h2 className="display-serif text-ink mb-3" style={{ fontSize: '1.4rem', fontWeight: 500 }}>Contact</h2>
            <p className="text-ink2 font-light leading-relaxed">Questions about this policy: <a href="mailto:privacy@noracomply.com" className="text-bronze-deep hover:underline">privacy@noracomply.com</a>. Our supervisory authority is the Data Protection Commission of Ireland (dataprotection.ie).</p>
          </section>

          <div className="text-xs text-muted font-mono">Last updated: May 2026 · Nora Comply Ltd · Ireland</div>
        </div>
      </div>
    </main>
  )
}
