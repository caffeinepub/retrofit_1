import { CheckCircle, FileSpreadsheet, Info, XCircle } from "lucide-react";
import { useState } from "react";
import {
  type FootingInput,
  type FootingResult,
  calcFooting,
} from "../utils/calculations";
import { downloadFootingExcel } from "../utils/excelExport";

interface Props {
  ndtFck?: number;
}

const FIELDS: {
  key: keyof Omit<FootingInput, "designation">;
  label: string;
  unit: string;
}[] = [
  { key: "P", label: "Column Load P", unit: "kN" },
  { key: "b_col", label: "Column Width b", unit: "mm" },
  { key: "D_col", label: "Column Depth D", unit: "mm" },
  { key: "SBC", label: "Safe Bearing Capacity (SBC)", unit: "kN/m²" },
  { key: "fck", label: "fck (from NDT)", unit: "MPa" },
  { key: "fy", label: "fy", unit: "MPa" },
  { key: "cover", label: "Clear Cover", unit: "mm" },
  { key: "dia", label: "Bar Diameter", unit: "mm" },
];

export default function FootingJacketing({ ndtFck = 25 }: Props) {
  const [vals, setVals] = useState<Record<string, string>>({
    fck: String(ndtFck),
  });
  const [desig, setDesig] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<FootingResult | null>(null);
  const [downloading, setDownloading] = useState(false);

  function validate(): FootingInput | null {
    const errs: Record<string, string> = {};
    FIELDS.forEach((f) => {
      if (!vals[f.key]?.trim()) errs[f.key] = `${f.label} is required`;
      else if (Number.isNaN(Number(vals[f.key])) || Number(vals[f.key]) <= 0)
        errs[f.key] = "Must be positive";
    });
    setErrors(errs);
    if (Object.keys(errs).length) return null;
    return {
      P: +vals.P,
      b_col: +vals.b_col,
      D_col: +vals.D_col,
      SBC: +vals.SBC,
      fck: +vals.fck,
      fy: +vals.fy,
      cover: +vals.cover,
      dia: +vals.dia,
      designation: desig,
    };
  }

  function calculate() {
    const inp = validate();
    if (!inp) return;
    setResult(calcFooting(inp));
  }

  async function handleExcel() {
    const inp = validate();
    if (!inp || !result) return;
    setDownloading(true);
    await downloadFootingExcel(inp, result);
    setDownloading(false);
  }

  const res = result;

  return (
    <div className="p-6 md:p-10 max-w-4xl">
      <div className="mb-6">
        <h1 className="font-poppins font-bold text-2xl text-navy mb-1">
          Footing Jacketing Design
        </h1>
        <p className="font-inter text-sm text-muted-foreground">
          IS 456:2000 • Isolated Footing Design
        </p>
      </div>
      <div
        className="flex items-start gap-2 p-4 rounded-lg mb-6 text-sm font-inter"
        style={{
          background: "oklch(var(--primary) / 0.05)",
          border: "1px solid oklch(var(--primary) / 0.15)",
        }}
      >
        <Info
          size={16}
          className="mt-0.5 shrink-0"
          style={{ color: "oklch(var(--primary))" }}
        />
        <div>
          One-way shear and punching shear checked per IS 456:2000. Self-weight
          assumed as 10% of column load. Flexure design with minimum steel
          check.
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <h2 className="font-poppins font-semibold text-base text-navy mb-5">
          Input Parameters
        </h2>
        <div className="mb-4">
          <label className="font-inter text-sm font-medium text-foreground block mb-1">
            Structural Element Designation
          </label>
          <input
            data-ocid="ftg_jack.designation.input"
            className="form-input"
            value={desig}
            onChange={(e) => setDesig(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label className="font-inter text-xs font-medium text-foreground block mb-1">
                {f.label}{" "}
                <span className="text-muted-foreground">({f.unit})</span>
              </label>
              <input
                data-ocid={`ftg_jack.${f.key}.input`}
                type="number"
                className={`form-input ${errors[f.key] ? "error" : ""}`}
                value={vals[f.key] || ""}
                onChange={(e) => {
                  setVals((p) => ({ ...p, [f.key]: e.target.value }));
                  setErrors((p) => ({ ...p, [f.key]: "" }));
                }}
              />
              {errors[f.key] && (
                <p className="text-xs text-danger mt-1">{errors[f.key]}</p>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          data-ocid="ftg_jack.calculate.primary_button"
          className="btn-primary mt-6"
          onClick={calculate}
        >
          Calculate Design
        </button>
      </div>

      {res && (
        <div className="animate-fade-in space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: "Footing Size",
                value: `${res.L.toFixed(2)} m × ${res.B.toFixed(2)} m`,
              },
              { label: "Effective Depth", value: `${res.d} mm` },
              {
                label: "Overall Depth",
                value: `${res.D_overall.toFixed(0)} mm`,
              },
              { label: "Ast Adopted", value: `${res.As_adopt.toFixed(0)} mm²` },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-card rounded-xl border border-border p-4"
              >
                <div className="text-xs text-muted-foreground font-inter mb-1">
                  {item.label}
                </div>
                <div className="font-poppins font-bold text-base text-navy">
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              className="p-4 rounded-xl flex items-center gap-3"
              style={{
                background: res.punchSafe
                  ? "oklch(var(--success) / 0.08)"
                  : "oklch(var(--danger) / 0.08)",
                border: `1px solid oklch(var(--${res.punchSafe ? "success" : "danger"}) / 0.25)`,
              }}
            >
              {res.punchSafe ? (
                <CheckCircle size={18} className="text-success" />
              ) : (
                <XCircle size={18} className="text-danger" />
              )}
              <div>
                <div className="font-poppins font-bold text-sm">
                  {res.punchSafe
                    ? "Punching Shear SAFE"
                    : "Punching Shear NOT SAFE"}
                </div>
                <div className="text-xs text-muted-foreground">
                  τv = {res.tau_v_punch.toFixed(4)} vs τc ={" "}
                  {res.tau_c_punch.toFixed(4)} N/mm²
                </div>
              </div>
            </div>
            <div
              className="p-4 rounded-xl flex items-center gap-3"
              style={{
                background: "oklch(var(--primary) / 0.05)",
                border: "1px solid oklch(var(--primary) / 0.15)",
              }}
            >
              <Info size={18} style={{ color: "oklch(var(--primary))" }} />
              <div>
                <div className="font-poppins font-semibold text-sm text-navy">
                  Reinforcement
                </div>
                <div className="text-xs text-muted-foreground">
                  {res.N_bars} nos of {vals.dia}mm dia bars
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="font-poppins font-semibold text-base text-navy">
                Step-by-Step Calculations
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="calc-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Description</th>
                    <th>Formula</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {res.steps.map((s, i) => (
                    <tr key={i}>
                      <td className="text-muted-foreground">{i + 1}</td>
                      <td className="font-medium">{s.label}</td>
                      <td className="font-mono text-xs text-muted-foreground">
                        {s.formula}
                      </td>
                      <td className="font-semibold">{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button
            type="button"
            data-ocid="ftg_jack.excel.download_button"
            className="btn-primary"
            onClick={handleExcel}
            disabled={downloading}
          >
            <FileSpreadsheet size={16} />{" "}
            {downloading ? "Preparing..." : "Download Excel Report"}
          </button>
        </div>
      )}
    </div>
  );
}
