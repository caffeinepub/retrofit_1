import { AlertCircle, CheckCircle, Mail, Phone, Send } from "lucide-react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";

const TEAM = [
  {
    name: "Manas Bichadu",
    initial: "M",
    email: "mbichadu@gmail.com",
    role: "Structural Engineer & Lead Developer",
    color: "oklch(0.27 0.073 255)",
  },
  {
    name: "Shubham Dhole",
    initial: "S",
    email: "dholeshubham58@gmail.com",
    role: "Structural Analysis & BIM Specialist",
    color: "oklch(0.38 0.09 250)",
  },
  {
    name: "Nitish Bandi",
    initial: "N",
    email: "nitishbandi3@gmail.com",
    role: "NDT Testing & Retrofit Design",
    color: "oklch(0.33 0.08 260)",
  },
];

export default function AboutUs() {
  const { actor } = useActor();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errMsg, setErrMsg] = useState("");

  function validate() {
    const e: Record<string, string> = {};
    if (!form.fullName.trim()) e.fullName = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email))
      e.email = "Enter a valid email";
    if (!form.subject.trim()) e.subject = "Subject is required";
    if (!form.message.trim()) e.message = "Message is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setStatus("loading");
    try {
      if (actor) {
        await actor.submitContact(
          form.fullName,
          form.email,
          form.subject,
          form.message,
        );
      }
      setStatus("success");
      setForm({ fullName: "", email: "", subject: "", message: "" });
    } catch (err) {
      setStatus("error");
      setErrMsg(
        err instanceof Error
          ? err.message
          : "Submission failed. Please try again.",
      );
    }
  }

  return (
    <div className="p-6 md:p-10">
      <div className="mb-8">
        <h1 className="font-poppins font-bold text-2xl text-navy mb-1">
          About Us
        </h1>
        <p className="font-inter text-sm text-muted-foreground">
          Meet the team behind RetroFit
        </p>
      </div>

      {/* Team cards */}
      <section className="mb-12">
        <h2 className="font-poppins font-bold text-xl text-navy mb-6">
          Our Team
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {TEAM.map((member, i) => (
            <div
              key={member.name}
              data-ocid={`about.team.card.${i + 1}`}
              className={`feature-card flex flex-col items-center text-center animate-fade-in delay-${(i + 1) * 100}`}
            >
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-white font-poppins font-bold text-2xl mb-4 shrink-0"
                style={{
                  background: member.color,
                  boxShadow: "0 4px 20px rgba(27,42,74,0.25)",
                }}
              >
                {member.initial}
              </div>
              <h3 className="font-poppins font-bold text-base text-navy mb-1">
                {member.name}
              </h3>
              <p className="font-inter text-xs text-muted-foreground mb-3">
                {member.role}
              </p>
              <a
                href={`mailto:${member.email}`}
                className="flex items-center gap-1.5 text-xs font-inter hover:opacity-80 transition-opacity"
                style={{ color: "oklch(var(--primary))" }}
              >
                <Mail size={12} />
                {member.email}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Contact info */}
      <section className="mb-10">
        <h2 className="font-poppins font-bold text-xl text-navy mb-4">
          Contact Information
        </h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="mailto:mbichadu@gmail.com"
            className="flex items-center gap-3 px-5 py-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-all"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: "oklch(var(--primary) / 0.08)" }}
            >
              <Mail size={18} style={{ color: "oklch(var(--primary))" }} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-inter">
                Email
              </div>
              <div className="font-inter font-semibold text-sm text-navy">
                mbichadu@gmail.com
              </div>
            </div>
          </a>
          <a
            href="tel:+918623026760"
            className="flex items-center gap-3 px-5 py-4 rounded-xl bg-card border border-border hover:border-primary/40 transition-all"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: "oklch(var(--primary) / 0.08)" }}
            >
              <Phone size={18} style={{ color: "oklch(var(--primary))" }} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-inter">
                Phone
              </div>
              <div className="font-inter font-semibold text-sm text-navy">
                +91 8623026760
              </div>
            </div>
          </a>
        </div>
      </section>

      {/* Contact form */}
      <section className="max-w-xl">
        <h2 className="font-poppins font-bold text-xl text-navy mb-6">
          Send a Message
        </h2>
        <form
          data-ocid="about.contact.modal"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label className="font-inter text-sm font-medium text-foreground block mb-1">
              Full Name
            </label>
            <input
              data-ocid="about.contact.fullname.input"
              className={`form-input ${errors.fullName ? "error" : ""}`}
              value={form.fullName}
              onChange={(e) => {
                setForm((p) => ({ ...p, fullName: e.target.value }));
                setErrors((p) => ({ ...p, fullName: "" }));
              }}
            />
            {errors.fullName && (
              <p
                className="text-xs text-danger mt-1"
                data-ocid="about.contact.fullname.error_state"
              >
                {errors.fullName}
              </p>
            )}
          </div>
          <div>
            <label className="font-inter text-sm font-medium text-foreground block mb-1">
              Email
            </label>
            <input
              data-ocid="about.contact.email.input"
              type="email"
              className={`form-input ${errors.email ? "error" : ""}`}
              value={form.email}
              onChange={(e) => {
                setForm((p) => ({ ...p, email: e.target.value }));
                setErrors((p) => ({ ...p, email: "" }));
              }}
            />
            {errors.email && (
              <p
                className="text-xs text-danger mt-1"
                data-ocid="about.contact.email.error_state"
              >
                {errors.email}
              </p>
            )}
          </div>
          <div>
            <label className="font-inter text-sm font-medium text-foreground block mb-1">
              Subject
            </label>
            <input
              data-ocid="about.contact.subject.input"
              className={`form-input ${errors.subject ? "error" : ""}`}
              value={form.subject}
              onChange={(e) => {
                setForm((p) => ({ ...p, subject: e.target.value }));
                setErrors((p) => ({ ...p, subject: "" }));
              }}
            />
            {errors.subject && (
              <p
                className="text-xs text-danger mt-1"
                data-ocid="about.contact.subject.error_state"
              >
                {errors.subject}
              </p>
            )}
          </div>
          <div>
            <label className="font-inter text-sm font-medium text-foreground block mb-1">
              Message
            </label>
            <textarea
              data-ocid="about.contact.message.textarea"
              rows={5}
              className={`form-input resize-none ${errors.message ? "error" : ""}`}
              value={form.message}
              onChange={(e) => {
                setForm((p) => ({ ...p, message: e.target.value }));
                setErrors((p) => ({ ...p, message: "" }));
              }}
            />
            {errors.message && (
              <p
                className="text-xs text-danger mt-1"
                data-ocid="about.contact.message.error_state"
              >
                {errors.message}
              </p>
            )}
          </div>

          {status === "success" && (
            <div
              data-ocid="about.contact.success_state"
              className="flex items-center gap-2 p-4 rounded-lg"
              style={{
                background: "oklch(var(--success) / 0.08)",
                border: "1px solid oklch(var(--success) / 0.25)",
              }}
            >
              <CheckCircle size={16} className="text-success" />
              <span className="font-inter text-sm text-success">
                Message sent! We will get back to you soon.
              </span>
            </div>
          )}
          {status === "error" && (
            <div
              data-ocid="about.contact.error_state"
              className="flex items-center gap-2 p-4 rounded-lg"
              style={{
                background: "oklch(var(--danger) / 0.08)",
                border: "1px solid oklch(var(--danger) / 0.25)",
              }}
            >
              <AlertCircle size={16} className="text-danger" />
              <span className="font-inter text-sm text-danger">{errMsg}</span>
            </div>
          )}

          <button
            data-ocid="about.contact.submit_button"
            type="submit"
            disabled={status === "loading"}
            className="btn-primary w-full justify-center py-3"
            style={{
              background:
                "linear-gradient(135deg, oklch(var(--primary)) 0%, oklch(0.38 0.09 250) 100%)",
              opacity: status === "loading" ? 0.7 : 1,
            }}
          >
            {status === "loading" ? (
              "Sending..."
            ) : (
              <>
                <Send size={16} /> Send Message
              </>
            )}
          </button>
        </form>
      </section>
    </div>
  );
}
