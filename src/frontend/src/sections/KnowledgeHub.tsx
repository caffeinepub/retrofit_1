import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Layers,
  Lightbulb,
  MapPin,
  Wrench,
} from "lucide-react";
import { useState } from "react";

const TABS = [
  { id: "importance", label: "Importance", icon: Lightbulb },
  { id: "cases", label: "Case Studies", icon: MapPin },
  { id: "types", label: "Types of Retrofitting", icon: Layers },
  { id: "process", label: "Site Process", icon: Wrench },
];

const CASE_STUDIES = [
  {
    id: 1,
    title: "RC Frame Building — Patna, Bihar",
    location: "Patna, Bihar",
    problem:
      "A 4-storey residential RC frame structure suffered severe flood-induced deterioration. Column bases showed extensive spalling, reinforcement corrosion with up to 40% cross-section loss, and UPV readings below 2.5 km/s indicating very poor concrete quality.",
    intervention:
      "Full RC Jacketing of ground-floor columns with 120mm jacket thickness. New jacket fck upgraded from 15 to 20 MPa per IS 15988:2013. Shear connectors at 250mm c/c. Surface preparation with hydro-jetting prior to casting.",
    outcome:
      "Post-retrofit UPV readings improved to 3.8 km/s. Axial load capacity restored to 110% of original design. Building certified habitable by state PWD.",
    code: "IS 15988:2013, IS 13311 (Part 1)",
  },
  {
    id: 2,
    title: "SBI Branch Office — Gandhidham, Gujarat",
    location: "Gandhidham, Gujarat",
    problem:
      "The 2001 Bhuj earthquake (Mw 7.7) caused shear cracking in 6 columns. Half-cell potential readings ranged from −280 to −420mV indicating active corrosion. The building was structurally unsafe for occupancy.",
    intervention:
      "Column jacketing for seismic upgrade. New column sizes designed per IS 15988:2013 for enhanced ductility. Ties at 100mm in plastic hinge zones. CFRP corner wrapping at beam-column joints.",
    outcome:
      "Lateral load capacity increased by 65%. Building re-opened for banking operations within 4 months. Retrofit certified by IIT Gandhinagar structural review team.",
    code: "IS 15988:2013, IS 1893:2016",
  },
  {
    id: 3,
    title: "Heritage Colonial Structure — Shimla, HP",
    location: "Shimla, Himachal Pradesh",
    problem:
      "A 120-year-old colonial administrative building showed carbonation depths of 35–45mm against a cover of 25mm. Traditional RC jacketing would have altered the heritage appearance permanently.",
    intervention:
      "CFRP wrapping adopted to preserve aesthetic character. ACI 440.2R column confinement with 2 plies of 0.165mm CFRP. Lime-based surface repair prior to FRP application. Corner radii prepared to 30mm minimum.",
    outcome:
      "Confined strength fcc increased from 18 to 28 MPa. Visual appearance preserved. Heritage building retained Grade-II status by ASI. Monitoring sensors installed for long-term tracking.",
    code: "ACI 440.2R-17, IS 13311 (Part 2)",
  },
  {
    id: 4,
    title: "Industrial Warehouse — Akola, Maharashtra",
    location: "Akola, Maharashtra",
    problem:
      "A 30-year-old industrial warehouse showed Rebound Numbers of 12–18, visible column deterioration, and bar corrosion. Chloride attack from fertiliser storage caused extensive section loss in 14 of 20 columns.",
    intervention:
      "Full RC jacketing with 150mm jacket on all deteriorated columns. fck upgraded from 15 to 25 MPa. Epoxy injection of existing cracks before jacketing. Additional 4 nos 16mm bars with shear connectors at 200mm c/c.",
    outcome:
      "All columns restored to full design capacity. Rebound Numbers post-retrofit averaged 35–40. Industrial operations resumed. Annual NDT monitoring protocol established.",
    code: "IS 15988:2013 §8.5.1, IS 456:2000",
  },
  {
    id: 5,
    title: "Mani Mandir — Morbi & Kerala FRP Practice",
    location: "Morbi, Gujarat / Kerala",
    problem:
      "Post the 2022 Morbi bridge collapse, assessment of heritage temples in seismic zones became a national priority. Several temples in Kerala showed carbonation depths exceeding cover (avg 42mm vs 25mm cover).",
    intervention:
      "GFRP and CFRP wrapping for temple columns and beams. Kerala PWD implemented FRP strengthening in 25+ public structures as a pilot. FRP strips bonded to beam soffits for flexural strengthening per ACI 440.2R-17.",
    outcome:
      "Flexural capacities of beams increased by 40–60%. Column axial capacities restored. Programme cited as model for heritage structure retrofitting by Ministry of Housing & Urban Affairs.",
    code: "ACI 440.2R-17, FIB 2010",
  },
];

