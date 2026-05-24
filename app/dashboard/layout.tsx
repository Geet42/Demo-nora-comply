import { Sidebar } from '@/components/dashboard/Sidebar'
import { Topbar } from '@/components/dashboard/Topbar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ background: '#070e1c', color: '#dceeff' }}>
      <Sidebar pathname="/dashboard" />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 px-8 lg:px-10 py-10 fade-in">{children}</main>
      </div>
    </div>
  )
}
