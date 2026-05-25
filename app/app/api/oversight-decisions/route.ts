import { NextRequest, NextResponse } from 'next/server'
import { fetchHumanDecisionsPage } from '@/lib/data'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '0')
  const pageSize = parseInt(searchParams.get('pageSize') || '50')
  const data = await fetchHumanDecisionsPage(page, pageSize)
  return NextResponse.json(data)
}