const SITE_PROCESS = [
  {
    id: 1,
    title: "Column Jacketing — Step-by-Step Process",
    steps: [
      "Surface Preparation: Chip off loose concrete, clean rust from bars with wire brush, apply anti-corrosion coating.",
      "Crack Treatment: Inject epoxy resin into cracks >0.3mm width under pressure.",
      "Install Shear Connectors: Drill 12mm holes at 250mm c/c on 2 faces; fix 12mm dia L-shaped dowels with epoxy adhesive.",
      "New Reinforcement: Place new longitudinal bars and ties as per design. Maintain cover with spacers.",
      "Formwork: Erect plywood formwork around column leaving 100–150mm jacket space. Ensure vertical alignment.",
      "Concrete Pouring: Use M25 or higher grade non-shrink micro-concrete. Pour in layers, vibrate thoroughly.",
      "Curing: Wet-cure for minimum 14 days. Use curing compound on exposed surfaces.",
      "Quality Check: UPV test on new jacket after 28 days; Rebound Hammer readings ≥35.",
    ],
  },
  {
    id: 2,
    title: "Beam Jacketing — Step-by-Step Process",
    steps: [
      "NDT Survey: Map deterioration using Rebound Hammer and UPV. Mark crack patterns.",
      "Surface Preparation: Remove laitance and loose material by sandblasting or hydro-jetting.",
      "Bar Cleaning & Primer: Wire-brush corroded bars; apply zinc-rich primer.",
      "Drill & Fix Shear Connectors: Install L-shaped 10mm bars at 200mm c/c through beam soffit.",
      "Reinforcement Placement: Lay new 16mm longitudinal bars and shear links.",
      "Shuttering: Form beam sides and soffit leaving design clearance.",
      "Concreting & Curing: Pour M25 micro-concrete; cure for 14 days minimum.",
    ],
  },
  {
    id: 3,
    title: "FRP Column Wrapping — Step-by-Step",
    steps: [
      "Surface Grinding: Grind column surface to Sa 2.5 cleanliness; round all corners to minimum 25–30mm radius.",
      "Crack Repair: Fill voids with epoxy putty; level surface with filler.",
      "Primer Application: Apply epoxy primer; allow to cure 4–8 hours.",
      "FRP Sheet Preparation: Cut CFRP/GFRP sheets to required width; apply saturant resin to both sides.",
      "Wet Lay-up: Apply FRP sheets around column with 150mm overlap at each wrap. Remove air bubbles with roller.",
      "Curing & Protection: Allow 24–48 hrs curing at ambient temperature; apply UV-resistant top coat.",
    ],
  },
  {
    id: 4,
    title: "FRP Beam Bonding — Step-by-Step",
    steps: [
      "Surface Preparation: Grind beam soffit to remove laitance; achieve concrete pull-off strength ≥1.5 MPa.",
      "Moisture Check: Ensure surface is dry (moisture <5%) before bonding.",
      "Epoxy Adhesive: Mix epoxy adhesive components as per manufacturer specification; apply to beam soffit.",
      "FRP Strip Application: Position pre-cured CFRP strips or wet lay-up sheets; press firmly to eliminate voids.",
      "Anchor Bolts: Install U-anchor straps at strip ends to prevent debonding.",
      "Quality Assurance: Tap test (coin test) for delamination; repair voids with injection grouting.",
    ],
  },
];

