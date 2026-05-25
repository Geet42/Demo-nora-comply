import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function getAppUrl(req: NextRequest): string {
  const fwdHost = req.headers.get('x-forwarded-host')
  const fwdProto = req.headers.get('x-forwarded-proto') || 'https'
  if (fwdHost) return `${fwdProto}://${fwdHost}`
  const host = req.headers.get('host') || ''
  if (host && !host.includes('localhost')) return `https://${host}`
  return process.env.NEXT_PUBLIC_APP_URL || 'https://demo-nora-comply.vercel.app'
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const appUrl = getAppUrl(req)

  if (code) {
    const supabase = createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
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
      return NextResponse.redirect(`${appUrl}/dashboard`)
    }
  }

  return NextResponse.redirect(`${appUrl}/login?error=oauth`)
}
