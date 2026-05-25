import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.RESEND_API_KEY
    const from = process.env.RESEND_FROM_EMAIL

    if (!apiKey || !from) {
      return NextResponse.json(
        { error: 'Resend not configured. Add RESEND_API_KEY and RESEND_FROM_EMAIL to Vercel environment variables.' },
        { status: 500 }
      )
    }

    const body = await req.json()
    const to = body.to || process.env.DIGEST_TEST_RECIPIENT || 'you@example.com'
    const companyName = body.companyName || 'your company'
    const overallScore = body.overallScore || 0
    const systemCount = body.systemCount || 0
    const openObligations = body.openObligations || 0
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://demo-nora-comply.vercel.app'

    const daysToDeadline = Math.ceil(
      (new Date('2026-08-02').getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )

    const resend = new Resend(apiKey)

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: `Nora Comply: weekly digest — ${overallScore}% posture, ${daysToDeadline} days to EU AI Act`,
      html: digestHtml({ companyName, overallScore, systemCount, openObligations, daysToDeadline, appUrl }),
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, id: data?.id })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

function digestHtml({
  companyName,
  overallScore,
  systemCount,
  openObligations,
  daysToDeadline,
  appUrl,
}: {
  companyName: string
  overallScore: number
  systemCount: number
  openObligations: number
  daysToDeadline: number
  appUrl: string
}) {
  const scoreColor = overallScore >= 75 ? '#3d7a5e' : overallScore >= 50 ? '#b07a2a' : '#b5604e'
  const urgency = daysToDeadline <= 30 ? 'URGENT' : daysToDeadline <= 90 ? 'ACTION REQUIRED' : 'UPCOMING'
  const urgencyColor = daysToDeadline <= 30 ? '#b5604e' : daysToDeadline <= 90 ? '#c9914a' : '#2563b0'

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#0a1628;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">

    <div style="max-width:600px;margin:0 auto;padding:32px 16px;">

      <!-- Card wrapper -->
      <div style="background:#0d1a30;border:1px solid #1e3358;border-radius:20px;overflow:hidden;">

        <!-- Header band -->
        <div style="background:linear-gradient(135deg,#070e1c 0%,#0f2240 50%,#1a3a6b 100%);padding:32px 32px 24px;position:relative;overflow:hidden;">
          <div style="position:absolute;bottom:0;left:0;right:0;opacity:0.15;">
            <svg viewBox="0 0 600 80" preserveAspectRatio="none" style="display:block;width:100%;height:50px;">
              <polygon points="0,80 100,30 200,55 300,15 400,45 500,10 600,35 600,80" fill="#4a90d9"/>
            </svg>
          </div>
          <div style="position:relative;">
            <div style="font-size:22px;font-weight:700;color:#dceeff;letter-spacing:-0.5px;">
              nora<span style="color:#4a90d9;">.</span>comply
            </div>
            <div style="font-family:monospace;font-size:10px;color:#5c85b8;text-transform:uppercase;letter-spacing:2px;margin-top:4px;">
              Weekly digest &middot; ${companyName}
            </div>
          </div>
        </div>

        <!-- Body -->
        <div style="padding:28px 32px;">

          <!-- Score headline -->
          <div style="border-bottom:1px solid #1e3358;padding-bottom:20px;margin-bottom:24px;">
            <div style="font-size:28px;font-weight:700;color:#dceeff;line-height:1.2;margin-bottom:6px;">
              ${systemCount} AI system${systemCount !== 1 ? 's' : ''} &middot;
              <span style="color:${scoreColor};">${overallScore}%</span> posture
            </div>
            <div style="font-family:monospace;font-size:11px;color:#5c85b8;">
              ${daysToDeadline} days to Regulation (EU) 2024/1689 enforcement
            </div>
          </div>

          <!-- Deadline alert -->
          <div style="background:rgba(37,99,176,0.08);border:1px solid rgba(37,99,176,0.25);border-radius:12px;padding:14px 16px;margin-bottom:18px;">
            <div style="font-size:10px;font-weight:700;color:${urgencyColor};text-transform:uppercase;letter-spacing:1.5px;margin-bottom:5px;font-family:monospace;">
              ${urgency} &middot; 2 August 2026 &middot; EU AI Act
            </div>
            <div style="font-size:13px;color:#9bbce0;line-height:1.5;">
              ${daysToDeadline} days until Articles 9, 12, 13, 14 and 26 of Regulation (EU) 2024/1689 become
              enforceable for high-risk AI deployers in the EU.
            </div>
          </div>

          ${openObligations > 0 ? `
          <!-- Open obligations -->
          <div style="background:rgba(181,96,78,0.07);border:1px solid rgba(181,96,78,0.25);border-radius:12px;padding:14px 16px;margin-bottom:18px;">
            <div style="font-size:10px;font-weight:700;color:#d45a5a;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:5px;font-family:monospace;">
              Action required
            </div>
            <div style="font-size:13px;color:#9bbce0;line-height:1.5;">
              <strong style="color:#dceeff;">${openObligations} obligation${openObligations !== 1 ? 's' : ''}</strong>
              ${openObligations !== 1 ? 'are' : 'is'} below 100% evidence coverage.
              Art. 14 (Human oversight) is most commonly incomplete for employment AI.
            </div>
          </div>` : `
          <!-- All complete -->
          <div style="background:rgba(60,122,94,0.08);border:1px solid rgba(60,122,94,0.25);border-radius:12px;padding:14px 16px;margin-bottom:18px;">
            <div style="font-size:10px;font-weight:700;color:#3d7a5e;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:5px;font-family:monospace;">
              All obligations covered
            </div>
            <div style="font-size:13px;color:#9bbce0;line-height:1.5;">
              All obligations have evidence uploaded. Your compliance posture is up to date.
            </div>
          </div>`}

          <!-- CTA -->
          <a href="${appUrl}/dashboard"
            style="display:inline-block;background:linear-gradient(135deg,#1a3a6b 0%,#2563b0 100%);color:#ffffff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:600;font-size:14px;margin-bottom:28px;letter-spacing:0.2px;">
            Review compliance dashboard &rarr;
          </a>

          <!-- Footer -->
          <div style="font-family:monospace;font-size:10px;color:#2a4a72;border-top:1px solid #1e3358;padding-top:14px;line-height:1.7;">
            Nora Comply &middot; Built in Ireland &middot; Regulation (EU) 2024/1689<br>
            <a href="${appUrl}/cookies" style="color:#2a4a72;text-decoration:none;">Cookie policy</a> &middot;
            <a href="${appUrl}/privacy" style="color:#2a4a72;text-decoration:none;">Privacy</a>
          </div>

        </div>
      </div>

    </div>
    </body>
    </html>
  `
}
