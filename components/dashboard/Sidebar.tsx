import { getUserContext, isDemoMode } from '@/lib/auth'
import { signOut } from '@/app/login/actions'
import { SidebarNav } from './SidebarNav'
import Link from 'next/link'

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner', admin: 'Admin', uploader: 'Uploader',
  reviewer: 'Reviewer', auditor: 'Auditor', viewer: 'Viewer',
}

function cleanName(raw: string): string {
  if (!raw) return 'My workspace'
  const s = raw.trim()
  if (s.includes('@')) return 'My workspace'
  if (s.includes('.') && !s.includes(' ') && s.length < 20) return 'My workspace'
  if (!/\s/.test(s) && s.length < 12 && /[a-z][A-Z]/.test(s)) return 'My workspace'
  if (s === s.toUpperCase() && s.length < 8 && /^[A-Z]+$/.test(s)) return 'My workspace'
  return s
}

export async function Sidebar({ pathname }: { pathname: string }) {
  const ctx = !isDemoMode() ? await getUserContext() : null
  const email       = ctx?.email || ''
  const role        = ctx?.role  || 'owner'
  const initials    = ctx?.initials || 'DU'
  const companyName = cleanName(ctx?.companyName || 'My workspace')
  const displayName = email ? email.split('@')[0] : 'Demo user'

  return (
    <>
      {/* Mobile overlay toggle — pure CSS hack via checkbox */}
      <input type="checkbox" id="sidebar-toggle" className="peer sr-only" />

      {/* Mobile hamburger button */}
      <label
        htmlFor="sidebar-toggle"
        className="lg:hidden fixed top-4 left-4 z-50 w-9 h-9 flex items-center justify-center rounded-xl cursor-pointer"
        style={{ background: 'rgba(10,22,42,0.95)', border: '1px solid rgba(74,144,217,0.2)' }}
        aria-label="Toggle menu"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4a90d9" strokeWidth="2" strokeLinecap="round">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </label>

      {/* Overlay backdrop */}
      <label
        htmlFor="sidebar-toggle"
        className="lg:hidden fixed inset-0 z-30 hidden peer-checked:block"
        style={{ background: 'rgba(0,0,0,0.55)' }}
        aria-hidden
      />

      {/* Sidebar */}
      <aside
        className="fixed lg:static inset-y-0 left-0 z-40 w-60 flex-shrink-0 flex flex-col py-6 px-4 min-h-screen
                   -translate-x-full lg:translate-x-0 peer-checked:translate-x-0 transition-transform duration-200"
        style={{ background: '#070e1c', borderRight: '1px solid rgba(30,51,88,0.8)' }}
      >
        <style>{`.sb-signout:hover { background: rgba(30,51,88,0.5) !important; }`}</style>

        {/* Close button on mobile */}
        <label
          htmlFor="sidebar-toggle"
          className="lg:hidden absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg cursor-pointer"
          style={{ background: 'rgba(30,51,88,0.5)' }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9bbce0" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </label>

        {/* Logo */}
        <div className="pb-6 mb-5" style={{ borderBottom: '1px solid rgba(30,51,88,0.8)' }}>
          <Link href="/" className="flex items-center gap-2.5">
            <span
              className="relative inline-flex items-center justify-center rounded-[10px] overflow-hidden"
              style={{ width: 28, height: 28, background: 'linear-gradient(140deg, #4a90d9 0%, #2563b0 55%, #1a3a6b 100%)' }}
            >
              <span className="display-serif italic" style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>n</span>
            </span>
            <span className="display-serif" style={{ fontSize: 15, fontWeight: 500, color: '#dceeff' }}>
              nora<span className="italic font-light" style={{ color: '#4a90d9' }}>.</span>comply
            </span>
          </Link>
          <div className="font-mono text-[10px] mt-1.5 ml-9 uppercase tracking-widest" style={{ color: '#2a4470' }}>
            Compliance OS
          </div>
        </div>

        {companyName !== 'My workspace' && (
          <div className="mb-5 px-2.5">
            <div className="font-mono text-[11px] truncate" style={{ color: '#5a7fa8' }}>
              {companyName}
            </div>
          </div>
        )}

        <SidebarNav pathname={pathname} />

        {/* User / sign out */}
        <div className="mt-auto pt-4" style={{ borderTop: '1px solid rgba(30,51,88,0.8)' }}>
          <form action={signOut}>
            <button
              type="submit"
              className="sb-signout w-full flex items-center gap-3 px-2.5 py-2 rounded-xl cursor-pointer text-left transition-colors"
              style={{ background: 'transparent', color: '#9bbce0' }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #4a90d9 0%, #2563b0 100%)', color: '#fff' }}
              >
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium truncate" style={{ color: '#dceeff' }}>{displayName}</div>
                <div className="text-[11px]" style={{ color: '#5a7fa8' }}>{ROLE_LABELS[role]} · sign out</div>
              </div>
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
