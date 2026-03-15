import { Download, FileSpreadsheet, Info } from "lucide-react";
import { useRef, useState } from "react";
import {
  type ColumnJacketingInput,
  type ColumnJacketingResult,
  calcColumnJacketing,
} from "../utils/calculations";
import { downloadColumnJacketingExcel } from "../utils/excelExport";

interface Props {
  ndtFck?: number;
}

const FIELDS: {
  key: keyof Omit<ColumnJacketingInput, "designation">;
  label: string;
  unit: string;
}[] = [
  { key: "height", label: "Column Height", unit: "mm" },
  { key: "b", label: "Width (b)", unit: "mm" },
  { key: "D", label: "Depth (D)", unit: "mm" },
  { key: "nBars", label: "No. of Existing Bars", unit: "nos" },
  { key: "fy", label: "fy (yield strength)", unit: "MPa" },
  { key: "fck", label: "fck (from NDT)", unit: "MPa" },
  { key: "Pu", label: "Factored Load Pu", unit: "kN" },
  { key: "dia", label: "Bar Dia for Jacket", unit: "mm" },
];

export default function ColumnJacketing({ ndtFck = 25 }: Props) {
  const [vals, setVals] = useState<Record<string, string>>({
    fck: String(ndtFck),
  });
  const [desig, setDesig] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ColumnJacketingResult | null>(null);
  const [downloading, setDownloading] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  function validate(): ColumnJacketingInput | null {
    const errs: Record<string, string> = {};
    FIELDS.forEach((f) => {
      if (!vals[f.key]?.trim()) errs[f.key] = `${f.label} is required`;
      else if (Number.isNaN(Number(vals[f.key])) || Number(vals[f.key]) <= 0)
        errs[f.key] = "Must be a positive number";
    });
    setErrors(errs);
    if (Object.keys(errs).length) return null;
    return {
      height: +vals.height,
      b: +vals.b,
      D: +vals.D,
      nBars: +vals.nBars,
      fy: +vals.fy,
      fck: +vals.fck,
      Pu: +vals.Pu,
      dia: +vals.dia,
      designation: desig,
    };
  }

  function calculate() {
    const inp = validate();
    if (!inp) return;
    setResult(calcColumnJacketing(inp));
  }

  async function handleExcel() {
    const inp = validate();
    if (!inp || !result) return;
    setDownloading(true);
    await downloadColumnJacketingExcel(inp, result);
    setDownloading(false);
  }

  function downloadSVGasPNG() {
    const svg = svgRef.current;
    if (!svg) return;
    const data = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(data)}`;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = svg.viewBox.baseVal.width * 2;
      canvas.height = svg.viewBox.baseVal.height * 2;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(2, 2);
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const a = document.createElement("a");
      a.download = `Column_Jacketing_${desig || "diagram"}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = url;
  }

  const inp = vals.b && vals.D ? { b: +vals.b, D: +vals.D } : null;
  const res = result;

  return (
    <div className="p-6 md:p-10 max-w-4xl">
      <div className="mb-6">
        <h1 className="font-poppins font-bold text-2xl text-navy mb-1">
          Column Jacketing Design
        </h1>
        <p className="font-inter text-sm text-muted-foreground">
          IS 15988:2013 §8.5.1 | RC Jacketing of Columns
        </p>
      </div>

      {/* IS Code Notice */}
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
          <strong>IS 15988:2013 §8.5.1.2(a):</strong> fck upgraded by 5 MPa.{" "}
          <strong>§8.5.1.1(e):</strong> New steel area = 4/3 of required.{" "}
          <strong>§8.5.1.2(c):</strong> Min jacket thickness 100mm.
        </div>
      </div>

      {/* Inputs */}
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <h2 className="font-poppins font-semibold text-base text-navy mb-5">
          Input Parameters
        </h2>
        <div className="mb-4">
          <label className="font-inter text-sm font-medium text-foreground block mb-1">
            Structural Element Designation
          </label>
          <input
            data-ocid="col_jack.designation.input"
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
                data-ocid={`col_jack.${f.key}.input`}
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
          data-ocid="col_jack.calculate.primary_button"
          className="btn-primary mt-6"
          onClick={calculate}
        >
          Calculate Design
        </button>
      </div>

      {/* Results */}
      {res && (
        <div className="animate-fade-in space-y-6">
          {/* Summary table */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div
              className="px-6 py-4 border-b"
              style={{ borderColor: "oklch(var(--border))" }}
            >
              <h3 className="font-poppins font-semibold text-base text-navy">
                Design Summary
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="calc-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Existing</th>
                    <th>After Jacketing</th>
                    <th>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Column Size</td>
                    <td>{inp ? `${inp.b} × ${inp.D} mm` : "—"}</td>
                    <td>
                      <strong>
                        {res.side_new} × {res.side_new} mm
                      </strong>
                    </td>
                    <td>IS 15988:2013</td>
                  </tr>
                  <tr>
                    <td>Jacket Thickness</td>
                    <td>—</td>
                    <td>{res.tj} mm (each side)</td>
                    <td>§8.5.1.2(c) min 100mm</td>
                  </tr>
                  <tr>
                    <td>Steel Area</td>
                    <td>{vals.nBars} bars</td>
                    <td>
                      {res.N_bars} bars ({vals.dia}mm dia)
                    </td>
                    <td>§8.5.1.1(e)</td>
                  </tr>
                  <tr>
                    <td>Additional Bars</td>
                    <td>—</td>
                    <td>{res.add_bars} nos</td>
                    <td />
                  </tr>
                  <tr>
                    <td>Tie Diameter</td>
                    <td>—</td>
                    <td>{res.tie_dia} mm</td>
                    <td>IS 456:2000</td>
                  </tr>
                  <tr>
                    <td>Tie Spacing</td>
                    <td>—</td>
                    <td>{res.tie_spacing} mm c/c</td>
                    <td />
                  </tr>
                  <tr>
                    <td>Shear Connectors</td>
                    <td>—</td>
                    <td>{res.N_shear} nos, 12mm dia @ 250 c/c</td>
                    <td>IS 15988:2013</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Step-by-step */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div
              className="px-6 py-4 border-b"
              style={{ borderColor: "oklch(var(--border))" }}
            >
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

          {/* SVG Diagram */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-poppins font-semibold text-base text-navy">
                Cross-Section Diagram
              </h3>
              <button
                type="button"
                data-ocid="col_jack.diagram.download_button"
                className="btn-secondary text-xs"
                onClick={downloadSVGasPNG}
              >
                <Download size={14} /> Save PNG
              </button>
            </div>
            <ColumnSVG
              b={+vals.b}
              D={+vals.D}
              sideNew={res.side_new}
              nBars={+vals.nBars}
              nBarsNew={res.N_bars}
              svgRef={svgRef}
            />
          </div>

          {/* Download */}
          <button
            type="button"
            data-ocid="col_jack.excel.download_button"
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

// ─── SVG Component ────────────────────────────────────────────────────────
function ColumnSVG({
  b,
  D,
  sideNew,
  nBars,
  nBarsNew,
  svgRef,
}: {
  b: number;
  D: number;
  sideNew: number;
  nBars: number;
  nBarsNew: number;
  svgRef: React.RefObject<SVGSVGElement | null>;
}) {
  const VW = 500;
  const VH = 300;
  const scale = Math.min(((VW / 2 - 60) / Math.max(sideNew, b, D)) * 0.85, 1);

  // Old column
  const oldW = b * scale;
  const oldH = D * scale;
  const ox = 50;
  const oy = (VH - oldH) / 2;

  // New column
  const newW = sideNew * scale;
  const newH = sideNew * scale;
  const nx = VW / 2 + 40;
  const ny = (VH - newH) / 2;

  function barDots(
    x: number,
    y: number,
    w: number,
    h: number,
    count: number,
    r: number,
    color: string,
  ) {
    const positions: [number, number][] = [
      [x + 12, y + 12],
      [x + w - 12, y + 12],
      [x + 12, y + h - 12],
      [x + w - 12, y + h - 12],
    ];
    if (count > 4) {
      const extra = Math.min(count - 4, 8);
      for (let i = 0; i < extra; i++) {
        const t = (i + 1) / (extra + 1);
        positions.push(
          i < extra / 2
            ? [x + 12 + t * (w - 24), y + 12]
            : [
                x +
                  12 +
                  ((i - Math.floor(extra / 2) + 1) /
                    (extra - Math.floor(extra / 2) + 1)) *
                    (w - 24),
                y + h - 12,
              ],
        );
      }
    }
    return positions
      .slice(0, count)
      .map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r={r} fill={color} />
      ));
  }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VW} ${VH}`}
      className="w-full border rounded-lg bg-white"
      style={{ maxHeight: 320 }}
    >
      {/* Old column */}
      <rect
        x={ox}
        y={oy}
        width={oldW}
        height={oldH}
        fill="#e8edf5"
        stroke="#1B2A4A"
        strokeWidth="2"
      />
      {barDots(ox, oy, oldW, oldH, nBars, 5, "#1B2A4A")}
      {/* Tie */}
      <rect
        x={ox + 8}
        y={oy + 8}
        width={oldW - 16}
        height={oldH - 16}
        fill="none"
        stroke="#7A8B9A"
        strokeWidth="1"
        strokeDasharray="4 3"
      />

      {/* Labels old */}
      <text
        x={ox + oldW / 2}
        y={oy - 10}
        textAnchor="middle"
        fontSize="10"
        fill="#1B2A4A"
        fontFamily="Inter"
      >
        {b}mm
      </text>
      <text
        x={ox - 12}
        y={oy + oldH / 2}
        textAnchor="middle"
        fontSize="10"
        fill="#1B2A4A"
        fontFamily="Inter"
        transform={`rotate(-90,${ox - 12},${oy + oldH / 2})`}
      >
        {D}mm
      </text>
      <text
        x={ox + oldW / 2}
        y={VH - 5}
        textAnchor="middle"
        fontSize="10"
        fill="#444"
        fontFamily="Inter"
      >
        EXISTING
      </text>

      {/* New column — outer */}
      <rect
        x={nx}
        y={ny}
        width={newW}
        height={newH}
        fill="#d1e3f8"
        stroke="#1B2A4A"
        strokeWidth="2"
      />
      {/* Old column inside new (dashed) */}
      <rect
        x={nx + (newW - oldW) / 2}
        y={ny + (newH - oldH) / 2}
        width={oldW}
        height={oldH}
        fill="#e8edf5"
        stroke="#1B2A4A"
        strokeWidth="1.5"
        strokeDasharray="6 4"
      />
      {barDots(nx, ny, newW, newH, nBarsNew, 5, "#1B3A6A")}
      {/* Shear connector triangles */}
      {[0.25, 0.5, 0.75].map((t) => (
        <polygon
          key={t}
          points={`${nx + newW},${ny + t * newH - 5} ${nx + newW + 10},${ny + t * newH} ${nx + newW},${ny + t * newH + 5}`}
          fill="#7A8B9A"
        />
      ))}
      {[0.25, 0.5, 0.75].map((t) => (
        <polygon
          key={t + 10}
          points={`${nx},${ny + t * newH - 5} ${nx - 10},${ny + t * newH} ${nx},${ny + t * newH + 5}`}
          fill="#7A8B9A"
        />
      ))}

      {/* Labels new */}
      <text
        x={nx + newW / 2}
        y={ny - 10}
        textAnchor="middle"
        fontSize="10"
        fill="#1B2A4A"
        fontFamily="Inter"
      >
        {sideNew}mm
      </text>
      <text
        x={nx + newW + 18}
        y={ny + newH / 2}
        textAnchor="middle"
        fontSize="10"
        fill="#1B2A4A"
        fontFamily="Inter"
        transform={`rotate(90,${nx + newW + 18},${ny + newH / 2})`}
      >
        {sideNew}mm
      </text>
      <text
        x={nx + newW / 2}
        y={VH - 5}
        textAnchor="middle"
        fontSize="10"
        fill="#444"
        fontFamily="Inter"
      >
        AFTER JACKETING
      </text>

      {/* Legend */}
      <circle cx="20" cy="20" r="5" fill="#1B2A4A" />
      <text x="30" y="24" fontSize="9" fill="#444" fontFamily="Inter">
        Existing bars
      </text>
      <circle cx="20" cy="38" r="5" fill="#1B3A6A" />
      <text x="30" y="42" fontSize="9" fill="#444" fontFamily="Inter">
        New bars
      </text>
      <polygon
        points="0,52 10,57 0,62"
        fill="#7A8B9A"
        transform="translate(14,0)"
      />
      <text x="30" y="60" fontSize="9" fill="#444" fontFamily="Inter">
        Shear connectors
      </text>
    </svg>
  );
}
