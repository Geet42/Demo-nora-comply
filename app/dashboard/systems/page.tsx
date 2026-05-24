import { fetchSystems } from "@/lib/data";
import { SystemsTable } from "@/components/dashboard/SystemsTable";
import { RegisterSystemButton } from "@/components/dashboard/RegisterSystemButton";

export const dynamic = "force-dynamic";

export default async function SystemsPage() {
  const systems = await fetchSystems();

  return (
    <div className="space-y-8 fade-in">
      <div>
        <span className="eyebrow">— Registry</span>
        <h2
          className="display-serif text-cream mt-3 leading-tight"
          style={{ fontSize: "2.4rem", fontWeight: 400 }}
        >
          AI <span className="italic font-light text-bronze">systems</span>
        </h2>
        <p className="text-sm text-cream2/70 max-w-2xl mt-3 font-light leading-relaxed">
          Every AI system registered in your organisation, with an EU AI Act risk classification and running compliance score.
        </p>
      </div>

      {systems.length === 0 ? (
        <div className="card !bg-coal2 !border-ash p-16 text-center">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--bronze)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-6 opacity-70">
            <path d="M12 2 2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <div
            className="display-serif text-cream mb-3"
            style={{ fontSize: "1.6rem", fontWeight: 400 }}
          >
            No systems yet
          </div>
          <p className="text-sm text-cream2/70 max-w-md mx-auto mb-8 font-light leading-relaxed">
            Register your first AI system to start mapping obligations. Most teams begin with the customer-facing models, then work inward.
          </p>
          <RegisterSystemButton label="Register your first system" />
        </div>
      ) : (
        <SystemsTable systems={systems} />
      )}
    </div>
  );
}
