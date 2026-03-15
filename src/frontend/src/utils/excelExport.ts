// Excel export using SheetJS (xlsx) — loaded from CDN via dynamic import
// Falls back to CSV download if CDN unavailable

type SheetData = { name: string; rows: (string | number)[][] }[];

function csvFromRows(rows: (string | number)[][]): string {
  return rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function tryLoadXLSX(): Promise<any> {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore dynamic CDN import
    // biome-ignore lint: CDN dynamic import
    // @ts-ignore
    const mod = await Function(
      "url",
      "return import(url)",
    )("https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs");
    return mod;
  } catch {
    return null;
  }
}

async function downloadExcelOrCSV(sheets: SheetData, filename: string) {
  const XLSX = await tryLoadXLSX();
  if (XLSX) {
    const wb = XLSX.utils.book_new();
    sheets.forEach(({ name, rows }) => {
      const ws = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
    });
    XLSX.writeFile(wb, filename);
  } else {
    // Fallback: all sheets concatenated in one CSV
    const combined = sheets
      .map((s) => [`=== ${s.name} ===`, csvFromRows(s.rows)].join("\n"))
      .join("\n\n");
    downloadBlob(
      new Blob([combined], { type: "text/csv" }),
      filename.replace(".xlsx", ".csv"),
    );
  }
}

// ─── Column Jacketing Excel ────────────────────────────────────────────────
import type {
  ColumnJacketingInput,
  ColumnJacketingResult,
} from "./calculations";

export async function downloadColumnJacketingExcel(
  inp: ColumnJacketingInput,
  res: ColumnJacketingResult,
) {
  const sheets: SheetData = [
    {
      name: "Input Data",
      rows: [
        ["RetroFit — Column Jacketing Design"],
        ["IS 15988:2013 Compliant"],
        [""],
        ["Parameter", "Value", "Unit"],
        ["Member Designation", inp.designation, ""],
        ["Column Height", inp.height, "mm"],
        ["Column Width (b)", inp.b, "mm"],
        ["Column Depth (D)", inp.D, "mm"],
        ["No. of Existing Bars", inp.nBars, "nos"],
        ["fy", inp.fy, "MPa"],
        ["fck (from NDT)", inp.fck, "MPa"],
        ["Factored Load Pu", inp.Pu, "kN"],
        ["Bar Dia for Jacket", inp.dia, "mm"],
      ],
    },
    {
      name: "Step-by-Step Calculations",
      rows: [
        ["Step", "Description", "Formula / Reference", "Result"],
        ...res.steps.map((s, i) => [i + 1, s.label, s.formula, s.value]),
      ],
    },
    {
      name: "Final Summary",
      rows: [
        ["RetroFit — Column Jacketing Summary"],
        [""],
        ["Item", "Before", "After"],
        [
          "Column Size",
          `${inp.b} × ${inp.D} mm`,
          `${res.side_new} × ${res.side_new} mm`,
        ],
        ["Reinforcement Bars", `${inp.nBars} nos`, `${res.N_bars} nos`],
        ["Additional Bars", "—", `${res.add_bars} nos (${inp.dia}mm dia)`],
        ["Tie Diameter", "—", `${res.tie_dia} mm`],
        ["Tie Spacing", "—", `${res.tie_spacing} mm c/c`],
        ["Jacket Thickness", "—", `${res.tj} mm`],
        ["Shear Connectors", "—", `${res.N_shear} nos (12mm @ 250 c/c)`],
        [""],
        ["Note: Designed per IS 15988:2013 §8.5.1"],
      ],
    },
  ];
  await downloadExcelOrCSV(
    sheets,
    `Column_Jacketing_${inp.designation || "Design"}.xlsx`,
  );
}

// ─── Beam Jacketing Excel ─────────────────────────────────────────────────
import type { BeamJacketingInput, BeamJacketingResult } from "./calculations";

