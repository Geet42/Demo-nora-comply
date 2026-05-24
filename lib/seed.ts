import { createAdminClient } from '@/lib/supabase/admin'
import { OBLIGATION_MAP } from '@/lib/eu-ai-act-data'

export async function seedWorkspace(companyId: string, userId?: string) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return

  const admin = createAdminClient()
  const { count } = await admin.from('ai_systems').select('*', { count: 'exact', head: true }).eq('company_id', companyId)
  if ((count ?? 0) > 0) return

  const systems = [
    { company_id: companyId, name: 'Recruitment Screening Engine', vendor: 'Internal · Logistic regression + NLP', purpose: 'Automated shortlisting of job applicants based on CV parsing and behavioural scoring', risk_level: 'High', annex_category: 'Annex III.4 — Employment, worker management and access to self-employment', status: 'Action required', score: 41 },
    { company_id: companyId, name: 'Customer Support Assistant', vendor: 'OpenAI · GPT-4o', purpose: 'Conversational AI handling tier-1 customer support queries', risk_level: 'Limited', status: 'Compliant', score: 84 },
    { company_id: companyId, name: 'Credit Risk Scoring Model', vendor: 'Internal · XGBoost ensemble', purpose: 'Automated credit risk assessment for loan applications', risk_level: 'High', annex_category: 'Annex III.5 — Access to essential private services and benefits', status: 'In review', score: 62 },
    { company_id: companyId, name: 'Marketing Copy Generator', vendor: 'Anthropic · Claude 3.5', purpose: 'Generates first-draft marketing copy for human review and approval', risk_level: 'Minimal', status: 'Compliant', score: 91 },
    { company_id: companyId, name: 'Transaction Fraud Detection', vendor: 'Internal · Isolation forest + LSTM', purpose: 'Real-time detection of potentially fraudulent financial transactions', risk_level: 'High', annex_category: 'Annex III.5 — Access to essential private services and benefits', status: 'In review', score: 68 },
  ]

  const { data: createdSystems } = await admin.from('ai_systems').insert(systems).select('id, name, risk_level')
  if (!createdSystems?.length) return

  // Fetch real regulation rows from DB to pin obligations to
  const { data: regulationRows } = await admin.from('regulations').select('id, article, framework').eq('is_current', true)
  const regMap = new Map((regulationRows || []).map((r: any) => [`${r.framework}:${r.article}`, r.id]))

  const obligationRows: any[] = []
  for (const sys of createdSystems) {
    const articles = OBLIGATION_MAP[sys.risk_level] || []
    for (const articleCode of articles) {
      // Try EU AI Act first, then GDPR
      const euRegId = regMap.get(`EU AI Act:${articleCode}`)
      const gdprRegId = regMap.get(`GDPR:${articleCode}`)
      const regId = euRegId || gdprRegId
      const framework = euRegId ? 'EU AI Act' : 'GDPR'

      // Get article details from DB
      const { data: reg } = await admin.from('regulations').select('article, title, summary, full_text, applies_to').eq('id', regId || '').maybeSingle()
      if (!reg && !regId) continue

      obligationRows.push({
        system_id: sys.id,
        regulation_id: regId || null,
        framework,
        article: articleCode,
        article_title: reg?.title || articleCode,
        article_summary: reg?.summary || '',
        article_full_text: reg?.full_text || '',
        applicable_to: reg?.applies_to || [],
        pct: 0,
      })
    }
  }

  if (obligationRows.length > 0) {
    await admin.from('obligations').insert(obligationRows)
  }

  await admin.from('activities').insert([
    { company_id: companyId, actor: userId ?? null, action_type: 'system_register', text: 'Recruitment Screening Engine registered — High risk, Annex III.4 (Employment, worker management)' },
    { company_id: companyId, actor: userId ?? null, action_type: 'system_register', text: 'Workspace initialised — EU AI Act obligations pre-loaded from Regulation (EU) 2024/1689' },
    { company_id: companyId, actor: userId ?? null, action_type: 'obligation_update', text: 'Art. 14 (Human oversight) flagged as priority — enforcement deadline 2 August 2026' },
  ])
}
