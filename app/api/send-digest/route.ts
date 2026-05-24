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
  const scoreColor = overallScore >= 75 ? '#7F8B6F' : overallScore >= 50 ? '#B87352' : '#B5604E'

  return `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px; background: #FBF6EF; color: #221C16; border-radius: 20px; border: 1px solid #E6DDCE;">
      
      <!-- Mountain header SVG -->
      <div style="background: linear-gradient(160deg, #0f2744 0%, #1a3d6b 60%, #2a5a8a 100%); border-radius: 12px; padding: 24px 24px 8px; margin-bottom: 24px; overflow: hidden; position: relative;">
        <svg style="position: absolute; bottom: 0; left: 0; right: 0; opacity: 0.2;" viewBox="0 0 600 60" preserveAspectRatio="none">
          <polygon points="0,60 80,20 160,40 240,10 320,35 400,5 480,25 600,15 600,60" fill="#5ba3d4"/>
        </svg>
        <div style="position: relative;">
          <div style="font-size: 20px; font-weight: 500; color: #e8f4ff; font-family: Georgia, serif;">nora<span style="color: #c17f3e;">.</span>comply</div>
          <div style="font-family: monospace; font-size: 11px; color: #a8cde8; text-transform: uppercase; letter-spacing: 1.4px; margin-top: 4px;">Weekly digest · ${companyName}</div>
        </div>
      </div>

      <div style="border-bottom: 1px solid #E6DDCE; padding-bottom: 18px; margin-bottom: 24px;">
        <h2 style="font-size: 26px; margin: 0 0 8px; font-weight: 400; line-height: 1.2;">
          ${systemCount} AI system${systemCount !== 1 ? 's' : ''} &middot; <span style="color: ${scoreColor};">${overallScore}%</span> posture.
        </h2>
        <p style="color: #8A7E70; font-size: 13px; margin: 0; font-family: monospace;">${daysToDeadline} days to Regulation (EU) 2024/1689 enforcement</p>
      </div>

      <!-- Deadline alert -->
      <div style="background: rgba(181,96,78,0.08); border: 1px solid rgba(181,96,78,0.25); border-radius: 12px; padding: 14px 16px; margin-bottom: 20px;">
        <div style="font-family: system-ui, sans-serif; font-size: 12px; color: #9A5A3D; font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.06em;">2 August 2026 · EU AI Act</div>
        <div style="font-size: 14px; color: #221C16; font-family: system-ui, sans-serif; line-height: 1.5;">
          ${daysToDeadline} days until Articles 9, 12, 13, 14 and 26 of Regulation (EU) 2024/1689 become enforceable for high-risk AI deployers.
        </div>
      </div>

      ${openObligations > 0 ? `
      <div style="background: #F2EBE0; border: 1px solid rgba(184,115,82,0.30); border-radius: 12px; padding: 14px 16px; margin-bottom: 20px;">
        <div style="font-family: system-ui, sans-serif; font-size: 12px; color: #9A5A3D; font-weight: 600; margin-bottom: 4px;">Action required</div>
        <div style="font-size: 14px; color: #221C16; font-family: system-ui, sans-serif; line-height: 1.5;">
          ${openObligations} obligation${openObligations !== 1 ? 's are' : ' is'} below 100% evidence coverage. Art. 14 (Human oversight) is most commonly incomplete for employment AI.
        </div>
      </div>` : ''}

      <a href="${appUrl}/dashboard" style="display: inline-block; background: #221C16; color: #FBF6EF; padding: 14px 26px; border-radius: 999px; text-decoration: none; font-weight: 500; font-family: system-ui, sans-serif; font-size: 14px; margin-bottom: 32px;">
        Review obligations &rarr;
      </a>

      <div style="margin-top: 24px; font-family: monospace; font-size: 11px; color: #8A7E70; border-top: 1px solid #E6DDCE; padding-top: 16px;">
        Nora Comply &middot; Built in Ireland &middot; Regulation (EU) 2024/1689
      </div>
    </div>
  `
}
