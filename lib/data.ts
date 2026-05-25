import { createClient } from '@/lib/supabase/server'
import { getUserCompanyId, isDemoMode } from '@/lib/auth'
import { demoSystems, demoObligations, demoDeadlines, demoActivities, type System, type Obligation, type Activity } from '@/lib/demo-data'

export type { System, Obligation, Activity }
export type Deadline = { month: string; day: string; name: string; desc: string; urgency: 'Urgent' | 'Soon' | 'Upcoming' }

export type LawAlert = {
  id: string
  framework: string
  article: string
  alertType: 'amendment' | 'new_guidance' | 'enforcement_change' | 'review_due'
  title: string
  description: string
  sourceUrl?: string
  detectedAt: string
  reviewedByNora: boolean
}

export type Regulation = {
  id: string
  framework: string
  article: string
  title: string
  summary: string
  fullText: string
  frameworkVersion: string
  celexNumber?: string
  sourceUrl?: string
  effectiveDate?: string
  enforcementDate?: string
  isCurrent: boolean
  supersedes?: string
  changeSummary?: string
}

export type DocumentTemplate = {
  id: string
  name: string
  description: string
  appliesToRisk: string[]
  framework: string
  article: string
  templateType: string
  guidanceNotes?: string
  isMandatory: boolean
}

export async function fetchSystems(): Promise<System[]> {
  if (isDemoMode()) return demoSystems
  const companyId = await getUserCompanyId()
  if (!companyId) return []
  const supabase = createClient()
  const { data } = await supabase.from('ai_systems').select('id, name, vendor, risk_level, status, score').eq('company_id', companyId).order('created_at', { ascending: false })
  if (!data || data.length === 0) return []
  return data.map((r: any) => ({ id: r.id, name: r.name, vendor: r.vendor || 'Unknown vendor', risk: r.risk_level, status: r.status, score: r.score ?? 0 }))
}

export async function fetchObligations(): Promise<Obligation[]> {
  if (isDemoMode()) return demoObligations
  const companyId = await getUserCompanyId()
  if (!companyId) return []
  const supabase = createClient()
  const { data } = await supabase.from('obligations').select('id, framework, article, article_title, pct, law_changed_since_created, system_id, ai_systems!inner(company_id)').eq('ai_systems.company_id', companyId).order('pct', { ascending: true }).limit(8)
  if (!data) return []
  return data.map((r: any) => ({ id: r.id, name: r.article_title || r.article, framework: r.framework, article: r.article, pct: r.pct ?? 0 }))
}

export async function fetchAllObligations() {
  if (isDemoMode()) return demoObligations
  const companyId = await getUserCompanyId()
  if (!companyId) return []
  const supabase = createClient()
  const { data } = await supabase.from('obligations').select(`id, framework, article, article_title, article_summary, article_full_text, pct, due_at, notes, law_changed_since_created, law_change_reviewed, regulation_id, system_id, ai_systems!inner(id, name, company_id, risk_level)`).eq('ai_systems.company_id', companyId).order('pct', { ascending: true })
  if (!data) return []
  return data
}

export async function fetchActivities(): Promise<Activity[]> {
  if (isDemoMode()) return demoActivities
  const companyId = await getUserCompanyId()
  if (!companyId) return []
  const supabase = createClient()
  const { data } = await supabase.from('activities').select('text, created_at, action_type').eq('company_id', companyId).order('created_at', { ascending: false }).limit(6)
  if (!data) return []
  const palette = ['var(--bronze)', 'var(--sage)', 'var(--warn)', 'var(--bronze-deep)']
  return data.map((r: any, i: number) => ({ text: r.text, time: relativeTime(new Date(r.created_at)), color: palette[i % palette.length] }))
}

export async function fetchDeadlines(): Promise<Deadline[]> {
  if (isDemoMode()) return demoDeadlines
  const companyId = await getUserCompanyId()
  if (!companyId) return demoDeadlines
  const fixed: Deadline[] = [{ month: 'AUG', day: '02', name: 'EU AI Act high-risk obligations enforceable', desc: 'Art. 9, 12, 13, 14, 26 — Reg. (EU) 2024/1689', urgency: 'Urgent' }]
  const supabase = createClient()
  const { data } = await supabase.from('obligations').select('article_title, due_at, ai_systems!inner(name, company_id)').eq('ai_systems.company_id', companyId).not('due_at', 'is', null).order('due_at', { ascending: true }).limit(4)
  if (!data || data.length === 0) return fixed
  const db: Deadline[] = data.map((r: any) => {
    const d = new Date(r.due_at)
    return { month: d.toLocaleString('en-IE', { month: 'short' }).toUpperCase(), day: String(d.getDate()).padStart(2, '0'), name: r.article_title, desc: (r.ai_systems as any)?.name || '', urgency: getDueUrgency(d) }
  })
  return [...fixed, ...db].slice(0, 4)
}

export async function fetchTeamMembers() {
  if (isDemoMode()) return []
  const companyId = await getUserCompanyId()
  if (!companyId) return []
  const supabase = createClient()
  const { data } = await supabase.from('memberships').select('user_id, role, created_at').eq('company_id', companyId).order('created_at', { ascending: true })
  return data || []
}

export async function fetchHumanDecisions(systemId?: string) {
  if (isDemoMode()) return []
  const companyId = await getUserCompanyId()
  if (!companyId) return []
  const supabase = createClient()
  let q = supabase.from('human_decisions').select('*').eq('company_id', companyId).order('decided_at', { ascending: false }).limit(50)
  if (systemId) q = q.eq('system_id', systemId)
  const { data } = await q
  return data || []
}

// =========================================================================
// LIVING LAW FUNCTIONS
// =========================================================================

