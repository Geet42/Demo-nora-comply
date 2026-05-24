/**
 * Nora Comply — law data helper
 *
 * The canonical law text now lives in the `regulations` table in Supabase.
 * This file only exists to:
 *   1. Seed new workspaces when Supabase is not yet seeded (fallback)
 *   2. Provide TypeScript types used across the app
 *   3. Map risk level → required article codes (obligation template logic)
 *
 * The REAL source of truth is the DB. Never hardcode article text in components.
 */

export type EUAIActArticle = {
  article: string
  title: string
  summary: string
  fullText: string
  appliesTo: ('High' | 'Limited' | 'Minimal' | 'All')[]
  framework: 'EU AI Act' | 'GDPR'
  applicableDeployerObligation: boolean
  deadline?: string
  celexNumber?: string
  sourceUrl?: string
}

export type ObligationTemplate = {
  framework: 'EU AI Act' | 'GDPR'
  article: string
  article_title: string
  article_summary: string
  article_full_text: string
  applicable_to: string[]
  pct: number
}

// Maps risk level to the article codes required
// The actual text is fetched from DB; this just drives which articles to attach
export const OBLIGATION_MAP: Record<string, string[]> = {
  Unacceptable: [], // prohibited — cannot be deployed
  High: ['Art. 9','Art. 12','Art. 13','Art. 14','Art. 26','Art. 22','Art. 30','Art. 35','Art. 32'],
  Limited: ['Art. 50','Art. 30','Art. 32'],
  Minimal: ['Art. 30','Art. 32'],
}

export const ANNEX_III_CATEGORIES = [
  'Annex III.1 — Biometric identification and categorisation',
  'Annex III.2 — Critical infrastructure management',
  'Annex III.3 — Education and vocational training',
  'Annex III.4 — Employment, worker management and access to self-employment',
  'Annex III.5 — Access to essential private services and benefits',
  'Annex III.6 — Law enforcement',
  'Annex III.7 — Migration, asylum and border control management',
  'Annex III.8 — Administration of justice and democratic processes',
]

// Fallback used only when Supabase is not yet seeded (demo mode)
// Matches what is inserted in schema.sql
export function getObligationTemplates(riskLevel: 'Unacceptable' | 'High' | 'Limited' | 'Minimal'): ObligationTemplate[] {
  const required = OBLIGATION_MAP[riskLevel] || []
  return FALLBACK_ARTICLES.filter(a => required.includes(a.article)).map(a => ({
    framework: a.framework,
    article: a.article,
    article_title: a.title,
    article_summary: a.summary,
    article_full_text: a.fullText,
    applicable_to: a.appliesTo as string[],
    pct: 0,
  }))
}

