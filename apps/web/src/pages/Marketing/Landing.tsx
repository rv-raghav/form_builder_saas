import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3,
  Blocks,
  Check,
  Compass,
  FileText,
  Globe,
  Lock,
  Mail,
  Rocket,
  Sparkles,
  Wand2,
} from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import GridShape from "../../components/common/GridShape";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function scrollToHash(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};

function GlassCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl",
        "shadow-[0_30px_90px_-55px_rgba(99,102,241,0.55)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.10] via-white/[0.02] to-transparent" />
      {children}
    </div>
  );
}

function GradientButton({
  children,
  to,
  variant = "primary",
}: {
  children: React.ReactNode;
  to: string;
  variant?: "primary" | "secondary";
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition will-change-transform";
  if (variant === "secondary") {
    return (
      <Link
        to={to}
        className={cn(
          base,
          "border border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.07]",
        )}
      >
        {children}
      </Link>
    );
  }
  return (
    <Link
      to={to}
      className={cn(
        base,
        "text-white shadow-[0_18px_60px_-25px_rgba(245,158,11,0.6)]",
        "bg-gradient-to-r from-indigo-500/90 via-indigo-500 to-orange-400/90",
        "hover:translate-y-[-1px] hover:shadow-[0_20px_70px_-25px_rgba(99,102,241,0.7)]",
      )}
    >
      {children}
    </Link>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold tracking-wide text-white/80">
        <Sparkles className="h-3.5 w-3.5 text-orange-200/90" />
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        {title}
      </h2>
      <p className="mt-3 text-base leading-relaxed text-slate-300">{description}</p>
    </div>
  );
}

function DashboardMock() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-8 -z-10">
        <div className="absolute left-10 top-10 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute right-0 top-24 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-24 h-64 w-64 rounded-full bg-orange-400/15 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18, rotateX: 6 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
        className={cn(
          "relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0B1020]/70 backdrop-blur-2xl",
          "shadow-[0_35px_120px_-55px_rgba(34,211,238,0.30)]",
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(99,102,241,0.18),transparent_45%),radial-gradient(circle_at_70%_20%,rgba(245,158,11,0.14),transparent_40%),radial-gradient(circle_at_30%_80%,rgba(34,211,238,0.12),transparent_40%)]" />

        <div className="relative grid grid-cols-[190px_1fr] gap-0">
          <div className="border-r border-white/10 p-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-400/90 to-orange-300/80" />
              <div>
                <p className="text-sm font-semibold text-white">ChaiForms</p>
                <p className="text-[11px] text-white/55">Creator dashboard</p>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              {[
                { icon: <Blocks className="h-4 w-4" />, label: "Builder" },
                { icon: <BarChart3 className="h-4 w-4" />, label: "Analytics" },
                { icon: <FileText className="h-4 w-4" />, label: "Responses" },
                { icon: <Compass className="h-4 w-4" />, label: "Explore" },
              ].map((item) => (
                <div
                  key={item.label}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium",
                    item.label === "Analytics"
                      ? "border border-indigo-400/30 bg-indigo-400/10 text-white"
                      : "text-white/70 hover:bg-white/[0.05]",
                  )}
                >
                  <span className={cn(item.label === "Analytics" ? "text-indigo-200" : "text-white/60")}>
                    {item.icon}
                  </span>
                  {item.label}
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-[11px] font-semibold text-white/80">Publishing</p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-white/60">
                <span>demo-event-rsvp</span>
                <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-emerald-200">
                  live
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-2 w-full rounded-full bg-white/10">
                  <div className="h-2 w-[72%] rounded-full bg-gradient-to-r from-cyan-400/70 to-indigo-400/70" />
                </div>
                <span className="text-[11px] text-white/55">72%</span>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Responses", value: "1,284", tint: "from-indigo-400/25 to-indigo-400/0" },
                { label: "Completion", value: "68%", tint: "from-cyan-400/20 to-cyan-400/0" },
                { label: "Active forms", value: "12", tint: "from-orange-400/20 to-orange-400/0" },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className={cn(
                    "rounded-2xl border border-white/10 bg-gradient-to-b p-3",
                    kpi.tint,
                  )}
                >
                  <p className="text-[11px] font-medium text-white/60">{kpi.label}</p>
                  <p className="mt-1 text-lg font-semibold text-white">{kpi.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 grid gap-3 lg:grid-cols-[1.35fr_1fr]">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-white/80">Response trend</p>
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] text-white/60">
                    last 14 days
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-14 items-end gap-1">
                  {[6, 8, 3, 9, 10, 7, 4, 5, 9, 11, 6, 8, 12, 7].map((h, idx) => (
                    <div
                      key={idx}
                      className="h-16 rounded-full bg-white/5"
                      aria-hidden="true"
                    >
                      <div
                        className="h-full rounded-full bg-gradient-to-t from-indigo-400/55 via-cyan-400/45 to-orange-300/25"
                        style={{ height: `${(h / 12) * 100}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-xs font-semibold text-white/80">Live feed</p>
                <div className="mt-3 space-y-2">
                  {[
                    { name: "Alice", msg: "Yes, attending", t: "2m" },
                    { name: "Devon", msg: "Maybe", t: "9m" },
                    { name: "Casey", msg: "No", t: "22m" },
                  ].map((r) => (
                    <div
                      key={r.name}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-400/60 to-orange-300/60" />
                        <div>
                          <p className="text-[11px] font-semibold text-white/80">{r.name}</p>
                          <p className="text-[11px] text-white/55">{r.msg}</p>
                        </div>
                      </div>
                      <p className="text-[10px] text-white/45">{r.t}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute right-6 top-6 hidden lg:block"
            >
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 backdrop-blur-xl">
                <p className="text-[11px] font-semibold text-white/80">Publish link</p>
                <p className="mt-0.5 text-[11px] text-white/55">chaiforms.app/f/demo-event-rsvp</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function BuilderShowcase() {
  return (
    <GlassCard className="p-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <p className="text-xs font-semibold tracking-wide text-white/70">Builder</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">
            Drag, refine, publish — in minutes.
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Build visually, control privacy (public or unlisted), and ship forms that look
            great on day one. No-code simplicity with production-grade behavior.
          </p>

          <div className="mt-5 grid gap-3">
            {[
              {
                icon: <Wand2 className="h-4 w-4" />,
                title: "Smart field presets",
                desc: "Email, rating, selects — validated and clean.",
              },
              {
                icon: <Globe className="h-4 w-4" />,
                title: "Public & unlisted",
                desc: "Share instantly without a heavy embed flow.",
              },
              {
                icon: <Lock className="h-4 w-4" />,
                title: "Role-based access",
                desc: "Creators build, admins govern — secure defaults.",
              },
            ].map((i) => (
              <div key={i.title} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="mt-0.5 rounded-xl border border-white/10 bg-white/[0.05] p-2 text-indigo-200">
                  {i.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/85">{i.title}</p>
                  <p className="text-sm text-white/60">{i.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute -inset-8 -z-10">
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-indigo-500/15 blur-3xl" />
            <div className="absolute bottom-0 left-10 h-48 w-48 rounded-full bg-orange-400/12 blur-3xl" />
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-2xl bg-gradient-to-br from-indigo-400/70 to-cyan-300/50" />
                <div>
                  <p className="text-xs font-semibold text-white/80">Event RSVP</p>
                  <p className="text-[11px] text-white/55">Theme: Event · Visibility: Public</p>
                </div>
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] text-white/65">
                Draft → Publish
              </span>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-2xl border border-white/10 bg-[#0B1020]/50 p-3">
                <p className="text-[11px] font-semibold text-white/70">Fields</p>
                <div className="mt-2 space-y-2">
                  {[
                    { label: "Full name", pill: "short_text" },
                    { label: "Email", pill: "email" },
                    { label: "Attendance", pill: "single_select" },
                    { label: "Notes", pill: "long_text" },
                  ].map((f, idx) => (
                    <motion.div
                      key={f.label}
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-20%" }}
                      transition={{ duration: 0.35, delay: 0.05 * idx }}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-orange-300/70" />
                        <p className="text-xs font-medium text-white/80">{f.label}</p>
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] text-white/55">
                        {f.pill}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
                <p className="text-[11px] font-semibold text-white/70">Live preview</p>
                <div className="mt-2 space-y-2">
                  {[
                    { label: "Full name", placeholder: "Jane Doe" },
                    { label: "Email", placeholder: "you@example.com" },
                  ].map((i) => (
                    <div key={i.label}>
                      <p className="text-[11px] text-white/55">{i.label}</p>
                      <div className="mt-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/40">
                        {i.placeholder}
                      </div>
                    </div>
                  ))}
                  <div>
                    <p className="text-[11px] text-white/55">Attendance</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {["Yes", "Maybe", "No"].map((x) => (
                        <span
                          key={x}
                          className={cn(
                            "rounded-full border border-white/10 px-3 py-1 text-[11px]",
                            x === "Yes"
                              ? "bg-indigo-400/15 text-indigo-100"
                              : "bg-white/[0.03] text-white/55",
                          )}
                        >
                          {x}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="pt-2">
                    <div className="rounded-xl bg-gradient-to-r from-indigo-500/90 via-indigo-500 to-orange-400/90 px-4 py-2 text-center text-xs font-semibold text-white">
                      Submit
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

function AnalyticsShowcase() {
  const rows = useMemo(
    () => [
      { label: "Today", value: "92", delta: "+14%" },
      { label: "This week", value: "512", delta: "+9%" },
      { label: "Completion", value: "68%", delta: "+3%" },
    ],
    [],
  );

  return (
    <GlassCard className="p-6">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-[#0B1020]/55 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white/80">Analytics</p>
              <p className="mt-1 text-sm text-white/60">Trends, tables, and clean exports.</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-white/60">
              <BarChart3 className="h-3.5 w-3.5 text-cyan-200/90" />
              Live metrics
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {rows.map((k) => (
              <div key={k.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-[11px] text-white/55">{k.label}</p>
                <p className="mt-1 text-lg font-semibold text-white">{k.value}</p>
                <p className="mt-1 text-[11px] text-emerald-200/80">{k.delta}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <p className="text-xs font-semibold text-white/80">Response table</p>
            <div className="mt-3 space-y-2">
              {[
                { who: "alice@example.com", what: "Yes, attending", when: "2m ago" },
                { who: "devon@example.com", what: "Maybe", when: "9m ago" },
                { who: "casey@example.com", what: "No", when: "22m ago" },
              ].map((r) => (
                <div key={r.who} className="grid grid-cols-[1.2fr_1fr_auto] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
                  <p className="truncate text-[11px] text-white/65">{r.who}</p>
                  <p className="truncate text-[11px] text-white/55">{r.what}</p>
                  <p className="text-[10px] text-white/45">{r.when}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-semibold text-white">
            Know what’s working — instantly.
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Creators get a clear submission list + detail view, plus analytics you can trust.
            Technical enough for teams, accessible enough for communities.
          </p>

          <div className="mt-6 space-y-3">
            {[
              { icon: <Mail className="h-4 w-4" />, t: "Email notifications", d: "Notify creators on new responses." },
              { icon: <Lock className="h-4 w-4" />, t: "Secure access rules", d: "Owner/admin visibility with enforced policy." },
              { icon: <FileText className="h-4 w-4" />, t: "Response detail", d: "Labeled answers in field order." },
            ].map((i) => (
              <div key={i.t} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="mt-0.5 rounded-xl border border-white/10 bg-white/[0.05] p-2 text-cyan-100">
                  {i.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/85">{i.t}</p>
                  <p className="text-sm text-white/60">{i.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0B1020] text-white">
      <PageMeta
        title="ChaiForms — Build beautiful forms"
        description="Build beautiful forms. Share instantly. Analyze responses. Production-grade form builder for creators and teams."
      />

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 left-1/2 h-[520px] w-[920px] -translate-x-1/2 rounded-full bg-indigo-500/15 blur-3xl" />
          <div className="absolute top-28 left-12 h-[420px] w-[420px] rounded-full bg-orange-400/12 blur-3xl" />
          <div className="absolute top-56 right-0 h-[420px] w-[420px] rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.07),transparent_50%)]" />
        </div>

        <GridShape />

        <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0B1020]/55 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400/80 to-orange-300/70 shadow-[0_18px_50px_-30px_rgba(245,158,11,0.8)]" />
              <span className="text-sm font-semibold tracking-wide">ChaiForms</span>
            </Link>

            <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
              <button type="button" className="hover:text-white" onClick={() => scrollToHash("features")}>
                Features
              </button>
              <button type="button" className="hover:text-white" onClick={() => scrollToHash("pricing")}>
                Pricing
              </button>
              <Link to="/explore" className="hover:text-white">
                Explore
              </Link>
              <a
                href="http://localhost:8000/docs"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white"
              >
                Docs
              </a>
            </nav>

            <div className="flex items-center gap-3">
              <Link to="/signin" className="hidden text-sm font-medium text-white/70 hover:text-white sm:inline-flex">
                Sign In
              </Link>
              <GradientButton to="/signup">Get Started</GradientButton>
            </div>
          </div>
        </header>

        <main>
          {/* Hero */}
          <section className="mx-auto max-w-6xl px-6 pb-16 pt-12 sm:pt-16">
            <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
              <motion.div variants={container} initial="hidden" animate="show">
                <motion.p variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white/75">
                  <Rocket className="h-3.5 w-3.5 text-indigo-200" />
                  Production-grade form builder for creators & teams
                </motion.p>
                <motion.h1 variants={fadeUp} className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-6xl">
                  Build Forms{" "}
                  <span className="bg-gradient-to-r from-indigo-200 via-white to-orange-100 bg-clip-text text-transparent">
                    That People Actually Want to Fill
                  </span>
                </motion.h1>
                <motion.p variants={fadeUp} className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
                  Create stunning forms, share instantly, collect responses, and analyze everything from a premium creator dashboard.
                  No-code simplicity with developer-grade polish.
                </motion.p>

                <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
                  <GradientButton to="/signup">Start Building</GradientButton>
                  <GradientButton to="/explore" variant="secondary">
                    Live Demo
                  </GradientButton>
                </motion.div>

                <motion.div variants={fadeUp} className="mt-8 grid gap-3 sm:grid-cols-3">
                  {[
                    { k: "10k+ responses collected", icon: <FileText className="h-4 w-4" /> },
                    { k: "Built with tRPC + Drizzle", icon: <Blocks className="h-4 w-4" /> },
                    { k: "Public & unlisted forms", icon: <Globe className="h-4 w-4" /> },
                  ].map((item) => (
                    <div key={item.k} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white/75">
                      <span className="text-orange-200/90">{item.icon}</span>
                      <span>{item.k}</span>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              <div className="relative">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -left-4 -top-4 hidden lg:block"
                >
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-xl">
                    <p className="text-[11px] font-semibold text-white/80">AI-polished UX</p>
                    <p className="mt-0.5 text-[11px] text-white/55">Validation · previews · analytics</p>
                  </div>
                </motion.div>
                <DashboardMock />
              </div>
            </div>
          </section>

          {/* Trusted by */}
          <section className="mx-auto max-w-6xl px-6 pb-16">
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6">
              <p className="text-center text-xs font-semibold tracking-wide text-white/55">
                Trusted by teams shipping fast
              </p>
              <div className="mt-5 grid grid-cols-2 gap-4 text-center text-sm font-semibold text-white/45 sm:grid-cols-5">
                {["DevLaunch", "HackStack", "Buildify", "OpenForge", "ByteLabs"].map((name) => (
                  <div key={name} className="rounded-2xl border border-white/5 bg-white/[0.02] py-3">
                    {name}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Feature grid */}
          <section id="features" className="mx-auto max-w-6xl px-6 pb-20">
            <SectionHeader
              eyebrow="Core features"
              title="Everything you need to launch forms that convert"
              description="A premium builder experience with clean publishing, secure access rules, and analytics that stay readable."
            />

            <div className="mt-10 grid gap-4 lg:grid-cols-12">
              {[
                {
                  title: "Drag & Drop Builder",
                  desc: "Build fast with smart field presets and clean validation.",
                  icon: <Wand2 className="h-5 w-5" />,
                  className: "lg:col-span-4",
                },
                {
                  title: "Public & Unlisted Forms",
                  desc: "Share instantly. Unlisted stays off Explore but still works by link.",
                  icon: <Globe className="h-5 w-5" />,
                  className: "lg:col-span-4",
                },
                {
                  title: "Real-time Analytics",
                  desc: "Track daily response trends and total submissions in a creator dashboard.",
                  icon: <BarChart3 className="h-5 w-5" />,
                  className: "lg:col-span-4",
                },
                {
                  title: "Role-Based Access",
                  desc: "Owner/admin rules enforced server-side for safe collaboration.",
                  icon: <Lock className="h-5 w-5" />,
                  className: "lg:col-span-6",
                },
                {
                  title: "Instant Publishing",
                  desc: "Draft → publish with a share link. No complicated setup.",
                  icon: <Rocket className="h-5 w-5" />,
                  className: "lg:col-span-3",
                },
                {
                  title: "Theme Presets",
                  desc: "Premium vibes out of the box — tech, event, community, startup, and more.",
                  icon: <Sparkles className="h-5 w-5" />,
                  className: "lg:col-span-3",
                },
              ].map((f, idx) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20%" }}
                  transition={{ duration: 0.55, delay: 0.05 * idx }}
                  className={cn("lg:col-span-4", f.className)}
                >
                  <GlassCard className="h-full p-5 transition hover:translate-y-[-2px] hover:border-white/15">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-white/90">{f.title}</p>
                        <p className="mt-2 text-sm leading-relaxed text-white/60">{f.desc}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-2 text-indigo-200">
                        {f.icon}
                      </div>
                    </div>
                    <div className="mt-4 h-[72px] rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.18),transparent_55%),radial-gradient(circle_at_70%_60%,rgba(245,158,11,0.14),transparent_55%)]" />
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Builder showcase */}
          <section className="mx-auto max-w-6xl px-6 pb-20">
            <SectionHeader
              eyebrow="Interactive builder"
              title="A builder that feels like a product — not a template"
              description="Glass panels, confident spacing, and micro-interactions that make creating forms feel effortless."
            />
            <div className="mt-10">
              <BuilderShowcase />
            </div>
          </section>

          {/* Analytics showcase */}
          <section className="mx-auto max-w-6xl px-6 pb-20">
            <SectionHeader
              eyebrow="Analytics"
              title="Cinematic dashboards with trustworthy numbers"
              description="Clear totals. Clean trends. Full response detail. Designed to be technical but accessible."
            />
            <div className="mt-10">
              <AnalyticsShowcase />
            </div>
          </section>

          {/* Themes */}
          <section className="mx-auto max-w-6xl px-6 pb-20">
            <SectionHeader
              eyebrow="Theme presets"
              title="Ship beautiful forms out of the box"
              description="Pick a theme and publish. Premium dark UI with subtle chai warmth — no heavy design work required."
            />

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { name: "Anime Theme", tint: "from-fuchsia-400/25 via-indigo-400/10 to-transparent" },
                { name: "Startup Theme", tint: "from-orange-400/20 via-indigo-400/10 to-transparent" },
                { name: "Gaming Theme", tint: "from-cyan-400/20 via-indigo-400/10 to-transparent" },
                { name: "Community Theme", tint: "from-emerald-400/18 via-indigo-400/10 to-transparent" },
                { name: "Tech Theme", tint: "from-indigo-400/22 via-cyan-400/10 to-transparent" },
                { name: "Event Theme", tint: "from-orange-300/20 via-cyan-300/10 to-transparent" },
              ].map((t, idx) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.5, delay: 0.04 * idx }}
                >
                  <GlassCard className="p-5 transition hover:translate-y-[-2px]">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white/85">{t.name}</p>
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] text-white/60">
                        preset
                      </span>
                    </div>
                    <div className={cn("mt-4 rounded-2xl border border-white/10 bg-gradient-to-b p-4", t.tint)}>
                      <div className="space-y-2">
                        <div className="h-2 w-24 rounded-full bg-white/25" />
                        <div className="h-2 w-40 rounded-full bg-white/15" />
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="h-10 rounded-xl border border-white/10 bg-white/[0.03]" />
                        <div className="h-10 rounded-xl border border-white/10 bg-white/[0.03]" />
                        <div className="h-9 rounded-xl bg-gradient-to-r from-indigo-500/85 to-orange-400/75" />
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Pricing */}
          <section id="pricing" className="mx-auto max-w-6xl px-6 pb-20">
            <SectionHeader
              eyebrow="Pricing"
              title="Simple plans that scale with you"
              description="Premium product, honest tiers. (Demo pricing — no real billing.)"
            />

            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {[
                {
                  name: "Free",
                  price: "$0",
                  desc: "For solo creators getting started.",
                  features: ["Up to 3 forms", "100 responses/month", "Basic themes"],
                },
                {
                  name: "Pro",
                  price: "$19",
                  badge: "Most popular",
                  desc: "For shipping teams and campaigns.",
                  features: ["Unlimited forms", "Analytics dashboard", "Email notifications", "Theme presets"],
                  highlight: true,
                },
                {
                  name: "Team",
                  price: "$49",
                  desc: "For organizations that need control.",
                  features: ["Role-based access", "Audit-friendly analytics", "Priority support", "Sane defaults"],
                },
              ].map((p) => (
                <GlassCard
                  key={p.name}
                  className={cn(
                    "p-6",
                    p.highlight &&
                      "border-indigo-400/30 shadow-[0_30px_90px_-55px_rgba(245,158,11,0.55)]",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white/90">{p.name}</p>
                      <p className="mt-2 text-4xl font-semibold tracking-tight text-white">{p.price}</p>
                    </div>
                    {p.badge ? (
                      <span className="rounded-full bg-gradient-to-r from-indigo-500/60 to-orange-400/50 px-3 py-1 text-[11px] font-semibold text-white">
                        {p.badge}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-white/60">{p.desc}</p>
                  <div className="mt-5 space-y-2">
                    {p.features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm text-white/70">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-200">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        {f}
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <GradientButton to="/signup" variant={p.highlight ? "primary" : "secondary"}>
                      Get started
                    </GradientButton>
                  </div>
                </GlassCard>
              ))}
            </div>
          </section>

          {/* Testimonials */}
          <section className="mx-auto max-w-6xl px-6 pb-20">
            <SectionHeader
              eyebrow="Testimonials"
              title="Premium UX that earns trust fast"
              description="The goal: immediately understandable in 5 seconds — and still deep enough for teams."
            />

            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {[
                {
                  who: "Mina K.",
                  role: "Developer Advocate",
                  quote:
                    "ChaiForms feels like a real product: fast builder, clean publishing, and analytics that don’t overwhelm.",
                },
                {
                  who: "Arjun S.",
                  role: "Founder",
                  quote:
                    "We shipped a public form in minutes. The dashboard looks premium and instantly sells trust to users.",
                },
                {
                  who: "Lena P.",
                  role: "Community Lead",
                  quote:
                    "Unlisted links and role-based access made it simple to collect responses without exposing everything publicly.",
                },
              ].map((t) => (
                <GlassCard key={t.who} className="p-6">
                  <p className="text-sm leading-relaxed text-white/75">“{t.quote}”</p>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-400/60 to-orange-300/60" />
                    <div>
                      <p className="text-sm font-semibold text-white/85">{t.who}</p>
                      <p className="text-xs text-white/55">{t.role}</p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </section>

          {/* CTA banner */}
          <section className="mx-auto max-w-6xl px-6 pb-16">
            <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.03] p-10">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.25),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(245,158,11,0.20),transparent_55%),radial-gradient(circle_at_50%_90%,rgba(34,211,238,0.14),transparent_55%)]" />
              <div className="relative mx-auto max-w-3xl text-center">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white/75">
                  <Sparkles className="h-3.5 w-3.5 text-orange-200/90" />
                  Build → Share → Collect → Analyze
                </p>
                <h3 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Start building better forms today
                </h3>
                <p className="mt-3 text-base text-white/65">
                  Premium UX, production-grade rules, and analytics that stay readable.
                </p>
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                  <GradientButton to="/signup">Create Free Account</GradientButton>
                  <GradientButton to="/explore" variant="secondary">
                    Explore Demo
                  </GradientButton>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="mx-auto max-w-6xl px-6 pb-10">
            <div className="grid gap-8 border-t border-white/10 pt-10 sm:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400/80 to-orange-300/70" />
                  <span className="text-sm font-semibold">ChaiForms</span>
                </div>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-white/60">
                  Build beautiful forms. Share instantly. Analyze responses. A production-grade form builder for creators and teams.
                </p>
              </div>

              {(
                [
                {
                  title: "Product",
                  items: [
                    { kind: "scroll", label: "Features", id: "features" },
                    { kind: "scroll", label: "Pricing", id: "pricing" },
                    { kind: "route", label: "Explore", to: "/explore" },
                  ],
                },
                {
                  title: "Resources",
                  items: [
                    { kind: "href", label: "Docs", href: "http://localhost:8000/docs" },
                    { kind: "href", label: "OpenAPI JSON", href: "http://localhost:8000/openapi.json" },
                    { kind: "href", label: "API health", href: "http://localhost:8000/health" },
                  ],
                },
                {
                  title: "Company",
                  items: [
                    { kind: "route", label: "Sign In", to: "/signin" },
                    { kind: "route", label: "Get Started", to: "/signup" },
                    { kind: "route", label: "Dashboard", to: "/dashboard" },
                  ],
                },
              ] as const).map((col) => (
                <div key={col.title}>
                  <p className="text-xs font-semibold tracking-wide text-white/70">{col.title}</p>
                  <div className="mt-4 space-y-2 text-sm text-white/60">
                    {col.items.map((i) => (
                      <div key={i.label}>
                        {i.kind === "route" ? (
                          <Link to={i.to} className="hover:text-white">
                            {i.label}
                          </Link>
                        ) : i.kind === "href" ? (
                          <a href={i.href} target="_blank" rel="noreferrer" className="hover:text-white">
                            {i.label}
                          </a>
                        ) : (
                          <button type="button" onClick={() => scrollToHash(i.id)} className="hover:text-white">
                            {i.label}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
              <p>© {new Date().getFullYear()} ChaiForms. All rights reserved.</p>
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-2">
                  <Blocks className="h-3.5 w-3.5 text-indigo-200/80" />
                  tRPC + Drizzle
                </span>
                <span className="inline-flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-orange-200/80" />
                  Premium glass UI
                </span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
