export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-paper text-ink px-6 lg:px-10 py-20">
      <div className="max-w-3xl mx-auto">
        <span className="eyebrow">Regulation (EU) 2016/679 · GDPR</span>
        <h1 className="display-serif text-ink mt-4 mb-8 leading-tight" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 400 }}>
          Privacy policy
        </h1>

        <div className="space-y-8">
          {[
            { title: 'Who we are', content: 'Nora Comply is a compliance software company incorporated in Ireland. We are the data controller for personal data processed through this platform. Our supervisory authority is the Data Protection Commission (DPC) of Ireland.' },
            { title: 'What data we collect and why',
              content: 'We collect only what is necessary for the service. Your email address and company name are required to create an account (legal basis: contract performance under GDPR Art. 6(1)(b)). Compliance documents you upload are processed to provide the service (contract). Activity logs and human oversight decision logs are processed as the product feature itself (contract). We never collect candidate names or personal data about third parties — only anonymised batch references.' },
            { title: 'What we do NOT collect',
              content: 'We do not collect real names of job candidates. We do not use AI to process personal data about your employees. We do not sell data. We do not use advertising cookies or trackers.' },
            { title: 'Where data is stored',
              content: 'All data is stored in Supabase eu-west-1 (Ireland) and served via Vercel\'s European edge network. No data is transferred outside the EEA without adequate safeguards.' },
            { title: 'Your rights under GDPR',
              content: 'You have the right to access, correct, delete, or port your data. You have the right to object to processing and to lodge a complaint with the DPC. To exercise any right, email privacy@noracomply.com. We will respond within 30 days.' },
            { title: 'Retention',
              content: 'Account data is retained for the duration of your subscription plus 90 days after cancellation. Activity logs and evidence uploads are retained per your compliance needs — you control deletion. Human oversight logs should be retained for a minimum of 6 months per EU AI Act Art. 26.' },
            { title: 'Automated decision-making',
              content: 'Nora does not make automated decisions about people. We process compliance data on behalf of your organisation. Any AI features in Nora are used to generate draft text for human review — no output is final without a human confirming it.' },
          ].map(s => (
            <section key={s.title}>
              <h2 className="display-serif text-ink mb-3" style={{ fontSize: '1.4rem', fontWeight: 500 }}>{s.title}</h2>
              <p className="text-ink2 font-light leading-relaxed">{s.content}</p>
            </section>
          ))}

          <div className="text-xs text-muted font-mono">Last updated: May 2026 · Nora Comply Ltd · Ireland · DPC registration pending</div>
        </div>
      </div>
    </main>
  )
}
