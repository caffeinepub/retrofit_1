// ─── NDT Analysis ────────────────────────────────────────────────────────────

export type StrengthGrade = "Very Good" | "Good" | "Fair" | "Poor";
export type UPVGrade = "Excellent" | "Good" | "Medium" | "Poor";
export type CorrosionStatus =
  | "No Corrosion (90%)"
  | "Uncertain"
  | "Corrosion (90%)";
export type CarbonationStatus = "Safe" | "At Risk" | "High Risk";
export type OverallHealth =
  | "Excellent"
  | "Good"
  | "Moderate"
  | "Poor"
  | "Critical";

export interface NDTResults {
  strengthGrade?: StrengthGrade;
  upvGrade?: UPVGrade;
  corrosionStatus?: CorrosionStatus;
  carbonationStatus?: CarbonationStatus;
  overallHealth: OverallHealth;
  recommendation: string;
  retrofitType: "none" | "surface" | "frp" | "jacketing";
}

export function analyzeReboundNumber(rn: number): StrengthGrade {
  if (rn >= 40) return "Very Good";
  if (rn >= 30) return "Good";
  if (rn >= 20) return "Fair";
  return "Poor";
}

export function analyzeUPV(upv: number): UPVGrade {
  if (upv >= 4.5) return "Excellent";
  if (upv >= 3.5) return "Good";
  if (upv >= 3.0) return "Medium";
  return "Poor";
}

export function analyzeHalfCell(mv: number): CorrosionStatus {
  if (mv > -200) return "No Corrosion (90%)";
  if (mv >= -350) return "Uncertain";
  return "Corrosion (90%)";
}

export function analyzeCarbonation(
  depth: number,
  cover: number,
): CarbonationStatus {
  if (depth < cover) return "Safe";
  if (depth === cover) return "At Risk";
  return "High Risk";
}

export function computeNDTResults(inputs: {
  rn?: number;
  upv?: number;
  mv?: number;
  carbDepth?: number;
  carbCover?: number;
}): NDTResults {
  const sg =
    inputs.rn !== undefined ? analyzeReboundNumber(inputs.rn) : undefined;
  const ug = inputs.upv !== undefined ? analyzeUPV(inputs.upv) : undefined;
  const cs = inputs.mv !== undefined ? analyzeHalfCell(inputs.mv) : undefined;
  const cbs =
    inputs.carbDepth !== undefined && inputs.carbCover !== undefined
      ? analyzeCarbonation(inputs.carbDepth, inputs.carbCover)
      : undefined;

  // Score-based overall health
  let score = 0;
  let count = 0;
  const scoreMap: Record<string, number> = {
    "Very Good": 4,
    Excellent: 4,
    Good: 3,
    Medium: 2,
    Fair: 2,
    Poor: 1,
    "No Corrosion (90%)": 4,
    Uncertain: 2,
    "Corrosion (90%)": 1,
    Safe: 4,
    "At Risk": 2,
    "High Risk": 1,
  };
  [sg, ug, cs, cbs].forEach((v) => {
    if (v) {
      score += scoreMap[v] ?? 2;
      count++;
    }
  });
  const avg = count > 0 ? score / count : 3;

  let overallHealth: OverallHealth;
  let recommendation: string;
  let retrofitType: NDTResults["retrofitType"];

  if (avg >= 3.5) {
    overallHealth = "Excellent";
    recommendation =
      "No Retrofitting Required. Minor maintenance and periodic inspection recommended.";
    retrofitType = "none";
  } else if (avg >= 3.0) {
    overallHealth = "Good";
    recommendation =
      "No Retrofitting Required. Preventive maintenance advised.";
    retrofitType = "none";
  } else if (avg >= 2.3) {
    overallHealth = "Moderate";
    if (cs === "Corrosion (90%)" || cbs === "High Risk") {
      recommendation =
        "FRP Wrapping recommended to arrest corrosion progression and restore confinement.";
      retrofitType = "frp";
    } else {
      recommendation =
        "Surface Repair + Protective Coating to address early deterioration.";
      retrofitType = "surface";
    }
  } else if (avg >= 1.5) {
    overallHealth = "Poor";
    recommendation =
      "RC Jacketing strongly recommended. Structural integrity is compromised.";
    retrofitType = "jacketing";
  } else {
    overallHealth = "Critical";
    recommendation =
      "Immediate RC Jacketing required. Structure is at risk of failure.";
    retrofitType = "jacketing";
  }

  return {
    strengthGrade: sg,
    upvGrade: ug,
    corrosionStatus: cs,
    carbonationStatus: cbs,
    overallHealth,
    recommendation,
    retrofitType,
  };
}

