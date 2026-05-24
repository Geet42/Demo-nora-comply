-- =========================================================================
-- Nora Comply · Schema v3
-- Adds: living law system, law_amendments, obligation_law_versions,
--       cookie_consents, app_versions, document_templates, law_update_alerts
-- Idempotent — safe to re-run.
-- =========================================================================

-- TENANTS
create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'starter' check (plan in ('starter','growth','enterprise')),
  created_at timestamptz default now()
);

-- USERS to companies link
create table if not exists memberships (
  user_id uuid references auth.users(id) on delete cascade,
  company_id uuid references companies(id) on delete cascade,
  role text not null check (role in ('owner','admin','uploader','reviewer','auditor','viewer')),
  invited_by uuid references auth.users(id),
  created_at timestamptz default now(),
  primary key (user_id, company_id)
);

-- PENDING INVITATIONS
create table if not exists invitations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade not null,
  email text not null,
  role text not null check (role in ('admin','uploader','reviewer','auditor','viewer')),
  invited_by uuid references auth.users(id),
  token text unique not null default encode(gen_random_bytes(32), 'hex'),
  accepted_at timestamptz,
  created_at timestamptz default now()
);

-- =========================================================================
-- LIVING LAW SYSTEM
-- Laws are stored in the DB, versioned, and never deleted.
-- Each amendment creates a new row that supersedes the previous one.
-- Obligations pin to a specific law version at the time they were created.
-- =========================================================================

create table if not exists regulations (
  id uuid primary key default gen_random_uuid(),
  framework text not null,            -- 'EU AI Act', 'GDPR', 'Internal Policy'
  article text not null,              -- 'Art. 14'
  title text not null,
  summary text not null,              -- plain-language for non-lawyers
  full_text text not null,            -- actual regulatory text
  applies_to text[] not null,         -- ['High','Limited'] etc.
  framework_version text not null,    -- 'OJ L 2024/1689' or 'OJ L 2016/679'
  celex_number text,                  -- EUR-Lex CELEX identifier for change tracking
  source_url text,                    -- canonical EUR-Lex URL
  effective_date date,
  enforcement_date date,
  is_deployer_obligation boolean not null default true,
  is_current boolean not null default true,
  supersedes uuid references regulations(id), -- points to the row this amends
  change_summary text,                -- what changed vs previous version (null for originals)
  created_at timestamptz default now()
);

-- Index for fast "give me current articles for this framework" queries
create index if not exists regulations_current_framework
  on regulations(framework, is_current)
  where is_current = true;

-- LAW UPDATE ALERTS — tracks when Nora detects a possible law change
-- and which companies have been notified
create table if not exists law_update_alerts (
  id uuid primary key default gen_random_uuid(),
  regulation_id uuid references regulations(id),
  framework text not null,
  article text not null,
  alert_type text not null check (alert_type in ('amendment','new_guidance','enforcement_change','review_due')),
  title text not null,
  description text not null,
  source_url text,
  detected_at timestamptz default now(),
  reviewed_by_nora boolean default false, -- true = Nora team has verified this is real
  is_active boolean default true
);

-- Which companies have seen/dismissed which alerts
create table if not exists company_alert_dismissals (
  company_id uuid references companies(id) on delete cascade,
  alert_id uuid references law_update_alerts(id) on delete cascade,
  dismissed_by uuid references auth.users(id),
  dismissed_at timestamptz default now(),
  primary key (company_id, alert_id)
);

-- AI SYSTEMS
create table if not exists ai_systems (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade not null,
  name text not null,
  vendor text,
  purpose text,
  deployment_context text,
  risk_level text not null check (risk_level in ('Unacceptable','High','Limited','Minimal')),
  annex_category text,
  status text not null default 'In review' check (status in ('Compliant','In review','Action required')),
  score int default 0,
  created_at timestamptz default now()
);

