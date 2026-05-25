import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { analytics, marketing } = await req.json()
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const ipRaw = req.headers.get('x-forwarded-for') || ''
    const uaRaw = req.headers.get('user-agent') || ''
    const hashStr = (s: string) => s.split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0).toString(16)

    await supabase.from('cookie_consents').insert({
      user_id: user?.id || null,
      analytics_accepted: Boolean(analytics),
      marketing_accepted: Boolean(marketing),
      ip_hash: hashStr(ipRaw),
      user_agent_hash: hashStr(uaRaw),
    })
  } catch {}

  return NextResponse.json({ ok: true })
}
