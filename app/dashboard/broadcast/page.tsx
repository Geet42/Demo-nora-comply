import { getUserContext, isDemoMode } from '@/lib/auth'
import { BroadcastClient } from './BroadcastClient'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function BroadcastPage() {
  if (!isDemoMode()) {
    const ctx = await getUserContext()
    if (!ctx || !['owner', 'admin'].includes(ctx.role)) {
      redirect('/dashboard')
    }
  }

  return (
    <div className="space-y-8 fade-in">
      <div>
        <span className="eyebrow">Admin</span>
        <h2 className="display-serif text-cream mt-3 leading-tight" style={{ fontSize: '2.4rem', fontWeight: 400 }}>
          Broadcast <span className="italic font-light text-bronze">email</span>
        </h2>
        <p className="text-sm text-cream2/70 max-w-2xl mt-3 font-light leading-relaxed">
          Send an email to all registered users in Nora Comply. Use for product updates, compliance reminders, or feature announcements.
        </p>
      </div>
      <BroadcastClient />
    </div>
  )
}