-- OBLIGATIONS — each one pinned to the regulation version that created it
create table if not exists obligations (
  id uuid primary key default gen_random_uuid(),
  system_id uuid references ai_systems(id) on delete cascade not null,
  regulation_id uuid references regulations(id),  -- which law version this obligation is based on
  framework text not null check (framework in ('EU AI Act','GDPR','Internal Policy')),
  article text not null,
  article_title text not null,
  article_summary text,
  article_full_text text,
  applicable_to text[],
  pct int default 0 check (pct >= 0 and pct <= 100),
  owner uuid references auth.users(id),
  due_at timestamptz,
  notes text,
  -- Law change tracking
  law_changed_since_created boolean default false,  -- set true when regulation superseded
  law_change_reviewed boolean default false,        -- set true when company reviews the change
  created_at timestamptz default now()
);

-- DOCUMENT TEMPLATES — required docs per risk level, based on EU AI Act Annex IV
create table if not exists document_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  applies_to_risk text[] not null,   -- ['High'] or ['High','Limited']
  framework text not null,
  article text not null,
  template_type text not null check (template_type in (
    'risk_assessment','dpia','human_oversight_procedure',
    'technical_documentation','transparency_notice',
    'records_of_processing','data_governance','security_policy',
    'incident_response','candidate_notice'
  )),
  download_url text,                  -- link to fillable template
  guidance_notes text,
  is_mandatory boolean default true,
  created_at timestamptz default now()
);

-- EVIDENCE — full integrity chain
create table if not exists evidence (
  id uuid primary key default gen_random_uuid(),
  obligation_id uuid references obligations(id) on delete cascade not null,
  storage_path text not null,
  file_name text not null,
  file_type text,
  file_size_bytes bigint,
  content_hash text not null,
  column_labels jsonb,
  version int not null default 1,
  uploaded_by uuid references auth.users(id),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  review_status text check (review_status in ('pending','approved','rejected')),
  review_notes text,
  -- Law version at time of upload — so evidence is still valid after law changes
  regulation_version_at_upload text,
  uploaded_at timestamptz default now()
);

-- HUMAN OVERSIGHT LOG
create table if not exists human_decisions (
  id uuid primary key default gen_random_uuid(),
  system_id uuid references ai_systems(id) on delete cascade not null,
  company_id uuid references companies(id) on delete cascade not null,
  reviewer_id uuid references auth.users(id) not null,
  decision_context text not null,
  ai_recommendation text,
  human_decision text not null,
  did_override boolean not null default false,
  override_reason text,
  candidate_ref text,
  review_duration_seconds int,
  decided_at timestamptz default now(),
  session_ref text
);

-- COOKIE CONSENTS — GDPR Art. 7 consent records
create table if not exists cookie_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  session_id text,                    -- for anonymous pre-auth consent
  analytics_accepted boolean default false,
  marketing_accepted boolean default false,
  ip_hash text,                       -- hashed IP, not raw
  user_agent_hash text,               -- hashed UA
  consented_at timestamptz default now(),
  withdrawn_at timestamptz
);

-- APP VERSIONS — tracks what version of the app each company is on
-- Answers: "what version were they using when this evidence was uploaded?"
create table if not exists app_versions (
  id uuid primary key default gen_random_uuid(),
  version text not null,              -- e.g. 'v3.0.0'
  release_notes text,
  law_data_version text,              -- e.g. 'EU-AI-Act-OJ-2024-1689-v1'
  released_at timestamptz default now(),
  is_current boolean default true
);

-- ACTIVITIES
create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade not null,
  actor uuid references auth.users(id),
  action_type text,
  text text not null,
  metadata jsonb,
  created_at timestamptz default now()
);

-- =========================================================================
-- ROW LEVEL SECURITY
-- =========================================================================

alter table companies enable row level security;
alter table memberships enable row level security;
alter table invitations enable row level security;
alter table regulations enable row level security;
alter table law_update_alerts enable row level security;
alter table company_alert_dismissals enable row level security;
alter table ai_systems enable row level security;
alter table obligations enable row level security;
alter table document_templates enable row level security;
alter table evidence enable row level security;
alter table human_decisions enable row level security;
alter table cookie_consents enable row level security;
alter table activities enable row level security;

create or replace function user_companies()
returns setof uuid language sql security definer stable as $$
  select company_id from memberships where user_id = auth.uid();
