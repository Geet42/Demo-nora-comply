"use client"
import Link from 'next/link'

/* ─────────────────────────────────────────────────────────────
   Nora Comply — Hero
   • Real glacial-mountain photo backdrop (public/mountain-glacier.jpg)
     darkened + tinted to fit the night/glacial palette
   • CSS-only animations (slow photo "breathe", aurora opacity pulse,
     falling snow, dot pulse) — no per-frame canvas redraws
   • Single static linear gradient handles the clean fade-to-white
   ───────────────────────────────────────────────────────────── */

// Deterministic snow flake params (seeded by index so SSR & client agree).
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
    <section className="nora-hero">
      <style jsx>{`
        .nora-hero {
          position: relative;
          min-height: 100vh;
          background: radial-gradient(
            ellipse 110% 70% at 50% 0%,
            #0b1d36 0%,
            #07142a 45%,
            #05101e 100%
          );
          overflow: hidden;
          isolation: isolate;
        }

        .stars,
        .aurora,
        .mountain-photo,
        .mountain-tint,
        .mountain-wash,
        .snow,
        .merge {
          position: absolute;
          pointer-events: none;
        }

        /* tiny static stars */
        .stars {
          inset: 0;
          z-index: 1;
          background-image:
            radial-gradient(1px 1px at 18% 22%, rgba(255,255,255,0.55), transparent 60%),
            radial-gradient(1px 1px at 64% 11%, rgba(255,255,255,0.45), transparent 60%),
            radial-gradient(1px 1px at 33% 38%, rgba(255,255,255,0.35), transparent 60%),
            radial-gradient(1px 1px at 82% 28%, rgba(255,255,255,0.40), transparent 60%),
            radial-gradient(1px 1px at 48% 8%,  rgba(255,255,255,0.30), transparent 60%),
            radial-gradient(1px 1px at 7%  15%, rgba(255,255,255,0.30), transparent 60%),
            radial-gradient(1px 1px at 92% 18%, rgba(255,255,255,0.40), transparent 60%);
          background-repeat: no-repeat;
        }

        /* slow blue aurora wash */
        .aurora {
          inset: -10% 0 auto 12%;
          width: 80%;
          height: 65%;
          background:
            radial-gradient(ellipse 60% 50% at 70% 30%, rgba(74,144,217,0.28) 0%, transparent 65%),
            radial-gradient(ellipse 45% 40% at 25% 50%, rgba(43,99,176,0.22) 0%, transparent 70%);
          filter: blur(6px);
          z-index: 2;
          animation: nora-aurora 14s ease-in-out infinite;
          will-change: opacity;
        }
        @keyframes nora-aurora {
          0%, 100% { opacity: 0.55; }
          50%      { opacity: 1; }
        }

        /* the glacial photo, darkened and tinted */
        .mountain-photo {
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 68%;
          background-image: url('/mountain-glacier.png');
          background-position: center bottom;
          background-size: cover;
          background-repeat: no-repeat;
          z-index: 3;
          filter: brightness(0.55) contrast(1.05) saturate(0.85);
          transform: translate3d(0, 0, 0);
          animation: nora-breathe 28s ease-in-out infinite;
          will-change: transform;
          /* fade the top edge into the sky */
          -webkit-mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(0, 0, 0, 0.4) 6%,
            #000 14%,
            #000 100%
          );
          mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(0, 0, 0, 0.4) 6%,
            #000 14%,
            #000 100%
          );
        }
        @keyframes nora-breathe {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1.02); }
          50%      { transform: translate3d(-6px, -4px, 0) scale(1.04); }
        }

        /* navy overlay pushing the photo into the night palette */
        .mountain-tint {
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 68%;
          z-index: 4;
          background:
            linear-gradient(
              180deg,
              rgba(8, 22, 42, 0.55) 0%,
              rgba(10, 28, 56, 0.30) 25%,
              rgba(10, 28, 56, 0.18) 55%,
              rgba(6, 16, 32, 0.55) 100%
            ),
            linear-gradient(
              180deg,
              rgba(30, 76, 138, 0.18) 0%,
              rgba(30, 76, 138, 0.00) 60%
            );
          mix-blend-mode: multiply;
          -webkit-mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(0, 0, 0, 0.4) 6%,
            #000 14%,
            #000 100%
          );
          mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(0, 0, 0, 0.4) 6%,
            #000 14%,
            #000 100%
          );
        }

        /* cool-blue wash for the snow areas */
        .mountain-wash {
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 68%;
          z-index: 5;
          background: linear-gradient(
            180deg,
            rgba(74, 144, 217, 0.10) 0%,
            rgba(74, 144, 217, 0.05) 40%,
            rgba(43, 99, 176, 0.00) 100%
          );
          mix-blend-mode: screen;
          -webkit-mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(0, 0, 0, 0.4) 6%,
            #000 14%,
            #000 100%
          );
          mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(0, 0, 0, 0.4) 6%,
            #000 14%,
            #000 100%
          );
        }

        /* falling snow particles */
        .snow {
          inset: 0;
          z-index: 6;
          overflow: hidden;
        }
        .flake {
          position: absolute;
          top: -10px;
          border-radius: 50%;
          background: rgba(230, 242, 255, 0.85);
          box-shadow: 0 0 4px rgba(200, 225, 250, 0.5);
          will-change: transform, opacity;
          animation: nora-snowfall linear infinite;
        }
        @keyframes nora-snowfall {
          0%   { transform: translate3d(0, 0, 0); opacity: 0; }
          10%  { opacity: 0.9; }
          70%  { opacity: 0.55; }
          100% { transform: translate3d(28px, 100vh, 0); opacity: 0; }
        }

        /* bottom merge to white */
        .merge {
          left: 0;
          right: 0;
          bottom: 0;
          height: 28%;
          z-index: 7;
          background: linear-gradient(
            to bottom,
            rgba(244, 248, 253, 0)    0%,
            rgba(244, 248, 253, 0.10) 30%,
            rgba(244, 248, 253, 0.45) 65%,
            rgba(244, 248, 253, 0.90) 90%,
            rgba(244, 248, 253, 1)   100%
          );
        }

        /* content */
        .hero-inner {
          position: relative;
          z-index: 10;
          max-width: 1320px;
          margin: 0 auto;
          padding: 110px 40px 140px;
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1.05fr 1fr;
          gap: 80px;
          align-items: center;
        }
        @media (max-width: 1024px) {
          .hero-inner { grid-template-columns: 1fr; padding: 130px 24px 100px; }
          .dash-wrap { display: none; }
        }

        .tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border-radius: 999px;
          background: rgba(74, 144, 217, 0.12);
          border: 1px solid rgba(74, 144, 217, 0.28);
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #8bb8e8;
          width: fit-content;
          margin-bottom: 28px;
        }
        .tag .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ff6868;
          animation: nora-pulse 2.4s ease-out infinite;
        }
        @keyframes nora-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(255, 104, 104, 0.55); }
          70%  { box-shadow: 0 0 0 8px rgba(255, 104, 104, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 104, 104, 0); }
        }

        h1.heading {
          font-family: 'Fraunces', Georgia, serif;
          font-feature-settings: 'ss01', 'ss02';
          font-optical-sizing: auto;
          letter-spacing: -0.018em;
          text-wrap: balance;
          font-size: clamp(2.8rem, 5.4vw, 4.8rem);
          font-weight: 400;
          line-height: 1.02;
          color: #f0f8ff;
          margin: 0 0 22px;
        }
        h1.heading .accent { font-style: italic; font-weight: 300; color: #8abde8; }

        p.sub {
          font-size: clamp(1rem, 1.45vw, 1.13rem);
          font-weight: 300;
          line-height: 1.65;
          color: rgba(155, 188, 224, 0.88);
          margin: 0 0 36px;
          max-width: 560px;
        }

        .cta-row { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin-bottom: 44px; }

        .cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          background: rgba(255, 255, 255, 0.97);
          color: #0a1e3d;
          padding: 15px 28px;
          border-radius: 999px;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: -0.01em;
          text-decoration: none;
          border: 1px solid rgba(255, 255, 255, 1);
          box-shadow:
            0 1px 0 rgba(255,255,255,0.9) inset,
            0 0 0 1px rgba(200,225,255,0.25),
            0 6px 20px rgba(0,0,0,0.25),
            0 2px 8px rgba(255,255,255,0.15);
          transition: transform 0.18s cubic-bezier(0.2,0.8,0.2,1),
                      box-shadow 0.22s cubic-bezier(0.2,0.8,0.2,1),
                      background 0.15s ease;
          will-change: transform;
        }
        .cta-primary:hover {
          background: #fff;
          transform: translateY(-2px);
          box-shadow:
            0 1px 0 rgba(255,255,255,0.9) inset,
            0 0 0 1px rgba(200,225,255,0.30),
            0 12px 32px rgba(0,0,0,0.30),
            0 4px 14px rgba(255,255,255,0.20);
        }
        .cta-primary:active { transform: translateY(0); transition-duration: 0.08s; }
        .cta-primary .arrow {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(10,30,61,0.10);
          transition: transform 0.18s cubic-bezier(0.2,0.8,0.2,1),
                      background 0.18s ease;
          flex-shrink: 0;
        }
        .cta-primary:hover .arrow {
          transform: translateX(2px);
          background: rgba(10,30,61,0.16);
        }

        .cta-ghost {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: rgba(195, 220, 248, 0.90);
          font-size: 14px;
          font-weight: 400;
          letter-spacing: -0.005em;
          text-decoration: none;
          padding: 14px 20px;
          border-radius: 999px;
          border: 1px solid rgba(139, 184, 232, 0.22);
          background: rgba(74, 144, 217, 0.06);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          transition: color 0.18s ease,
                      border-color 0.18s ease,
                      background 0.18s ease,
                      transform 0.18s cubic-bezier(0.2,0.8,0.2,1);
          will-change: transform;
        }
        .cta-ghost:hover {
          color: #dceeff;
          border-color: rgba(139, 184, 232, 0.42);
          background: rgba(74, 144, 217, 0.12);
          transform: translateY(-1px);
        }
        .cta-ghost:active { transform: translateY(0); }

        .trust { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; max-width: 520px; }
        .trust-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.045);
          border: 1px solid rgba(139, 184, 232, 0.14);
          border-radius: 12px;
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
        }
        .trust-icon {
          width: 26px;
          height: 26px;
          flex-shrink: 0;
          border-radius: 7px;
          background: rgba(74, 144, 217, 0.14);
          border: 1px solid rgba(74, 144, 217, 0.22);
          display: grid;
          place-items: center;
          color: #8bb8e8;
        }
        .trust-icon :global(svg) { width: 13px; height: 13px; }
        .trust-text { font-size: 12px; font-weight: 500; color: #cde0f4; line-height: 1.25; }
        .trust-sub  { font-size: 11px; font-weight: 300; color: rgba(139, 184, 232, 0.6); margin-top: 2px; }

        .dash-wrap { position: relative; }
        .dash-glow {
          position: absolute;
          inset: -40px;
          border-radius: 32px;
          background: radial-gradient(
            ellipse 70% 55% at 50% 50%,
            rgba(74, 144, 217, 0.22) 0%,
            transparent 70%
          );
          pointer-events: none;
        }
        .dash-card {
          position: relative;
          background: rgba(10, 22, 42, 0.78);
          border: 1px solid rgba(74, 144, 217, 0.22);
          border-radius: 18px;
          overflow: hidden;
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-shadow: 0 28px 72px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(139, 184, 232, 0.09);
        }
        .dash-head {
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(30, 51, 88, 0.65);
        }
        .dash-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.12em;
          color: #4a7aaa;
        }
        .dash-label .dot { width: 6px; height: 6px; border-radius: 50%; background: #4a90d9; }
        .traffic { display: flex; gap: 6px; }
        .traffic span { width: 9px; height: 9px; border-radius: 50%; opacity: 0.75; }

        .stats { display: grid; grid-template-columns: repeat(3, 1fr); border-bottom: 1px solid rgba(30, 51, 88, 0.65); }
        .stat { padding: 16px 12px; text-align: center; }
        .stat + .stat { border-left: 1px solid rgba(30, 51, 88, 0.65); }
        .stat-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: #4a7aaa;
          letter-spacing: 0.08em;
          margin-bottom: 4px;
          text-transform: uppercase;
        }
        .stat-value {
          font-family: 'Fraunces', Georgia, serif;
          font-variant-numeric: tabular-nums;
          font-size: 1.95rem;
          font-weight: 400;
          line-height: 1;
        }
        .stat-note { font-size: 10px; color: #1e3458; margin-top: 4px; }

        .obligations { padding: 14px 20px; display: flex; flex-direction: column; gap: 12px; }
        .ob-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
        .ob-left { display: flex; align-items: center; gap: 10px; }
        .ob-art {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 4px;
          background: rgba(74, 144, 217, 0.12);
          color: #8bb8e8;
          border: 1px solid rgba(74, 144, 217, 0.18);
        }
        .ob-name { font-size: 12px; color: #9bbce0; }
        .ob-pct  { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #4a7aaa; }
        .bar {
          height: 3px;
          background: rgba(20, 40, 75, 0.85);
          border-radius: 999px;
          overflow: hidden;
        }
        .bar > i {
          display: block;
          height: 100%;
          border-radius: 999px;
          transform-origin: left center;
          animation: nora-fill 1.4s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }
        @keyframes nora-fill { from { transform: scaleX(0); } to { transform: scaleX(1); } }

        .alert {
          margin: 4px 20px 20px;
          padding: 10px 14px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(212, 90, 90, 0.07);
          border: 1px solid rgba(212, 90, 90, 0.18);
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #d45a5a;
        }
        .alert .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #d45a5a;
          flex-shrink: 0;
          animation: nora-pulse 2s infinite;
        }

        .floating-badge {
          position: absolute;
          right: -12px;
          bottom: -16px;
          background: #0a1828;
          border: 1px solid rgba(74, 144, 217, 0.25);
          border-radius: 12px;
          padding: 8px 12px;
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45);
        }
        .fb-cap {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: #4a7aaa;
          margin-bottom: 2px;
        }
        .fb-text { font-size: 12px; font-weight: 500; color: #8bb8e8; }

        /* entrance stagger */
        .anim-up {
          opacity: 0;
          transform: translateY(16px);
          animation: nora-in 0.9s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }
        .anim-up.d1 { animation-delay: 0.05s; }
        .anim-up.d2 { animation-delay: 0.18s; }
        .anim-up.d3 { animation-delay: 0.32s; }
        .anim-up.d4 { animation-delay: 0.46s; }
        .anim-up.d5 { animation-delay: 0.6s; }
        @keyframes nora-in { to { opacity: 1; transform: translateY(0); } }

        @media (prefers-reduced-motion: reduce) {
          .aurora, .flake, .bar > i, .tag .dot, .alert .dot, .anim-up, .mountain-photo {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* atmosphere */}
      <div className="stars" aria-hidden />
      <div className="aurora" aria-hidden />

      {/* mountain photo backdrop */}
      <div className="mountain-photo" aria-hidden />
      <div className="mountain-tint"  aria-hidden />
      <div className="mountain-wash"  aria-hidden />

      {/* falling snow */}
      <div className="snow" aria-hidden>
        {SNOW_FLAKES.map((f, i) => (
          <span
            key={i}
            className="flake"
            style={{
              left: `${f.left}%`,
              width: `${f.size.toFixed(2)}px`,
              height: `${f.size.toFixed(2)}px`,
              opacity: f.opacity,
              animationDuration: `${f.dur.toFixed(1)}s`,
              animationDelay: `${f.delay.toFixed(1)}s`,
            }}
          />
        ))}
      </div>

      {/* bottom merge */}
      <div className="merge" aria-hidden />

      {/* content */}
      <div className="hero-inner">
        {/* LEFT */}
        <div>
          <div className="tag anim-up d1">
            <span className="dot" />
            <span>{daysToDeadline} days · EU AI Act · 2 August 2026</span>
          </div>

          <h1 className="heading anim-up d2">
            EU AI Act compliance,{' '}
            <span className="accent">without the legal team.</span>
          </h1>

          <p className="sub anim-up d3">
            Nora maps every obligation from Regulation (EU) 2024/1689 to your AI systems,
            proves human oversight with tamper-evident logs, and alerts you when the law changes.
            Built for mid-market companies using AI in hiring.
          </p>

          <div className="cta-row anim-up d4">
            <Link href="/login" className="cta-primary">
              Start your compliance audit
              <span className="arrow" aria-hidden>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
            <Link href="/dashboard?demo=1" className="cta-ghost">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              View demo dashboard
            </Link>
          </div>

          <div className="trust anim-up d5">
            <div className="trust-item">
              <div className="trust-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 20l6-10 4 6 3-4 5 8H3z" />
                </svg>
              </div>
              <div>
                <div className="trust-text">Reg. (EU) 2024/1689</div>
                <div className="trust-sub">official article text in DB</div>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="11" width="16" height="10" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
              </div>
              <div>
                <div className="trust-text">SHA-256 verified</div>
                <div className="trust-sub">tamper-evident uploads</div>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v18" />
                  <path d="M5 8h14" />
                  <path d="M5 8l-3 6a5 5 0 0 0 6 0z" />
                  <path d="M19 8l-3 6a5 5 0 0 0 6 0z" />
                </svg>
              </div>
              <div>
                <div className="trust-text">GDPR-native</div>
                <div className="trust-sub">EU-region hosting, Ireland</div>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z" />
                  <path d="M10 21a2 2 0 0 0 4 0" />
                </svg>
              </div>
              <div>
                <div className="trust-text">EUR-Lex monitoring</div>
                <div className="trust-sub">monthly law change alerts</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="dash-wrap anim-up d4">
          <div className="dash-glow" aria-hidden />
          <div className="dash-card">
            <div className="dash-head">
              <div className="dash-label">
                <span className="dot" />
                NORA COMPLY · LIVE DASHBOARD
              </div>
              <div className="traffic">
                <span style={{ background: '#c0524e' }} />
                <span style={{ background: '#c49a3c' }} />
                <span style={{ background: '#4e9a60' }} />
              </div>
            </div>

            <div className="stats">
              <div className="stat">
                <div className="stat-label">Compliance</div>
                <div className="stat-value" style={{ color: '#e0a84a' }}>41%</div>
                <div className="stat-note">posture</div>
              </div>
              <div className="stat">
                <div className="stat-label">AI systems</div>
                <div className="stat-value" style={{ color: '#4a90d9' }}>5</div>
                <div className="stat-note">registered</div>
              </div>
              <div className="stat">
                <div className="stat-label">Open items</div>
                <div className="stat-value" style={{ color: '#d45a5a' }}>9</div>
                <div className="stat-note">obligations</div>
              </div>
            </div>

            <div className="obligations">
              {[
                { art: 'Art. 14', name: 'Human oversight',       pct: 22, color: '#d45a5a' },
                { art: 'Art. 26', name: 'Deployer obligations',  pct: 55, color: '#4a90d9' },
                { art: 'Art. 35', name: 'DPIA',                  pct: 33, color: '#d45a5a' },
                { art: 'Art. 30', name: 'Records of processing', pct: 90, color: '#5c9e8a' },
              ].map((o, idx) => (
                <div key={o.art}>
                  <div className="ob-head">
                    <div className="ob-left">
                      <span className="ob-art">{o.art}</span>
                      <span className="ob-name">{o.name}</span>
                    </div>
                    <span className="ob-pct">{o.pct}%</span>
                  </div>
                  <div className="bar">
                    <i
                      style={{
                        width: `${o.pct}%`,
                        background: o.color,
                        animationDelay: `${0.1 + idx * 0.15}s`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="alert">
              <span className="dot" />
              <span>{daysToDeadline}d · EU AI Act enforcement · Art. 14 incomplete</span>
            </div>
          </div>

          <div className="floating-badge">
            <div className="fb-cap">EUR-Lex · CELEX 32024R1689</div>
            <div className="fb-text">Law text versioned in DB</div>
          </div>
        </div>
      </div>
    </section>
  )
}
