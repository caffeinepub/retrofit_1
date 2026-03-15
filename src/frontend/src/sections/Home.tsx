import {
  Activity,
  ArrowRight,
  Box,
  ChevronRight,
  FileSpreadsheet,
  Layers,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface Props {
  onStartAssessment: () => void;
}

const FEATURES = [
  {
    icon: Activity,
    title: "NDT Analysis",
    desc: "Rebound Hammer, UPV, Half-Cell & Carbonation tests per IS 13311 & ASTM C876",
    delay: "delay-100",
  },
  {
    icon: Layers,
    title: "RC Jacketing Design",
    desc: "Column, Beam & Footing jacketing designed as per IS 15988:2013 §8.5.1",
    delay: "delay-200",
  },
  {
    icon: Zap,
    title: "FRP Strengthening",
    desc: "Column & Beam FRP per ACI 440.2R-17 and FIB 2010 with confinement analysis",
    delay: "delay-300",
  },
  {
    icon: Box,
    title: "BIM Integration",
    desc: "Scan-to-BIM workflow with Autodesk Revit, ReCap & point cloud data processing",
    delay: "delay-400",
  },
  {
    icon: ShieldCheck,
    title: "IS Code Compliant",
    desc: "IS 15988:2013, IS 456:2000, IS 13311, ASTM C876 — all references cited inline",
    delay: "delay-500",
  },
  {
    icon: FileSpreadsheet,
    title: "Excel Reports",
    desc: "Instant multi-sheet Excel downloads with step-by-step calculations and summaries",
    delay: "delay-600",
  },
];

export default function HomeSection({ onStartAssessment }: Props) {
  return (
    <div className="min-h-full">
      {/* ── Hero ──────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden hero-grid"
        style={{ minHeight: 420 }}
      >
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, oklch(var(--primary) / 0.92) 0%, oklch(0.33 0.09 250) 60%, oklch(0.42 0.07 240) 100%)",
          }}
        />

        {/* SVG Engineering Visual */}
        <svg
          className="absolute right-0 top-0 h-full opacity-10"
          viewBox="0 0 500 420"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: "auto" }}
        >
          {/* Column cross-section art */}
          <rect
            x="60"
            y="80"
            width="100"
            height="260"
            stroke="white"
            strokeWidth="3"
            fill="none"
          />
          <rect
            x="70"
            y="90"
            width="80"
            height="240"
            stroke="white"
            strokeWidth="1"
            strokeDasharray="6 4"
            fill="none"
          />
          <circle cx="80" cy="100" r="8" fill="white" fillOpacity="0.7" />
          <circle cx="150" cy="100" r="8" fill="white" fillOpacity="0.7" />
          <circle cx="80" cy="320" r="8" fill="white" fillOpacity="0.7" />
          <circle cx="150" cy="320" r="8" fill="white" fillOpacity="0.7" />
          {/* Beam */}
          <rect
            x="200"
            y="140"
            width="260"
            height="80"
            stroke="white"
            strokeWidth="3"
            fill="none"
          />
          <rect
            x="210"
            y="150"
            width="240"
            height="60"
            stroke="white"
            strokeWidth="1"
            strokeDasharray="6 4"
            fill="none"
          />
          <circle cx="220" cy="210" r="7" fill="white" fillOpacity="0.7" />
          <circle cx="260" cy="210" r="7" fill="white" fillOpacity="0.7" />
          <circle cx="300" cy="210" r="7" fill="white" fillOpacity="0.7" />
          <circle cx="340" cy="210" r="7" fill="white" fillOpacity="0.7" />
          <circle cx="380" cy="210" r="7" fill="white" fillOpacity="0.7" />
          {/* Dimension lines */}
          <line
            x1="60"
            y1="360"
            x2="160"
            y2="360"
            stroke="white"
            strokeWidth="1.5"
            strokeOpacity="0.6"
          />
          <line
            x1="60"
            y1="355"
            x2="60"
            y2="365"
            stroke="white"
            strokeWidth="1.5"
            strokeOpacity="0.6"
          />
          <line
            x1="160"
            y1="355"
            x2="160"
            y2="365"
            stroke="white"
            strokeWidth="1.5"
            strokeOpacity="0.6"
          />
          <line
            x1="200"
            y1="50"
            x2="460"
            y2="50"
            stroke="white"
            strokeWidth="1.5"
            strokeOpacity="0.6"
          />
          <line
            x1="200"
            y1="45"
            x2="200"
            y2="55"
            stroke="white"
            strokeWidth="1.5"
            strokeOpacity="0.6"
          />
          <line
            x1="460"
            y1="45"
            x2="460"
            y2="55"
            stroke="white"
            strokeWidth="1.5"
            strokeOpacity="0.6"
          />
          {/* Stirrups */}
          <rect
            x="215"
            y="148"
            width="230"
            height="64"
            stroke="white"
            strokeWidth="1"
            strokeOpacity="0.4"
            fill="none"
            rx="2"
          />
          <rect
            x="230"
            y="148"
            width="230"
            height="64"
            stroke="white"
            strokeWidth="1"
            strokeOpacity="0.2"
            fill="none"
            rx="2"
          />
        </svg>

        <div className="relative z-10 px-8 py-16 md:py-24 max-w-2xl">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6 animate-fade-in"
            style={{
              background: "rgba(255,255,255,0.15)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.25)",
            }}
          >
            <ShieldCheck size={13} /> IS 15988:2013 Compliant
          </div>

          <h1
            className="font-poppins font-bold text-3xl md:text-4xl lg:text-5xl leading-tight mb-4 animate-fade-in delay-100"
            style={{ color: "white" }}
          >
            RetroFit
          </h1>
          <h2
            className="font-poppins font-semibold text-xl md:text-2xl mb-4 animate-fade-in delay-200"
            style={{ color: "rgba(255,255,255,0.85)" }}
          >
            Structural Assessment &amp; Retrofitting Platform
          </h2>
          <p
            className="font-inter text-base leading-relaxed mb-8 animate-fade-in delay-300"
            style={{ color: "rgba(255,255,255,0.72)", maxWidth: 520 }}
          >
            Professional NDT-based structural health assessment with automated
            RC Jacketing and FRP strengthening design. Compliant with IS
            15988:2013, IS 456:2000, ACI 440.2R-17, and IS 13311.
          </p>

          <button
            type="button"
            data-ocid="home.start_assessment.primary_button"
            className="btn-primary animate-fade-in delay-400 text-base px-8 py-3.5"
            style={{ background: "white", color: "oklch(var(--primary))" }}
            onClick={onStartAssessment}
          >
            Start Assessment <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* ── Feature Cards ──────────────────────────────── */}
      <section className="px-6 md:px-10 py-12">
        <div className="mb-8">
          <h2 className="font-poppins font-bold text-2xl text-navy mb-2">
            Platform Capabilities
          </h2>
          <p className="font-inter text-sm text-muted-foreground">
            Comprehensive structural engineering tools in one integrated
            platform
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <div key={i} className={`feature-card animate-fade-in ${f.delay}`}>
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "oklch(var(--primary) / 0.08)" }}
              >
                <f.icon size={22} style={{ color: "oklch(var(--primary))" }} />
              </div>
              <h3 className="font-poppins font-semibold text-base text-navy mb-2">
                {f.title}
              </h3>
              <p className="font-inter text-sm text-muted-foreground leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Jacketing Visual Strip ─────────────────────── */}
      <section
        className="mx-6 md:mx-10 mb-10 rounded-2xl overflow-hidden"
        style={{
          background: "oklch(var(--primary) / 0.04)",
          border: "1px solid oklch(var(--primary) / 0.1)",
        }}
      >
        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
          <div className="p-8">
            <h3 className="font-poppins font-bold text-lg text-navy mb-3 flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "oklch(var(--primary) / 0.1)" }}
              >
                <Layers size={15} style={{ color: "oklch(var(--primary))" }} />
              </div>
              Column Jacketing
            </h3>
            <p className="font-inter text-sm text-muted-foreground leading-relaxed mb-4">
              RC jacketing of columns per IS 15988:2013 §8.5.1. The module
              computes upgraded fck, new column size, jacket thickness (min
              100mm), additional reinforcement, tie design, and shear connector
              layout.
            </p>
            <div className="flex flex-wrap gap-2">
              {["§8.5.1.1(e)", "§8.5.1.2(a)", "§8.5.1.2(c)"].map((ref) => (
                <span
                  key={ref}
                  className="text-xs px-2 py-0.5 rounded-full badge-good font-mono"
                >
                  {ref}
                </span>
              ))}
            </div>
          </div>
          <div className="p-8">
            <h3 className="font-poppins font-bold text-lg text-navy mb-3 flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "oklch(var(--primary) / 0.1)" }}
              >
                <Zap size={15} style={{ color: "oklch(var(--primary))" }} />
              </div>
              Beam Jacketing
            </h3>
            <p className="font-inter text-sm text-muted-foreground leading-relaxed mb-4">
              Beam section jacketing per IS 15988:2013 with IS 456:2000 flexure
              and shear design. Fixed section increment (b+200, D+100), Ast
              design, and shear check using IS 456 Table 19.
            </p>
            <div className="flex flex-wrap gap-2">
              {["IS 456:2000", "Table 19", "IS 15988:2013"].map((ref) => (
                <span
                  key={ref}
                  className="text-xs px-2 py-0.5 rounded-full badge-good font-mono"
                >
                  {ref}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────── */}
      <section className="px-6 md:px-10 pb-12 text-center">
        <button
          type="button"
          data-ocid="home.cta.primary_button"
          className="btn-primary text-base px-10 py-4"
          onClick={onStartAssessment}
        >
          Start Structural Assessment <ChevronRight size={18} />
        </button>
        <p className="mt-3 text-xs text-muted-foreground font-inter">
          Begin with NDT test results — Step 1 of 4
        </p>
      </section>
    </div>
  );
}
