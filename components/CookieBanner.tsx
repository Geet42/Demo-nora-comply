'use client'

import { useState, useEffect } from 'react'

const COOKIE_KEY = 'nora_cookie_consent'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COOKIE_KEY)
      if (!stored) setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  function accept(type: 'necessary' | 'all') {
    try {
      localStorage.setItem(COOKIE_KEY, JSON.stringify({ type, at: new Date().toISOString() }))
    } catch {}
    setVisible(false)

    // Log consent to DB (fire and forget)
    fetch('/api/cookie-consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analytics: type === 'all', marketing: false }),
    }).catch(() => {})
  }

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10000,
        width: 'calc(100% - 48px)',
        maxWidth: 560,
        background: 'var(--coal2)',
        border: '1px solid var(--ash)',
        borderRadius: 16,
        padding: '20px 24px',
        boxShadow: '0 20px 60px -10px rgba(0,0,0,0.7)',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
      className="theme-dark"
    >
      <div>
        <div className="eyebrow !text-cream2/60 mb-1.5">Cookie consent</div>
        <p className="text-xs text-cream2/70 font-light leading-relaxed">
          We use a single essential cookie to keep you signed in. We would also like to use anonymous analytics cookies to improve the product.{' '}
          <a href="/cookies" className="text-glacier-light underline underline-offset-2">Cookie policy</a>
        </p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => accept('all')}
          className="btn-primary !py-2 !px-4 text-[12px]"
        >
          Accept all
        </button>
        <button
          onClick={() => accept('necessary')}
          className="btn-ghost !py-2 !px-4 text-[12px]"
        >
          Necessary only
        </button>
      </div>
    </div>
  )
}
