import { NextRequest, NextResponse } from 'next/server'
import { fetchHumanDecisions } from '@/lib/data'

export async function GET(req: NextRequest) {
  const data = await fetchHumanDecisions()
  return NextResponse.json(data)
}