export async function downloadBeamJacketingExcel(
  inp: BeamJacketingInput,
  res: BeamJacketingResult,
) {
  const sheets: SheetData = [
    {
      name: "Input Data",
      rows: [
        ["RetroFit — Beam Jacketing Design"],
        ["IS 15988:2013 / IS 456:2000 Compliant"],
        [""],
        ["Parameter", "Value", "Unit"],
        ["Member Designation", inp.designation, ""],
        ["Applied Moment Mu", inp.Mu, "kNm"],
        ["fck (NDT)", inp.fck, "MPa"],
        ["fy", inp.fy, "MPa"],
        ["Width b", inp.b, "mm"],
        ["Overall Depth D", inp.D, "mm"],
        ["Effective Depth d", inp.d, "mm"],
        ["Shear Force Vu", inp.Vu, "kN"],
      ],
    },
    {
      name: "Section Properties",
      rows: [
        ["Property", "Original", "Jacketed", "Unit"],
        ["Width b", inp.b, res.b_new, "mm"],
        ["Overall Depth D", inp.D, res.D_new, "mm"],
        ["Effective Depth d", inp.d, res.d_new, "mm"],
      ],
    },
    {
      name: "Flexure Design",
      rows: [
        ["Step", "Description", "Formula", "Result"],
        ...res.steps
          .filter((_, i) => i < 13)
          .map((s, i) => [i + 1, s.label, s.formula, s.value]),
      ],
    },
    {
      name: "Shear Design",
      rows: [
        ["Step", "Description", "Formula", "Result"],
        ...res.steps
          .filter((_, i) => i >= 13)
          .map((s, i) => [i + 1, s.label, s.formula, s.value]),
      ],
    },
    {
      name: "Summary",
      rows: [
        ["RetroFit — Beam Jacketing Summary"],
        [""],
        ["Check", "Status"],
        ["Flexure", res.flexureSafe ? "SAFE" : "NOT SAFE"],
        ["Shear", res.shearSafe ? "SAFE" : "NOT SAFE"],
        [""],
        ["Ast Provided", `${res.Ast_prov.toFixed(0)} mm²`],
        ["No. of 16mm Bars", `${res.N_bars} nos`],
        ["Moment Capacity", `${res.Mu_actual.toFixed(2)} kNm`],
        ["Note: Designed per IS 15988:2013 & IS 456:2000"],
      ],
    },
  ];
  await downloadExcelOrCSV(
    sheets,
    `Beam_Jacketing_${inp.designation || "Design"}.xlsx`,
  );
}

// ─── Footing Excel ─────────────────────────────────────────────────────────
import type { FootingInput, FootingResult } from "./calculations";

export async function downloadFootingExcel(
  inp: FootingInput,
  res: FootingResult,
) {
  const sheets: SheetData = [
    {
      name: "Input Data",
      rows: [
        ["RetroFit — Footing Jacketing Design"],
        ["IS 456:2000 Compliant"],
        [""],
        ["Parameter", "Value", "Unit"],
        ["Column Load P", inp.P, "kN"],
        ["Column Width b", inp.b_col, "mm"],
        ["Column Depth D", inp.D_col, "mm"],
        ["SBC", inp.SBC, "kN/m²"],
        ["fck", inp.fck, "MPa"],
        ["fy", inp.fy, "MPa"],
        ["Clear Cover", inp.cover, "mm"],
        ["Bar Diameter", inp.dia, "mm"],
      ],
    },
    {
      name: "Calculations",
      rows: [
        ["Step", "Description", "Formula", "Result"],
        ...res.steps.map((s, i) => [i + 1, s.label, s.formula, s.value]),
      ],
    },
    {
      name: "Summary",
      rows: [
        ["Footing Size", `${res.L.toFixed(2)} m × ${res.B.toFixed(2)} m`],
        ["Effective Depth d", `${res.d} mm`],
        ["Overall Depth D", `${res.D_overall.toFixed(0)} mm`],
        ["Punching Check", res.punchSafe ? "SAFE" : "NOT SAFE"],
        ["Ast Adopted", `${res.As_adopt.toFixed(0)} mm²`],
        ["No. of Bars", `${res.N_bars} nos`],
      ],
    },
  ];
  await downloadExcelOrCSV(
    sheets,
    `Footing_Jacketing_${inp.designation || "Design"}.xlsx`,
  );
}