// ─── IS 456 Shear Strength Interpolation ────────────────────────────────────
const TC_TABLE: [number, number][] = [
  [0.15, 0.28],
  [0.25, 0.36],
  [0.5, 0.48],
  [0.75, 0.56],
  [1.0, 0.62],
  [1.25, 0.67],
  [1.5, 0.72],
  [1.75, 0.75],
  [2.0, 0.79],
  [2.25, 0.81],
  [2.5, 0.82],
  [2.75, 0.82],
  [3.0, 0.82],
];

export function interpolateTc(pt: number, fck: number): number {
  const clampedPt = Math.min(Math.max(pt, 0.15), 3.0);
  let tc = 0.28;
  for (let i = 0; i < TC_TABLE.length - 1; i++) {
    const [p0, t0] = TC_TABLE[i];
    const [p1, t1] = TC_TABLE[i + 1];
    if (clampedPt >= p0 && clampedPt <= p1) {
      tc = t0 + ((t1 - t0) * (clampedPt - p0)) / (p1 - p0);
      break;
    }
  }
  // Grade factor per IS 456
  let k = 1.0;
  if (fck >= 40) k = 1.25;
  else if (fck >= 35) k = 1.2;
  else if (fck >= 30) k = 1.15;
  else if (fck >= 25) k = 1.1;
  else if (fck >= 20) k = 1.0;
  else k = 0.85;
  return tc * k;
}

// ─── Column Jacketing ────────────────────────────────────────────────────────
export interface ColumnJacketingInput {
  height: number; // mm
  b: number; // mm (width)
  D: number; // mm (depth)
  nBars: number;
  fy: number; // MPa
  fck: number; // MPa (from NDT)
  Pu: number; // kN
  dia: number; // mm (bar dia for jacket)
  designation: string;
}

export interface ColumnJacketingResult {
  fck_new: number;
  Ac_req: number; // mm²
  Ac_new: number; // mm²
  side_new: number; // mm
  tj: number; // mm jacket thickness each side
  As: number; // mm² (0.8% of new)
  As_new: number; // mm² (4/3 of As)
  N_bars: number;
  add_bars: number;
  tie_dia: number; // mm
  tie_spacing: number; // mm
  N_shear: number;
  steps: { label: string; formula: string; value: string }[];
}