$$;

-- Companies
drop policy if exists "users see their companies" on companies;
create policy "users see their companies" on companies for select using (id in (select user_companies()));
drop policy if exists "users insert company" on companies;
create policy "users insert company" on companies for insert with check (true);

-- Memberships
drop policy if exists "users see memberships" on memberships;
create policy "users see memberships" on memberships for select
  using (user_id = auth.uid() or company_id in (select user_companies()));
drop policy if exists "users insert membership" on memberships;
create policy "users insert membership" on memberships for insert with check (user_id = auth.uid());

-- Invitations
drop policy if exists "members see invitations" on invitations;
create policy "members see invitations" on invitations for select using (company_id in (select user_companies()));
drop policy if exists "admins manage invitations" on invitations;
create policy "admins manage invitations" on invitations for all
  using (company_id in (select user_companies())) with check (company_id in (select user_companies()));

-- Regulations — publicly readable (law is public knowledge)
drop policy if exists "regulations are public" on regulations;
create policy "regulations are public" on regulations for select using (true);

-- Law update alerts — publicly readable
drop policy if exists "alerts are public" on law_update_alerts;
create policy "alerts are public" on law_update_alerts for select using (true);

-- Company alert dismissals
drop policy if exists "company dismissals" on company_alert_dismissals;
create policy "company dismissals" on company_alert_dismissals for all
  using (company_id in (select user_companies())) with check (company_id in (select user_companies()));

-- AI Systems
drop policy if exists "users manage systems" on ai_systems;
create policy "users manage systems" on ai_systems for all
  using (company_id in (select user_companies())) with check (company_id in (select user_companies()));

-- Obligations
drop policy if exists "users manage obligations" on obligations;
create policy "users manage obligations" on obligations for all
  using (system_id in (select id from ai_systems where company_id in (select user_companies())))
  with check (system_id in (select id from ai_systems where company_id in (select user_companies())));

-- Document templates — publicly readable
drop policy if exists "templates are public" on document_templates;
create policy "templates are public" on document_templates for select using (true);

-- Evidence
drop policy if exists "users manage evidence" on evidence;
create policy "users manage evidence" on evidence for all
  using (obligation_id in (select id from obligations where system_id in (select id from ai_systems where company_id in (select user_companies()))))
  with check (obligation_id in (select id from obligations where system_id in (select id from ai_systems where company_id in (select user_companies()))));

-- Human decisions
drop policy if exists "users manage decisions" on human_decisions;
create policy "users manage decisions" on human_decisions for all
  using (company_id in (select user_companies())) with check (company_id in (select user_companies()));

-- Cookie consents
drop policy if exists "users manage consents" on cookie_consents;
create policy "users manage consents" on cookie_consents for all
  using (user_id = auth.uid() or user_id is null) with check (true);

-- Activities
drop policy if exists "users see activities" on activities;
create policy "users see activities" on activities for select using (company_id in (select user_companies()));
drop policy if exists "users insert activities" on activities;
create policy "users insert activities" on activities for insert with check (company_id in (select user_companies()));

-- =========================================================================
-- STORAGE
-- =========================================================================
insert into storage.buckets (id, name, public) values ('evidence', 'evidence', false) on conflict (id) do nothing;

drop policy if exists "company members read evidence" on storage.objects;
create policy "company members read evidence" on storage.objects for select
  using (bucket_id = 'evidence' and split_part(name,'/',1)='companies' and split_part(name,'/',2)::uuid in (select user_companies()));

drop policy if exists "company members write evidence" on storage.objects;
create policy "company members write evidence" on storage.objects for insert
  with check (bucket_id = 'evidence' and split_part(name,'/',1)='companies' and split_part(name,'/',2)::uuid in (select user_companies()));

-- =========================================================================
-- SEED REGULATIONS — real EU AI Act + GDPR articles
-- Uses INSERT ... ON CONFLICT DO NOTHING so re-runs are safe
-- =========================================================================

insert into regulations (framework, article, title, summary, full_text, applies_to, framework_version, celex_number, source_url, effective_date, enforcement_date, is_deployer_obligation, is_current) values