// ─── Column FRP Excel ─────────────────────────────────────────────────────
import type { ColumnFRPInput, ColumnFRPResult } from "./calculations";

export async function downloadColumnFRPExcel(
  inp: ColumnFRPInput,
  res: ColumnFRPResult,
) {
  const sheets: SheetData = [
    {
      name: "Input Data",
      rows: [
        ["RetroFit — Column FRP Design"],
        ["FIB 2010 / ACI 440.2R Compliant"],
        [""],
        ["Parameter", "Value", "Unit"],
        ["Member", inp.designation, ""],
        ["Width b", inp.b, "mm"],
        ["Depth d", inp.d_col, "mm"],
        ["fck provided", inp.fck_prov, "MPa"],
        ["fck required", inp.fck_req, "MPa"],
        ["Pu", inp.Pu, "kN"],
        ["fy", inp.fy, "MPa"],
        ["Ast", inp.Ast, "mm²"],
        ["FRP Strain εf", inp.eps_f, "%"],
        ["Ply Thickness tf", inp.tf, "mm"],
        ["FRP Modulus Ef", inp.Ef, "GPa"],
        ["No. of Plies n", inp.n, "nos"],
        ["Corner Radius rc", inp.rc, "mm"],
      ],
    },
    {
      name: "Calculations",
      rows: [
        ["Step", "Description", "Formula", "Result"],
        ...res.steps.map((s, i) => [i + 1, s.label, s.formula, s.value]),
      ],
    },
    {
      name: "Summary",
      rows: [
        ["Existing Capacity", `${res.Pu_exist.toFixed(1)} kN`],
        ["Confinement fl", `${res.fl.toFixed(3)} MPa`],
        ["Confined Strength fcc", `${res.fcc.toFixed(2)} MPa`],
        ["Adequacy", res.sufficient ? "SUFFICIENT" : "INSUFFICIENT"],
        ["Plies Required", `${res.n_required} nos`],
      ],
    },
  ];
  await downloadExcelOrCSV(
    sheets,
    `Column_FRP_${inp.designation || "Design"}.xlsx`,
  );
}

// ─── Beam FRP Excel ───────────────────────────────────────────────────────
import type { BeamFRPInput, BeamFRPResult } from "./calculations";

export async function downloadBeamFRPExcel(
  inp: BeamFRPInput,
  res: BeamFRPResult,
) {
  const sheets: SheetData = [
    {
      name: "Input Data",
      rows: [
        ["RetroFit — Beam FRP Design"],
        ["ACI 440.2R-17 Compliant"],
        [""],
        ["Parameter", "Value", "Unit"],
        ["Member", inp.designation, ""],
        ["b", inp.b, "mm"],
        ["D", inp.D, "mm"],
        ["d", inp.d, "mm"],
        ["fck", inp.fck, "MPa"],
        ["fy", inp.fy, "MPa"],
        ["Ast existing", inp.Ast, "mm²"],
        ["Mu", inp.Mu, "kNm"],
        ["tf", inp.tf, "mm"],
        ["wf", inp.wf, "mm"],
        ["Ef", inp.Ef, "GPa"],
        ["ffu*", inp.ffu_star, "MPa"],
        ["εfu*", inp.eps_fu_star, "%"],
        ["CE", inp.CE, "—"],
      ],
    },
    {
      name: "Calculations",
      rows: [
        ["Step", "Description", "Formula", "Result"],
        ...res.steps.map((s, i) => [i + 1, s.label, s.formula, s.value]),
      ],
    },
    {
      name: "Summary",
      rows: [
        ["Existing Moment Capacity", `${res.Mexist.toFixed(2)} kNm`],
        ["Moment Deficiency", `${res.Mdeficiency.toFixed(2)} kNm`],
        ["Plies Required", `${res.n_required} nos`],
        ["φMn Achieved", `${res.phi_Mn_achieved.toFixed(2)} kNm`],
        ["Check", res.phi_Mn_achieved >= inp.Mu ? "ADEQUATE" : "INADEQUATE"],
      ],
    },
  ];
  await downloadExcelOrCSV(
    sheets,
    `Beam_FRP_${inp.designation || "Design"}.xlsx`,
  );
}
