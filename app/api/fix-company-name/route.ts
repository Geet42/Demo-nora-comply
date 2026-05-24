/**
 * One-time helper: fixes company names that were auto-set from email domains.
 * 
 * Usage (run once from your browser after signing in):
 *   fetch('/api/fix-company-name', {
 *     method: 'POST',
 *     headers: { 'Content-Type': 'application/json' },
 *     body: JSON.stringify({ name: 'Acme Ltd' })
 *   }).then(r => r.json()).then(console.log)
 *
 * Or just pass ?name=YourCompany in a GET request for quick testing.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const name = String(body.name || '').trim()
  if (!name || name.length < 2) {
    return NextResponse.json({ error: 'Provide a name in the request body: { "name": "Your Company" }' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: membership } = await admin
    .from('memberships')
    .select('company_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (!membership?.company_id) {
    return NextResponse.json({ error: 'No workspace found for this user' }, { status: 404 })
  }

  const { error } = await admin
    .from('companies')
    .update({ name })
    .eq('id', membership.company_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, name })
}

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get('name')
  if (!name) {
    return NextResponse.json({
      usage: 'POST /api/fix-company-name with body { "name": "Your Company Name" }',
      orGet: 'GET /api/fix-company-name?name=YourCompany'
    })
  }
  const fakeReq = new Request(req.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  return POST(fakeReq as NextRequest)
}
