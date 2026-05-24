'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export type AuthState = { error?: string; info?: string } | undefined

function configured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

export async function signIn(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '')

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  if (!configured()) {
    return {
      error:
        'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to Vercel environment variables, then redeploy.',
    }
  }

  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message.toLowerCase().includes('email not confirmed')) {
      return {
        error:
          'Email not confirmed yet. Check your inbox for the verification link from Supabase. To skip confirmation for testing, go to Supabase dashboard → Authentication → Providers → Email and disable "Confirm email".',
      }
    }
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signUp(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '')
  const companyName = String(formData.get('companyName') || '').trim()

  if (!email || !password || !companyName) {
    return { error: 'Company name, email, and password are required.' }
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }

  if (!configured()) {
    return { error: 'Supabase is not configured. Add environment variables to Vercel.' }
  }

  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { company_name: companyName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://demo-nora-comply.vercel.app'}/dashboard`,
    },
  })

  if (error) return { error: error.message }

  if (data.user && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const admin = createAdminClient()
      const { data: company } = await admin
        .from('companies')
        .insert({ name: companyName })
        .select('id')
        .single()

      if (company) {
        await admin.from('memberships').insert({
          user_id: data.user.id,
          company_id: company.id,
          role: 'owner',
        })

        const { seedWorkspace } = await import('@/lib/seed')
        await seedWorkspace(company.id, data.user.id)

        // Send welcome email if Resend is configured
        if (process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL) {
          await sendWelcomeEmail(email, companyName)
        }
      }
    } catch {
      // Non-fatal
    }
  }

  if (!data.session) {
    return {
      info: 'Workspace created. Check your inbox for the verification link, then sign in.',
    }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signOut() {
  if (!configured()) {
    redirect('/login')
  }
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}

async function sendWelcomeEmail(to: string, companyName: string) {
  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://demo-nora-comply.vercel.app'

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to,
      subject: `Your Nora Comply workspace is ready`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px; background: #FBF6EF; color: #221C16; border-radius: 20px; border: 1px solid #E6DDCE;">
          <div style="border-bottom: 1px solid #E6DDCE; padding-bottom: 18px; margin-bottom: 24px;">
            <div style="font-size: 20px; font-weight: 500;">nora<span style="color: #9A5A3D;">.</span>comply</div>
            <div style="font-size: 11px; color: #8A7E70; text-transform: uppercase; letter-spacing: 1.4px; margin-top: 6px; font-family: monospace;">Workspace ready</div>
          </div>
          <h2 style="font-size: 26px; margin: 0 0 14px; font-weight: 400; line-height: 1.2;">
            Welcome, ${companyName}.
          </h2>
          <p style="color: #5A4E42; line-height: 1.7; font-size: 15px;">
            Your Nora Comply workspace has been created. We have pre-loaded your AI system inventory with EU AI Act obligations from <strong>Regulation (EU) 2024/1689</strong>.
          </p>
          <div style="background: #F2EBE0; border: 1px solid rgba(184,115,82,0.30); border-radius: 14px; padding: 16px; margin: 22px 0;">
            <div style="color: #9A5A3D; font-weight: 600; margin-bottom: 8px; font-family: system-ui, sans-serif; font-size: 13px;">Important: 2 August 2026 deadline</div>
            <div style="font-size: 14px; color: #221C16; font-family: system-ui, sans-serif; line-height: 1.5;">
              All high-risk AI systems must comply with EU AI Act Articles 9, 12, 13, 14, and 26 by 2 August 2026. Start with Article 14 (human oversight) — it is the most commonly flagged gap for employment AI.
            </div>
          </div>
          <a href="${appUrl}/dashboard" style="display: inline-block; background: #221C16; color: #FBF6EF; padding: 14px 26px; border-radius: 999px; text-decoration: none; font-weight: 500; font-family: system-ui, sans-serif; font-size: 14px;">
            Open your dashboard &rarr;
          </a>
          <div style="margin-top: 36px; font-size: 11px; color: #8A7E70; font-family: monospace;">
            Nora Comply &middot; Built in Ireland &middot; Regulation (EU) 2024/1689
          </div>
        </div>
      `,
    })
  } catch {
    // Non-fatal — do not block sign-up if email fails
  }
}
