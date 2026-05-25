// This route serves the printable HTML evidence document
// User opens /api/oversight-evidence-pdf?systemId=xxx and uses browser Print → Save as PDF
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserCompanyId } from '@/lib/auth'
import { isDemoMode } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const systemId = searchParams.get('systemId') || undefined
  const reviewerName = searchParams.get('reviewerName') || 'HR Panel'
  const cycleLabel = searchParams.get('cycle') || 'All cycles'

  if (isDemoMode()) {
    return new NextResponse('<h1>Configure Supabase to generate live evidence records.</h1>', { headers: { 'Content-Type': 'text/html' } })
  }

  const companyId = await getUserCompanyId()
  if (!companyId) return new NextResponse('<h1>Not signed in.</h1>', { headers: { 'Content-Type': 'text/html' }, status: 401 })

  const supabase = createClient()

  const { data: company } = await supabase.from('companies').select('name').eq('id', companyId).single()

  let systemName = 'All AI Systems', systemVendor = '', systemRisk = '', systemAnnex = ''
  if (systemId) {
    const { data: sys } = await supabase.from('ai_systems').select('name, vendor, risk_level, annex_category').eq('id', systemId).single()
    if (sys) { systemName = sys.name; systemVendor = sys.vendor || ''; systemRisk = sys.risk_level; systemAnnex = sys.annex_category || '' }
  }

  let q = supabase.from('human_decisions').select('*').eq('company_id', companyId).order('decided_at', { ascending: true })
  if (systemId) q = q.eq('system_id', systemId)
  const { data: decisions } = await q
  const all = decisions || []

  const total = all.length
  const overrides = all.filter((d: any) => d.did_override).length
  const overrideRate = total > 0 ? Math.round((overrides / total) * 100) : 0
  const overrideList = all.filter((d: any) => d.did_override)
  const manualList = all.filter((d: any) => !d.session_ref?.startsWith('bulk-'))
  const docRef = `NORA-ART14-${companyId.slice(0, 8).toUpperCase()}-${Date.now()}`
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-IE', { day: '2-digit', month: 'long', year: 'numeric' })
  const timeStr = now.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })

  function esc(s: string) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }
  function fmtDate(s: string) { return new Date(s).toLocaleDateString('en-IE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }

  const overrideRows = overrideList.map((d: any) => `
    <tr>
      <td>${esc(d.candidate_ref || 'N/A')}</td>
      <td>${esc(d.ai_recommendation || '')}</td>
      <td>${esc(d.human_decision || '')}</td>
      <td class="reason">${esc(d.override_reason || '')}</td>
      <td>${fmtDate(d.decided_at)}</td>
    </tr>`).join('')

  const manualRows = manualList.map((d: any) => `
    <div class="entry ${d.did_override ? 'override' : 'agreed'}">
      <div class="entry-header">
        <strong>${esc(d.candidate_ref || 'No reference')}</strong>
        <span class="badge ${d.did_override ? 'badge-override' : 'badge-agreed'}">${d.did_override ? 'AI Overridden' : 'Agreed with AI'}</span>
        <span class="entry-date">${fmtDate(d.decided_at)}</span>
      </div>
      <div class="entry-grid">
        <div class="entry-field"><div class="field-label">Decision context</div><div class="field-value">${esc(d.decision_context || '')}</div></div>
        <div class="entry-field"><div class="field-label">AI recommendation</div><div class="field-value">${esc(d.ai_recommendation || '')}</div></div>
        <div class="entry-field"><div class="field-label">Human decision</div><div class="field-value">${esc(d.human_decision || '')}</div></div>
        ${d.did_override && d.override_reason ? `<div class="entry-field override-reason"><div class="field-label">Override reason</div><div class="field-value">${esc(d.override_reason)}</div></div>` : ''}
      </div>
    </div>`).join('')

  const allRows = all.map((d: any) => `
    <tr class="${d.did_override ? 'row-override' : ''}">
      <td>${esc(d.candidate_ref || '')}</td>
      <td>${esc(d.decision_context || '').slice(0, 60)}${(d.decision_context || '').length > 60 ? '...' : ''}</td>
      <td>${esc(d.ai_recommendation || '')}</td>
      <td>${esc(d.human_decision || '')}</td>
      <td class="center">${d.did_override ? '<span class="badge badge-override">Override</span>' : '<span class="badge badge-agreed">Agreed</span>'}</td>
      <td>${fmtDate(d.decided_at)}</td>
    </tr>`).join('')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Human Oversight Evidence Record — ${esc(systemName)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10pt; color: #0a1628; background: white; }
  @page { size: A4; margin: 18mm 18mm 18mm 18mm; }
  @media print { .no-print { display: none; } body { font-size: 9pt; } }

  .no-print {
    position: fixed; bottom: 24px; right: 24px;
    background: #2563b0; color: white; border: none; border-radius: 10px;
    padding: 12px 22px; font-size: 13px; font-weight: 600; cursor: pointer;
    box-shadow: 0 4px 20px rgba(37,99,176,0.4);
    z-index: 100;
  }
  .no-print:hover { background: #1a4a8a; }

  .header { border-bottom: 2px solid #0f2240; padding-bottom: 14px; margin-bottom: 18px; }
  .header-top { display: flex; justify-content: space-between; align-items: flex-start; }
  .brand { font-size: 8pt; font-weight: 700; letter-spacing: 0.15em; color: #2563b0; text-transform: uppercase; margin-bottom: 4px; }
  .doc-title { font-size: 20pt; font-weight: 700; color: #0a1628; line-height: 1.1; }
  .doc-subtitle { font-size: 11pt; color: #2a4a72; margin-top: 3px; }
  .doc-ref { text-align: right; font-size: 8pt; color: #5c85b8; font-family: monospace; line-height: 1.6; }

  .legal-notice {
    background: #f0f6ff; border: 1px solid #c8ddf2; border-radius: 6px;
    padding: 10px 14px; margin-bottom: 18px; font-size: 8.5pt; color: #2a4a72; line-height: 1.5;
  }

  .section { margin-bottom: 20px; }
  .section-title {
    font-size: 10pt; font-weight: 700; color: #0a1628; text-transform: uppercase;
    letter-spacing: 0.08em; border-bottom: 1px solid #c8ddf2; padding-bottom: 5px; margin-bottom: 10px;
  }

  table { width: 100%; border-collapse: collapse; font-size: 8.5pt; }
  th { background: #0f2240; color: white; padding: 6px 8px; text-align: left; font-weight: 600; font-size: 8pt; }
  td { padding: 5px 8px; border-bottom: 1px solid #e8f2fc; vertical-align: top; }
  tr:nth-child(even) td { background: #f4f8fd; }
  tr.row-override td { background: #fffbf0; }
  td.reason { font-size: 8pt; color: #6a4a1a; font-style: italic; }
  td.center { text-align: center; }

  .meta-table td:first-child { font-weight: 700; width: 38%; color: #0a1628; }
  .meta-table td { border-bottom: 1px solid #e8f2fc; padding: 5px 8px; }

  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 18px; }
  .stat-card { border: 1px solid #c8ddf2; border-radius: 6px; padding: 10px 12px; background: #f4f8fd; }
  .stat-label { font-size: 7.5pt; color: #5c85b8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 3px; }
  .stat-value { font-size: 18pt; font-weight: 700; color: #0a1628; line-height: 1; }
  .stat-sub { font-size: 7.5pt; color: #5c85b8; margin-top: 2px; }

  .entry { border: 1px solid #c8ddf2; border-radius: 6px; margin-bottom: 8px; overflow: hidden; }
  .entry.override { border-color: #e8c990; }
  .entry-header { display: flex; align-items: center; gap: 10px; padding: 7px 10px; background: #0f2240; color: white; font-size: 8.5pt; }
  .entry-header strong { flex: 1; }
  .entry-date { font-size: 7.5pt; color: #8bb8e8; font-family: monospace; }
  .entry-grid { padding: 8px 10px; display: grid; grid-template-columns: 1fr 1fr; gap: 6px; background: white; }
  .entry.override .entry-grid { background: #fffbf0; }
  .entry-field { font-size: 8pt; }
  .entry-field.override-reason { grid-column: 1 / -1; }
  .field-label { font-weight: 700; color: #5c85b8; font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 2px; }
  .field-value { color: #0a1628; line-height: 1.4; }
  .override-reason .field-value { color: #7a4a10; font-style: italic; }

  .badge { display: inline-block; padding: 2px 7px; border-radius: 20px; font-size: 7.5pt; font-weight: 700; }
  .badge-override { background: rgba(180,120,40,0.15); color: #8a5a10; border: 1px solid rgba(180,120,40,0.3); }
  .badge-agreed { background: rgba(60,120,80,0.12); color: #1a5a30; border: 1px solid rgba(60,120,80,0.25); }

  .integrity-box {
    background: #f4f8fd; border: 1px solid #c8ddf2; border-radius: 6px;
    padding: 12px 14px; font-size: 8pt; color: #2a4a72; line-height: 1.6;
  }
  .integrity-box strong { color: #0a1628; }

  .signature-block {
    border: 1px solid #c8ddf2; border-radius: 6px; padding: 14px;
    display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 10px;
  }
  .sig-field { border-bottom: 1px solid #0a1628; padding-bottom: 20px; margin-bottom: 6px; }
  .sig-label { font-size: 8pt; color: #5c85b8; }

  .footer {
    margin-top: 24px; padding-top: 10px; border-top: 1px solid #c8ddf2;
    font-size: 7.5pt; color: #5c85b8; line-height: 1.5; text-align: center;
  }

  .page-break { page-break-before: always; }
</style>
</head>
<body>

<button class="no-print" onclick="window.print()">Save as PDF / Print</button>

<!-- HEADER -->
<div class="header">
  <div class="header-top">
    <div>
      <div class="brand">Nora Comply · Human Oversight Evidence Record</div>
      <div class="doc-title">${esc(systemName)}</div>
      <div class="doc-subtitle">${esc(company?.name || '')} · ${esc(cycleLabel)}</div>
    </div>
    <div class="doc-ref">
      Document ref: ${docRef}<br>
      Generated: ${dateStr} at ${timeStr}<br>
      Reviewer: ${esc(reviewerName)}<br>
      Regulation: Reg. (EU) 2024/1689 Art. 14
    </div>
  </div>
</div>

<!-- LEGAL NOTICE -->
<div class="legal-notice">
  <strong>Legal basis:</strong> This record constitutes evidence of human oversight compliance under Article 14 of Regulation (EU) 2024/1689 (EU AI Act) and Article 22 of Regulation (EU) 2016/679 (GDPR). It documents that a natural person with appropriate competence and authority reviewed AI-generated recommendations, retained the ability to override AI decisions, and that all overrides have been recorded with written reasons. This record is generated from tamper-evident, timestamped database entries and may be presented to supervisory authorities including the Data Protection Commission of Ireland as evidence of compliance.
</div>

<!-- SECTION 1: SYSTEM & METADATA -->
<div class="section">
  <div class="section-title">1. AI system details</div>
  <table class="meta-table">
    <tr><td>AI system name</td><td>${esc(systemName)}</td></tr>
    <tr><td>Vendor</td><td>${esc(systemVendor || 'Internal deployment')}</td></tr>
    <tr><td>Risk classification</td><td>${esc(systemRisk)} risk — ${esc(systemAnnex || 'EU AI Act Annex III')}</td></tr>
    <tr><td>Deploying organisation</td><td>${esc(company?.name || '')}</td></tr>
    <tr><td>Oversight reviewer</td><td>${esc(reviewerName)}</td></tr>
    <tr><td>Review cycle</td><td>${esc(cycleLabel)}</td></tr>
    <tr><td>Applicable regulation</td><td>Regulation (EU) 2024/1689 — EU AI Act, Art. 14 · Regulation (EU) 2016/679 — GDPR, Art. 22</td></tr>
    <tr><td>Enforcement date</td><td>2 August 2026</td></tr>
  </table>
</div>

<!-- SECTION 2: STATS -->
<div class="section">
  <div class="section-title">2. Decision summary</div>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">Total decisions</div>
      <div class="stat-value">${total.toLocaleString()}</div>
      <div class="stat-sub">logged in Nora</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">AI overrides</div>
      <div class="stat-value">${overrides.toLocaleString()}</div>
      <div class="stat-sub">human changed AI recommendation</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Override rate</div>
      <div class="stat-value">${overrideRate}%</div>
      <div class="stat-sub">of all decisions reviewed</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Agreed with AI</div>
      <div class="stat-value">${(total - overrides).toLocaleString()}</div>
      <div class="stat-sub">human confirmed AI recommendation</div>
    </div>
  </div>
</div>

<!-- SECTION 3: OVERRIDE LOG -->
<div class="section">
  <div class="section-title">3. Override decisions — full log (${overrides} records)</div>
  ${overrides === 0 ? '<p style="color:#5c85b8;font-size:9pt;">No overrides recorded in this cycle.</p>' : `
  <table>
    <thead>
      <tr>
        <th style="width:14%">Candidate ref</th>
        <th style="width:14%">AI recommended</th>
        <th style="width:14%">Human decided</th>
        <th style="width:40%">Override reason</th>
        <th style="width:18%">Date</th>
      </tr>
    </thead>
    <tbody>${overrideRows}</tbody>
  </table>`}
</div>

<!-- SECTION 4: MANUAL ENTRIES -->
${manualList.length > 0 ? `
<div class="section page-break">
  <div class="section-title">4. Manual oversight entries (${manualList.length} records)</div>
  ${manualRows}
</div>` : ''}

<!-- SECTION 5: FULL DECISION LOG -->
<div class="section page-break">
  <div class="section-title">${manualList.length > 0 ? '5' : '4'}. Complete decision log (${total} records)</div>
  <table>
    <thead>
      <tr>
        <th style="width:13%">Candidate ref</th>
        <th style="width:22%">Context</th>
        <th style="width:15%">AI recommendation</th>
        <th style="width:18%">Human decision</th>
        <th style="width:12%">Override</th>
        <th style="width:20%">Date &amp; time</th>
      </tr>
    </thead>
    <tbody>${allRows}</tbody>
  </table>
</div>

<!-- SECTION 6: INTEGRITY -->
<div class="section">
  <div class="section-title">${manualList.length > 0 ? '6' : '5'}. Data integrity statement</div>
  <div class="integrity-box">
    <strong>Storage:</strong> All records stored in Supabase PostgreSQL, EU region. Row-level security enforced at database level — company data isolated by RLS policy.<br>
    <strong>Tamper evidence:</strong> Records are insert-only via application layer. No update or delete permitted on the human_decisions table. Each record carries a UTC timestamp set at insertion.<br>
    <strong>Session reference:</strong> Bulk imports are assigned a unique session reference (bulk-[cycle]-[timestamp]) enabling full re-trace of any import event.<br>
    <strong>GDPR compliance:</strong> Candidate references are anonymised batch IDs only. No personal data (names, contact details) is stored in the oversight log.<br>
    <strong>Document reference:</strong> ${docRef}<br>
    <strong>Generated:</strong> ${dateStr} at ${timeStr} UTC by Nora Comply
  </div>
</div>

<!-- SECTION 7: SIGNATURE -->
<div class="section">
  <div class="section-title">${manualList.length > 0 ? '7' : '6'}. Reviewer sign-off</div>
  <p style="font-size:8.5pt;color:#2a4a72;margin-bottom:10px;">
    By signing below, the named reviewer confirms that the human oversight process described in this record was carried out, that all AI recommendations were reviewed by a competent natural person, and that override reasons accurately reflect the basis for each decision.
  </p>
  <div class="signature-block">
    <div>
      <div class="sig-field"></div>
      <div class="sig-label">Reviewer signature</div>
    </div>
    <div>
      <div class="sig-field"></div>
      <div class="sig-label">Date signed</div>
    </div>
    <div>
      <div class="sig-field">${esc(reviewerName)}</div>
      <div class="sig-label">Reviewer name (printed)</div>
    </div>
    <div>
      <div class="sig-field">${esc(company?.name || '')}</div>
      <div class="sig-label">Organisation</div>
    </div>
  </div>
</div>

<!-- FOOTER -->
<div class="footer">
  Generated by Nora Comply · noracomply.com · ${dateStr} ·
  This document constitutes evidence of human oversight under Art. 14, Regulation (EU) 2024/1689 (EU AI Act)
  and Art. 22, Regulation (EU) 2016/679 (GDPR). Document reference: ${docRef}
</div>

</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Document-Ref': docRef,
    }
  })
}
