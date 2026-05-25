'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUserCompanyId, getUserContext, isDemoMode } from '@/lib/auth'
import { OBLIGATION_MAP, ANNEX_III_CATEGORIES, getObligationTemplates } from '@/lib/eu-ai-act-data'
import { revalidatePath } from 'next/cache'

export type RegisterState = { error?: string; ok?: boolean } | undefined

export async function registerSystem(_prev: RegisterState, formData: FormData): Promise<RegisterState> {
  const name = String(formData.get('name') || '').trim()
  const vendor = String(formData.get('vendor') || '').trim()
  const purpose = String(formData.get('purpose') || '').trim()
  const risk = String(formData.get('risk') || 'Limited') as 'Unacceptable' | 'High' | 'Limited' | 'Minimal'
  const annexCategory = String(formData.get('annexCategory') || '').trim()

  if (!name) return { error: 'System name is required.' }
  if (isDemoMode()) return { ok: true }

  const ctx = await getUserContext()
  if (!ctx?.companyId) return { error: 'Workspace not found.' }

  const admin = createAdminClient()
  const { data: system, error } = await admin.from('ai_systems').insert({
    company_id: ctx.companyId, name, vendor: vendor || null, purpose: purpose || null,
    risk_level: risk, annex_category: annexCategory || null,
    status: risk === 'High' || risk === 'Unacceptable' ? 'Action required' : 'In review',
    score: risk === 'Minimal' ? 75 : risk === 'Limited' ? 60 : 20,
  }).select('id').single()

  if (error || !system) return { error: error?.message || 'Could not register system.' }

  // Fetch current regulation rows from DB to pin obligations correctly
  const articles = OBLIGATION_MAP[risk] || []
  const { data: regs } = await admin.from('regulations').select('id, article, framework, title, summary, full_text, applies_to').eq('is_current', true).in('article', articles)
  const regsByKey = new Map((regs || []).map((r: any) => [`${r.framework}:${r.article}`, r]))

  const obligations: any[] = []
  for (const articleCode of articles) {
    const euReg = regsByKey.get(`EU AI Act:${articleCode}`)
    const gdprReg = regsByKey.get(`GDPR:${articleCode}`)
    const reg = euReg || gdprReg
    const framework = euReg ? 'EU AI Act' : 'GDPR'

    if (reg) {
      obligations.push({
        system_id: system.id, regulation_id: reg.id, framework,
        article: articleCode, article_title: reg.title,
        article_summary: reg.summary, article_full_text: reg.full_text,
        applicable_to: reg.applies_to, pct: 0,
      })
    } else {
      // Fallback to static data if DB not yet seeded
      const fallback = getObligationTemplates(risk).find(t => t.article === articleCode)
      if (fallback) {
        obligations.push({ system_id: system.id, regulation_id: null, framework: fallback.framework, article: fallback.article, article_title: fallback.article_title, article_summary: fallback.article_summary, article_full_text: fallback.article_full_text, applicable_to: fallback.applicable_to, pct: 0 })
      }
    }
  }

  if (obligations.length > 0) await admin.from('obligations').insert(obligations)

  await admin.from('activities').insert({
    company_id: ctx.companyId, actor: ctx.userId, action_type: 'system_register',
    text: `${name} registered (${risk} risk${annexCategory ? ', ' + annexCategory.split(' — ')[1] : ''}) — ${obligations.length} obligations pre-loaded`,
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/systems')
  revalidatePath('/dashboard/obligations')
  return { ok: true }
}

export type HumanDecisionState = { error?: string; ok?: boolean } | undefined

export async function logHumanDecision(_prev: HumanDecisionState, formData: FormData): Promise<HumanDecisionState> {
  if (isDemoMode()) return { error: 'Configure Supabase to log real decisions.' }
  const systemId = String(formData.get('systemId') || '').trim()
  const decisionContext = String(formData.get('decisionContext') || '').trim()
  const aiRecommendation = String(formData.get('aiRecommendation') || '').trim()
  const humanDecision = String(formData.get('humanDecision') || '').trim()
  const didOverride = formData.get('didOverride') === 'true'
  const overrideReason = String(formData.get('overrideReason') || '').trim()
  const candidateRef = String(formData.get('candidateRef') || '').trim()

  if (!systemId || !decisionContext || !humanDecision) return { error: 'System, context and decision are required.' }
  if (didOverride && !overrideReason) return { error: 'Please provide a reason for overriding the AI recommendation.' }

  const ctx = await getUserContext()
  if (!ctx) return { error: 'Not signed in.' }

  const supabase = createClient()
  const { error } = await supabase.from('human_decisions').insert({
    system_id: systemId, company_id: ctx.companyId, reviewer_id: ctx.userId,
    decision_context: decisionContext, ai_recommendation: aiRecommendation || null,
    human_decision: humanDecision, did_override: didOverride,
    override_reason: overrideReason || null, candidate_ref: candidateRef || null,
    session_ref: ctx.userId + '-' + Date.now(),
  })

  if (error) return { error: error.message }

  await supabase.from('activities').insert({
    company_id: ctx.companyId, actor: ctx.userId, action_type: 'human_decision',
    text: `Human oversight decision logged${didOverride ? ' — AI recommendation overridden' : ''}: ${decisionContext}`,
    metadata: { systemId, didOverride },
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/oversight')
  return { ok: true }
}

export type InviteMemberState = { error?: string; ok?: boolean; email?: string } | undefined

export async function inviteMember(_prev: InviteMemberState, formData: FormData): Promise<InviteMemberState> {
  if (isDemoMode()) return { error: 'Configure Supabase to invite real members.' }
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const role = String(formData.get('role') || 'viewer') as 'admin' | 'uploader' | 'reviewer' | 'auditor' | 'viewer'

  if (!email || !email.includes('@')) return { error: 'Valid email required.' }

  const ctx = await getUserContext()
  if (!ctx) return { error: 'Not signed in.' }
  if (!['owner', 'admin'].includes(ctx.role)) return { error: 'Only owners and admins can invite members.' }

  const admin = createAdminClient()
  const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { company_id: ctx.companyId, invited_role: role },
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://demo-nora-comply.vercel.app'}/dashboard`,
  })

  if (inviteError) return { error: inviteError.message }

  await admin.from('invitations').insert({ company_id: ctx.companyId, email, role, invited_by: ctx.userId })
  await admin.from('activities').insert({ company_id: ctx.companyId, actor: ctx.userId, action_type: 'member_invite', text: `${email} invited to workspace as ${role}`, metadata: { email, role } })

  revalidatePath('/dashboard/team')
  return { ok: true, email }
}

export type DeleteMemberState = { error?: string; ok?: boolean } | undefined

export async function removeMember(_prev: DeleteMemberState, formData: FormData): Promise<DeleteMemberState> {
  if (isDemoMode()) return { error: 'Configure Supabase to manage real members.' }
  const targetUserId = String(formData.get('userId') || '').trim()
  if (!targetUserId) return { error: 'User ID required.' }

  const ctx = await getUserContext()
  if (!ctx) return { error: 'Not signed in.' }
  if (!['owner', 'admin'].includes(ctx.role)) return { error: 'Only owners and admins can remove members.' }
  if (targetUserId === ctx.userId) return { error: 'You cannot remove yourself.' }

  const admin = createAdminClient()
  const { error } = await admin.from('memberships').delete().eq('user_id', targetUserId).eq('company_id', ctx.companyId)
  if (error) return { error: error.message }

  await admin.from('activities').insert({
    company_id: ctx.companyId, actor: ctx.userId, action_type: 'member_remove',
    text: `Member ${targetUserId.slice(0, 8)}... removed from workspace`,
  })

  revalidatePath('/dashboard/team')
  return { ok: true }
}

export type DeleteCompanyState = { error?: string; ok?: boolean } | undefined

export async function deleteCompany(_prev: DeleteCompanyState, formData: FormData): Promise<DeleteCompanyState> {
  if (isDemoMode()) return { error: 'Configure Supabase to delete real workspaces.' }
  const confirm = String(formData.get('confirm') || '').trim()
  if (confirm !== 'DELETE') return { error: 'Type DELETE to confirm.' }

  const ctx = await getUserContext()
  if (!ctx) return { error: 'Not signed in.' }
  if (ctx.role !== 'owner') return { error: 'Only the workspace owner can delete it.' }

  const admin = createAdminClient()
  const { error } = await admin.from('companies').delete().eq('id', ctx.companyId)
  if (error) return { error: error.message }

  return { ok: true }
}

export type BulkImportState = { error?: string; imported?: number; overrides?: number; ok?: boolean } | undefined

export async function bulkImportDecisions(_prev: BulkImportState, formData: FormData): Promise<BulkImportState> {
  if (isDemoMode()) return { error: 'Configure Supabase to import real decisions.' }

  const systemId = String(formData.get('systemId') || '').trim()
  const cycle = String(formData.get('cycle') || '').trim()
  const rawJson = String(formData.get('rowsJson') || '').trim()

  if (!systemId) return { error: 'Select an AI system.' }
  if (!rawJson) return { error: 'No rows found. Upload a valid CSV.' }

  let rows: any[]
  try {
    rows = JSON.parse(rawJson)
  } catch {
    return { error: 'Could not parse CSV data. Check the file format.' }
  }

  if (!Array.isArray(rows) || rows.length === 0) return { error: 'CSV has no data rows.' }
  if (rows.length > 200000) return { error: 'Maximum 200,000 rows per import.' }

  const ctx = await getUserContext()
  if (!ctx) return { error: 'Not signed in.' }

  const admin = createAdminClient()

  // Verify system belongs to this company
  const { data: sys } = await admin.from('ai_systems').select('id').eq('id', systemId).eq('company_id', ctx.companyId).single()
  if (!sys) return { error: 'System not found in this workspace.' }

  const sessionRef = `bulk-${cycle || 'import'}-${Date.now()}`

  const records = rows.map((r: any) => ({
    system_id: systemId,
    company_id: ctx.companyId,
    reviewer_id: ctx.userId,
    decision_context: String(r.decision_context || cycle || 'Bulk import').slice(0, 500),
    ai_recommendation: r.ai_recommendation ? String(r.ai_recommendation).slice(0, 500) : null,
    human_decision: String(r.human_decision || 'Reviewed').slice(0, 500),
    did_override: r.did_override === 'true' || r.did_override === true || r.did_override === 1,
    override_reason: r.override_reason ? String(r.override_reason).slice(0, 1000) : null,
    candidate_ref: r.candidate_ref ? String(r.candidate_ref).slice(0, 100) : null,
    session_ref: sessionRef,
  }))

  // Insert in batches of 1000 to avoid payload limits
  const BATCH = 1000
  for (let i = 0; i < records.length; i += BATCH) {
    const { error } = await admin.from('human_decisions').insert(records.slice(i, i + BATCH))
    if (error) return { error: `Batch ${Math.floor(i / BATCH) + 1} failed: ${error.message}` }
  }

  const overrides = records.filter(r => r.did_override).length

  await admin.from('activities').insert({
    company_id: ctx.companyId,
    actor: ctx.userId,
    action_type: 'bulk_oversight_import',
    text: `Bulk import — ${records.length.toLocaleString()} decisions logged, ${overrides.toLocaleString()} overrides (${cycle || 'no cycle label'})`,
    metadata: { systemId, total: records.length, overrides, cycle, sessionRef },
  })

  revalidatePath('/dashboard/oversight')
  revalidatePath('/dashboard')
  return { ok: true, imported: records.length, overrides }
}
