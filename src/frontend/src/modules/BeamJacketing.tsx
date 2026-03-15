import {
  CheckCircle,
  Download,
  FileSpreadsheet,
  Info,
  XCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import {
  type BeamJacketingInput,
  type BeamJacketingResult,
  calcBeamJacketing,
} from "../utils/calculations";
import { downloadBeamJacketingExcel } from "../utils/excelExport";

interface Props {
  ndtFck?: number;
}

const FIELDS: {
  key: keyof Omit<BeamJacketingInput, "designation">;
  label: string;
  unit: string;
}[] = [
  { key: "Mu", label: "Applied Moment Mu", unit: "kNm" },
  { key: "fck", label: "fck (from NDT)", unit: "MPa" },
  { key: "fy", label: "fy", unit: "MPa" },
  { key: "b", label: "Width b", unit: "mm" },
  { key: "D", label: "Overall Depth D", unit: "mm" },
  { key: "d", label: "Effective Depth d", unit: "mm" },
  { key: "Vu", label: "Shear Force Vu", unit: "kN" },
];

export default function BeamJacketing({ ndtFck = 25 }: Props) {
  const [vals, setVals] = useState<Record<string, string>>({
    fck: String(ndtFck),
  });
  const [desig, setDesig] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<BeamJacketingResult | null>(null);
  const [downloading, setDownloading] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  function validate(): BeamJacketingInput | null {
    const errs: Record<string, string> = {};
    FIELDS.forEach((f) => {
      if (!vals[f.key]?.trim()) errs[f.key] = `${f.label} is required`;
      else if (Number.isNaN(Number(vals[f.key])) || Number(vals[f.key]) <= 0)
        errs[f.key] = "Must be positive";
    });
    setErrors(errs);
    if (Object.keys(errs).length) return null;
    return {
      Mu: +vals.Mu,
      fck: +vals.fck,
      fy: +vals.fy,
      b: +vals.b,
      D: +vals.D,
      d: +vals.d,
      Vu: +vals.Vu,
      designation: desig,
    };
  }

  function calculate() {
    const inp = validate();
    if (!inp) return;
    setResult(calcBeamJacketing(inp));
  }

  async function handleExcel() {
    const inp = validate();
    if (!inp || !result) return;
    setDownloading(true);
    await downloadBeamJacketingExcel(inp, result);
    setDownloading(false);
  }

  function downloadSVGasPNG() {
    const svg = svgRef.current;
    if (!svg) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1000;
      canvas.height = 600;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(2, 2);
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, 1000, 600);
      ctx.drawImage(img, 0, 0);
      const a = document.createElement("a");
      a.download = `Beam_Jacketing_${desig || "diagram"}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
  }

  const res = result;

  return (
    <div className="p-6 md:p-10 max-w-4xl">
      <div className="mb-6">
        <h1 className="font-poppins font-bold text-2xl text-navy mb-1">
          Beam Jacketing Design
        </h1>
        <p className="font-inter text-sm text-muted-foreground">
          IS 15988:2013 • IS 456:2000 • Flexure & Shear Design
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
          Section increments: <strong>b+200mm</strong>, <strong>D+100mm</strong>
          , <strong>d = D_new − 40mm</strong>. Bars: 16mm default. Shear: IS
          456:2000 Table 19.
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
            data-ocid="beam_jack.designation.input"
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
                data-ocid={`beam_jack.${f.key}.input`}
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
          data-ocid="beam_jack.calculate.primary_button"
          className="btn-primary mt-6"
          onClick={calculate}
        >
          Calculate Design
        </button>
      </div>

      {res && (
        <div className="animate-fade-in space-y-6">
          {/* Section comparison */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="font-poppins font-semibold text-base text-navy">
                Section Comparison
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="calc-table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Original</th>
                    <th>Jacketed</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Width b</td>
                    <td>{vals.b} mm</td>
                    <td>
                      <strong>{res.b_new} mm</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>Overall Depth D</td>
                    <td>{vals.D} mm</td>
                    <td>
                      <strong>{res.D_new} mm</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>Effective Depth d</td>
                    <td>{vals.d} mm</td>
                    <td>
                      <strong>{res.d_new} mm</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>Limiting Moment</td>
                    <td>—</td>
                    <td>
                      {res.Mlim.toFixed(2)} kNm (
                      {res.isDoubly ? "Doubly" : "Singly"} R/F)
                    </td>
                  </tr>
                  <tr>
                    <td>Ast Required</td>
                    <td>—</td>
                    <td>{res.Ast.toFixed(0)} mm²</td>
                  </tr>
                  <tr>
                    <td>Ast Provided</td>
                    <td>—</td>
                    <td>
                      {res.Ast_prov.toFixed(0)} mm² ({res.N_bars} nos of 16mm)
                    </td>
                  </tr>
                  <tr>
                    <td>Moment Capacity</td>
                    <td>—</td>
                    <td>{res.Mu_actual.toFixed(2)} kNm</td>
                  </tr>
                  <tr>
                    <td>Shear Capacity</td>
                    <td>—</td>
                    <td>{res.Vc.toFixed(2)} kN</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Safety checks */}
          <div className="grid grid-cols-2 gap-4">
            <div
              className="p-5 rounded-xl flex items-center gap-3"
              style={{
                background: res.flexureSafe
                  ? "oklch(var(--success) / 0.08)"
                  : "oklch(var(--danger) / 0.08)",
                border: `1px solid oklch(var(--${res.flexureSafe ? "success" : "danger"}) / 0.25)`,
              }}
            >
              {res.flexureSafe ? (
                <CheckCircle size={20} className="text-success shrink-0" />
              ) : (
                <XCircle size={20} className="text-danger  shrink-0" />
              )}
              <div>
                <div className="font-poppins font-bold text-sm">
                  {res.flexureSafe ? "Flexure SAFE" : "Flexure NOT SAFE"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {res.Mu_actual.toFixed(2)} kNm ≥ {vals.Mu} kNm
                </div>
              </div>
            </div>
            <div
              className="p-5 rounded-xl flex items-center gap-3"
              style={{
                background: res.shearSafe
                  ? "oklch(var(--success) / 0.08)"
                  : "oklch(var(--danger) / 0.08)",
                border: `1px solid oklch(var(--${res.shearSafe ? "success" : "danger"}) / 0.25)`,
              }}
            >
              {res.shearSafe ? (
                <CheckCircle size={20} className="text-success shrink-0" />
              ) : (
                <XCircle size={20} className="text-danger  shrink-0" />
              )}
              <div>
                <div className="font-poppins font-bold text-sm">
                  {res.shearSafe ? "Shear SAFE" : "Shear NOT SAFE"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {res.Vc.toFixed(2)} kN vs {vals.Vu} kN
                </div>
              </div>
            </div>
          </div>

          {/* Calc steps */}
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

          {/* SVG */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-poppins font-semibold text-base text-navy">
                Cross-Section Diagram
              </h3>
              <button
                type="button"
                data-ocid="beam_jack.diagram.download_button"
                className="btn-secondary text-xs"
                onClick={downloadSVGasPNG}
              >
                <Download size={14} /> Save PNG
              </button>
            </div>
            <BeamSVG
              b={+vals.b}
              D={+vals.D}
              bNew={res.b_new}
              DNew={res.D_new}
              nBars={res.N_bars}
              svgRef={svgRef}
            />
          </div>

          <button
            type="button"
            data-ocid="beam_jack.excel.download_button"
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

function BeamSVG({
  b,
  D,
  bNew,
  DNew,
  nBars,
  svgRef,
}: {
  b: number;
  D: number;
  bNew: number;
  DNew: number;
  nBars: number;
  svgRef: React.RefObject<SVGSVGElement | null>;
}) {
  const VW = 500;
  const VH = 280;
  const scale = Math.min(((VW / 2 - 60) / Math.max(bNew, b)) * 0.9, 2);
  const scaleH = Math.min(((VH - 60) / Math.max(DNew, D)) * 0.9, 2);
  const sc = Math.min(scale, scaleH);

  const oldW = b * sc;
  const oldH = D * sc;
  const ox = 40;
  const oy = (VH - oldH) / 2;

  const nwW = bNew * sc;
  const nwH = DNew * sc;
  const nxStart = VW / 2 + 30;
  const nyo = (VH - nwH) / 2;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VW} ${VH}`}
      className="w-full border rounded-lg bg-white"
      style={{ maxHeight: 300 }}
    >
      {/* Old beam */}
      <rect
        x={ox}
        y={oy}
        width={oldW}
        height={oldH}
        fill="#e8edf5"
        stroke="#1B2A4A"
        strokeWidth="2"
      />
      {Array.from({
        length: Math.min(4, Math.max(2, Math.floor(nBars / 2))),
      }).map((_, i) => {
        const total = Math.min(4, Math.max(2, Math.floor(nBars / 2)));
        const bx = ox + 12 + (i * (oldW - 24)) / (total - 1 || 1);
        return (
          <circle key={i} cx={bx} cy={oy + oldH - 12} r={5} fill="#1B2A4A" />
        );
      })}
      <text
        x={ox + oldW / 2}
        y={oy - 8}
        textAnchor="middle"
        fontSize="10"
        fill="#1B2A4A"
        fontFamily="Inter"
      >
        {b}mm
      </text>
      <text
        x={ox - 14}
        y={oy + oldH / 2}
        textAnchor="middle"
        fontSize="10"
        fill="#1B2A4A"
        fontFamily="Inter"
        transform={`rotate(-90,${ox - 14},${oy + oldH / 2})`}
      >
        {D}mm
      </text>
      <text
        x={ox + oldW / 2}
        y={VH - 6}
        textAnchor="middle"
        fontSize="10"
        fill="#444"
        fontFamily="Inter"
      >
        EXISTING
      </text>

      {/* New beam */}
      <rect
        x={nxStart}
        y={nyo}
        width={nwW}
        height={nwH}
        fill="#d1e3f8"
        stroke="#1B2A4A"
        strokeWidth="2"
      />
      <rect
        x={nxStart + (nwW - oldW) / 2}
        y={nyo + (nwH - oldH) / 2}
        width={oldW}
        height={oldH}
        fill="#e8edf5"
        stroke="#1B2A4A"
        strokeWidth="1.5"
        strokeDasharray="5 4"
      />
      {Array.from({ length: nBars }).map((_, i) => {
        const bx = nxStart + 12 + (i * (nwW - 24)) / (nBars - 1 || 1);
        return (
          <circle key={i} cx={bx} cy={nyo + nwH - 12} r={5} fill="#1B3A6A" />
        );
      })}
      <text
        x={nxStart + nwW / 2}
        y={nyo - 8}
        textAnchor="middle"
        fontSize="10"
        fill="#1B2A4A"
        fontFamily="Inter"
      >
        {bNew}mm
      </text>
      <text
        x={nxStart + nwW + 14}
        y={nyo + nwH / 2}
        textAnchor="middle"
        fontSize="10"
        fill="#1B2A4A"
        fontFamily="Inter"
        transform={`rotate(90,${nxStart + nwW + 14},${nyo + nwH / 2})`}
      >
        {DNew}mm
      </text>
      <text
        x={nxStart + nwW / 2}
        y={VH - 6}
        textAnchor="middle"
        fontSize="10"
        fill="#444"
        fontFamily="Inter"
      >
        AFTER JACKETING
      </text>
    </svg>
  );
}
