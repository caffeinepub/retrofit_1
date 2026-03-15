import {
  AlertCircle,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
} from "lucide-react";
import { useState } from "react";
import BeamFRP from "../modules/BeamFRP";
import BeamJacketing from "../modules/BeamJacketing";
import ColumnFRP from "../modules/ColumnFRP";
import ColumnJacketing from "../modules/ColumnJacketing";
import FootingJacketing from "../modules/FootingJacketing";
import { type NDTResults, computeNDTResults } from "../utils/calculations";

type TestId = "rh" | "upv" | "hcp" | "carb";
type ModuleId =
  | "col_jack"
  | "beam_jack"
  | "ftg_jack"
  | "col_frp"
  | "beam_frp"
  | null;

const TESTS: { id: TestId; label: string; standard: string }[] = [
  { id: "rh", label: "Rebound Hammer Test", standard: "IS 13311 (Part 2)" },
  { id: "upv", label: "UPV Test", standard: "IS 13311 (Part 1)" },
  { id: "hcp", label: "Half Cell Potential Test", standard: "ASTM C876" },
  { id: "carb", label: "Carbonation Test", standard: "IS 516" },
];

const HEALTH_COLOR: Record<string, string> = {
  Excellent: "badge-good",
  Good: "badge-good",
  Moderate: "badge-fair",
  Poor: "badge-poor",
  Critical: "badge-poor",
};

const GRADE_COLOR: Record<string, string> = {
  "Very Good": "text-success",
  Excellent: "text-success",
  Good: "text-success",
  Medium: "text-warning",
  Fair: "text-warning",
  Poor: "text-danger",
  "No Corrosion (90%)": "text-success",
  Uncertain: "text-warning",
  "Corrosion (90%)": "text-danger",
  Safe: "text-success",
  "At Risk": "text-warning",
  "High Risk": "text-danger",
};

