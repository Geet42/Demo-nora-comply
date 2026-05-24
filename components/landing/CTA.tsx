import Link from 'next/link'

export function CTA() {
  return (
    <section className="px-6 lg:px-10 py-32 relative overflow-hidden"
      style={{ background: 'linear-gradient(170deg, #0a1628 0%, #0f2240 50%, #1a3a6b 100%)' }}>
      {/* Mini mountain ridge */}
      <svg className="absolute bottom-0 left-0 right-0 w-full pointer-events-none opacity-20" viewBox="0 0 1440 120" preserveAspectRatio="none">
        <polygon points="0,120 120,55 240,80 380,30 520,65 660,20 800,55 940,25 1080,60 1220,30 1360,65 1440,45 1440,120" fill="#4a90d9"/>
        <polygon points="0,120 0,95 180,80 340,60 500,85 660,45 820,75 980,50 1140,78 1300,55 1440,72 1440,120" fill="#2563b0" opacity="0.6"/>
      </svg>
      {/* Aurora */}
      <div className="aurora-layer absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 100% 50% at 80% 40%, rgba(74,144,217,0.15) 0%, transparent 60%)',
      }} />
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center">
          <span className="eyebrow" style={{ color: '#4a90d9' }}>Ready when you are</span>
          <h2 className="display-serif mt-5 mb-6 leading-[1.05]" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.6rem)', fontWeight: 400, color: '#f0f8ff' }}>
            Your first audit packet, <span className="italic font-light" style={{ color: '#8bb8e8' }}>three weeks from today</span>.
          </h2>
          <p className="font-light leading-relaxed max-w-xl mx-auto mb-10" style={{ fontSize: '1.1rem', color: 'rgba(155,188,224,0.85)' }}>
            Start a workspace and walk through your AI inventory. Obligations load automatically from the official EUR-Lex text. Art. 14 human oversight evidence trail starts on day one.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/login" className="btn-primary" style={{ background: '#fff', color: '#0f2240', borderColor: '#fff', boxShadow: '0 4px 24px rgba(255,255,255,0.15)' }}>
              Start your workspace
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </Link>
            <a href="mailto:hello@noracomply.com" className="btn-ghost" style={{ color: '#8bb8e8', borderColor: 'rgba(74,144,217,0.35)' }}>
              Book a 20-minute call
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