('EU AI Act','Art. 9','Risk management system',
'You must establish a continuous, documented risk management system covering: identification of known and foreseeable risks to health, safety or fundamental rights; evaluation of risks under intended use and foreseeable misuse; adoption of targeted risk mitigation measures.',
'A risk management system shall be established, implemented, documented and maintained in relation to high-risk AI systems. The risk management system shall comprise the following processes and steps: (a) the identification and analysis of the known and the reasonably foreseeable risks that the high-risk AI system can pose to health, safety or fundamental rights when the high-risk AI system is used in accordance with its intended purpose; (b) the estimation and evaluation of the risks that may emerge when the high-risk AI system is used in accordance with its intended purpose, and under conditions of reasonably foreseeable misuse; (c) the evaluation of other risks possibly arising, based on the analysis of data gathered from the post-market monitoring system referred to in Article 72; (d) the adoption of appropriate and targeted risk management measures designed to address the risks identified pursuant to point (a). (Regulation (EU) 2024/1689, Article 9)',
ARRAY['High'],'OJ L 2024/1689','32024R1689','https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1689','2024-07-12','2026-08-02',true,true),

('EU AI Act','Art. 10','Data and data governance',
'Training, validation and testing data must meet quality criteria: relevant, representative, free from errors and biases that could affect fundamental rights. Data governance practices must be documented including provenance, preparation steps, and bias examination results.',
'High-risk AI systems which make use of techniques involving the training of AI models with data shall be developed on the basis of training, validation and testing data sets that meet the quality criteria referred to in paragraphs 2 to 5. Training, validation and testing data sets shall be subject to data governance and management practices appropriate for the intended purpose of the high-risk AI system. Those practices shall concern in particular: (a) the relevant design choices; (b) data collection and the origin of data, and in the case of personal data, the original purpose of the data collection; (c) relevant data-preparation processing operations; (d) the formulation of assumptions; (e) an assessment of the availability, quantity and suitability of the data sets; (f) examination in view of possible biases that are likely to affect health and safety or lead to discrimination prohibited by Union law. (Regulation (EU) 2024/1689, Article 10)',
ARRAY['High'],'OJ L 2024/1689','32024R1689','https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1689','2024-07-12','2026-08-02',false,true),

('EU AI Act','Art. 11','Technical documentation',
'Technical documentation must be drawn up before market placement and kept up to date. It must demonstrate compliance with Chapter III requirements and provide authorities with all information needed to assess conformity. Minimum content is set out in Annex IV.',
'The technical documentation of a high-risk AI system shall be drawn up before that system is placed on the market or put into service and shall be kept up to date. The technical documentation shall be drawn up in such a way as to demonstrate that the high-risk AI system complies with the requirements set out in this Chapter and provide national competent authorities and notified bodies with all the necessary information to assess the compliance of the AI system with those requirements. It shall contain, at a minimum, the elements set out in Annex IV. (Regulation (EU) 2024/1689, Article 11)',
ARRAY['High'],'OJ L 2024/1689','32024R1689','https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1689','2024-07-12','2026-08-02',false,true),

('EU AI Act','Art. 12','Record-keeping and logging',
'High-risk AI systems must automatically record events (logs) throughout their lifetime. Deployers must retain logs for at least 6 months. Logging must enable monitoring of operation and detection of malfunctions and unexpected situations.',
'High-risk AI systems shall technically allow for the automatic recording of events (logs) over the lifetime of the system. Logging capabilities shall ensure a level of traceability of the AI system''s functioning throughout its lifecycle that is appropriate to the intended purpose of the system. Deployers of high-risk AI systems shall retain the logs automatically generated by the high-risk AI system, to the extent such logs are under their control, for a period that is appropriate to the intended purpose of the high-risk AI system and of applicable legal obligations. (Regulation (EU) 2024/1689, Article 12)',
ARRAY['High'],'OJ L 2024/1689','32024R1689','https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1689','2024-07-12','2026-08-02',true,true),

