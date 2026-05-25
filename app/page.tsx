import { Nav } from '@/components/landing/Nav'
import { Hero } from '@/components/landing/Hero'
import { TrustStrip } from '@/components/landing/TrustStrip'
import { FeatureGrid } from '@/components/landing/FeatureGrid'
import { ComplianceMap } from '@/components/landing/ComplianceMap'
import { ArchDecisions } from '@/components/landing/ArchDecisions'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { CTA } from '@/components/landing/CTA'
import { Footer } from '@/components/landing/Footer'

export const dynamic = 'force-dynamic'

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-x-hidden" style={{ background: '#f4f8fd', color: '#0a1628' }}>
      <Nav />
      <Hero />
      <TrustStrip />

      <section id="product" className="px-4 sm:px-6 lg:px-10 py-16 sm:py-24 lg:py-32" style={{ background: '#f4f8fd' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 lg:mb-14">
            <div className="max-w-2xl">
              <span className="eyebrow" style={{ color: '#5c85b8' }}>What it does</span>
              <h2 className="display-serif text-ink mt-4 leading-[1.05]" style={{ fontSize: 'clamp(1.8rem, 4.5vw, 3.2rem)', fontWeight: 400 }}>
                Eight surfaces.{' '}
                <span className="italic font-light" style={{ color: '#2563b0' }}>One system of record.</span>
              </h2>
            </div>
            <p className="max-w-md font-light leading-relaxed" style={{ color: '#2a4a72' }}>
              Built around the obligations European regulators actually ask about — not a generic governance checklist.
            </p>
          </div>
          <FeatureGrid />
        </div>
      </section>

      <section id="compliance" className="px-4 sm:px-6 lg:px-10 py-16 sm:py-24 lg:py-32" style={{ background: '#e8f2fc', borderTop: '1px solid #c8ddf2', borderBottom: '1px solid #c8ddf2' }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 lg:mb-14 max-w-2xl">
            <span className="eyebrow" style={{ color: '#5c85b8' }}>The map</span>
            <h2 className="display-serif text-ink mt-4 leading-[1.05]" style={{ fontSize: 'clamp(1.8rem, 4.5vw, 3.2rem)', fontWeight: 400 }}>
              Every article,{' '}
              <span className="italic font-light" style={{ color: '#2563b0' }}>accounted for.</span>
            </h2>
            <p className="font-light leading-relaxed mt-5" style={{ color: '#2a4a72' }}>
              Nora pre-loads the obligations that follow from EU AI Act risk classification. Law text sourced from EUR-Lex, versioned in the database, never deleted.
            </p>
          </div>
          <ComplianceMap />
        </div>
      </section>

      <ArchDecisions />
      <HowItWorks />
      <CTA />
      <Footer />
    </main>
  )
}