export function calcColumnJacketing(
  inp: ColumnJacketingInput,
): ColumnJacketingResult {
  const fck_new = inp.fck + 5;
  const Ac_req = (inp.Pu * 1000) / (0.4 * fck_new + 0.67 * inp.fy * 0.008);
  const Ac_new_calc = 1.5 * Ac_req;
  let side_new = Math.ceil(Math.sqrt(Ac_new_calc));
  const minSide = Math.max(inp.b, inp.D) + 200;
  side_new = Math.max(side_new, minSide);
  // Round to nearest 5mm
  side_new = Math.ceil(side_new / 5) * 5;
  const tj = (side_new - Math.max(inp.b, inp.D)) / 2;
  const As = 0.008 * side_new * side_new;
  const As_new = (4 / 3) * As;
  const N_bars = Math.ceil((As_new * 4) / (Math.PI * inp.dia * inp.dia));
  const add_bars = Math.max(0, N_bars - inp.nBars);
  const tie_dia = Math.max(8, Math.ceil(inp.dia / 3));
  const S_raw = (inp.fy * tie_dia * tie_dia) / (Math.PI * fck_new * tj * tj);
  const tie_spacing = Math.max(100, Math.round(S_raw / 5) * 5);
  const N_shear = Math.ceil(inp.height / 250);

  const steps = [
    {
      label: "Upgraded fck",
      formula: "fck_new = fck + 5",
      value: `${fck_new} MPa [IS 15988:2013 §8.5.1.2(a)]`,
    },
    {
      label: "Required Gross Area",
      formula: "Pu×1000 / (0.4×fck_new + 0.67×fy×0.008)",
      value: `${Ac_req.toFixed(0)} mm²`,
    },
    {
      label: "New Gross Area",
      formula: "Ac_new = 1.5 × Ac_req",
      value: `${(1.5 * Ac_req).toFixed(0)} mm² [IS 15988:2013 §8.5.1.1(e)]`,
    },
    {
      label: "New Column Side",
      formula: "max(√Ac_new, max(b,D)+200)",
      value: `${side_new} mm`,
    },
    {
      label: "Jacket Thickness",
      formula: "tj = (side_new − max(b,D)) / 2",
      value: `${tj} mm [min 100 mm per §8.5.1.2(c)]`,
    },
    {
      label: "Steel Area (0.8%)",
      formula: "As = 0.008 × side_new²",
      value: `${As.toFixed(0)} mm²`,
    },
    {
      label: "Jacket Steel Area",
      formula: "As_new = (4/3) × As",
      value: `${As_new.toFixed(0)} mm² [IS 15988:2013 §8.5.1.1(e)]`,
    },
    {
      label: "No. of Bars",
      formula: "N = ⌈As_new × 4 / (π × dia²)⌉",
      value: `${N_bars} bars (${inp.dia}mm dia)`,
    },
    {
      label: "Additional Bars",
      formula: "N_bars − existing",
      value: `${add_bars} bars`,
    },
    {
      label: "Tie Diameter",
      formula: "max(8, ⌈dia/3⌉)",
      value: `${tie_dia} mm`,
    },
    {
      label: "Tie Spacing",
      formula: "max(100, round((fy×dh²)/(π×fck_new×tj²), 5))",
      value: `${tie_spacing} mm c/c`,
    },
    {
      label: "Shear Connectors",
      formula: "⌈H/250⌉, 12mm dia @ 250mm c/c",
      value: `${N_shear} nos`,
    },
  ];

  return {
    fck_new,
    Ac_req,
    Ac_new: 1.5 * Ac_req,
    side_new,
    tj,
    As,
    As_new,
    N_bars,
    add_bars,
    tie_dia,
    tie_spacing,
    N_shear,
    steps,
  };
}

// ─── Beam Jacketing ──────────────────────────────────────────────────────────
export interface BeamJacketingInput {
  Mu: number; // kNm
  fck: number; // MPa
  fy: number; // MPa
  b: number; // mm
  D: number; // mm (overall depth)
  d: number; // mm (effective depth)
  Vu: number; // kN
  designation: string;
}

export interface BeamJacketingResult {
  b_new: number;
  D_new: number;
  d_new: number;
  Mlim: number; // kNm
  isDoubly: boolean;
  Ast_req: number; // mm²
  Ast_min: number; // mm²
  Ast: number; // mm²
  N_bars: number;
  Ast_prov: number; // mm²
  Xu: number; // mm
  Mu_actual: number; // kNm
  flexureSafe: boolean;
  Pt: number; // %
  Tc: number; // N/mm²
  Vc: number; // kN
  shearSafe: boolean;
  steps: { label: string; formula: string; value: string }[];
}