const FALLBACK_ARTICLES: EUAIActArticle[] = [
  { article:'Art. 9', framework:'EU AI Act', title:'Risk management system', appliesTo:['High'], applicableDeployerObligation:true, deadline:'2 August 2026', celexNumber:'32024R1689', sourceUrl:'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1689',
    summary:'You must establish a continuous, documented risk management system covering: identification of known and foreseeable risks to health, safety or fundamental rights; evaluation of risks under intended use and foreseeable misuse; adoption of targeted risk mitigation measures.',
    fullText:'A risk management system shall be established, implemented, documented and maintained in relation to high-risk AI systems. The risk management system shall comprise: (a) the identification and analysis of the known and the reasonably foreseeable risks; (b) the estimation and evaluation of risks under intended use and foreseeable misuse; (c) the evaluation of other risks based on post-market monitoring; (d) the adoption of appropriate risk management measures. (Regulation (EU) 2024/1689, Article 9)'},
  { article:'Art. 12', framework:'EU AI Act', title:'Record-keeping and logging', appliesTo:['High'], applicableDeployerObligation:true, deadline:'2 August 2026',
    summary:'High-risk AI systems must automatically record events (logs) throughout their lifetime. Deployers must retain logs for at least 6 months.',
    fullText:'High-risk AI systems shall technically allow for the automatic recording of events (logs) over the lifetime of the system. Deployers shall retain the logs for a period appropriate to the intended purpose and of applicable legal obligations. (Regulation (EU) 2024/1689, Article 12)'},
  { article:'Art. 13', framework:'EU AI Act', title:'Transparency and provision of information', appliesTo:['High'], applicableDeployerObligation:false, deadline:'2 August 2026',
    summary:'High-risk AI systems must be sufficiently transparent. Instructions for use must cover capabilities, limitations, performance metrics, human oversight measures, and known biases.',
    fullText:'High-risk AI systems shall be designed and developed in such a way as to ensure that their operation is sufficiently transparent to enable deployers to interpret the output and use it appropriately. (Regulation (EU) 2024/1689, Article 13)'},
  { article:'Art. 14', framework:'EU AI Act', title:'Human oversight', appliesTo:['High'], applicableDeployerObligation:true, deadline:'2 August 2026',
    summary:'Deployers must assign human oversight to named persons with competence, training and authority to intervene. Humans must be able to understand, monitor, and override AI decisions.',
    fullText:'High-risk AI systems shall be designed so they can be effectively overseen by natural persons. Deployers shall assign oversight to persons with competence, training and authority. Those persons shall be able to: (a) understand the capabilities and limitations; (b) detect anomalies; (c) refrain from using the system where anomalies are detected; (d) override, disregard or reverse the output. (Regulation (EU) 2024/1689, Article 14)'},
  { article:'Art. 26', framework:'EU AI Act', title:'Obligations of deployers', appliesTo:['High'], applicableDeployerObligation:true, deadline:'2 August 2026',
    summary:'Deployers must use per instructions; assign competent oversight; inform workers; conduct DPIA where required; keep logs 6+ months; notify providers of serious incidents.',
    fullText:'Deployers of high-risk AI systems shall take appropriate technical and organisational measures to ensure they use such systems in accordance with the instructions for use. Deployers shall assign oversight to natural persons with the necessary competence, training and authority. Deployers shall keep logs for at least 6 months. (Regulation (EU) 2024/1689, Article 26)'},
  { article:'Art. 50', framework:'EU AI Act', title:'Transparency for certain AI systems', appliesTo:['Limited'], applicableDeployerObligation:true, deadline:'2 August 2025',
    summary:'AI systems that directly interact with people must inform users they are interacting with AI. Synthetic content (deepfakes, AI text) must be machine-detectable as AI-generated.',
    fullText:'Providers shall ensure that AI systems intended to interact directly with natural persons are designed so that the natural persons concerned are informed they are interacting with an AI system, unless this is obvious. (Regulation (EU) 2024/1689, Article 50)'},
  { article:'Art. 22', framework:'GDPR', title:'Automated individual decision-making', appliesTo:['High','Limited'], applicableDeployerObligation:true,
    summary:'Data subjects have the right not to be subject to decisions based solely on automated processing that produces legal or similarly significant effects. Human review must be available on request.',
    fullText:`The data subject shall have the right not to be subject to a decision based solely on automated processing, including profiling, which produces legal effects or similarly significantly affects him or her. Where permitted, the controller shall implement suitable measures to safeguard the data subject's rights, at least the right to obtain human intervention and to contest the decision. (Regulation (EU) 2016/679, Article 22)`},
  { article:'Art. 30', framework:'GDPR', title:'Records of processing activities', appliesTo:['High','Limited','Minimal'], applicableDeployerObligation:true,
    summary:'You must maintain a written record of all personal data processing activities. Each AI system processing personal data is a processing activity and must appear in this register.',
    fullText:'Each controller shall maintain a record of processing activities under its responsibility containing: the name and contact details of the controller; the purposes of the processing; a description of the categories of data subjects and personal data; the categories of recipients; retention periods; a general description of security measures. (Regulation (EU) 2016/679, Article 30)'},
  { article:'Art. 32', framework:'GDPR', title:'Security of processing', appliesTo:['High','Limited','Minimal'], applicableDeployerObligation:true,
    summary:'You must implement appropriate technical and organisational security measures: encryption, access controls, incident response, ongoing testing of security measures.',
    fullText:'The controller shall implement appropriate technical and organisational measures to ensure a level of security appropriate to the risk, including: (a) pseudonymisation and encryption; (b) ongoing confidentiality, integrity and availability; (c) ability to restore data after incidents; (d) regular testing of security measures. (Regulation (EU) 2016/679, Article 32)'},
  { article:'Art. 35', framework:'GDPR', title:'Data protection impact assessment', appliesTo:['High'], applicableDeployerObligation:true,
    summary:'A DPIA is mandatory before processing likely to result in high risk to individuals. AI systems making automated decisions with legal effects always require a DPIA.',
    fullText:'Where a type of processing using new technologies is likely to result in a high risk to the rights and freedoms of natural persons, the controller shall carry out a data protection impact assessment prior to the processing. (Regulation (EU) 2016/679, Article 35)'},
]
