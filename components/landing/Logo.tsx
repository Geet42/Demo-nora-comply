import Link from 'next/link'

export function Logo({ small = false }: { small?: boolean }) {
  const size = small ? 28 : 34
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <span className="relative inline-flex items-center justify-center rounded-[10px] overflow-hidden"
        style={{ width: size, height: size, background: 'linear-gradient(140deg, #4a90d9 0%, #2563b0 55%, #1a3a6b 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 1px 2px rgba(10,22,40,0.18)' }}>
        <span className="display-serif italic relative z-10" style={{ fontSize: small ? 14 : 17, fontWeight: 500, lineHeight: 1, color: '#fff' }}>n</span>
      </span>
      <span className="display-serif tracking-tight" style={{ fontSize: small ? 15 : 18, fontWeight: 500 }}>
        nora<span className="italic font-light" style={{ color: '#2563b0' }}>.</span>comply
      </span>
    </Link>
  )
}
