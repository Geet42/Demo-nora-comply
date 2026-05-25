"use client"
import Link from 'next/link'

const SNOW_FLAKES = Array.from({ length: 26 }, (_, i) => {
  const r1 = ((i * 9301 + 49297) % 233280) / 233280
  const r2 = ((i * 27583 + 13) % 9973) / 9973
  const r3 = ((i * 7919 + 31) % 6151) / 6151
  return { left: r1 * 100, dur: 14 + r2 * 16, delay: -r3 * (14 + r2 * 16), size: 1 + r2 * 1.6, opacity: 0.35 + r3 * 0.45 }
})

const TRUST = [
  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13}}><path d="M3 20l6-10 4 6 3-4 5 8H3z"/></svg>, title: 'Reg. (EU) 2024/1689', sub: 'official article text in DB' },
  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13}}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>, title: 'SHA-256 verified', sub: 'tamper-evident uploads' },
  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13}}><path d="M12 3v18"/><path d="M5 8h14"/><path d="M5 8l-3 6a5 5 0 0 0 6 0z"/><path d="M19 8l-3 6a5 5 0 0 0 6 0z"/></svg>, title: 'GDPR-native', sub: 'EU-region hosting, Ireland' },
  { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13}}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>, title: 'EUR-Lex monitoring', sub: 'monthly law change alerts' },
]

const OBS = [
  { art: 'Art. 14', name: 'Human oversight',       pct: 22, color: '#d45a5a' },
  { art: 'Art. 26', name: 'Deployer obligations',  pct: 55, color: '#4a90d9' },
  { art: 'Art. 35', name: 'DPIA',                  pct: 33, color: '#d45a5a' },
  { art: 'Art. 30', name: 'Records of processing', pct: 90, color: '#5c9e8a' },
]

export function Hero() {
  const days = Math.max(0, Math.ceil((new Date('2026-08-02').getTime() - Date.now()) / 86400000))

  return (
    <section className="nora-hero-section">
      <div className="nora-stars" aria-hidden />
      <div className="nora-aurora" aria-hidden />
      <div className="nora-mountain" aria-hidden />
      <div className="nora-tint" aria-hidden />
      <div className="nora-snow" aria-hidden>
        {SNOW_FLAKES.map((f, i) => (
          <span key={i} className="nora-flake" style={{
            left: `${f.left}%`,
            width: `${f.size.toFixed(2)}px`, height: `${f.size.toFixed(2)}px`,
            opacity: f.opacity,
            animationDuration: `${f.dur.toFixed(1)}s`,
            animationDelay: `${f.delay.toFixed(1)}s`,
          }} />
        ))}
      </div>
      <div className="nora-merge" aria-hidden />

      <div className="nora-hero-inner">
        {/* LEFT */}
        <div>
          <div className="nora-tag nora-anim-up nora-d1">
            <span className="nora-tag-dot" />
            <span>{days} days · EU AI Act · 2 August 2026</span>
          </div>

          <h1 className="nora-h1 nora-anim-up nora-d2">
            EU AI Act compliance,{' '}
            <span style={{ fontStyle: 'italic', fontWeight: 300, color: '#8abde8' }}>without the legal team.</span>
          </h1>

          <p className="nora-sub nora-anim-up nora-d3">
            Nora maps every obligation from Regulation (EU) 2024/1689 to your AI systems,
            proves human oversight with tamper-evident logs, and alerts you when the law changes.
            Built for mid-market companies using AI in hiring.
          </p>

          <div className="nora-cta-row nora-anim-up nora-d4">
            <Link href="/login" className="nora-cta-primary">
              Start your compliance audit
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/dashboard?demo=1" className="nora-cta-ghost">
              View demo dashboard
            </Link>
          </div>

          <div className="nora-trust nora-anim-up nora-d5">
            {TRUST.map(t => (
              <div key={t.title} className="nora-trust-item">
                <div className="nora-trust-icon">{t.icon}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#cde0f4', lineHeight: 1.25 }}>{t.title}</div>
                  <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(139,184,232,0.6)', marginTop: 2 }}>{t.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — dashboard mockup */}
        <div className="nora-dash-wrap nora-anim-up nora-d4">
          <div className="nora-dash-glow" aria-hidden />
          <div className="nora-dash-card">
            {/* Header */}
            <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(30,51,88,0.65)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: '0.12em', color: '#4a7aaa' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4a90d9', display: 'inline-block' }} />
                NORA COMPLY · LIVE DASHBOARD
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#c0524e','#c49a3c','#4e9a60'].map(c => <span key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c, opacity: 0.75, display: 'inline-block' }} />)}
              </div>
            </div>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderBottom: '1px solid rgba(30,51,88,0.65)' }}>
              {[
                { label: 'Compliance', value: '41%', note: 'posture',     color: '#e0a84a' },
                { label: 'AI systems', value: '5',   note: 'registered',  color: '#4a90d9' },
                { label: 'Open items', value: '9',   note: 'obligations', color: '#d45a5a' },
              ].map((s, i) => (
                <div key={s.label} style={{ padding: '16px 12px', textAlign: 'center', borderLeft: i > 0 ? '1px solid rgba(30,51,88,0.65)' : undefined }}>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#4a7aaa', letterSpacing: '0.08em', marginBottom: 4, textTransform: 'uppercase' }}>{s.label}</div>
                  <div style={{ fontFamily: "'Fraunces',Georgia,serif", fontSize: '1.95rem', fontWeight: 400, lineHeight: 1, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: '#1e3458', marginTop: 4 }}>{s.note}</div>
                </div>
              ))}
            </div>
            {/* Obligations */}
            <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {OBS.map((o, idx) => (
                <div key={o.art}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(74,144,217,0.12)', color: '#8bb8e8', border: '1px solid rgba(74,144,217,0.18)' }}>{o.art}</span>
                      <span style={{ fontSize: 12, color: '#9bbce0' }}>{o.name}</span>
                    </div>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#4a7aaa' }}>{o.pct}%</span>
                  </div>
                  <div style={{ height: 3, background: 'rgba(20,40,75,0.85)', borderRadius: 999, overflow: 'hidden' }}>
                    <div className="nora-bar-fill" style={{ width: `${o.pct}%`, background: o.color, animationDelay: `${0.1 + idx * 0.15}s` }} />
                  </div>
                </div>
              ))}
            </div>
            {/* Alert */}
            <div style={{ margin: '4px 20px 20px', padding: '10px 14px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(212,90,90,0.07)', border: '1px solid rgba(212,90,90,0.18)', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: '#d45a5a' }}>
              <span className="nora-tag-dot" style={{ background: '#d45a5a' }} />
              {days}d · EU AI Act enforcement · Art. 14 incomplete
            </div>
          </div>
          <div className="nora-float-badge">
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#4a7aaa', marginBottom: 2 }}>EUR-Lex · CELEX 32024R1689</div>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#8bb8e8' }}>Law text versioned in DB</div>
          </div>
        </div>
      </div>
    </section>
  )
}
