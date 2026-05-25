'use server'

import { createHash } from 'crypto'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getUserCompanyId, isDemoMode } from '@/lib/auth'

export type EvidenceState =
  | { error?: string; ok?: boolean; signedUrl?: string }
  | undefined

export async function uploadEvidence(
  _prev: EvidenceState,
  formData: FormData
): Promise<EvidenceState> {
  if (isDemoMode()) {
    return { error: 'Running in demo mode. Configure Supabase environment variables to enable uploads.' }
  }

  const file = formData.get('file') as File | null
  const obligationId = String(formData.get('obligationId') || '')
  const columnLabelsRaw = String(formData.get('columnLabels') || '')

  if (!file || file.size === 0) return { error: 'Choose a file to upload.' }
  if (!obligationId) return { error: 'Missing obligation reference.' }
  if (file.size > 20 * 1024 * 1024) return { error: 'File must be smaller than 20 MB.' }

  let columnLabels = null
  if (columnLabelsRaw) {
    try { columnLabels = JSON.parse(columnLabelsRaw) } catch { }
  }

  const supabase = createClient()
  const companyId = await getUserCompanyId()
  if (!companyId) return { error: 'Not signed in.' }

  const { data: ob } = await supabase
    .from('obligations')
    .select('id, system_id, ai_systems!inner(company_id)')
    .eq('id', obligationId)
    .eq('ai_systems.company_id', companyId)
    .maybeSingle()

  if (!ob) return { error: 'Obligation not found in your workspace.' }

  const arrayBuf = await file.arrayBuffer()
  const bytes = new Uint8Array(arrayBuf)
  const hashFull = createHash('sha256').update(bytes).digest('hex')
  const hashShort = hashFull.slice(0, 16)

  const { count } = await supabase
    .from('evidence')
    .select('*', { count: 'exact', head: true })
    .eq('obligation_id', obligationId)

  const version = (count ?? 0) + 1
  const ext = file.name.split('.').pop()?.toLowerCase() || 'bin'
  const path = `companies/${companyId}/obligations/${obligationId}/v${version}-${hashShort}.${ext}`

  const { error: uploadErr } = await supabase.storage
    .from('evidence')
    .upload(path, bytes, { contentType: file.type || 'application/octet-stream', upsert: false })

  if (uploadErr) return { error: `Upload failed: ${uploadErr.message}` }

  const { data: { user } } = await supabase.auth.getUser()

  const { error: insertErr } = await supabase.from('evidence').insert({
    obligation_id: obligationId,
    storage_path: path,
    file_name: file.name,
    file_type: file.type,
    file_size_bytes: file.size,
    content_hash: hashFull,
    column_labels: columnLabels,
    version,
    uploaded_by: user?.id,
    review_status: 'pending',
  })

  if (insertErr) return { error: `Record failed: ${insertErr.message}` }

  // Update obligation progress to 100% — evidence has been uploaded
  await supabase.from('obligations').update({ pct: 100 }).eq('id', obligationId)

  await supabase.from('activities').insert({
    company_id: companyId,
    actor: user?.id,
    action_type: 'evidence_upload',
    text: `Evidence v${version} uploaded for obligation — SHA-256: ${hashFull.slice(0, 16)}...`,
    metadata: { obligationId, version, hash: hashFull.slice(0, 16), columnLabels },
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/obligations')
  revalidatePath('/dashboard/evidence')

  return { ok: true }
}

export async function getEvidenceSignedUrl(
  storagePath: string,
  expiresInSeconds = 300
): Promise<{ url?: string; error?: string }> {
  if (isDemoMode()) return { error: 'Demo mode.' }

  const supabase = createClient()
  const companyId = await getUserCompanyId()
  if (!companyId) return { error: 'Not signed in.' }

  if (!storagePath.startsWith(`companies/${companyId}/`)) {
    return { error: 'Forbidden.' }
  }

  const { data, error } = await supabase.storage
    .from('evidence')
    .createSignedUrl(storagePath, expiresInSeconds)

  if (error) return { error: error.message }
  return { url: data.signedUrl }
}
