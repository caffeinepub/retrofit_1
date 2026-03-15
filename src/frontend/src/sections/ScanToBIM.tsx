import { CheckCircle, ChevronRight, Mail, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

const ACCEPTED = [".rcp", ".rcs", ".e57", ".dwg", ".dxf", ".ifc", ".rvt"];

interface UpFile {
  name: string;
  size: number;
}

const WORKFLOW = [
  {
    step: 1,
    title: "3D Laser Scan",
    icon: "📡",
    desc: "FARO Focus or Leica ScanStation captures millions of points in 3D space. Scan accuracy ±2mm at 10m range. Multiple stations registered for full coverage.",
  },
  {
    step: 2,
    title: "Point Cloud Data",
    icon: "☁️",
    desc: "Raw scan data (.e57, .rcs) imported into Autodesk ReCap for registration, noise filtering, and point cloud generation ready for BIM.",
  },
  {
    step: 3,
    title: "BIM Model (Revit)",
    icon: "🏢",
    desc: "Autodesk Revit used to trace the point cloud and create accurate as-built 3D BIM model with all structural elements parameterized.",
  },
  {
    step: 4,
    title: "Retrofit Design",
    icon: "⚙️",
    desc: "RetroFit integrates BIM data for automated structural assessment, jacketing, and FRP strengthening design with IS code compliance.",
  },
];

const SOFTWARE = [
  {
    name: "Autodesk ReCap",
    use: "Point cloud registration & processing",
    color: "oklch(0.65 0.15 30)",
  },
  {
    name: "Autodesk Revit",
    use: "3D BIM modeling from point cloud",
    color: "oklch(0.55 0.15 240)",
  },
  {
    name: "Autodesk TrueView",
    use: "Free DWG/BIM viewing and markup",
    color: "oklch(0.55 0.12 200)",
  },
  {
    name: "FARO Scene",
    use: "High-accuracy laser scan processing",
    color: "oklch(0.48 0.12 150)",
  },
];

function fmtBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ScanToBIM() {
  const [files, setFiles] = useState<UpFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [sent, setSent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(list: FileList | null) {
    if (!list) return;
    setFiles((p) => [
      ...p,
      ...Array.from(list).map((f) => ({ name: f.name, size: f.size })),
    ]);
  }

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="font-poppins font-bold text-2xl text-navy mb-1">
          Scan to BIM Technology
        </h1>
        <p className="font-inter text-sm text-muted-foreground">
          3D Laser Scanning → Point Cloud → BIM Model → Retrofit Design
        </p>
      </div>

      {/* Hero banner */}
      <div
        className="rounded-2xl overflow-hidden mb-10 p-8 md:p-12 relative"
        style={{
          background:
            "linear-gradient(135deg, oklch(var(--primary)) 0%, oklch(0.38 0.09 250) 100%)",
        }}
      >
        <div className="absolute inset-0 hero-grid opacity-20" />
        <div className="relative z-10 max-w-2xl">
          <h2
            className="font-poppins font-bold text-2xl md:text-3xl mb-4"
            style={{ color: "white" }}
          >
            Precise As-Built Documentation with 3D Laser Scanning
          </h2>
          <p
            className="font-inter text-base leading-relaxed"
            style={{ color: "rgba(255,255,255,0.8)" }}
          >
            Terrestrial laser scanning captures the exact geometry of existing
            structures with millimeter-level accuracy. Point cloud data is
            converted to intelligent BIM models in Autodesk Revit, providing the
            foundation for accurate structural assessment and retrofitting
            design — essential for heritage and critical infrastructure
            projects.
          </p>
        </div>
      </div>

      {/* Workflow */}
      <section className="mb-10">
        <h2 className="font-poppins font-bold text-xl text-navy mb-6">
          Scan-to-Retrofit Workflow
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {WORKFLOW.map((step, i) => (
            <div
              key={step.step}
              className={`feature-card animate-fade-in delay-${(i + 1) * 100}`}
            >
              <div className="text-3xl mb-3">{step.icon}</div>
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-5 h-5 rounded-full text-xs font-bold text-white flex items-center justify-center"
                  style={{ background: "oklch(var(--primary))" }}
                >
                  {step.step}
                </div>
                {i < 3 && (
                  <ChevronRight size={12} className="text-muted-foreground" />
                )}
              </div>
              <h3 className="font-poppins font-bold text-sm text-navy mb-2">
                {step.title}
              </h3>
              <p className="font-inter text-xs text-muted-foreground leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Image placeholders */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          "Laser Scanner Equipment",
          "Point Cloud Visualization",
          "Revit BIM Model",
          "Retrofit Design Overlay",
        ].map((label) => (
          <div
            key={label}
            className="aspect-video rounded-xl flex items-center justify-center text-center"
            style={{
              background: "oklch(var(--muted))",
              border: "2px dashed oklch(var(--border))",
            }}
          >
            <p className="text-xs text-muted-foreground font-inter px-2">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Software */}
      <section className="mb-10">
        <h2 className="font-poppins font-bold text-xl text-navy mb-5">
          Software Used
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SOFTWARE.map((sw, i) => (
            <div
              key={i}
              className="bg-card rounded-xl border border-border p-4 flex items-center gap-4"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-poppins font-bold text-sm shrink-0"
                style={{ background: sw.color }}
              >
                {sw.name[0]}
              </div>
              <div>
                <div className="font-poppins font-semibold text-sm text-navy">
                  {sw.name}
                </div>
                <div className="text-xs text-muted-foreground font-inter">
                  {sw.use}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Upload */}
      <section>
        <h2 className="font-poppins font-bold text-xl text-navy mb-2">
          Upload BIM / Scan Files
        </h2>
        <p className="font-inter text-sm text-muted-foreground mb-5">
          Accepted: {ACCEPTED.join(", ")}
        </p>

        {sent ? (
          <div
            className="rounded-xl p-8 flex flex-col items-center gap-4 animate-fade-in-scale"
            style={{
              background: "oklch(var(--success) / 0.07)",
              border: "1px solid oklch(var(--success) / 0.25)",
            }}
          >
            <CheckCircle size={40} className="text-success" />
            <div className="text-center">
              <div className="font-poppins font-bold text-base text-navy">
                Files Noted!
              </div>
              <p className="font-inter text-sm text-muted-foreground mt-1">
                Our BIM team will contact you shortly.
              </p>
            </div>
            <button
              type="button"
              data-ocid="scan.upload_again.button"
              className="btn-secondary text-sm"
              onClick={() => {
                setSent(false);
                setFiles([]);
              }}
            >
              Upload More Files
            </button>
          </div>
        ) : (
          <>
            <div
              data-ocid="scan.file.dropzone"
              className="rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-all"
              style={{
                borderColor: dragging
                  ? "oklch(var(--primary))"
                  : "oklch(var(--border))",
                background: dragging
                  ? "oklch(var(--primary) / 0.04)"
                  : "oklch(var(--card))",
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                addFiles(e.dataTransfer.files);
              }}
              onClick={() => inputRef.current?.click()}
            >
              <Upload
                size={28}
                className="mx-auto mb-3"
                style={{ color: "oklch(var(--primary))" }}
              />
              <p className="font-poppins font-semibold text-sm text-navy mb-1">
                Drag & Drop Files Here
              </p>
              <p className="font-inter text-xs text-muted-foreground">
                or click to browse
              </p>
              <input
                ref={inputRef}
                data-ocid="scan.file.upload_button"
                type="file"
                multiple
                accept={ACCEPTED.join(",")}
                className="hidden"
                onChange={(e) => addFiles(e.target.files)}
              />
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((f, i) => (
                  <div
                    key={i}
                    data-ocid={`scan.file.item.${i + 1}`}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-card border border-border"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold"
                      style={{
                        background: "oklch(var(--primary) / 0.1)",
                        color: "oklch(var(--primary))",
                      }}
                    >
                      {f.name.split(".").pop()?.toUpperCase().slice(0, 3)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-inter text-sm font-medium truncate">
                        {f.name}
                      </div>
                      <div className="font-inter text-xs text-muted-foreground">
                        {fmtBytes(f.size)}
                      </div>
                    </div>
                    <button
                      type="button"
                      data-ocid={`scan.file.delete_button.${i + 1}`}
                      className="p-1 rounded hover:bg-muted transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFiles((p) => p.filter((_, idx) => idx !== i));
                      }}
                    >
                      <X size={14} className="text-muted-foreground" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  data-ocid="scan.send_files.primary_button"
                  className="btn-primary mt-2"
                  onClick={() => setSent(true)}
                >
                  Send to RetroFit Team
                </button>
              </div>
            )}

            <div
              className="mt-5 flex items-center gap-2 p-4 rounded-lg"
              style={{
                background: "oklch(var(--muted))",
                border: "1px solid oklch(var(--border))",
              }}
            >
              <Mail size={16} style={{ color: "oklch(var(--primary))" }} />
              <span className="font-inter text-sm text-muted-foreground">
                Or email files to:{" "}
                <a
                  href="mailto:mbichadu@gmail.com"
                  className="font-medium hover:underline"
                  style={{ color: "oklch(var(--primary))" }}
                >
                  mbichadu@gmail.com
                </a>
              </span>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