function ImagePlaceholder({
  label,
  height = 180,
}: { label: string; height?: number }) {
  return (
    <div
      className="rounded-xl flex items-center justify-center"
      style={{
        height,
        background: "oklch(var(--muted))",
        border: "2px dashed oklch(var(--border))",
      }}
    >
      <div className="text-center">
        <div
          className="w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center"
          style={{ background: "oklch(var(--primary) / 0.1)" }}
        >
          <BookOpen size={20} style={{ color: "oklch(var(--primary))" }} />
        </div>
        <p className="text-xs text-muted-foreground font-inter">{label}</p>
      </div>
    </div>
  );
}

export default function KnowledgeHub() {
  const [activeTab, setActiveTab] = useState("importance");
  const [openAccordion, setOpenAcc] = useState<number | null>(null);

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="font-poppins font-bold text-2xl text-navy mb-1">
          Knowledge Hub
        </h1>
        <p className="font-inter text-sm text-muted-foreground">
          Structural retrofitting resources, case studies, and site guidance
        </p>
      </div>

      <div
        className="flex flex-wrap gap-2 mb-8 p-1 rounded-xl"
        style={{ background: "oklch(var(--muted))" }}
      >
        {TABS.map((tab) => (
          <button
            type="button"
            key={tab.id}
            data-ocid={`knowledge.${tab.id}.tab`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-inter font-medium transition-all"
            style={{
              background: activeTab === tab.id ? "white" : "transparent",
              color:
                activeTab === tab.id
                  ? "oklch(var(--primary))"
                  : "oklch(var(--muted-foreground))",
              boxShadow:
                activeTab === tab.id ? "0 1px 6px rgba(27,42,74,0.10)" : "none",
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "importance" && (
        <div className="animate-fade-in space-y-6">
          <div className="grid md:grid-cols-2 gap-5">
            {[
              {
                icon: "🏛️",
                title: "Aging Infrastructure",
                desc: "Over 60% of India's RC structures are more than 30 years old, built under earlier, less stringent codes. Carbonation depth now often exceeds concrete cover, exposing reinforcement to corrosion.",
              },
              {
                icon: "⚠️",
                title: "Seismic Vulnerability",
                desc: "Large parts of India fall in seismic zones III–V. Buildings designed before IS 1893:2002 lack ductility provisions. RC jacketing or FRP significantly improves lateral load resistance.",
              },
              {
                icon: "💰",
                title: "Economic Value",
                desc: "Retrofitting costs 30–50% of new construction while preserving the existing structure. For institutional and heritage buildings, it is the only economically and socially viable option.",
              },
              {
                icon: "📋",
                title: "IS Code Evolution",
                desc: "IS 15988:2013 provides a comprehensive framework for seismic evaluation and strengthening. It prescribes detailed procedures for RC jacketing, specifying minimum jacket dimensions and shear connector design.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`feature-card animate-fade-in delay-${(i + 1) * 100}`}
              >
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="font-poppins font-bold text-base text-navy mb-2">
                  {item.title}
                </h3>
                <p className="font-inter text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
          <ImagePlaceholder
            label="Before / After Retrofitting Comparison"
            height={220}
          />
        </div>
      )}

      {activeTab === "cases" && (
        <div className="animate-fade-in space-y-5">
          {CASE_STUDIES.map((cs, i) => (
            <div
              key={cs.id}
              className={`bg-card rounded-xl border border-border p-6 animate-fade-in delay-${(i + 1) * 100}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-poppins font-bold text-base text-navy">
                    {cs.title}
                  </h3>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin size={12} className="text-steel" />
                    <span className="text-xs text-muted-foreground font-inter">
                      {cs.location}
                    </span>
                  </div>
                </div>
                <span className="text-xs px-3 py-1 rounded-full badge-good font-mono">
                  {cs.code}
                </span>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Problem
                  </div>
                  <p className="text-sm font-inter leading-relaxed">
                    {cs.problem}
                  </p>
                </div>
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Intervention
                  </div>
                  <p className="text-sm font-inter leading-relaxed">
                    {cs.intervention}
                  </p>
                </div>
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Outcome
                  </div>
                  <p className="text-sm font-inter text-success leading-relaxed">
                    {cs.outcome}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "types" && (
        <div className="animate-fade-in space-y-5">
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: "🏗️",
                title: "RCC Jacketing",
                when: "Poor concrete quality (RN < 20, UPV < 3.0 km/s), active corrosion, structural inadequacy under revised loads.",
                adv: "Increases both stiffness and strength. Uses conventional materials. IS 15988:2013 compliant.",
                desc: "A reinforced concrete jacket is cast around the existing column or beam. New reinforcement tied to existing bars via shear connectors. Minimum jacket thickness: 100mm per IS 15988.",
              },
              {
                icon: "🔬",
                title: "FRP Retrofitting",
                when: "Moderate deterioration with corrosion. Heritage structures where aesthetics must be preserved. Where weight increase is undesirable.",
                adv: "High strength-to-weight ratio. Non-corrosive. Quick installation. Excellent for seismic confinement.",
                desc: "Carbon or glass FRP sheets bonded to the column surface using epoxy resin. For beams, CFRP strips are bonded to the soffit. Designed per ACI 440.2R-17 and FIB 2010.",
              },
              {
                icon: "⚙️",
                title: "Structural Strengthening",
                when: "General deterioration, change in occupancy loads, seismic upgrade, post-disaster repair.",
                adv: "Versatile. Can be combined with other methods. Addresses specific failure modes.",
                desc: "Methods include: concrete jacketing, steel plate bonding, post-tensioning, section enlargement, base isolation, and mass reduction. Choice depends on failure mode and performance objectives.",
              },
            ].map((type, i) => (
              <div key={i} className="feature-card">
                <div className="text-3xl mb-3">{type.icon}</div>
                <h3 className="font-poppins font-bold text-base text-navy mb-2">
                  {type.title}
                </h3>
                <p className="text-sm font-inter text-foreground leading-relaxed mb-3">
                  {type.desc}
                </p>
                <div
                  className="border-t pt-3"
                  style={{ borderColor: "oklch(var(--border))" }}
                >
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    When to Use
                  </div>
                  <p className="text-xs font-inter leading-relaxed mb-2">
                    {type.when}
                  </p>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Advantages
                  </div>
                  <p className="text-xs font-inter leading-relaxed">
                    {type.adv}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <ImagePlaceholder label="Column Jacketing" />
            <ImagePlaceholder label="Beam Strengthening" />
            <ImagePlaceholder label="FRP Wrapping" />
            <ImagePlaceholder label="Before / After" />
          </div>
        </div>
      )}

      {activeTab === "process" && (
        <div className="animate-fade-in space-y-3">
          {SITE_PROCESS.map((proc) => (
            <div
              key={proc.id}
              className="bg-card rounded-xl border border-border overflow-hidden"
            >
              <button
                type="button"
                data-ocid={`knowledge.process_${proc.id}.toggle`}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                onClick={() =>
                  setOpenAcc(openAccordion === proc.id ? null : proc.id)
                }
              >
                <span className="font-poppins font-semibold text-sm text-navy">
                  {proc.title}
                </span>
                {openAccordion === proc.id ? (
                  <ChevronUp size={18} className="text-muted-foreground" />
                ) : (
                  <ChevronDown size={18} className="text-muted-foreground" />
                )}
              </button>
              {openAccordion === proc.id && (
                <div className="px-6 pb-6 animate-fade-in">
                  <ol className="space-y-3">
                    {proc.steps.map((step, i) => (
                      <li key={i} className="flex gap-3">
                        <div
                          className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold font-poppins text-white mt-0.5"
                          style={{ background: "oklch(var(--primary))" }}
                        >
                          {i + 1}
                        </div>
                        <p className="font-inter text-sm text-foreground leading-relaxed">
                          {step}
                        </p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