('EU AI Act','Art. 13','Transparency and provision of information',
'High-risk AI systems must operate with sufficient transparency that deployers can interpret outputs and use them appropriately. The provider must supply instructions for use covering capabilities, limitations, performance metrics, human oversight measures, and known biases.',
'High-risk AI systems shall be designed and developed in such a way as to ensure that their operation is sufficiently transparent to enable deployers to interpret the system''s output and use it appropriately. An appropriate type and degree of transparency shall be ensured with a view to achieving compliance with the relevant obligations of the deployer set out in Article 26. High-risk AI systems shall be accompanied by instructions for use in an appropriate digital format or otherwise, that include concise, complete, correct and clear information that is relevant, accessible and comprehensible to deployers. (Regulation (EU) 2024/1689, Article 13)',
ARRAY['High'],'OJ L 2024/1689','32024R1689','https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1689','2024-07-12','2026-08-02',false,true),

('EU AI Act','Art. 14','Human oversight',
'Deployers must assign human oversight to named persons with competence, training and authority to intervene. Humans must be able to understand AI outputs, monitor operation, and override or refuse AI decisions. Override decisions and reasons must be documented.',
'High-risk AI systems shall be designed and developed in such a way, including with appropriate human-machine interface tools, that they can be effectively overseen by natural persons during the period in which the AI system is in use. Human oversight shall aim at preventing or minimising the risks to health, safety or fundamental rights. Deployers shall assign the oversight to natural persons who have the necessary competence, training and authority, as well as the necessary support. Those persons shall be able to: (a) properly understand the relevant capacities and limitations of the high-risk AI system; (b) monitor the operation of the high-risk AI system and detect and address as soon as possible signs of anomalies, dysfunctions and unexpected performance; (c) refrain from using or continue using the AI system where they detect signs of anomaly, dysfunction or unexpected performance; (d) override, disregard or reverse the output of the AI system. (Regulation (EU) 2024/1689, Article 14)',
ARRAY['High'],'OJ L 2024/1689','32024R1689','https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1689','2024-07-12','2026-08-02',true,true),

('EU AI Act','Art. 26','Obligations of deployers',
'Deployers must: use the system per instructions; assign competent human oversight persons; inform workers before deploying workplace AI; conduct DPIA where required; keep logs for at least 6 months; not use for prohibited purposes; notify providers of serious incidents.',
'Deployers of high-risk AI systems shall take appropriate technical and organisational measures to ensure they use such systems in accordance with the instructions for use. Deployers shall assign the oversight of the operation of the high-risk AI system to natural persons who have the necessary competence, training and authority. Deployers shall ensure that the input data is relevant in view of the intended purpose of the high-risk AI system. Deployers shall monitor the operation of the high-risk AI system on the basis of the instructions for use. Deployers shall keep the logs automatically generated by the high-risk AI system, to the extent such logs are under their control, for a period of at least 6 months unless provided otherwise in applicable Union or national law. (Regulation (EU) 2024/1689, Article 26)',
ARRAY['High'],'OJ L 2024/1689','32024R1689','https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1689','2024-07-12','2026-08-02',true,true),

('EU AI Act','Art. 50','Transparency for certain AI systems',
'AI systems that directly interact with people (chatbots) must inform users they are interacting with AI, unless this is obvious. Providers of AI that generates synthetic content (deepfakes, AI-generated images/text) must ensure outputs are machine-detectable as AI-generated.',
'Providers shall ensure that AI systems intended to interact directly with natural persons are designed and developed in such a way that the natural persons concerned are informed that they are interacting with an AI system, unless this is obvious from the point of view of a natural person who is reasonably well-informed, observant and circumspect. Deployers of an AI system that is used to generate or manipulate image, audio or video content constituting a deep fake shall disclose that the content has been artificially generated or manipulated. (Regulation (EU) 2024/1689, Article 50)',
ARRAY['Limited'],'OJ L 2024/1689','32024R1689','https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32024R1689','2024-07-12','2025-08-02',true,true),

