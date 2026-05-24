'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getUserCompanyId, isDemoMode } from '@/lib/auth'
import { getObligationTemplates } from '@/lib/eu-ai-act-data'

export type SystemFormState = { error?: string; ok?: boolean } | undefined

const RISK_LEVELS = ['Unacceptable', 'High', 'Limited', 'Minimal'] as const
type Risk = (typeof RISK_LEVELS)[number]

export async function registerSystem(
  _prev: SystemFormState,
  formData: FormData
): Promise<SystemFormState> {
  const name = String(formData.get('name') || '').trim()
  const vendor = String(formData.get('vendor') || '').trim()
  const risk = String(formData.get('risk') || '') as Risk

  if (!name || !vendor || !risk) {
    return { error: 'Name, vendor, and risk level are required.' }
  }

  if (!RISK_LEVELS.includes(risk)) {
    return { error: 'Invalid risk level.' }
  }

  if (isDemoMode()) {
    return { error: 'Running in demo mode. Configure Supabase env vars to persist real data.' }
  }

  const supabase = createClient()
  const companyId = await getUserCompanyId()

  if (!companyId) {
    return { error: "You don't belong to a workspace yet." }
  }

  const { data: system, error: insertError } = await supabase
    .from('ai_systems')
    .insert({
      company_id: companyId,
      name,
      vendor,
      risk_level: risk,
      status: 'In review',
      score: 0,
    })
    .select('id')
    .single()

  if (insertError) return { error: insertError.message }

  // Seed real EU AI Act + GDPR obligations
  const templates = getObligationTemplates(risk)
  const obligations = templates.map(t => ({
    system_id: system.id,
    framework: t.framework,
    article: t.article,
    article_title: t.article_title,
    article_summary: t.article_summary,
    article_full_text: t.article_full_text,
    applicable_to: t.applicable_to,
    pct: 0,
  }))

  if (obligations.length > 0) {
    await supabase.from('obligations').insert(obligations)
  }

  const { data: { user } } = await supabase.auth.getUser()
  await supabase.from('activities').insert({
    company_id: companyId,
    actor: user?.id,
    action_type: 'system_register',
    text: `Registered AI system: ${name} (${risk} risk) — ${templates.length} EU AI Act obligations pre-loaded`,
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/systems')
  return { ok: true }
}
