'use client'

import { useState, useEffect } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { inviteMember, removeMember, deleteCompany } from '@/app/dashboard/actions'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'

function SubmitBtn({ label, danger }: { label: string; danger?: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className={`${danger ? '' : 'btn-primary'} !py-2.5 !px-5 text-[13px] disabled:opacity-60`}
      style={danger ? { background: 'rgba(212,90,90,0.15)', border: '1px solid rgba(212,90,90,0.4)', color: '#d45a5a', borderRadius: 10, padding: '8px 18px', fontSize: 13, cursor: 'pointer' } : {}}
    >
      {pending ? 'Working...' : label}
    </button>
  )
}

const ROLE_COLORS: Record<string, string> = {
  owner: 'bg-bronze/15 text-bronze-soft border-bronze/30',
  admin: 'bg-warn/15 text-warn border-warn/30',
  uploader: 'bg-sage/15 text-[#B5BFA3] border-sage/30',
  reviewer: 'bg-sage/15 text-[#B5BFA3] border-sage/30',
  auditor: 'bg-ash/50 text-cream2/70 border-ash2/50',
  viewer: 'bg-ash/30 text-cream2/50 border-ash/50',
}

export function TeamClient({ members, canInvite, currentUserId, currentRole }: {
  members: any[]
  canInvite: boolean
  currentUserId: string | null
  currentRole?: string | null
}) {
  const [open, setOpen] = useState(false)
  const [deleteWorkspaceOpen, setDeleteWorkspaceOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [inviteState, inviteAction] = useFormState(inviteMember, undefined)
  const [deleteCompanyState, deleteCompanyAction] = useFormState(deleteCompany, undefined)
  const router = useRouter()

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { if (inviteState?.ok) setOpen(false) }, [inviteState])
  useEffect(() => {
    if (deleteCompanyState?.ok) {
      router.push('/login')
    }
  }, [deleteCompanyState, router])

  const inviteModal = open ? (
    <div className="theme-dark" style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => setOpen(false)}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'rgba(28,22,18,0.82)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }} />
      <div onClick={e => e.stopPropagation()} style={{ position: 'relative', width: '100%', maxWidth: 480, borderRadius: 18, padding: 28, boxShadow: '0 24px 60px -20px rgba(0,0,0,0.6)', background: 'var(--coal2)', border: '1px solid var(--ash)' }}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <span className="eyebrow !text-cream2/60">Workspace</span>
            <h2 className="display-serif text-cream mt-2 leading-tight" style={{ fontSize: '1.5rem', fontWeight: 400 }}>
              Invite a <span className="italic font-light text-bronze">team member</span>
            </h2>
            <p className="text-xs text-cream2/60 mt-1.5 font-light">They will receive an email with a link to join this workspace.</p>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="text-cream2/60 hover:text-cream text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-coal3">×</button>
        </div>

        <form action={inviteAction} className="space-y-4">
          <div>
            <label className="eyebrow !text-cream2/60 block mb-2">Email address</label>
            <input name="email" type="email" placeholder="colleague@company.com" required className="w-full bg-coal border border-ash rounded-xl px-4 py-3 text-sm text-cream placeholder:text-cream2/40 focus:outline-none focus:border-bronze transition" />
          </div>
          <div>
            <label className="eyebrow !text-cream2/60 block mb-2">Role</label>
            <select name="role" defaultValue="reviewer" className="w-full bg-coal border border-ash rounded-xl px-4 py-3 text-sm text-cream focus:outline-none focus:border-bronze transition">
              <option value="admin">Admin — manage systems and invite members</option>
              <option value="uploader">Uploader — upload evidence files only</option>
              <option value="reviewer">Reviewer — review evidence, log oversight decisions</option>
              <option value="auditor">Auditor — read-only, can export reports</option>
              <option value="viewer">Viewer — read-only, no exports</option>
            </select>
          </div>
          {inviteState?.error && <div className="text-xs px-3 py-2.5 rounded-xl" style={{ background: 'rgba(181,96,78,0.10)', border: '1px solid rgba(181,96,78,0.30)', color: 'var(--danger)' }}>{inviteState.error}</div>}
          {inviteState?.ok && <div className="text-xs px-3 py-2.5 rounded-xl" style={{ background: 'rgba(127,139,111,0.10)', border: '1px solid rgba(127,139,111,0.30)', color: 'var(--sage)' }}>Invite sent to {inviteState.email}</div>}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="btn-ghost !py-2 !px-4 text-[13px]">Cancel</button>
            <SubmitBtn label="Send invite" />
          </div>
        </form>
      </div>
    </div>
  ) : null

  const deleteWorkspaceModal = deleteWorkspaceOpen ? (
    <div className="theme-dark" style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => setDeleteWorkspaceOpen(false)}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'rgba(28,22,18,0.82)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }} />
      <div onClick={e => e.stopPropagation()} style={{ position: 'relative', width: '100%', maxWidth: 440, borderRadius: 18, padding: 28, boxShadow: '0 24px 60px -20px rgba(0,0,0,0.6)', background: 'var(--coal2)', border: '1px solid rgba(212,90,90,0.3)' }}>
        <h2 className="display-serif text-cream mb-2" style={{ fontSize: '1.4rem', fontWeight: 400 }}>Delete workspace</h2>
        <p className="text-xs text-cream2/60 mb-5 font-light leading-relaxed">This will permanently delete all AI systems, obligations, evidence, and members. This cannot be undone.</p>
        <form action={deleteCompanyAction} className="space-y-4">
          <div>
            <label className="eyebrow !text-cream2/60 block mb-2">Type DELETE to confirm</label>
            <input name="confirm" placeholder="DELETE" required className="w-full bg-coal border border-ash rounded-xl px-4 py-3 text-sm text-cream placeholder:text-cream2/40 focus:outline-none transition" />
          </div>
          {deleteCompanyState?.error && <div className="text-xs px-3 py-2.5 rounded-xl" style={{ background: 'rgba(212,90,90,0.08)', border: '1px solid rgba(212,90,90,0.25)', color: '#d45a5a' }}>{deleteCompanyState.error}</div>}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={() => setDeleteWorkspaceOpen(false)} className="btn-ghost !py-2 !px-4 text-[13px]">Cancel</button>
            <SubmitBtn label="Delete workspace" danger />
          </div>
        </form>
      </div>
    </div>
  ) : null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="display-serif text-cream" style={{ fontSize: '1.25rem', fontWeight: 500 }}>
          {members.length} {members.length === 1 ? 'member' : 'members'}
        </div>
        {canInvite && (
          <button onClick={() => setOpen(true)} className="btn-primary !py-2.5 !px-5 text-[13px]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            Invite member
          </button>
        )}
      </div>

      {members.length === 0 ? (
        <div className="card !bg-coal2 !border-ash p-12 text-center text-sm text-cream2/60 font-light">
          {canInvite ? 'Invite your first team member to collaborate on compliance.' : 'No team members yet.'}
        </div>
      ) : (
        <div className="card !bg-coal2 !border-ash overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-cream2/60 font-mono border-b border-ash">
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-3 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium text-right">Joined</th>
                {canInvite && <th className="px-6 py-3 font-medium text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {members.map((m: any) => (
                <MemberRow key={m.user_id} member={m} currentUserId={currentUserId} canInvite={canInvite} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {currentRole === 'owner' && (
        <div className="card !bg-coal2 !border-ash p-6 mt-8">
          <div className="eyebrow !text-danger/70 mb-2">Danger zone</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-cream font-medium">Delete workspace</div>
              <div className="text-xs text-cream2/50 mt-0.5 font-light">Permanently delete all data. Cannot be undone.</div>
            </div>
            <button
              onClick={() => setDeleteWorkspaceOpen(true)}
              className="text-[13px] px-4 py-2 rounded-xl transition"
              style={{ background: 'rgba(212,90,90,0.08)', border: '1px solid rgba(212,90,90,0.25)', color: '#d45a5a' }}
            >
              Delete workspace
            </button>
          </div>
        </div>
      )}

      {mounted && inviteModal && createPortal(inviteModal, document.body)}
      {mounted && deleteWorkspaceModal && createPortal(deleteWorkspaceModal, document.body)}
    </div>
  )
}

function MemberRow({ member: m, currentUserId, canInvite }: { member: any; currentUserId: string | null; canInvite: boolean }) {
  const [state, action] = useFormState(removeMember, undefined)
  const isYou = m.user_id === currentUserId
  const isOwner = m.role === 'owner'

  return (
    <tr className="border-t border-ash/60 hover:bg-coal3/60 transition">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium text-coal flex-shrink-0" style={{ background: 'linear-gradient(135deg, var(--bronze) 0%, var(--bronze-deep) 100%)' }}>
            {m.user_id?.slice(0, 2).toUpperCase()}
          </div>
          <span className="text-cream text-xs font-mono">{m.user_id?.slice(0, 8)}...</span>
          {isYou && <span className="text-[10px] text-bronze px-1.5 py-0.5 rounded bg-bronze/10 border border-bronze/20">You</span>}
        </div>
      </td>
      <td className="px-3 py-4">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border ${ROLE_COLORS[m.role] || ROLE_COLORS.viewer}`}>
          {m.role}
        </span>
      </td>
      <td className="px-6 py-4 text-right text-xs text-cream2/60">
        {new Date(m.created_at).toLocaleDateString('en-IE', { day: '2-digit', month: 'short', year: 'numeric' })}
      </td>
      {canInvite && (
        <td className="px-6 py-4 text-right">
          {!isYou && !isOwner && (
            <form action={action}>
              <input type="hidden" name="userId" value={m.user_id} />
              <RemoveBtn />
            </form>
          )}
          {state?.error && <div className="text-[10px] text-danger mt-1">{state.error}</div>}
        </td>
      )}
    </tr>
  )
}

function RemoveBtn() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="text-[11px] px-3 py-1.5 rounded-lg transition disabled:opacity-40"
      style={{ background: 'rgba(212,90,90,0.08)', border: '1px solid rgba(212,90,90,0.2)', color: '#d45a5a' }}
      onClick={e => { if (!confirm('Remove this member from the workspace?')) e.preventDefault() }}
    >
      {pending ? 'Removing...' : 'Remove'}
    </button>
  )
}
