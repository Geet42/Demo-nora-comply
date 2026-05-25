import { fetchTeamMembers } from '@/lib/data'
import { getUserContext, isDemoMode } from '@/lib/auth'
import { TeamClient } from './TeamClient'

export const dynamic = 'force-dynamic'

const ROLE_DESCRIPTIONS: Record<string, { label: string; can: string; cannot: string }> = {
  owner:    { label: 'Owner',    can: 'Everything including deleting the workspace', cannot: 'Nothing' },
  admin:    { label: 'Admin',    can: 'Register systems, invite members, approve evidence', cannot: 'Delete workspace' },
  uploader: { label: 'Uploader', can: 'Upload evidence files, log human decisions', cannot: 'Register systems, invite members, approve evidence' },
  reviewer: { label: 'Reviewer', can: 'Review and approve evidence, log oversight decisions, export reports', cannot: 'Upload evidence, register systems, invite members' },
  auditor:  { label: 'Auditor',  can: 'Read-only access to all data, export any report', cannot: 'Change any data' },
  viewer:   { label: 'Viewer',   can: 'View dashboard only', cannot: 'Upload, edit, export or change anything' },
}

export default async function TeamPage() {
  const [members, ctx] = await Promise.all([
    fetchTeamMembers(),
    isDemoMode() ? Promise.resolve(null) : getUserContext(),
  ])

  const canInvite = ctx?.role === 'owner' || ctx?.role === 'admin'

  return (
    <div className="space-y-8 fade-in">
      <div>
        <span className="eyebrow">Workspace</span>
        <h2 className="display-serif text-cream mt-3 leading-tight" style={{ fontSize: '2.4rem', fontWeight: 400 }}>
          Team <span className="italic font-light text-bronze">members</span>
        </h2>
        <p className="text-sm text-cream2/70 max-w-2xl mt-3 font-light leading-relaxed">
          Assign roles to control who can upload evidence, review AI decisions, and export compliance reports. Under EU AI Act Art. 14, at least one person must be designated as a reviewer with authority to override AI decisions.
        </p>
      </div>

      {/* Role reference */}
      <div className="card !bg-coal2 !border-ash overflow-hidden">
        <div className="px-6 py-4 border-b border-ash">
          <div className="eyebrow !text-cream2/60">Role reference</div>
        </div>
        <div className="divide-y divide-ash/60">
          {Object.entries(ROLE_DESCRIPTIONS).map(([role, desc]) => (
            <div key={role} className="px-6 py-3 flex items-start gap-4">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border min-w-[72px] justify-center mt-0.5" style={{ background: 'rgba(184,115,82,0.1)', border: '1px solid rgba(184,115,82,0.25)', color: 'var(--bronze-soft)' }}>
                {desc.label}
              </span>
              <div className="flex-1">
                <div className="text-xs text-cream2/80"><span className="text-sage">Can:</span> {desc.can}</div>
                <div className="text-xs text-cream2/50 mt-0.5"><span className="text-danger/80">Cannot:</span> {desc.cannot}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <TeamClient members={members} canInvite={canInvite} currentUserId={ctx?.userId || null} currentRole={ctx?.role || null} />
    </div>
  )
}
