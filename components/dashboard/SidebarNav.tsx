'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { label: 'Overview',    href: '/dashboard',             section: 'main' },
  { label: 'AI Systems',  href: '/dashboard/systems',     section: 'main' },
  { label: 'Obligations', href: '/dashboard/obligations', section: 'main' },
  { label: 'Oversight',   href: '/dashboard/oversight',   section: 'compliance' },
  { label: 'Evidence',    href: '/dashboard/evidence',    section: 'compliance' },
  { label: 'Law tracker', href: '/dashboard/law',         section: 'compliance' },
  { label: 'Team',        href: '/dashboard/team',        section: 'compliance' },
  { label: 'Reports',     href: '/dashboard/reports',     section: 'compliance' },
]

const ICONS: Record<string, JSX.Element> = {
  '/dashboard':             <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  '/dashboard/systems':     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
  '/dashboard/obligations': <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg>,
  '/dashboard/oversight':   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>,
  '/dashboard/evidence':    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>,
  '/dashboard/law':         <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  '/dashboard/team':        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  '/dashboard/reports':     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h12l4 4v12H4z"/><path d="M16 4v4h4"/><path d="M8 12h8M8 16h6"/></svg>,
}

export function SidebarNav({ pathname: _ignored }: { pathname: string }) {
  const pathname = usePathname()
  return (
    <>
      <NavSection title="Workspace"  items={nav.filter(n => n.section === 'main')}       pathname={pathname} />
      <NavSection title="Compliance" items={nav.filter(n => n.section === 'compliance')} pathname={pathname} />
    </>
  )
}

function NavSection({ title, items, pathname }: { title: string; items: typeof nav; pathname: string }) {
  return (
    <div className="mb-5">
      <div className="font-mono text-[10px] uppercase tracking-widest px-2.5 mb-2" style={{ color: '#2a4470' }}>{title}</div>
      <div className="space-y-0.5">
        {items.map(item => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] transition relative"
              style={{ background: active ? 'rgba(37,99,176,0.18)' : 'transparent', color: active ? '#dceeff' : 'rgba(155,188,224,0.7)', fontWeight: active ? 500 : 400 }}>
              {active && <span className="absolute left-0 top-[20%] h-[60%] w-[2px] rounded-r" style={{ background: '#4a90d9' }} />}
              {ICONS[item.href]}
              {item.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