export function calcBeamJacketing(
  inp: BeamJacketingInput,
): BeamJacketingResult {
  const b_new = inp.b + 200;
  const D_new = inp.D + 100;
  const d_new = D_new - 40;

  const Mlim = (0.138 * inp.fck * b_new * d_new * d_new) / 1e6;
  const isDoubly = inp.Mu > Mlim;

  const Ast_req = (inp.Mu * 1e6) / (0.87 * inp.fy * 0.9 * d_new);
  const Ast_min = (0.85 * b_new * d_new) / inp.fy;
  const Ast = Math.max(Ast_req, Ast_min);

  const bar_area = (Math.PI * 16 * 16) / 4; // 16mm bars
  const N_bars = Math.ceil(Ast / bar_area);
  const Ast_prov = N_bars * bar_area;

  const Xu = (0.87 * inp.fy * Ast_prov) / (0.36 * inp.fck * b_new);
  const Mu_actual = (0.87 * inp.fy * Ast_prov * (d_new - 0.42 * Xu)) / 1e6;
  const flexureSafe = Mu_actual >= inp.Mu;

  const Pt = (100 * Ast_prov) / (b_new * d_new);
  const Tc = interpolateTc(Pt, inp.fck);
  const Vc = (Tc * b_new * d_new) / 1000;
  const shearSafe = Vc >= inp.Vu;

  const steps = [
    {
      label: "Jacketed Width",
      formula: "b_new = b + 200",
      value: `${b_new} mm`,
    },
    {
      label: "Jacketed Depth",
      formula: "D_new = D + 100",
      value: `${D_new} mm`,
    },
    {
      label: "Effective Depth",
      formula: "d_new = D_new − 40",
      value: `${d_new} mm`,
    },
    {
      label: "Limiting Moment",
      formula: "0.138 × fck × b_new × d_new² / 10⁶",
      value: `${Mlim.toFixed(2)} kNm`,
    },
    {
      label: "Beam Type",
      formula: "Mu vs Mlim",
      value: isDoubly ? "Doubly Reinforced" : "Singly Reinforced",
    },
    {
      label: "Ast Required",
      formula: "Mu×10⁶ / (0.87×fy×0.9×d_new)",
      value: `${Ast_req.toFixed(0)} mm²`,
    },
    {
      label: "Ast Minimum",
      formula: "0.85×b_new×d_new / fy",
      value: `${Ast_min.toFixed(0)} mm²`,
    },
    {
      label: "Ast Adopted",
      formula: "max(Ast_req, Ast_min)",
      value: `${Ast.toFixed(0)} mm²`,
    },
    {
      label: "No. of 16mm Bars",
      formula: "⌈Ast / (π×16²/4)⌉",
      value: `${N_bars} bars`,
    },
    {
      label: "Ast Provided",
      formula: "N_bars × π×16²/4",
      value: `${Ast_prov.toFixed(0)} mm²`,
    },
    {
      label: "Neutral Axis xu",
      formula: "0.87×fy×Ast_prov / (0.36×fck×b_new)",
      value: `${Xu.toFixed(1)} mm`,
    },
    {
      label: "Moment Capacity",
      formula: "0.87×fy×Ast_prov×(d_new−0.42xu) / 10⁶",
      value: `${Mu_actual.toFixed(2)} kNm`,
    },
    {
      label: "Flexure Check",
      formula: "Mu_actual ≥ Mu",
      value: flexureSafe ? "✓ SAFE" : "✗ NOT SAFE",
    },
    {
      label: "Pt (%)",
      formula: "100×Ast_prov / (b_new×d_new)",
      value: `${Pt.toFixed(3)}%`,
    },
    {
      label: "τc (IS456 T19)",
      formula: "Interpolated for Pt and fck",
      value: `${Tc.toFixed(3)} N/mm²`,
    },
    {
      label: "Shear Capacity Vc",
      formula: "τc × b_new × d_new / 1000",
      value: `${Vc.toFixed(2)} kN`,
    },
    {
      label: "Shear Check",
      formula: "Vc ≥ Vu",
      value: shearSafe ? "✓ SAFE" : "✗ NOT SAFE",
    },
  ];

  return {
    b_new,
    D_new,
    d_new,
    Mlim,
    isDoubly,
    Ast_req,
    Ast_min,
    Ast,
    N_bars,
    Ast_prov,
    Xu,
    Mu_actual,
    flexureSafe,
    Pt,
    Tc,
    Vc,
    shearSafe,
    steps,
  };
}

// ─── Footing Jacketing ───────────────────────────────────────────────────────
export interface FootingInput {
  P: number; // kN
  b_col: number; // mm
  D_col: number; // mm
  SBC: number; // kN/m²
  fck: number; // MPa
  fy: number; // MPa
  cover: number; // mm
  dia: number; // mm
  designation: string;
}

export interface FootingResult {
  Wf: number;
  P_total: number;
  L: number; // m
  B: number; // m
  Pu: number; // N
  qu: number; // N/mm²
  d: number; // mm eff depth
  D_overall: number; // mm
  tau_v_punch: number; // N/mm²
  tau_c_punch: number; // N/mm²
  punchSafe: boolean;
  As_req: number; // mm²
  As_min: number; // mm²
  As_adopt: number; // mm²
  N_bars: number;
  steps: { label: string; formula: string; value: string }[];
}

