import { getUserContext, isDemoMode } from '@/lib/auth'
import { TopbarClient } from './TopbarClient'

export async function Topbar() {
  const ctx = !isDemoMode() ? await getUserContext() : null
  return <TopbarClient companyName={ctx?.companyName || 'Demo workspace'} />
}
