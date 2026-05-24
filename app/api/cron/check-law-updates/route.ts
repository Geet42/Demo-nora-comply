/**
 * Cron: check-law-updates
 * Runs monthly. Queries EUR-Lex SPARQL for changes to tracked regulations.
 * Inserts law_update_alert rows and emails workspace owners on detection.
 * Does NOT automatically update law text — Nora team reviews first.
 */
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

const EURLEX_SPARQL = 'https://publications.europa.eu/webapi/sparql'
const TRACKED = [
  { celex: '32024R1689', name: 'EU AI Act', framework: 'EU AI Act' },
  { celex: '32016R0679', name: 'GDPR',      framework: 'GDPR' },
]

export async function GET(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const results: any[] = []

  for (const reg of TRACKED) {
    try {
      const query = `PREFIX cdm: <http://publications.europa.eu/ontology/cdm#>
SELECT ?date WHERE {
  ?work cdm:resource_legal_id_celex "${reg.celex}" ; cdm:work_date_document ?date .
} ORDER BY DESC(?date) LIMIT 1`

      const res = await fetch(
        `${EURLEX_SPARQL}?query=${encodeURIComponent(query)}&format=application%2Fsparql-results%2Bjson`,
        { headers: { Accept: 'application/sparql-results+json' }, signal: AbortSignal.timeout(10000) }
      )

      if (!res.ok) { results.push({ celex: reg.celex, status: 'eurlex_error' }); continue }

      const json = await res.json()
      const latestDate = json?.results?.bindings?.[0]?.date?.value
      if (!latestDate) { results.push({ celex: reg.celex, status: 'no_date' }); continue }

      const { data: stored } = await admin.from('regulations')
        .select('created_at').eq('celex_number', reg.celex).eq('is_current', true)
        .order('created_at', { ascending: false }).limit(1).maybeSingle()

      const storedDate = stored?.created_at ? new Date(stored.created_at) : null
      const isPotentialChange = storedDate ? new Date(latestDate) > storedDate : false

      if (isPotentialChange) {
        const { data: existing } = await admin.from('law_update_alerts').select('id')
          .eq('framework', reg.framework).eq('is_active', true).like('description', `%${latestDate}%`).maybeSingle()

        if (!existing) {
          const { data: alert } = await admin.from('law_update_alerts').insert({
            framework: reg.framework, article: 'Multiple articles', alert_type: 'amendment',
            title: `Possible ${reg.name} update detected`,
            description: `EUR-Lex shows a document dated ${latestDate} for ${reg.celex} (${reg.name}). This may be an amendment or corrigendum. A Nora team member will verify and update the law database within 5 business days.`,
            source_url: `https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:${reg.celex}`,
            reviewed_by_nora: false, is_active: true,
          }).select('id').single()

          if (alert) {
            await admin.from('obligations').update({ law_changed_since_created: true })
              .eq('framework', reg.framework).eq('law_change_reviewed', false)
            await notifyOwners(admin, reg.framework, latestDate, reg.celex)
          }
          results.push({ celex: reg.celex, status: 'alert_created', date: latestDate })
        } else {
          results.push({ celex: reg.celex, status: 'alert_exists' })
        }
      } else {
        results.push({ celex: reg.celex, status: 'no_change', latestDate })
      }
    } catch (err: any) {
      results.push({ celex: reg.celex, status: 'error', message: err.message })
    }
  }

  return NextResponse.json({ checked: TRACKED.length, results })
}

async function notifyOwners(admin: any, framework: string, date: string, celex: string) {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) return
  const { data: members } = await admin.from('memberships').select('user_id').in('role', ['owner', 'admin'])
  if (!members?.length) return
  const ids = [...new Set(members.map((m: any) => m.user_id))]
  const { data: usersData } = await admin.auth.admin.listUsers()
  const emails = (usersData?.users || []).filter((u: any) => ids.includes(u.id) && u.email).map((u: any) => u.email)
  if (!emails.length) return

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://demo-nora-comply.vercel.app'
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!, to: emails.slice(0, 50),
      subject: `Action required: Possible ${framework} update — review your obligations`,
      html: `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px;background:#FBF6EF;color:#221C16;border-radius:20px;border:1px solid #E6DDCE;">
        <div style="font-size:20px;font-weight:500;border-bottom:1px solid #E6DDCE;padding-bottom:14px;margin-bottom:20px;">nora<span style="color:#9A5A3D">.</span>comply</div>
        <h2 style="font-size:22px;margin:0 0 12px;font-weight:400;">Possible ${framework} update detected</h2>
        <p style="color:#5A4E42;line-height:1.7;">EUR-Lex shows a document dated <strong>${date}</strong> for ${celex}. This may be an amendment. Your existing obligations and evidence remain valid — they reference the law version in force when they were created.</p>
        <div style="background:#F2EBE0;border:1px solid rgba(184,115,82,0.3);border-radius:12px;padding:14px;margin:18px 0;font-family:system-ui;font-size:13px;color:#221C16;"><strong>Action:</strong> Review your flagged obligations in Nora. A Nora team member will verify the change within 5 business days.</div>
        <a href="${appUrl}/dashboard/law" style="display:inline-block;background:#221C16;color:#FBF6EF;padding:14px 26px;border-radius:999px;text-decoration:none;font-weight:500;font-family:system-ui;font-size:14px;">Review law updates &rarr;</a>
        <div style="margin-top:28px;font-family:monospace;font-size:11px;color:#8A7E70;border-top:1px solid #E6DDCE;padding-top:14px;">Nora Comply · Built in Ireland</div>
      </div>`,
    })
  } catch { /* non-fatal */ }
}