export function calcFooting(inp: FootingInput): FootingResult {
  const Wf = 0.1 * inp.P;
  const P_total = inp.P + Wf;
  const A = P_total / inp.SBC;
  let L = Math.sqrt(A);
  // Round up to nearest 50mm in metres: nearest 0.05m
  L = Math.ceil(L * 20) / 20;
  const B = L;

  const Pu = 1.5 * inp.P * 1000; // N
  const qu = Pu / (L * 1000 * B * 1000); // N/mm²

  // Iterate for one-way shear
  let d = 200;
  for (let iter = 0; iter < 200; iter++) {
    const Vu_1way = qu * B * 1000 * ((L * 1000) / 2 - inp.D_col / 2 - d);
    const Pt_try = 0.25; // initial assumption
    const Tc_try = interpolateTc(Pt_try, inp.fck);
    const Vc = Tc_try * B * 1000 * d;
    if (Vc >= Vu_1way) break;
    d += 10;
  }

  // Two-way shear
  const b0 = 2 * (inp.b_col + inp.D_col + 2 * d);
  const Vu_punch = Pu - qu * (inp.b_col + d) * (inp.D_col + d);
  const tau_v_punch = Vu_punch / (b0 * d);
  const tau_c_punch = 0.25 * Math.sqrt(inp.fck);
  const punchSafe = tau_v_punch <= tau_c_punch;

  // Flexure
  const proj = (L * 1000 - inp.b_col) / 2;
  const Mu_ftg = (qu * B * 1000 * proj * proj) / 2 / 1e6; // kNm
  const As_req = (Mu_ftg * 1e6) / (0.87 * inp.fy * d);
  const D_overall = d + inp.cover + inp.dia / 2;
  const As_min = 0.0012 * B * 1000 * D_overall;
  const As_adopt = Math.max(As_req, As_min);
  const bar_area = (Math.PI * inp.dia * inp.dia) / 4;
  const N_bars = Math.ceil(As_adopt / bar_area);

  const steps = [
    {
      label: "Self Weight",
      formula: "Wf = 0.1 × P",
      value: `${Wf.toFixed(1)} kN`,
    },
    {
      label: "Total Load",
      formula: "P_total = P + Wf",
      value: `${P_total.toFixed(1)} kN`,
    },
    {
      label: "Footing Area",
      formula: "A = P_total / SBC",
      value: `${A.toFixed(2)} m²`,
    },
    {
      label: "Footing Size",
      formula: "L = B = √A (rounded up to 50mm)",
      value: `${L.toFixed(2)} m × ${B.toFixed(2)} m`,
    },
    {
      label: "Factored Load",
      formula: "Pu = 1.5 × P × 1000",
      value: `${(Pu / 1000).toFixed(1)} kN`,
    },
    {
      label: "Net Upward Pressure",
      formula: "qu = Pu / (L×B) in N/mm²",
      value: `${qu.toFixed(4)} N/mm²`,
    },
    {
      label: "Effective Depth",
      formula: "Iterate d for one-way shear (IS 456:2000)",
      value: `${d} mm`,
    },
    {
      label: "Overall Depth",
      formula: "D = d + cover + dia/2",
      value: `${D_overall.toFixed(0)} mm`,
    },
    {
      label: "Punching Shear τv",
      formula: "Vu_punch / (b0 × d)",
      value: `${tau_v_punch.toFixed(4)} N/mm²`,
    },
    {
      label: "Allowable τc",
      formula: "0.25 × √fck",
      value: `${tau_c_punch.toFixed(4)} N/mm²`,
    },
    {
      label: "Punch Check",
      formula: "τv ≤ τc",
      value: punchSafe ? "✓ SAFE" : "✗ NOT SAFE",
    },
    {
      label: "Ast Required",
      formula: "Mu×10⁶ / (0.87×fy×d)",
      value: `${As_req.toFixed(0)} mm²`,
    },
    {
      label: "Ast Minimum",
      formula: "0.12% × B × D",
      value: `${As_min.toFixed(0)} mm²`,
    },
    {
      label: "Ast Adopted",
      formula: "max(Ast_req, Ast_min)",
      value: `${As_adopt.toFixed(0)} mm²`,
    },
    {
      label: "No. of Bars",
      formula: `⌈As_adopt / (π×${inp.dia}²/4)⌉`,
      value: `${N_bars} nos`,
    },
  ];

  return {
    Wf,
    P_total,
    L,
    B,
    Pu,
    qu,
    d,
    D_overall,
    tau_v_punch,
    tau_c_punch,
    punchSafe,
    As_req,
    As_min,
    As_adopt,
    N_bars,
    steps,
  };
}

// ─── Column FRP ──────────────────────────────────────────────────────────────
export interface ColumnFRPInput {
  b: number; // mm
  d_col: number; // mm (depth/height)
  fck_prov: number; // MPa provided
  fck_req: number; // MPa required
  Pu: number; // kN
  fy: number; // MPa
  Ast: number; // mm²
  eps_f: number; // % (FRP ultimate strain)
  tf: number; // mm (ply thickness)
  Ef: number; // GPa
  n: number; // no. of plies
  rc: number; // mm corner radius
  designation: string;
}

