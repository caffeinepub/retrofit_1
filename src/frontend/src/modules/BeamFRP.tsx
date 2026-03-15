import { CheckCircle, FileSpreadsheet, Info, XCircle } from "lucide-react";
import { useState } from "react";
import {
  type BeamFRPInput,
  type BeamFRPResult,
  calcBeamFRP,
} from "../utils/calculations";
import { downloadBeamFRPExcel } from "../utils/excelExport";

const FIELDS: {
  key: keyof Omit<BeamFRPInput, "designation">;
  label: string;
  unit: string;
}[] = [
  { key: "b", label: "Width b", unit: "mm" },
  { key: "D", label: "Overall Depth D", unit: "mm" },
  { key: "d", label: "Effective Depth d", unit: "mm" },
  { key: "fck", label: "fck", unit: "MPa" },
  { key: "fy", label: "fy", unit: "MPa" },
  { key: "Ast", label: "Ast existing", unit: "mm²" },
  { key: "Mu", label: "Applied Moment Mu", unit: "kNm" },
  { key: "tf", label: "Ply Thickness tf", unit: "mm" },
  { key: "wf", label: "Strip Width wf", unit: "mm" },
  { key: "Ef", label: "FRP Modulus Ef", unit: "GPa" },
  { key: "ffu_star", label: "ffu* (tensile str.)", unit: "MPa" },
  { key: "eps_fu_star", label: "εfu* (ult. strain)", unit: "%" },
  { key: "CE", label: "Env. Factor CE", unit: "—" },
  { key: "n", label: "Initial Plies n", unit: "nos" },
];

export default function BeamFRP() {
  const [vals, setVals] = useState<Record<string, string>>({});
  const [desig, setDesig] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<BeamFRPResult | null>(null);
  const [downloading, setDownloading] = useState(false);

  function validate(): BeamFRPInput | null {
    const errs: Record<string, string> = {};
    FIELDS.forEach((f) => {
      if (!vals[f.key]?.trim()) errs[f.key] = `${f.label} is required`;
      else if (Number.isNaN(Number(vals[f.key])) || Number(vals[f.key]) <= 0)
        errs[f.key] = "Must be positive";
    });
    setErrors(errs);
    if (Object.keys(errs).length) return null;
    return {
      b: +vals.b,
      D: +vals.D,
      d: +vals.d,
      fck: +vals.fck,
      fy: +vals.fy,
      Ast: +vals.Ast,
      Mu: +vals.Mu,
      tf: +vals.tf,
      wf: +vals.wf,
      Ef: +vals.Ef,
      ffu_star: +vals.ffu_star,
      eps_fu_star: +vals.eps_fu_star,
      CE: +vals.CE,
      n: +vals.n,
      designation: desig,
    };
  }

  function calculate() {
    const inp = validate();
    if (!inp) return;
    setResult(calcBeamFRP(inp));
  }

  async function handleExcel() {
    const inp = validate();
    if (!inp || !result) return;
    setDownloading(true);
    await downloadBeamFRPExcel(inp, result);
    setDownloading(false);
  }

  const res = result;

  return (
    <div className="p-6 md:p-10 max-w-4xl">
      <div className="mb-6">
        <h1 className="font-poppins font-bold text-2xl text-navy mb-1">
          Beam FRP Flexural Strengthening
        </h1>
        <p className="font-inter text-sm text-muted-foreground">
          ACI 440.2R-17 • Externally Bonded FRP Laminates
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
          Debonding strain εfd per ACI 440.2R-17. Minimum plies computed to
          achieve φMn ≥ Mu. Existing steel capacity is preserved.
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <h2 className="font-poppins font-semibold text-base text-navy mb-5">
          Input Parameters
        </h2>
        <div className="mb-4">
          <label className="font-inter text-sm font-medium text-foreground block mb-1">
            Member Designation
          </label>
          <input
            data-ocid="beam_frp.designation.input"
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
                data-ocid={`beam_frp.${f.key}.input`}
                type="number"
                step="any"
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
          data-ocid="beam_frp.calculate.primary_button"
          className="btn-primary mt-6"
          onClick={calculate}
        >
          Calculate FRP Design
        </button>
      </div>

      {res && (
        <div className="animate-fade-in space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                label: "Existing Capacity",
                value: `${res.Mexist.toFixed(2)} kNm`,
              },
              {
                label: "Deficiency",
                value: `${res.Mdeficiency.toFixed(2)} kNm`,
              },
              { label: "Plies Required", value: `${res.n_required} nos` },
              {
                label: "φMn Achieved",
                value: `${res.phi_Mn_achieved.toFixed(2)} kNm`,
              },
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

          <div
            className="p-4 rounded-xl flex items-center gap-3"
            style={{
              background:
                res.phi_Mn_achieved >= +vals.Mu
                  ? "oklch(var(--success) / 0.08)"
                  : "oklch(var(--danger) / 0.08)",
              border: `1px solid oklch(var(--${res.phi_Mn_achieved >= +vals.Mu ? "success" : "danger"}) / 0.25)`,
            }}
          >
            {res.phi_Mn_achieved >= +vals.Mu ? (
              <CheckCircle size={20} className="text-success" />
            ) : (
              <XCircle size={20} className="text-danger" />
            )}
            <div>
              <div className="font-poppins font-bold text-sm">
                {res.phi_Mn_achieved >= +vals.Mu
                  ? "FRP Design ADEQUATE"
                  : "FRP Design INADEQUATE"}
              </div>
              <div className="text-xs text-muted-foreground">
                φMn = {res.phi_Mn_achieved.toFixed(2)} kNm vs Mu = {vals.Mu} kNm
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="font-poppins font-semibold text-base text-navy">
                Detailed Calculations
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
            data-ocid="beam_frp.excel.download_button"
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
