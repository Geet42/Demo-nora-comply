/**
 * Demo data — all real EU AI Act article references.
 * No placeholder text. All names, articles, and legal citations are accurate.
 */

export type System = {
  id: string
  name: string
  vendor: string
  risk: 'Unacceptable' | 'High' | 'Limited' | 'Minimal'
  status: 'Compliant' | 'In review' | 'Action required'
  score: number
}

export type Obligation = {
  id: string
  name: string
  framework: 'EU AI Act' | 'GDPR'
  article: string
  pct: number
}

export type Deadline = {
  month: string
  day: string
  name: string
  desc: string
  urgency: 'Urgent' | 'Soon' | 'Upcoming'
}

export type Activity = {
  text: string
  time: string
  color: string
}

export const demoSystems: System[] = [
  {
    id: 'sys_1',
    name: 'Recruitment Screening Engine',
    vendor: 'Internal · Logistic regression + NLP',
    risk: 'High',
    status: 'Action required',
    score: 41,
  },
  {
    id: 'sys_2',
    name: 'Customer Support Assistant',
    vendor: 'OpenAI · GPT-4o',
    risk: 'Limited',
    status: 'Compliant',
    score: 84,
  },
  {
    id: 'sys_3',
    name: 'Credit Risk Scoring Model',
    vendor: 'Internal · XGBoost ensemble',
    risk: 'High',
    status: 'In review',
    score: 62,
  },
  {
    id: 'sys_4',
    name: 'Marketing Copy Generator',
    vendor: 'Anthropic · Claude 3.5',
    risk: 'Minimal',
    status: 'Compliant',
    score: 91,
  },
  {
    id: 'sys_5',
    name: 'Transaction Fraud Detection',
    vendor: 'Internal · Isolation forest',
    risk: 'High',
    status: 'In review',
    score: 68,
  },
]

export const demoObligations: Obligation[] = [
  {
    id: 'o1',
    name: 'Human oversight procedure',
    framework: 'EU AI Act',
    article: 'Art. 14',
    pct: 22,
  },
  {
    id: 'o2',
    name: 'Deployer obligations register',
    framework: 'EU AI Act',
    article: 'Art. 26',
    pct: 55,
  },
  {
    id: 'o3',
    name: 'Record-keeping and logging',
    framework: 'EU AI Act',
    article: 'Art. 12',
    pct: 78,
  },
  {
    id: 'o4',
    name: 'Automated decision-making rights',
    framework: 'GDPR',
    article: 'Art. 22',
    pct: 40,
  },
  {
    id: 'o5',
    name: 'Data protection impact assessment',
    framework: 'GDPR',
    article: 'Art. 35',
    pct: 33,
  },
  {
    id: 'o6',
    name: 'Records of processing activities',
    framework: 'GDPR',
    article: 'Art. 30',
    pct: 90,
  },
]

export const demoDeadlines: Deadline[] = [
  {
    month: 'AUG',
    day: '02',
    name: 'EU AI Act high-risk obligations apply',
    desc: 'All high-risk AI systems — Art. 9, 12, 13, 14, 26',
    urgency: 'Urgent',
  },
  {
    month: 'JUN',
    day: '28',
    name: 'DPIA refresh due',
    desc: 'Recruitment Screening Engine — GDPR Art. 35',
    urgency: 'Soon',
  },
  {
    month: 'JUL',
    day: '15',
    name: 'Human oversight log review',
    desc: 'Quarterly review — Art. 14 oversight records',
    urgency: 'Upcoming',
  },
]

export const demoActivities: Activity[] = [
  {
    text: 'Art. 14 human oversight log submitted for Recruitment Screening Engine',
    time: '18 min ago',
    color: 'var(--sage)',
  },
  {
    text: 'DPIA evidence uploaded for Credit Risk Scoring Model (GDPR Art. 35)',
    time: '2 hr ago',
    color: 'var(--bronze)',
  },
  {
    text: 'Recruitment Screening Engine flagged — Art. 14 human oversight incomplete',
    time: '4 hr ago',
    color: 'var(--warn)',
  },
  {
    text: 'Transaction Fraud Detection registered to AI inventory (High risk, Annex III)',
    time: 'Yesterday',
    color: 'var(--bronze)',
  },
  {
    text: 'Weekly compliance digest sent — 2 August 2026 deadline 73 days away',
    time: 'Yesterday',
    color: 'var(--sage)',
  },
]
