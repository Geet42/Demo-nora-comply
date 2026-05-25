import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')

  const host = req.headers.get('x-forwarded-host') || new URL(req.url).host
  const proto = req.headers.get('x-forwarded-proto') || 'https'
  const appUrl = host.includes('localhost')
    ? `http://${host}`
    : `${proto}://${host.split(',')[0].trim()}`

  if (!code) {
    return NextResponse.redirect(`${appUrl}/login?error=oauth`)
  }

  // Build response first so we can set cookies on it
  const redirectResponse = NextResponse.redirect(`${appUrl}/dashboard`)
  const loginResponse = NextResponse.redirect(`${appUrl}/login?error=oauth`)

  // Create supabase client that writes cookies onto our redirect response
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          redirectResponse.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          redirectResponse.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    return loginResponse
  }

  // Bootstrap company + membership for first-time Google users
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const admin = createAdminClient()
      const { data: existing } = await admin
        .from('memberships')
        .select('company_id')
        .eq('user_id', data.user.id)
        .maybeSingle()

      if (!existing) {
        const companyName =
          data.user.user_metadata?.full_name ||
          data.user.email?.split('@')[1]?.split('.')[0] ||
          'My Company'
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
        }
      }
    } catch {}
  }

  return redirectResponse
}
