import { NextResponse } from 'next/server'

export async function GET() {
  const csv = [
    'candidate_ref,ai_recommendation,human_decision,did_override,override_reason',
    'APP-00001,Shortlist,Shortlist,false,',
    'APP-00002,Shortlist,Rejected,true,Score inflated by extracurricular weighting — candidate lacked core technical requirements',
    'APP-00003,Reject,Shortlist,true,AI penalised gap year incorrectly — candidate had relevant industry experience during that period',
    'APP-00004,Shortlist,Shortlist,false,',
    '# Add your rows below — delete these example rows before importing',
    '# candidate_ref: any anonymised ID (no real names)',
    '# ai_recommendation: what the AI suggested',
    '# human_decision: what the reviewer decided',
    '# did_override: true or false',
    '# override_reason: required when did_override is true',
  ].join('\r\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="nora-oversight-template.csv"',
    },
  })
}