export default function Assessment() {
  const [step, setStep] = useState(1);
  const [selectedTests, setSelectedTests] = useState<Set<TestId>>(new Set());
  const [rn, setRn] = useState("");
  const [upv, setUpv] = useState("");
  const [mv, setMv] = useState("");
  const [cd, setCd] = useState(""); // carbonation depth
  const [cc, setCc] = useState(""); // concrete cover
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [results, setResults] = useState<NDTResults | null>(null);
  const [module, setModule] = useState<ModuleId>(null);

  function toggleTest(id: TestId) {
    setSelectedTests((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  function validateStep2(): boolean {
    const errs: Record<string, string> = {};
    if (selectedTests.has("rh") && !rn.trim())
      errs.rn = "Rebound Number is required";
    if (selectedTests.has("upv") && !upv.trim())
      errs.upv = "UPV value is required";
    if (selectedTests.has("hcp") && !mv.trim())
      errs.mv = "Half Cell Potential is required";
    if (selectedTests.has("carb")) {
      if (!cd.trim()) errs.cd = "Carbonation Depth is required";
      if (!cc.trim()) errs.cc = "Concrete Cover is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function runAnalysis() {
    if (!validateStep2()) return;
    const r = computeNDTResults({
      rn: selectedTests.has("rh") ? Number.parseFloat(rn) : undefined,
      upv: selectedTests.has("upv") ? Number.parseFloat(upv) : undefined,
      mv: selectedTests.has("hcp") ? Number.parseFloat(mv) : undefined,
      carbDepth: selectedTests.has("carb") ? Number.parseFloat(cd) : undefined,
      carbCover: selectedTests.has("carb") ? Number.parseFloat(cc) : undefined,
    });
    setResults(r);
    setStep(3);
  }

  // Module open
  if (module) {
    return (
      <div>
        <button
          type="button"
          data-ocid="assessment.back.button"
          className="flex items-center gap-2 m-6 btn-secondary"
          onClick={() => setModule(null)}
        >
          <ChevronLeft size={16} /> Back to Assessment
        </button>
        {module === "col_jack" && (
          <ColumnJacketing
            ndtFck={
              results
                ? results.strengthGrade === "Very Good"
                  ? 30
                  : results.strengthGrade === "Good"
                    ? 25
                    : results.strengthGrade === "Fair"
                      ? 20
                      : 15
                : 25
            }
          />
        )}
        {module === "beam_jack" && (
          <BeamJacketing
            ndtFck={
              results
                ? results.strengthGrade === "Very Good"
                  ? 30
                  : results.strengthGrade === "Good"
                    ? 25
                    : results.strengthGrade === "Fair"
                      ? 20
                      : 15
                : 25
            }
          />
        )}
        {module === "ftg_jack" && (
          <FootingJacketing
            ndtFck={
              results
                ? results.strengthGrade === "Very Good"
                  ? 30
                  : results.strengthGrade === "Good"
                    ? 25
                    : results.strengthGrade === "Fair"
                      ? 20
                      : 15
                : 25
            }
          />
        )}
        {module === "col_frp" && <ColumnFRP />}
        {module === "beam_frp" && <BeamFRP />}
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-poppins font-bold text-2xl text-navy mb-1">
          Structural Assessment Wizard
        </h1>
        <p className="font-inter text-sm text-muted-foreground">
          NDT-based structural health evaluation — IS 13311, ASTM C876, IS 516
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8">
        {["NDT Selection", "Input Values", "Analysis", "Recommendation"].map(
          (label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-poppins transition-all ${
                  step > i + 1
                    ? "bg-success text-white"
                    : step === i + 1
                      ? "text-white"
                      : "bg-muted text-muted-foreground"
                }`}
                style={
                  step === i + 1 ? { background: "oklch(var(--primary))" } : {}
                }
              >
                {i + 1}
              </div>
              <span
                className={`text-xs font-inter hidden sm:block ${
                  step === i + 1
                    ? "text-navy font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
              {i < 3 && (
                <ChevronRight size={14} className="text-muted-foreground" />
              )}
            </div>
          ),
        )}
      </div>

      {/* ── Step 1: NDT Test Selection */}
      {step === 1 && (
        <div className="animate-fade-in">
          <div className="bg-card rounded-xl border border-border p-6 mb-6">
            <h2 className="font-poppins font-semibold text-base text-navy mb-4 flex items-center gap-2">
              <CheckSquare size={18} /> Select NDT Tests Performed
            </h2>
            <div className="space-y-3">
              {TESTS.map((test) => (
                <label
                  key={test.id}
                  data-ocid={`assessment.test_${test.id}.checkbox`}
                  className="flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all hover:border-primary/40"
                  style={{
                    borderColor: selectedTests.has(test.id)
                      ? "oklch(var(--primary) / 0.5)"
                      : "oklch(var(--border))",
                    background: selectedTests.has(test.id)
                      ? "oklch(var(--primary) / 0.04)"
                      : "transparent",
                  }}
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-primary"
                    checked={selectedTests.has(test.id)}
                    onChange={() => toggleTest(test.id)}
                  />
                  <div className="flex-1">
                    <div className="font-inter font-medium text-sm text-foreground">
                      {test.label}
                    </div>
                    <div className="font-inter text-xs text-muted-foreground">
                      {test.standard}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {selectedTests.size === 0 && (
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <AlertCircle size={14} /> Select at least one test to proceed
              </div>
            )}
          </div>
          <button
            type="button"
            data-ocid="assessment.step1.primary_button"
            className="btn-primary"
            disabled={selectedTests.size === 0}
            style={
              selectedTests.size === 0
                ? { opacity: 0.5, cursor: "not-allowed" }
                : {}
            }
            onClick={() => setStep(2)}
          >
            Next: Enter Values <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ── Step 2: Input Values */}
      {step === 2 && (
        <div className="animate-fade-in">
          <div className="bg-card rounded-xl border border-border p-6 mb-6">
            <h2 className="font-poppins font-semibold text-base text-navy mb-6 flex items-center gap-2">
              <FlaskConical size={18} /> Enter Test Results
            </h2>
            <div className="space-y-5">
              {selectedTests.has("rh") && (
                <div>
                  <label className="font-inter text-sm font-medium text-foreground block mb-1">
                    Rebound Number (RN){" "}
                    <span className="text-xs text-muted-foreground">
                      — IS 13311 (Part 2)
                    </span>
                  </label>
                  <input
                    data-ocid="assessment.rn.input"
                    type="number"
                    className={`form-input ${errors.rn ? "error" : ""}`}
                    value={rn}
                    onChange={(e) => {
                      setRn(e.target.value);
                      setErrors((p) => ({ ...p, rn: "" }));
                    }}
                  />
                  {errors.rn && (
                    <p className="text-xs text-danger mt-1">{errors.rn}</p>
                  )}
                </div>
              )}
              {selectedTests.has("upv") && (
                <div>
                  <label className="font-inter text-sm font-medium text-foreground block mb-1">
                    UPV Value (km/s){" "}
                    <span className="text-xs text-muted-foreground">
                      — IS 13311 (Part 1)
                    </span>
                  </label>
                  <input
                    data-ocid="assessment.upv.input"
                    type="number"
                    step="0.01"
                    className={`form-input ${errors.upv ? "error" : ""}`}
                    value={upv}
                    onChange={(e) => {
                      setUpv(e.target.value);
                      setErrors((p) => ({ ...p, upv: "" }));
                    }}
                  />
                  {errors.upv && (
                    <p className="text-xs text-danger mt-1">{errors.upv}</p>
                  )}
                </div>
              )}
              {selectedTests.has("hcp") && (
                <div>
                  <label className="font-inter text-sm font-medium text-foreground block mb-1">
                    Half Cell Potential (mV){" "}
                    <span className="text-xs text-muted-foreground">
                      — ASTM C876 (enter as negative, e.g. -250)
                    </span>
                  </label>
                  <input
                    data-ocid="assessment.hcp.input"
                    type="number"
                    className={`form-input ${errors.mv ? "error" : ""}`}
                    value={mv}
                    onChange={(e) => {
                      setMv(e.target.value);
                      setErrors((p) => ({ ...p, mv: "" }));
                    }}
                  />
                  {errors.mv && (
                    <p className="text-xs text-danger mt-1">{errors.mv}</p>
                  )}
                </div>
              )}
              {selectedTests.has("carb") && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-inter text-sm font-medium text-foreground block mb-1">
                      Carbonation Depth (mm){" "}
                      <span className="text-xs text-muted-foreground">
                        — IS 516
                      </span>
                    </label>
                    <input
                      data-ocid="assessment.carb_depth.input"
                      type="number"
                      className={`form-input ${errors.cd ? "error" : ""}`}
                      value={cd}
                      onChange={(e) => {
                        setCd(e.target.value);
                        setErrors((p) => ({ ...p, cd: "" }));
                      }}
                    />
                    {errors.cd && (
                      <p className="text-xs text-danger mt-1">{errors.cd}</p>
                    )}
                  </div>
                  <div>
                    <label className="font-inter text-sm font-medium text-foreground block mb-1">
                      Concrete Cover (mm)
                    </label>
                    <input
                      data-ocid="assessment.carb_cover.input"
                      type="number"
                      className={`form-input ${errors.cc ? "error" : ""}`}
                      value={cc}
                      onChange={(e) => {
                        setCc(e.target.value);
                        setErrors((p) => ({ ...p, cc: "" }));
                      }}
                    />
                    {errors.cc && (
                      <p className="text-xs text-danger mt-1">{errors.cc}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              data-ocid="assessment.step2.back.button"
              className="btn-secondary"
              onClick={() => setStep(1)}
            >
              <ChevronLeft size={16} /> Back
            </button>
            <button
              type="button"
              data-ocid="assessment.step2.primary_button"
              className="btn-primary"
              onClick={runAnalysis}
            >
              Run Analysis <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Results */}
      {step === 3 && results && (
        <div className="animate-fade-in">
          <div className="bg-card rounded-xl border border-border p-6 mb-6">
            <h2 className="font-poppins font-semibold text-base text-navy mb-6">
              Analysis Results
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {results.strengthGrade && (
                <div
                  className="p-4 rounded-lg"
                  style={{ background: "oklch(var(--muted))" }}
                >
                  <div className="text-xs text-muted-foreground font-inter mb-1">
                    Concrete Strength
                  </div>
                  <div
                    className={`font-poppins font-bold text-lg ${GRADE_COLOR[results.strengthGrade] || ""}`}
                  >
                    {results.strengthGrade}
                  </div>
                  <div className="text-xs text-muted-foreground font-inter mt-1">
                    Rebound Number: {rn}
                  </div>
                </div>
              )}
              {results.upvGrade && (
                <div
                  className="p-4 rounded-lg"
                  style={{ background: "oklch(var(--muted))" }}
                >
                  <div className="text-xs text-muted-foreground font-inter mb-1">
                    Durability (UPV)
                  </div>
                  <div
                    className={`font-poppins font-bold text-lg ${GRADE_COLOR[results.upvGrade] || ""}`}
                  >
                    {results.upvGrade}
                  </div>
                  <div className="text-xs text-muted-foreground font-inter mt-1">
                    UPV: {upv} km/s
                  </div>
                </div>
              )}
              {results.corrosionStatus && (
                <div
                  className="p-4 rounded-lg"
                  style={{ background: "oklch(var(--muted))" }}
                >
                  <div className="text-xs text-muted-foreground font-inter mb-1">
                    Corrosion Status
                  </div>
                  <div
                    className={`font-poppins font-bold text-base ${GRADE_COLOR[results.corrosionStatus] || ""}`}
                  >
                    {results.corrosionStatus}
                  </div>
                  <div className="text-xs text-muted-foreground font-inter mt-1">
                    Half-Cell: {mv} mV
                  </div>
                </div>
              )}
              {results.carbonationStatus && (
                <div
                  className="p-4 rounded-lg"
                  style={{ background: "oklch(var(--muted))" }}
                >
                  <div className="text-xs text-muted-foreground font-inter mb-1">
                    Carbonation
                  </div>
                  <div
                    className={`font-poppins font-bold text-base ${GRADE_COLOR[results.carbonationStatus] || ""}`}
                  >
                    {results.carbonationStatus}
                  </div>
                  <div className="text-xs text-muted-foreground font-inter mt-1">
                    Depth: {cd}mm / Cover: {cc}mm
                  </div>
                </div>
              )}
            </div>

            <div
              className="p-4 rounded-xl flex items-center gap-4"
              style={{
                background: "oklch(var(--primary) / 0.06)",
                border: "1px solid oklch(var(--primary) / 0.15)",
              }}
            >
              <div>
                <div className="text-xs text-muted-foreground font-inter mb-1">
                  Overall Structural Health
                </div>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-bold font-poppins ${HEALTH_COLOR[results.overallHealth] || "badge-neutral"}`}
                >
                  {results.overallHealth}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              data-ocid="assessment.step3.back.button"
              className="btn-secondary"
              onClick={() => setStep(2)}
            >
              <ChevronLeft size={16} /> Back
            </button>
            <button
              type="button"
              data-ocid="assessment.step3.primary_button"
              className="btn-primary"
              onClick={() => setStep(4)}
            >
              View Recommendation <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── Step 4: Recommendation + Module selection */}
      {step === 4 && results && (
        <div className="animate-fade-in">
          <div className="bg-card rounded-xl border border-border p-6 mb-6">
            <h2 className="font-poppins font-semibold text-base text-navy mb-4">
              Retrofitting Recommendation
            </h2>

            <div
              className="p-5 rounded-xl mb-6"
              style={{
                background:
                  results.retrofitType === "none"
                    ? "oklch(var(--success) / 0.07)"
                    : results.retrofitType === "surface"
                      ? "oklch(var(--warning) / 0.07)"
                      : "oklch(var(--danger) / 0.07)",
                border: `1px solid oklch(var(--${results.retrofitType === "none" ? "success" : results.retrofitType === "surface" ? "warning" : "danger"}) / 0.2)`,
              }}
            >
              <p className="font-inter font-medium text-sm leading-relaxed">
                {results.recommendation}
              </p>
            </div>

            {results.retrofitType === "jacketing" && (
              <div>
                <p className="font-inter text-sm text-muted-foreground mb-3">
                  Select design module:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(
                    [
                      {
                        id: "col_jack",
                        label: "Column Jacketing",
                        sub: "IS 15988:2013",
                      },
                      {
                        id: "beam_jack",
                        label: "Beam Jacketing",
                        sub: "IS 15988:2013",
                      },
                      {
                        id: "ftg_jack",
                        label: "Footing Jacketing",
                        sub: "IS 456:2000",
                      },
                    ] as { id: ModuleId; label: string; sub: string }[]
                  ).map((m) => (
                    <button
                      type="button"
                      key={m.id as string}
                      data-ocid={`assessment.module_${m.id}.button`}
                      className="p-4 rounded-xl border text-left transition-all hover:shadow-md group"
                      style={{
                        borderColor: "oklch(var(--primary) / 0.3)",
                        background: "oklch(var(--primary) / 0.03)",
                      }}
                      onClick={() => setModule(m.id)}
                    >
                      <div className="font-poppins font-semibold text-sm text-navy mb-1">
                        {m.label}
                      </div>
                      <div className="text-xs text-muted-foreground font-inter">
                        {m.sub}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {results.retrofitType === "frp" && (
              <div>
                <p className="font-inter text-sm text-muted-foreground mb-3">
                  Select FRP design module:
                </p>
                <div className="grid grid-cols-2 gap-3 max-w-sm">
                  {(
                    [
                      {
                        id: "col_frp",
                        label: "Column FRP",
                        sub: "ACI 440.2R-17",
                      },
                      {
                        id: "beam_frp",
                        label: "Beam FRP",
                        sub: "ACI 440.2R-17",
                      },
                    ] as { id: ModuleId; label: string; sub: string }[]
                  ).map((m) => (
                    <button
                      type="button"
                      key={m.id as string}
                      data-ocid={`assessment.frp_module_${m.id}.button`}
                      className="p-4 rounded-xl border text-left transition-all hover:shadow-md"
                      style={{
                        borderColor: "oklch(var(--primary) / 0.3)",
                        background: "oklch(var(--primary) / 0.03)",
                      }}
                      onClick={() => setModule(m.id)}
                    >
                      <div className="font-poppins font-semibold text-sm text-navy mb-1">
                        {m.label}
                      </div>
                      <div className="text-xs text-muted-foreground font-inter">
                        {m.sub}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              data-ocid="assessment.step4.back.button"
              className="btn-secondary"
              onClick={() => setStep(3)}
            >
              <ChevronLeft size={16} /> Back
            </button>
            <button
              type="button"
              data-ocid="assessment.restart.button"
              className="btn-secondary"
              onClick={() => {
                setStep(1);
                setResults(null);
                setSelectedTests(new Set());
                setRn("");
                setUpv("");
                setMv("");
                setCd("");
                setCc("");
              }}
            >
              Start New Assessment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