('GDPR','Art. 5','Principles relating to processing',
'Personal data must be processed lawfully, fairly and transparently. Collected for specified, explicit and legitimate purposes only. Adequate, relevant and limited to what is necessary (data minimisation). Accurate and kept up to date. Not kept longer than necessary. Processed securely.',
'Personal data shall be: (a) processed lawfully, fairly and in a transparent manner in relation to the data subject; (b) collected for specified, explicit and legitimate purposes and not further processed in a manner that is incompatible with those purposes; (c) adequate, relevant and limited to what is necessary in relation to the purposes for which they are processed (data minimisation); (d) accurate and, where necessary, kept up to date; (e) kept in a form which permits identification of data subjects for no longer than is necessary (storage limitation); (f) processed in a manner that ensures appropriate security of the personal data. (Regulation (EU) 2016/679, Article 5)',
ARRAY['High','Limited','Minimal'],'OJ L 2016/679','32016R0679','https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32016R0679','2018-05-25',null,true,true),

('GDPR','Art. 22','Automated decision-making',
'Data subjects have the right not to be subject to decisions based solely on automated processing, including profiling, which produces legal or similarly significant effects. Critically relevant for AI-based recruitment screening. Human review must be available on request.',
'The data subject shall have the right not to be subject to a decision based solely on automated processing, including profiling, which produces legal effects concerning him or her or similarly significantly affects him or her. This shall not apply if the decision: (a) is necessary for entering into, or performance of, a contract; (b) is authorised by Union or Member State law; or (c) is based on explicit consent. In the cases referred to in points (a) and (c), the data controller shall implement suitable measures to safeguard the data subject''s rights and freedoms and legitimate interests, at least the right to obtain human intervention, to express his or her point of view and to contest the decision. (Regulation (EU) 2016/679, Article 22)',
ARRAY['High','Limited'],'OJ L 2016/679','32016R0679','https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32016R0679','2018-05-25',null,true,true),

('GDPR','Art. 30','Records of processing activities',
'You must maintain a written record of all personal data processing activities. For AI systems processing personal data, each AI system is a processing activity and must appear in this register with: purposes, data categories, recipients, retention periods, and security measures.',
'Each controller shall maintain a record of processing activities under its responsibility. That record shall contain: (a) the name and contact details of the controller; (b) the purposes of the processing; (c) a description of the categories of data subjects and categories of personal data; (d) the categories of recipients; (e) where applicable, transfers to third countries; (f) where possible, the envisaged time limits for erasure of the different categories of data; (g) where possible, a general description of the technical and organisational security measures. (Regulation (EU) 2016/679, Article 30)',
ARRAY['High','Limited','Minimal'],'OJ L 2016/679','32016R0679','https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32016R0679','2018-05-25',null,true,true),

('GDPR','Art. 32','Security of processing',
'You must implement appropriate technical and organisational measures to ensure security appropriate to the risk: encryption, access controls, incident response, ongoing confidentiality and integrity, ability to restore data after incidents, and regular security testing.',
'Taking into account the state of the art, the costs of implementation and the nature, scope, context and purposes of processing, the controller and the processor shall implement appropriate technical and organisational measures to ensure a level of security appropriate to the risk, including: (a) the pseudonymisation and encryption of personal data; (b) the ability to ensure the ongoing confidentiality, integrity, availability and resilience of processing systems; (c) the ability to restore the availability and access to personal data in a timely manner in the event of a physical or technical incident; (d) a process for regularly testing, assessing and evaluating the effectiveness of technical and organisational security measures. (Regulation (EU) 2016/679, Article 32)',
ARRAY['High','Limited','Minimal'],'OJ L 2016/679','32016R0679','https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32016R0679','2018-05-25',null,true,true),

('GDPR','Art. 35','Data protection impact assessment',
'A DPIA is mandatory before processing that is likely to result in high risk to individuals. AI systems that systematically evaluate personal aspects (work performance, behaviour, location) or make automated decisions with legal effects always require a DPIA.',
'Where a type of processing in particular using new technologies, and taking into account the nature, scope, context and purposes of the processing, is likely to result in a high risk to the rights and freedoms of natural persons, the controller shall, prior to the processing, carry out an assessment of the impact of the envisaged processing operations on the protection of personal data. A single assessment may address a set of similar processing operations that present similar high risks. The data protection officer, where designated, shall be consulted when carrying out a data protection impact assessment. (Regulation (EU) 2016/679, Article 35)',
ARRAY['High'],'OJ L 2016/679','32016R0679','https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32016R0679','2018-05-25',null,true,true)

