'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { RegisterSystemButton } from './RegisterSystemButton'
import Link from 'next/link'

export function TopbarClient({ companyName }: { companyName: string }) {
  const [synced, setSynced] = useState('just now')
  const searchParams = useSearchParams()
  const isDemo = searchParams.get('demo') === '1'

  // Clean display: never show raw email fragments or domain-derived strings.
  // If the stored name looks like an email fragment (no spaces, all lowercase,
  // contains no real words) fall back gracefully.
  const cleaned = cleanCompanyName(companyName)
  const displayName = isDemo ? 'Demo workspace' : cleaned

  useEffect(() => {
    const start = Date.now()
    const id = setInterval(() => {
      const sec = Math.floor((Date.now() - start) / 1000)
      if (sec < 5) setSynced('just now')
      else if (sec < 60) setSynced(`${sec}s ago`)
      else setSynced(`${Math.floor(sec / 60)}m ago`)
    }, 5000)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      className="sticky top-0 z-10 px-8 lg:px-10 flex items-center justify-between h-16"
      style={{
        background: 'rgba(7,14,28,0.88)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(30,51,88,0.8)',
      }}
    >
      <div className="flex items-center gap-3">
        <span
          className="display-serif"
          style={{ fontSize: '1.15rem', fontWeight: 500, color: '#dceeff' }}
        >
          {displayName}
        </span>
        {isDemo && (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono"
            style={{
              background: 'rgba(74,144,217,0.12)',
              color: '#4a90d9',
              border: '1px solid rgba(74,144,217,0.2)',
            }}
          >
            demo
          </span>
        )}
        {!isDemo && (
          <span
            className="hidden md:inline-flex items-center gap-1.5 text-xs pl-3 ml-1 font-mono"
            style={{ borderLeft: '1px solid rgba(30,51,88,0.8)', color: '#2a4470' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#5c9e8a' }} />
            Synced {synced}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/dashboard/reports"
          className="btn-ghost !py-2 !px-4 text-[13px]"
          style={{ color: '#9bbce0', borderColor: 'rgba(42,68,112,0.8)' }}
        >
          Export report
        </Link>
        <RegisterSystemButton />
      </div>
    </div>
  )
}

/**
 * Sanitises company names that were auto-generated from email domains.
 * Patterns we strip:
 *   - Pure email addresses          → 'My workspace'
 *   - Domain fragments  e.g. tj.ltd  → 'My workspace'
 *   - All-caps short strings < 5 ch → 'My workspace'
 *   - CamelCase from domain parts   → 'My workspace'
 */
function cleanCompanyName(raw: string): string {
  if (!raw) return 'My workspace'
  const s = raw.trim()
  // looks like an email
  if (s.includes('@')) return 'My workspace'
  // looks like a domain (contains dot, no spaces, short)
  if (s.includes('.') && !s.includes(' ') && s.length < 20) return 'My workspace'
  // CamelCase with no spaces and short — likely from email split e.g. "TjLtd"
  if (!/\s/.test(s) && s.length < 12 && /[a-z][A-Z]/.test(s)) return 'My workspace'
  // All-uppercase short string e.g. "TJLTD"
  if (s === s.toUpperCase() && s.length < 8 && /^[A-Z]+$/.test(s)) return 'My workspace'
  return s
}