export async function fetchCurrentRegulations(framework?: string): Promise<Regulation[]> {
  const supabase = createClient()
  let q = supabase.from('regulations').select('*').eq('is_current', true).order('article')
  if (framework) q = q.eq('framework', framework)
  const { data } = await q
  return (data || []).map((r: any) => ({
    id: r.id, framework: r.framework, article: r.article, title: r.title,
    summary: r.summary, fullText: r.full_text, frameworkVersion: r.framework_version,
    celexNumber: r.celex_number, sourceUrl: r.source_url,
    effectiveDate: r.effective_date, enforcementDate: r.enforcement_date,
    isCurrent: r.is_current, supersedes: r.supersedes, changeSummary: r.change_summary,
  }))
}

export async function fetchRegulationHistory(article: string, framework: string): Promise<Regulation[]> {
  const supabase = createClient()
  const { data } = await supabase.from('regulations').select('*').eq('article', article).eq('framework', framework).order('created_at', { ascending: false })
  return (data || []).map((r: any) => ({
    id: r.id, framework: r.framework, article: r.article, title: r.title,
    summary: r.summary, fullText: r.full_text, frameworkVersion: r.framework_version,
    celexNumber: r.celex_number, sourceUrl: r.source_url,
    effectiveDate: r.effective_date, enforcementDate: r.enforcement_date,
    isCurrent: r.is_current, supersedes: r.supersedes, changeSummary: r.change_summary,
  }))
}

export async function fetchActiveLawAlerts(companyId?: string): Promise<LawAlert[]> {
  const supabase = createClient()
  const { data: alerts } = await supabase.from('law_update_alerts').select('*').eq('is_active', true).order('detected_at', { ascending: false })
  if (!alerts) return []

  // Filter out ones this company has already dismissed
  if (companyId) {
    const { data: dismissals } = await supabase.from('company_alert_dismissals').select('alert_id').eq('company_id', companyId)
    const dismissed = new Set((dismissals || []).map((d: any) => d.alert_id))
    return alerts.filter((a: any) => !dismissed.has(a.id)).map(mapAlert)
  }

  return alerts.map(mapAlert)
}

function mapAlert(r: any): LawAlert {
  return { id: r.id, framework: r.framework, article: r.article, alertType: r.alert_type, title: r.title, description: r.description, sourceUrl: r.source_url, detectedAt: r.detected_at, reviewedByNora: r.reviewed_by_nora }
}

export async function fetchDocumentTemplates(riskLevel?: string): Promise<DocumentTemplate[]> {
  const supabase = createClient()
  let q = supabase.from('document_templates').select('*').eq('is_mandatory', true).order('article')
  const { data } = await q
  if (!data) return []
  const templates = data.map((r: any) => ({
    id: r.id, name: r.name, description: r.description,
    appliesToRisk: r.applies_to_risk, framework: r.framework, article: r.article,
    templateType: r.template_type, guidanceNotes: r.guidance_notes, isMandatory: r.is_mandatory,
  }))
  if (riskLevel) return templates.filter(t => t.appliesToRisk.includes(riskLevel))
  return templates
}

export async function fetchObligationsWithLawChanges() {
  if (isDemoMode()) return []
  const companyId = await getUserCompanyId()
  if (!companyId) return []
  const supabase = createClient()
  const { data } = await supabase.from('obligations').select(`id, article, article_title, framework, law_changed_since_created, law_change_reviewed, regulation_id, system_id, ai_systems!inner(name, company_id)`).eq('ai_systems.company_id', companyId).eq('law_changed_since_created', true).eq('law_change_reviewed', false)
  return data || []
}

function relativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

function getDueUrgency(date: Date): 'Urgent' | 'Soon' | 'Upcoming' {
  const days = Math.floor((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (days <= 14) return 'Urgent'
  if (days <= 45) return 'Soon'
  return 'Upcoming'
}

export async function fetchHumanDecisionStats() {
  if (isDemoMode()) return { total: 0, overrides: 0 }
  const companyId = await getUserCompanyId()
  if (!companyId) return { total: 0, overrides: 0 }
  const supabase = createClient()
  const [{ count: total }, { count: overrides }] = await Promise.all([
    supabase.from('human_decisions').select('*', { count: 'exact', head: true }).eq('company_id', companyId),
    supabase.from('human_decisions').select('*', { count: 'exact', head: true }).eq('company_id', companyId).eq('did_override', true),
  ])
  return { total: total || 0, overrides: overrides || 0 }
}

export async function fetchHumanDecisionsPage(page = 0, pageSize = 50, systemId?: string) {
  if (isDemoMode()) return []
  const companyId = await getUserCompanyId()
  if (!companyId) return []
  const supabase = createClient()
  let q = supabase.from('human_decisions').select('*').eq('company_id', companyId).order('decided_at', { ascending: false }).range(page * pageSize, (page + 1) * pageSize - 1)
  if (systemId) q = q.eq('system_id', systemId)
  const { data } = await q
  return data || []
}

export async function fetchEvidence(obligationId?: string) {
  if (isDemoMode()) return []
  const companyId = await getUserCompanyId()
  if (!companyId) return []
  const supabase = createClient()
  let q = supabase
    .from('evidence')
    .select('id, file_name, file_type, file_size_bytes, content_hash, version, uploaded_at, review_status, obligation_id, obligations!inner(article, article_title, system_id, ai_systems!inner(name, company_id))')
    .eq('obligations.ai_systems.company_id', companyId)
    .order('uploaded_at', { ascending: false })
  if (obligationId) q = q.eq('obligation_id', obligationId)
  const { data } = await q
  return data || []
}
