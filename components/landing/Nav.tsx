"use client"
import Link from 'next/link'
import { Logo } from './Logo'

export function Nav() {
  return (
    <nav className="sticky top-0 z-50 px-6 lg:px-10 py-4"
      style={{ background: 'rgba(10,22,40,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(74,144,217,0.15)' }}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <LogoBlue />
        <div className="hidden md:flex items-center gap-8 text-sm">
          {['#product', '#compliance', '#process'].map((href, i) => (
            <a key={href} href={href} className="transition font-light"
              style={{ color: 'rgba(155,188,224,0.8)' }}
              onMouseOver={e => (e.currentTarget.style.color = '#dceeff')}
              onMouseOut={e => (e.currentTarget.style.color = 'rgba(155,188,224,0.8)')}>
              {['Product', 'Frameworks', 'Process'][i]}
            </a>
          ))}
          <a href="mailto:hello@noracomply.com" className="transition font-light"
            style={{ color: 'rgba(155,188,224,0.8)' }}
            onMouseOver={e => (e.currentTarget.style.color = '#dceeff')}
            onMouseOut={e => (e.currentTarget.style.color = 'rgba(155,188,224,0.8)')}>
            Contact
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden sm:inline text-sm font-light px-3 py-2 transition"
            style={{ color: 'rgba(155,188,224,0.8)' }}>
            Sign in
          </Link>
          <Link href="/login" className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium transition"
            style={{ background: 'rgba(74,144,217,0.15)', border: '1px solid rgba(74,144,217,0.35)', color: '#dceeff' }}>
            Start workspace
          </Link>
        </div>
      </div>
    </nav>
  )
}

// Blue-themed logo for dark nav
function LogoBlue() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="relative inline-flex items-center justify-center rounded-[10px] overflow-hidden"
        style={{ width: 30, height: 30, background: 'linear-gradient(140deg, #4a90d9 0%, #2563b0 55%, #1a3a6b 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25)' }}>
        <span className="display-serif italic relative z-10" style={{ fontSize: 15, fontWeight: 500, lineHeight: 1, color: '#fff' }}>n</span>
      </span>
      <span className="display-serif tracking-tight" style={{ fontSize: 17, fontWeight: 500, color: '#dceeff' }}>
        nora<span className="italic font-light" style={{ color: '#4a90d9' }}>.</span>comply
      </span>
    </Link>
  )
}
