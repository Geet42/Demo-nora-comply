import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type UserRole = 'owner' | 'admin' | 'uploader' | 'reviewer' | 'auditor' | 'viewer'

export type UserContext = {
  userId: string
  companyId: string
  companyName: string
  email: string
  role: UserRole
  initials: string
}

export async function getUserContext(): Promise<UserContext | null> {
  if (isDemoMode()) return null
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: membership } = await supabase
    .from('memberships')
    .select('company_id, role, companies(name)')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (membership?.company_id) {
    const email = user.email || ''
    const name = (user.user_metadata?.full_name as string) || email.split('@')[0] || 'User'
    const parts = name.split(/\s+/)
    const initials =
      parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : name.slice(0, 2).toUpperCase()

    return {
      userId: user.id,
      companyId: membership.company_id,
      companyName: (membership.companies as any)?.name || 'My workspace',
      email,
      role: membership.role as UserRole,
      initials,
    }
  }

  // Bootstrap workspace
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return null

  try {
    const admin = createAdminClient()
    const companyName =
      (user.user_metadata?.company_name as string | undefined) ||
      'My workspace'

    const { data: company, error: companyErr } = await admin
      .from('companies')
      .insert({ name: companyName })
      .select('id')
      .single()

    if (companyErr || !company) return null

    await admin.from('memberships').insert({
      user_id: user.id,
      company_id: company.id,
      role: 'owner',
    })

    const { seedWorkspace } = await import('@/lib/seed')
    await seedWorkspace(company.id, user.id)

    const email = user.email || ''
    const emailUser = email.split('@')[0] || 'user'
    return {
      userId: user.id,
      companyId: company.id,
      companyName,
      email,
      role: 'owner',
      initials: emailUser.slice(0, 2).toUpperCase(),
    }
  } catch {
    return null
  }
}

export async function getUserCompanyId(): Promise<string | null> {
  const ctx = await getUserContext()
  return ctx?.companyId ?? null
}

export function isDemoMode(): boolean {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === '1') return true
  return (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

// Role permission helpers
export const ROLE_PERMISSIONS: Record<UserRole, {
  canUploadEvidence: boolean
  canReviewEvidence: boolean
  canRegisterSystems: boolean
  canInviteMembers: boolean
  canExportReports: boolean
  canLogHumanDecision: boolean
  canViewOnly: boolean
}> = {
  owner: {
    canUploadEvidence: true,
    canReviewEvidence: true,
    canRegisterSystems: true,
    canInviteMembers: true,
    canExportReports: true,
    canLogHumanDecision: true,
    canViewOnly: false,
  },
  admin: {
    canUploadEvidence: true,
    canReviewEvidence: true,
    canRegisterSystems: true,
    canInviteMembers: true,
    canExportReports: true,
    canLogHumanDecision: true,
    canViewOnly: false,
  },
  uploader: {
    canUploadEvidence: true,
    canReviewEvidence: false,
    canRegisterSystems: false,
    canInviteMembers: false,
    canExportReports: false,
    canLogHumanDecision: true,
    canViewOnly: false,
  },
  reviewer: {
    canUploadEvidence: false,
    canReviewEvidence: true,
    canRegisterSystems: false,
    canInviteMembers: false,
    canExportReports: true,
    canLogHumanDecision: true,
    canViewOnly: false,
  },
  auditor: {
    canUploadEvidence: false,
    canReviewEvidence: false,
    canRegisterSystems: false,
    canInviteMembers: false,
    canExportReports: true,
    canLogHumanDecision: false,
    canViewOnly: true,
  },
  viewer: {
    canUploadEvidence: false,
    canReviewEvidence: false,
    canRegisterSystems: false,
    canInviteMembers: false,
    canExportReports: false,
    canLogHumanDecision: false,
    canViewOnly: true,
  },
}
