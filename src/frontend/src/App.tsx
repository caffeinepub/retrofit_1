import { Toaster } from "@/components/ui/sonner";
import {
  BookOpen,
  Building2,
  ClipboardList,
  Home,
  Menu,
  Scan,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import AboutUs from "./sections/AboutUs";
import Assessment from "./sections/Assessment";
import HomeSection from "./sections/Home";
import KnowledgeHub from "./sections/KnowledgeHub";
import ScanToBIM from "./sections/ScanToBIM";

export type Section = "home" | "assessment" | "knowledge" | "scan" | "about";

const NAV_ITEMS: {
  id: Section;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "assessment", label: "Start Assessment", icon: ClipboardList },
  { id: "knowledge", label: "Knowledge Hub", icon: BookOpen },
  { id: "scan", label: "Scan to BIM Technology", icon: Scan },
  { id: "about", label: "About Us", icon: Users },
];

export default function App() {
  const [active, setActive] = useState<Section>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = (s: Section) => {
    setActive(s);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ── Sidebar ───────────────────────────────────── */}
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={[
          "fixed top-0 left-0 h-full z-40 flex flex-col transition-transform duration-300",
          "w-[240px]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0 md:static md:z-auto",
        ].join(" ")}
        style={{ background: "oklch(var(--sidebar))" }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-5 py-5 border-b"
          style={{ borderColor: "oklch(var(--sidebar-border))" }}
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: "oklch(var(--sidebar-primary))" }}
          >
            <Building2 size={20} color="white" />
          </div>
          <div>
            <div
              className="font-poppins font-bold text-base leading-tight"
              style={{ color: "oklch(var(--sidebar-foreground))" }}
            >
              RetroFit
            </div>
            <div
              className="text-[10px] font-inter"
              style={{ color: "oklch(var(--sidebar-foreground) / 0.6)" }}
            >
              Structural Engineering
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              type="button"
              key={item.id}
              data-ocid={`nav.${item.id}.link`}
              className={`sidebar-item w-full text-left ${active === item.id ? "active" : ""}`}
              onClick={() => navigate(item.id)}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* IS Code badge */}
        <div className="px-4 py-4">
          <div
            className="rounded-lg px-3 py-2 text-center"
            style={{ background: "oklch(var(--sidebar-accent))" }}
          >
            <div
              className="text-[10px] font-inter font-semibold"
              style={{ color: "oklch(var(--sidebar-foreground) / 0.7)" }}
            >
              IS 15988:2013
            </div>
            <div
              className="text-[10px] font-inter"
              style={{ color: "oklch(var(--sidebar-foreground) / 0.5)" }}
            >
              Compliant Software
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 border-b bg-card shadow-xs">
          <button
            type="button"
            data-ocid="nav.menu.toggle"
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setSidebarOpen((v) => !v)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="font-poppins font-bold text-base text-navy">
            RetroFit
          </span>
        </header>

        {/* Section content */}
        <main className="flex-1 overflow-y-auto">
          <div key={active} className="section-enter">
            {active === "home" && (
              <HomeSection onStartAssessment={() => navigate("assessment")} />
            )}
            {active === "assessment" && <Assessment />}
            {active === "knowledge" && <KnowledgeHub />}
            {active === "scan" && <ScanToBIM />}
            {active === "about" && <AboutUs />}
          </div>
        </main>

        {/* Footer */}
        <footer className="py-3 px-6 border-t bg-card flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground font-inter">
            IS 15988:2013 Compliant | RetroFit Structural Engineering Software
          </span>
          <span className="text-xs text-muted-foreground font-inter">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary transition-colors"
            >
              caffeine.ai
            </a>
          </span>
        </footer>
      </div>

      <Toaster />
    </div>
  );
}