on conflict do nothing;

-- =========================================================================
-- SEED DOCUMENT TEMPLATES — what documents are required per risk level
-- =========================================================================

insert into document_templates (name, description, applies_to_risk, framework, article, template_type, guidance_notes, is_mandatory) values

('Human Oversight Procedure',
'A written procedure naming the person(s) responsible for human oversight of the AI system, describing how they review AI outputs, what they can override, how overrides are recorded, and the escalation path if the AI malfunctions.',
ARRAY['High'],'EU AI Act','Art. 14','human_oversight_procedure',
'This is the single most-requested document for recruitment AI audits. One page is sufficient. Must name a real person, not just a role title. Must state the override mechanism (e.g. "reviewer can remove any candidate from AI shortlist without giving a reason").',
true),

('Risk Assessment Record',
'Documents identified risks for the AI system, likelihood and severity ratings, and the mitigations in place. Reviewed quarterly and when the system changes.',
ARRAY['High'],'EU AI Act','Art. 9','risk_assessment',
'Use a simple table: Risk | Likelihood (1-5) | Severity (1-5) | Mitigation | Owner | Review date. For recruitment AI, key risks are: gender bias in shortlisting, age discrimination proxy via graduation year, disability disadvantage via CV formatting.',
true),

('Data Protection Impact Assessment (DPIA)',
'Structured assessment of data protection risks for a specific AI system. Required before deploying AI that processes personal data for recruitment, credit, or similar decisions with legal or significant effects.',
ARRAY['High'],'GDPR','Art. 35','dpia',
'The Irish DPC publishes a DPIA template. Use it. The key sections for AI systems are: necessity and proportionality of the AI approach, identification of risks, and measures to address rights of data subjects including the right not to be subject to automated decision-making.',
true),

('Candidate Transparency Notice',
'Notice to job applicants informing them that AI is used in screening, what data is used, how it affects the outcome, and their right to request human review of the AI decision.',
ARRAY['High'],'GDPR','Art. 22',
'candidate_notice',
'Must be given before the AI processes the candidate''s data — typically at the application form stage. Must be in plain language. Must explain the logic of the AI (at least in general terms — exact algorithm not required). Must state the right to contest.',
true),

('Records of Processing Activities (ROPA)',
'Register of all personal data processing activities in the organisation. Each AI system that processes personal data is a processing activity and must appear here.',
ARRAY['High','Limited','Minimal'],'GDPR','Art. 30','records_of_processing',
'Each AI system gets one entry: system name, purpose, data categories processed, legal basis, data retention period, any third-country transfers, and security measures. One page per system is normal.',
true),

('Technical Documentation',
'Documentation required under Art. 11 + Annex IV of the EU AI Act. Describes the system''s design, intended purpose, performance metrics, training data characteristics, and known limitations.',
ARRAY['High'],'EU AI Act','Art. 11','technical_documentation',
'Primarily a provider obligation — your AI vendor should supply this. As a deployer, you should receive and retain a copy. If you built the AI internally, you must produce this yourself. Nora can generate a draft from your system registration data.',
true),

('Security of Processing Policy',
'Documents the technical and organisational security measures protecting personal data processed by the AI system: access controls, encryption, incident response procedure, and testing schedule.',
ARRAY['High','Limited','Minimal'],'GDPR','Art. 32','security_policy',
'Can be a section of a broader information security policy. Must be specific enough to cover AI system data flows. Include: who has access to training data, who has access to AI outputs, how outputs are stored, and what happens in a data breach.',
true)

on conflict do nothing;

-- =========================================================================
-- INITIAL APP VERSION
-- =========================================================================
insert into app_versions (version, release_notes, law_data_version, is_current)
values ('3.0.0', 'Living law system, roles, human oversight log, evidence integrity, cookie consent', 'EU-AI-Act-OJ-2024-1689-v1-GDPR-OJ-2016-679-v1', true)
on conflict do nothing;