export interface ColumnFRPResult {
  Ag: number;
  Ac: number;
  Pu_exist: number; // kN
  Ke: number;
  fl: number; // MPa
  fcc: number; // MPa (confined strength)
  sufficient: boolean;
  n_required: number;
  steps: { label: string; formula: string; value: string }[];
}

export function calcColumnFRP(inp: ColumnFRPInput): ColumnFRPResult {
  const Ag = inp.b * inp.d_col;
  const Ac = Ag - inp.Ast;
  const Pu_exist = (0.4 * inp.fck_prov * Ac + 0.67 * inp.fy * inp.Ast) / 1000;

  const b_prime = inp.b - 2 * inp.rc;
  const d_prime = inp.d_col - 2 * inp.rc;
  const rho_sg = inp.Ast / Ag;
  const Ke =
    1 - (b_prime * b_prime + d_prime * d_prime) / (3 * Ag * (1 - rho_sg));

  const Ef_MPa = inp.Ef * 1000;
  const ef = inp.eps_f / 100;

  function computeFcc(nPlies: number): { fl: number; fcc: number } {
    const rho_b = (2 * nPlies * inp.tf) / inp.b;
    const rho_d = (2 * nPlies * inp.tf) / inp.d_col;
    const Kconf_b = rho_b * Ke * Ef_MPa;
    const Kconf_d = rho_d * Ke * Ef_MPa;
    const flb = (Kconf_b * ef) / 2;
    const fld = (Kconf_d * ef) / 2;
    const fl = Math.min(flb, fld);
    const fcc =
      inp.fck_prov *
      (2.254 * Math.sqrt(1 + (7.94 * fl) / inp.fck_prov) -
        (2 * fl) / inp.fck_prov -
        1.254);
    return { fl, fcc };
  }

  const { fl, fcc } = computeFcc(inp.n);
  const sufficient = fcc >= inp.fck_req;

  let n_required = inp.n;
  for (let i = 1; i <= 20; i++) {
    if (computeFcc(i).fcc >= inp.fck_req) {
      n_required = i;
      break;
    }
  }

  const rho_b = (2 * inp.n * inp.tf) / inp.b;
  const rho_d = (2 * inp.n * inp.tf) / inp.d_col;

  const steps = [
    { label: "Gross Area Ag", formula: "b × d", value: `${Ag.toFixed(0)} mm²` },
    {
      label: "Concrete Area Ac",
      formula: "Ag − Ast",
      value: `${Ac.toFixed(0)} mm²`,
    },
    {
      label: "Existing Capacity",
      formula: "(0.4×fck_prov×Ac + 0.67×fy×Ast) / 1000",
      value: `${Pu_exist.toFixed(1)} kN`,
    },
    { label: "Corner Reduced b'", formula: "b − 2×rc", value: `${b_prime} mm` },
    { label: "Corner Reduced d'", formula: "d − 2×rc", value: `${d_prime} mm` },
    {
      label: "Efficiency Factor Ke",
      formula: "1 − (b'²+d'²)/(3×Ag×(1−ρsg))",
      value: `${Ke.toFixed(4)}`,
    },
    {
      label: "FRP Volumetric ρb",
      formula: "2×n×tf / b",
      value: `${rho_b.toFixed(5)}`,
    },
    {
      label: "FRP Volumetric ρd",
      formula: "2×n×tf / d",
      value: `${rho_d.toFixed(5)}`,
    },
    {
      label: "Confinement Pressure fl",
      formula: "min(Kconf_b, Kconf_d) × εf / 2",
      value: `${fl.toFixed(3)} MPa`,
    },
    {
      label: "Confined Strength fcc",
      formula: "fck×[2.254√(1+7.94fl/fck) − 2fl/fck − 1.254]",
      value: `${fcc.toFixed(2)} MPa`,
    },
    {
      label: "Adequacy Check",
      formula: "fcc ≥ fck_required",
      value: sufficient ? "✓ SUFFICIENT" : "✗ INSUFFICIENT",
    },
    {
      label: "Plies Required",
      formula: "Min n such that fcc ≥ fck_req",
      value: `${n_required} plies`,
    },
  ];

  return { Ag, Ac, Pu_exist, Ke, fl, fcc, sufficient, n_required, steps };
}

