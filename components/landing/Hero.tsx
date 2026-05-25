"use client"
import Link from 'next/link'

const SNOW_FLAKES = Array.from({ length: 26 }, (_, i) => {
  const r1 = ((i * 9301 + 49297) % 233280) / 233280
  const r2 = ((i * 27583 + 13) % 9973) / 9973
  const r3 = ((i * 7919 + 31) % 6151) / 6151
  return {
    left: r1 * 100,
    dur: 14 + r2 * 16,
    delay: -r3 * (14 + r2 * 16),
    size: 1 + r2 * 1.6,
    opacity: 0.35 + r3 * 0.45,
  }
})

export function Hero() {
  const daysToDeadline = Math.max(
    0,
    Math.ceil((new Date('2026-08-02').getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  )

  return (
    <section style={{
      position: 'relative',
      minHeight: '100vh',
      background: 'radial-gradient(ellipse 110% 70% at 50% 0%, #0b1d36 0%, #07142a 45%, #05101e 100%)',
      overflow: 'hidden',
      isolation: 'isolate',
    }}>
      {/* Stars */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0, zIndex: 1,
        backgroundImage: `
          radial-gradient(1px 1px at 18% 22%, rgba(255,255,255,0.55), transparent 60%),
          radial-gradient(1px 1px at 64% 11%, rgba(255,255,255,0.45), transparent 60%),
          radial-gradient(1px 1px at 33% 38%, rgba(255,255,255,0.35), transparent 60%),
          radial-gradient(1px 1px at 82% 28%, rgba(255,255,255,0.40), transparent 60%),
          radial-gradient(1px 1px at 48% 8%,  rgba(255,255,255,0.30), transparent 60%),
          radial-gradient(1px 1px at 7%  15%, rgba(255,255,255,0.30), transparent 60%),
          radial-gradient(1px 1px at 92% 18%, rgba(255,255,255,0.40), transparent 60%)`,
        backgroundRepeat: 'no-repeat',
      }} />

      {/* Aurora */}
      <div aria-hidden className="aurora-layer" style={{
        position: 'absolute', top: '-10%', left: '12%',
        width: '80%', height: '65%', zIndex: 2,
        background: `
          radial-gradient(ellipse 60% 50% at 70% 30%, rgba(74,144,217,0.28) 0%, transparent 65%),
          radial-gradient(ellipse 45% 40% at 25% 50%, rgba(43,99,176,0.22) 0%, transparent 70%)`,
        filter: 'blur(6px)',
      }} />

      {/* Mountain photo */}
      <div aria-hidden style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        width: '100%', height: '68%', zIndex: 3,
        backgroundImage: "url('/mountain-glacier.png')",
        backgroundPosition: 'center bottom',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        filter: 'brightness(0.55) contrast(1.05) saturate(0.85)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 6%, #000 14%, #000 100%)',
        maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 6%, #000 14%, #000 100%)',
      }} />

      {/* Tint overlay */}
      <div aria-hidden style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        width: '100%', height: '68%', zIndex: 4,
        background: 'linear-gradient(180deg, rgba(8,22,42,0.55) 0%, rgba(10,28,56,0.18) 55%, rgba(6,16,32,0.55) 100%)',
        mixBlendMode: 'multiply',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 6%, #000 14%, #000 100%)',
        maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 6%, #000 14%, #000 100%)',
      }} />

      {/* Snow */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 6, overflow: 'hidden', pointerEvents: 'none' }}>
        {SNOW_FLAKES.map((f, i) => (
          <span key={i} className="snow-p" style={{
            position: 'absolute',
            top: -10,
            left: `${f.left}%`,
            width: `${f.size.toFixed(2)}px`,
            height: `${f.size.toFixed(2)}px`,
            borderRadius: '50%',
            background: 'rgba(230,242,255,0.85)',
            boxShadow: '0 0 4px rgba(200,225,250,0.5)',
            opacity: f.opacity,
            animationDuration: `${f.dur.toFixed(1)}s`,
            animationDelay: `${f.delay.toFixed(1)}s`,
          }} />
        ))}
      </div>

      {/* Bottom fade to white */}
      <div aria-hidden style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        height: '28%', zIndex: 7, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(244,248,253,0) 0%, rgba(244,248,253,0.10) 30%, rgba(244,248,253,0.45) 65%, rgba(244,248,253,0.90) 90%, rgba(244,248,253,1) 100%)',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 10,
        maxWidth: 1320, margin: '0 auto',
        padding: 'clamp(90px, 12vw, 110px) clamp(20px, 5vw, 40px) clamp(80px, 10vw, 140px)',
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: 'clamp(1fr, 50vw, 1.05fr) 1fr',
        gap: 'clamp(40px, 6vw, 80px)',
        alignItems: 'center',
      }}>
        {/* LEFT */}
        <div>
          {/* Tag */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 12px', borderRadius: 999,
            background: 'rgba(74,144,217,0.12)',
            border: '1px solid rgba(74,144,217,0.28)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
            color: '#8bb8e8', width: 'fit-content', marginBottom: 28,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: '#ff6868',
              display: 'inline-block', animation: 'pulse 2.4s ease-out infinite',
            }} />
            <span>{daysToDeadline} days · EU AI Act · 2 August 2026</span>
          </div>

          {/* Heading */}
          <h1 style={{
            fontFamily: "'Fraunces', Georgia, serif",
            letterSpacing: '-0.018em',
            fontSize: 'clamp(2.2rem, 5.4vw, 4.8rem)',
            fontWeight: 400, lineHeight: 1.02,
            color: '#f0f8ff', margin: '0 0 22px',
          }}>
            EU AI Act compliance,{' '}
            <span style={{ fontStyle: 'italic', fontWeight: 300, color: '#8abde8' }}>without the legal team.</span>
          </h1>

          {/* Subtext */}
          <p style={{
            fontSize: 'clamp(0.95rem, 1.45vw, 1.13rem)',
            fontWeight: 300, lineHeight: 1.65,
            color: 'rgba(155,188,224,0.88)',
            margin: '0 0 36px', maxWidth: 560,
          }}>
            Nora maps every obligation from Regulation (EU) 2024/1689 to your AI systems,
            proves human oversight with tamper-evident logs, and alerts you when the law changes.
            Built for mid-market companies using AI in hiring.
          </p>

          {/* CTA buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', marginBottom: 44 }}>
            <Link href="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: '#fff', color: '#0f2240',
              padding: '14px 26px', borderRadius: 999,
              fontSize: 15, fontWeight: 500, textDecoration: 'none',
              border: '1px solid rgba(255,255,255,0.95)',
              boxShadow: '0 4px 28px rgba(255,255,255,0.18)',
            }}>
              Start your compliance audit
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/dashboard?demo=1" style={{
              color: 'rgba(139,184,232,0.9)', fontSize: 14, fontWeight: 400,
              textDecoration: 'underline', textUnderlineOffset: 4,
            }}>
              View demo dashboard
            </Link>
          </div>

          {/* Trust grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 10, maxWidth: 520,
          }}>
            {[
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13}}><path d="M3 20l6-10 4 6 3-4 5 8H3z"/></svg>, title: 'Reg. (EU) 2024/1689', sub: 'official article text in DB' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13}}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>, title: 'SHA-256 verified', sub: 'tamper-evident uploads' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13}}><path d="M12 3v18"/><path d="M5 8h14"/><path d="M5 8l-3 6a5 5 0 0 0 6 0z"/><path d="M19 8l-3 6a5 5 0 0 0 6 0z"/></svg>, title: 'GDPR-native', sub: 'EU-region hosting, Ireland' },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{width:13,height:13}}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>, title: 'EUR-Lex monitoring', sub: 'monthly law change alerts' },
            ].map(t => (
              <div key={t.title} style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: '10px 12px',
                background: 'rgba(255,255,255,0.045)',
                border: '1px solid rgba(139,184,232,0.14)',
                borderRadius: 12,
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
              }}>
                <div style={{
                  width: 26, height: 26, flexShrink: 0, borderRadius: 7,
                  background: 'rgba(74,144,217,0.14)',
                  border: '1px solid rgba(74,144,217,0.22)',
                  display: 'grid', placeItems: 'center', color: '#8bb8e8',
                }}>{t.icon}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#cde0f4', lineHeight: 1.25 }}>{t.title}</div>
                  <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(139,184,232,0.6)', marginTop: 2 }}>{t.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — dashboard card, hidden on mobile */}
        <div style={{ position: 'relative' }} className="hero-dash-wrap">
          <div style={{
            position: 'absolute', inset: -40, borderRadius: 32,
            background: 'radial-gradient(ellipse 70% 55% at 50% 50%, rgba(74,144,217,0.22) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{
            position: 'relative',
            background: 'rgba(10,22,42,0.78)',
            border: '1px solid rgba(74,144,217,0.22)',
            borderRadius: 18, overflow: 'hidden',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            boxShadow: '0 28px 72px rgba(0,0,0,0.55), inset 0 1px 0 rgba(139,184,232,0.09)',
          }}>
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
                { label: 'Compliance', value: '41%', note: 'posture', color: '#e0a84a' },
                { label: 'AI systems', value: '5', note: 'registered', color: '#4a90d9' },
                { label: 'Open items', value: '9', note: 'obligations', color: '#d45a5a' },
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
              {[
                { art: 'Art. 14', name: 'Human oversight', pct: 22, color: '#d45a5a' },
                { art: 'Art. 26', name: 'Deployer obligations', pct: 55, color: '#4a90d9' },
                { art: 'Art. 35', name: 'DPIA', pct: 33, color: '#d45a5a' },
                { art: 'Art. 30', name: 'Records of processing', pct: 90, color: '#5c9e8a' },
              ].map(o => (
                <div key={o.art}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(74,144,217,0.12)', color: '#8bb8e8', border: '1px solid rgba(74,144,217,0.18)' }}>{o.art}</span>
                      <span style={{ fontSize: 12, color: '#9bbce0' }}>{o.name}</span>
                    </div>
                    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#4a7aaa' }}>{o.pct}%</span>
                  </div>
                  <div style={{ height: 3, background: 'rgba(20,40,75,0.85)', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${o.pct}%`, background: o.color, borderRadius: 999 }} />
                  </div>
                </div>
              ))}
            </div>
            {/* Alert */}
            <div style={{
              margin: '4px 20px 20px', padding: '10px 14px', borderRadius: 12,
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(212,90,90,0.07)', border: '1px solid rgba(212,90,90,0.18)',
              fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: '#d45a5a',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d45a5a', flexShrink: 0, display: 'inline-block', animation: 'pulse 2s infinite' }} />
              {daysToDeadline}d · EU AI Act enforcement · Art. 14 incomplete
            </div>
          </div>
          {/* Floating badge */}
          <div style={{
            position: 'absolute', right: -12, bottom: -16,
            background: '#0a1828', border: '1px solid rgba(74,144,217,0.25)',
            borderRadius: 12, padding: '8px 12px',
            boxShadow: '0 8px 28px rgba(0,0,0,0.45)',
          }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: '#4a7aaa', marginBottom: 2 }}>EUR-Lex · CELEX 32024R1689</div>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#8bb8e8' }}>Law text versioned in DB</div>
          </div>
        </div>
      </div>

      {/* Responsive styles via global class */}
      <style>{`
        @media (max-width: 1024px) {
          .hero-dash-wrap { display: none !important; }
        }
        @media (max-width: 640px) {
          section > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
            padding: 90px 20px 80px !important;
          }
        }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(255,104,104,0.55); }
          70% { box-shadow: 0 0 0 8px rgba(255,104,104,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,104,104,0); }
        }
        @keyframes snowfall {
          0% { transform: translate3d(0,0,0); opacity: 0; }
          10% { opacity: 0.9; }
          70% { opacity: 0.55; }
          100% { transform: translate3d(28px,100vh,0); opacity: 0; }
        }
        @keyframes aurora {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
      `}</style>
    </section>
  )
}
