import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUserContext } from '@/lib/auth'
import { Resend } from 'resend'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const ctx = await getUserContext()
  if (!ctx || !['owner', 'admin'].includes(ctx.role)) {
    return NextResponse.json({ error: 'Not authorised.' }, { status: 403 })
  }

  const { subject, heading, body, ctaText, ctaUrl } = await req.json()
  if (!subject || !heading || !body) {
    return NextResponse.json({ error: 'Subject, heading and body required.' }, { status: 400 })
  }

  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL
  if (!apiKey || !from) {
    return NextResponse.json({ error: 'Resend not configured. Add RESEND_API_KEY and RESEND_FROM_EMAIL to environment variables.' }, { status: 500 })
  }

  const admin = createAdminClient()

  // Fetch all auth users
  const { data: { users }, error: usersError } = await admin.auth.admin.listUsers({ perPage: 1000 })
  if (usersError) return NextResponse.json({ error: usersError.message }, { status: 500 })

  const emails = users.map(u => u.email).filter(Boolean) as string[]
  if (emails.length === 0) return NextResponse.json({ error: 'No registered users found.' }, { status: 400 })

  const resend = new Resend(apiKey)
  let sent = 0, failed = 0
  const errors: string[] = []

  const paragraphs = body.split('\n').filter(Boolean)
    .map((p: string) => `<p style="color:#9bbce0;font-size:14px;line-height:1.7;margin:0 0 14px;">${p}</p>`)
    .join('')

  const html = buildEmail(heading, paragraphs, ctaText, ctaUrl)

  // Send in batches of 10 to respect Resend rate limits
  for (let i = 0; i < emails.length; i += 10) {
    const batch = emails.slice(i, i + 10)
    await Promise.all(batch.map(async (email) => {
      try {
        const { error } = await resend.emails.send({ from, to: email, subject, html })
        if (error) { failed++; errors.push(`${email}: ${error.message}`) }
        else sent++
      } catch (e: any) {
        failed++
        errors.push(`${email}: ${e.message}`)
      }
    }))
    // Small delay between batches
    if (i + 10 < emails.length) await new Promise(r => setTimeout(r, 200))
  }

  return NextResponse.json({ sent, failed, errors: errors.slice(0, 5) })
}

function buildEmail(heading: string, paragraphs: string, ctaText: string, ctaUrl: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a1628;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:32px 16px;">
<div style="background:#0d1a30;border:1px solid #1e3358;border-radius:20px;overflow:hidden;">
  <div style="background:linear-gradient(135deg,#070e1c 0%,#0f2240 50%,#1a3a6b 100%);padding:32px 32px 24px;position:relative;overflow:hidden;">
    <div style="position:absolute;bottom:0;left:0;right:0;opacity:0.15;">
      <svg viewBox="0 0 600 80" preserveAspectRatio="none" style="display:block;width:100%;height:50px;">
        <polygon points="0,80 100,30 200,55 300,15 400,45 500,10 600,35 600,80" fill="#4a90d9"/>
      </svg>
    </div>
    <div style="position:relative;">
      <div style="font-size:22px;font-weight:700;color:#dceeff;letter-spacing:-0.5px;">nora<span style="color:#4a90d9;">.</span>comply</div>
      <div style="font-family:monospace;font-size:10px;color:#5c85b8;text-transform:uppercase;letter-spacing:2px;margin-top:4px;">EU AI Act Compliance</div>
    </div>
  </div>
  <div style="padding:28px 32px;">
    <h2 style="font-size:24px;font-weight:700;color:#dceeff;margin:0 0 16px;line-height:1.2;">${heading}</h2>
    ${paragraphs}
    ${ctaText ? `<a href="${ctaUrl}" style="display:inline-block;background:linear-gradient(135deg,#1a3a6b 0%,#2563b0 100%);color:#ffffff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:600;font-size:14px;margin-top:8px;margin-bottom:24px;">${ctaText} &rarr;</a>` : ''}
    <div style="font-family:monospace;font-size:10px;color:#2a4a72;border-top:1px solid #1e3358;padding-top:14px;margin-top:24px;line-height:1.7;">
      Nora Comply &middot; Built in Ireland &middot; Regulation (EU) 2024/1689
    </div>
  </div>
</div>
</div>
</body>
</html>`
}