// ─── Beam FRP ────────────────────────────────────────────────────────────────
export interface BeamFRPInput {
  b: number; // mm
  D: number; // mm
  d: number; // mm
  fck: number; // MPa
  fy: number; // MPa
  Ast: number; // mm² existing
  Mu: number; // kNm
  tf: number; // mm ply thickness
  wf: number; // mm strip width
  Ef: number; // GPa
  ffu_star: number; // MPa
  eps_fu_star: number; // % ultimate strain
  CE: number; // env factor
  n: number; // initial plies to check
  designation: string;
}

export interface BeamFRPResult {
  ffu: number; // MPa
  eps_fu: number;
  eps_fd: number;
  eps_fe: number;
  xu_exist: number; // mm
  Mexist: number; // kNm
  Mdeficiency: number; // kNm
  n_required: number;
  phi_Mn_achieved: number; // kNm
  steps: { label: string; formula: string; value: string }[];
}

export function calcBeamFRP(inp: BeamFRPInput): BeamFRPResult {
  const Ef_MPa = inp.Ef * 1000;
  const ffu = inp.CE * inp.ffu_star;
  const eps_fu = (inp.CE * inp.eps_fu_star) / 100;
  const eps_fd = 0.41 * Math.sqrt(inp.fck / (Ef_MPa * inp.tf));
  const eps_fe = Math.min(0.9 * eps_fu, eps_fd);

  const xu_exist = (0.87 * inp.fy * inp.Ast) / (0.36 * inp.fck * inp.b);
  const Mexist = (0.87 * inp.fy * inp.Ast * (inp.d - 0.42 * xu_exist)) / 1e6;
  const Mdeficiency = Math.max(0, inp.Mu - Mexist);

  let n_required = 0;
  let phi_Mn_achieved = Mexist * 0.9;

  for (let i = 1; i <= 30; i++) {
    const Af = i * inp.tf * inp.wf;
    const ffe = Ef_MPa * eps_fe;
    const Tf = Af * ffe;
    const z = inp.d - 0.42 * xu_exist;
    const Mfrp = (Tf * z) / 1e6;
    const Mn = Mexist + Mfrp;
    const phi_Mn = 0.9 * Mn;
    if (phi_Mn >= inp.Mu) {
      n_required = i;
      phi_Mn_achieved = phi_Mn;
      break;
    }
  }
  if (n_required === 0) n_required = 30;

  const steps = [
    {
      label: "Design FRP Strength",
      formula: "ffu = CE × ffu*",
      value: `${ffu.toFixed(1)} MPa`,
    },
    {
      label: "Design FRP Strain",
      formula: "εfu = CE × εfu* / 100",
      value: `${eps_fu.toFixed(5)}`,
    },
    {
      label: "Debonding Strain εfd",
      formula: "0.41 × √(fck / (Ef × tf))",
      value: `${eps_fd.toFixed(5)}`,
    },
    {
      label: "Effective Strain εfe",
      formula: "min(0.9×εfu, εfd)",
      value: `${eps_fe.toFixed(5)}`,
    },
    {
      label: "Existing Neutral Axis",
      formula: "0.87×fy×Ast / (0.36×fck×b)",
      value: `${xu_exist.toFixed(1)} mm`,
    },
    {
      label: "Existing Moment Cap.",
      formula: "0.87×fy×Ast×(d−0.42xu) / 10⁶",
      value: `${Mexist.toFixed(2)} kNm`,
    },
    {
      label: "Moment Deficiency",
      formula: "Mu − Mexist",
      value: `${Mdeficiency.toFixed(2)} kNm`,
    },
    {
      label: "Plies Required",
      formula: "Min n such that φMn ≥ Mu",
      value: `${n_required} plies`,
    },
    {
      label: "φMn Achieved",
      formula: "0.9 × (Mexist + Mfrp)",
      value: `${phi_Mn_achieved.toFixed(2)} kNm`,
    },
    {
      label: "Final Check",
      formula: "φMn ≥ Mu",
      value: phi_Mn_achieved >= inp.Mu ? "✓ ADEQUATE" : "✗ INADEQUATE",
    },
  ];

  return {
    ffu,
    eps_fu,
    eps_fd,
    eps_fe,
    xu_exist,
    Mexist,
    Mdeficiency,
    n_required,
    phi_Mn_achieved,
    steps,
  };
}
