import Link from 'next/link'

export function Footer() {
  return (
    <footer className="px-6 lg:px-10 py-16 relative overflow-hidden" style={{ background: '#070e1c', borderTop: '1px solid rgba(30,51,88,0.8)' }}>
      <svg className="absolute bottom-0 left-0 right-0 w-full pointer-events-none opacity-10" viewBox="0 0 1440 60" preserveAspectRatio="none">
        <polygon points="0,60 200,22 400,42 600,10 800,36 1000,8 1200,32 1440,18 1440,60" fill="#1e3358"/>
      </svg>

      <style>{`
        .footer-link { color: rgba(155,188,224,0.7); transition: color 0.2s; }
        .footer-link:hover { color: #dceeff; }
      `}</style>

      <div className="max-w-7xl mx-auto relative">
        <div className="flex flex-col lg:flex-row justify-between gap-10 mb-12">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="relative inline-flex items-center justify-center rounded-[10px] overflow-hidden"
                style={{ width: 28, height: 28, background: 'linear-gradient(140deg, #4a90d9 0%, #2563b0 55%, #1a3a6b 100%)' }}>
                <span className="display-serif italic" style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>n</span>
              </span>
              <span className="display-serif" style={{ fontSize: 16, fontWeight: 500, color: '#dceeff' }}>
                nora<span className="italic font-light" style={{ color: '#4a90d9' }}>.</span>comply
              </span>
            </div>
            <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(155,188,224,0.7)' }}>
              EU AI Act compliance for mid-market companies using AI in hiring. Built in Ireland.
            </p>
            <p className="font-mono text-[11px] mt-3" style={{ color: '#2a4470' }}>Regulation (EU) 2024/1689</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest mb-4" style={{ color: '#2a4470' }}>Product</div>
              <div className="space-y-2.5">
                <Link href="/dashboard?demo=1" className="footer-link block font-light">Demo dashboard</Link>
                <a href="/#product" className="footer-link block font-light">Features</a>
                <a href="/#compliance" className="footer-link block font-light">Compliance map</a>
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest mb-4" style={{ color: '#2a4470' }}>Law</div>
              <div className="space-y-2.5">
                <a href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1689" target="_blank" rel="noopener noreferrer" className="footer-link block font-light">EU AI Act · EUR-Lex</a>
                <a href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32016R0679" target="_blank" rel="noopener noreferrer" className="footer-link block font-light">GDPR · EUR-Lex</a>
                <a href="https://www.dataprotection.ie" target="_blank" rel="noopener noreferrer" className="footer-link block font-light">DPC Ireland</a>
              </div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest mb-4" style={{ color: '#2a4470' }}>Legal</div>
              <div className="space-y-2.5">
                <Link href="/privacy" className="footer-link block font-light">Privacy policy</Link>
                <Link href="/cookies" className="footer-link block font-light">Cookie policy</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-8" style={{ borderTop: '1px solid rgba(30,51,88,0.6)' }}>
          <p className="text-xs font-light" style={{ color: '#2a4470' }}>© 2026 Nora Comply Ltd · Ireland · Built for Regulation (EU) 2024/1689</p>
          <p className="font-mono text-[11px]" style={{ color: '#2a4470' }}>Not legal advice · Law text sourced from EUR-Lex</p>
        </div>
      </div>
    </footer>
  )
}
