'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

export type AuthState = { error?: string; info?: string } | undefined

function configured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://demo-nora-comply.vercel.app'

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '')

  if (!email || !password) return { error: 'Email and password are required.' }
  if (!configured()) return { error: 'Supabase is not configured. Add environment variables to Vercel.' }

  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message.toLowerCase().includes('email not confirmed')) {
      return { error: 'Please confirm your email first. Check your inbox for the verification link.' }
    }
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '')
  const companyName = String(formData.get('companyName') || '').trim()

  if (!email || !password || !companyName) return { error: 'Company name, email, and password are required.' }
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' }
  if (!configured()) return { error: 'Supabase is not configured.' }

  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { company_name: companyName },
      emailRedirectTo: `${APP_URL}/dashboard`,
    },
  })

  if (error) return { error: error.message }

  if (data.user && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const admin = createAdminClient()
      const { data: company } = await admin.from('companies').insert({ name: companyName }).select('id').single()
      if (company) {
        await admin.from('memberships').insert({ user_id: data.user.id, company_id: company.id, role: 'owner' })
        const { seedWorkspace } = await import('@/lib/seed')
        await seedWorkspace(company.id, data.user.id)
        if (process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL) {
          await sendWelcomeEmail(email, companyName)
        }
      }
    } catch {}
  }

  if (!data.session) {
    return { info: 'Workspace created. Check your inbox to verify your email, then sign in.' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signInWithGoogle() {
  if (!configured()) return
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${APP_URL}/auth/callback` },
  })
  if (data.url) redirect(data.url)
}

export async function signOut() {
  if (!configured()) redirect('/login')
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

// ── Email helpers ─────────────────────────────────────────────────────────────

function noraEmailWrapper(content: string, footerExtra = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a1628;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:32px 16px;">
<div style="background:#0d1a30;border:1px solid #1e3358;border-radius:20px;overflow:hidden;">

  <!-- Header -->
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

  <!-- Content -->
  <div style="padding:28px 32px;">
    ${content}
    <!-- Footer -->
    <div style="font-family:monospace;font-size:10px;color:#2a4a72;border-top:1px solid #1e3358;padding-top:14px;margin-top:24px;line-height:1.7;">
      Nora Comply &middot; Built in Ireland &middot; Regulation (EU) 2024/1689${footerExtra}
    </div>
  </div>
</div>
</div>
</body>
</html>`
}

async function sendWelcomeEmail(to: string, companyName: string) {
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    const daysToDeadline = Math.ceil((new Date('2026-08-02').getTime() - Date.now()) / (1000 * 60 * 60 * 24))

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to,
      subject: `Your Nora Comply workspace is ready`,
      html: noraEmailWrapper(`
        <h2 style="font-size:26px;font-weight:700;color:#dceeff;margin:0 0 10px;line-height:1.2;">
          Welcome, ${companyName}.
        </h2>
        <p style="color:#9bbce0;font-size:14px;line-height:1.7;margin:0 0 20px;">
          Your workspace is ready. We have pre-loaded your EU AI Act obligations from <strong style="color:#dceeff;">Regulation (EU) 2024/1689</strong>. You have <strong style="color:#dceeff;">${daysToDeadline} days</strong> until enforcement.
        </p>

        <div style="background:rgba(37,99,176,0.08);border:1px solid rgba(37,99,176,0.25);border-radius:12px;padding:14px 16px;margin-bottom:20px;">
          <div style="font-size:10px;font-weight:700;color:#4a90d9;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:6px;font-family:monospace;">Your next steps</div>
          <div style="font-size:13px;color:#9bbce0;line-height:1.8;">
            1. Register your AI systems<br>
            2. Upload evidence against each obligation<br>
            3. Log human oversight decisions<br>
            4. Generate your audit-ready evidence pack
          </div>
        </div>

        <div style="background:rgba(181,96,78,0.07);border:1px solid rgba(181,96,78,0.25);border-radius:12px;padding:14px 16px;margin-bottom:24px;">
          <div style="font-size:10px;font-weight:700;color:#d45a5a;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:5px;font-family:monospace;">2 August 2026 deadline</div>
          <div style="font-size:13px;color:#9bbce0;line-height:1.5;">
            Art. 9, 12, 13, 14 and 26 become enforceable. Start with <strong style="color:#dceeff;">Art. 14 (human oversight)</strong> — the most commonly flagged gap for employment AI.
          </div>
        </div>

        <a href="${APP_URL}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#1a3a6b 0%,#2563b0 100%);color:#ffffff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:600;font-size:14px;">
          Open your dashboard &rarr;
        </a>
      `),
    })
  } catch {}
}
