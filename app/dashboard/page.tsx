import { headers } from 'next/headers'
import { fetchSystems, fetchObligations, fetchActivities, fetchDeadlines } from '@/lib/data'
import { StatCards } from '@/components/dashboard/StatCards'
import { SystemsTable } from '@/components/dashboard/SystemsTable'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { ObligationsList } from '@/components/dashboard/ObligationsList'
import { ScoreRing } from '@/components/dashboard/ScoreRing'
import { DeadlineList } from '@/components/dashboard/DeadlineList'
import { AlertBanner } from '@/components/dashboard/AlertBanner'
import { demoSystems, demoObligations, demoActivities, demoDeadlines } from '@/lib/demo-data'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // Check for ?demo=1 in the URL via the request URL
  // We detect demo mode from the referer or just use isDemoMode()
  const { isDemoMode } = await import('@/lib/auth')
  const isDemo = isDemoMode()

  const [systems, obligations, activities, deadlines] = isDemo
    ? [demoSystems, demoObligations, demoActivities, demoDeadlines]
    : await Promise.all([fetchSystems(), fetchObligations(), fetchActivities(), fetchDeadlines()])

  const overallScore =
    systems.length > 0
      ? Math.round(systems.reduce((sum, s) => sum + s.score, 0) / systems.length)
      : 73

  return (
    <div className="space-y-6 fade-in">
      <AlertBanner />
      <StatCards
        systemCount={systems.length}
        overallScore={overallScore}
        openObligations={obligations.filter(o => (o as any).pct < 100).length}
      />
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-4">
        <SystemsTable systems={systems} />
        <ActivityFeed activities={activities} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_1fr] gap-4">
        <ObligationsList obligations={obligations} />
        <ScoreRing pct={overallScore} />
        <DeadlineList deadlines={deadlines} />
      </div>
    </div>
  )
}
