import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import {
  fetchExploreForms,
  type ExploreForm,
} from "../../api/public";

/* ───────────────── Constants ───────────────── */
const ACCENT = "#D97706";
const DARK = "#0b0f1a";

/* ───────────────── Gauge (reusable) ───────────────── */
function Gauge({
  value,
  color = ACCENT,
  showLabels = false,
  min,
  max,
}: {
  value: number;
  color?: string;
  showLabels?: boolean;
  min?: string;
  max?: string;
}) {
  const total = 40;
  const active = Math.round((value / 100) * total);
  const r = 80;

  return (
    <div>
      <svg viewBox="0 0 200 120" className="mx-auto" style={{ maxWidth: 260 }}>
        {Array.from({ length: total }, (_, i) => {
          const angle = Math.PI + (i / (total - 1)) * Math.PI;
          const x1 = 100 + (r - 10) * Math.cos(angle);
          const y1 = 100 + (r - 10) * Math.sin(angle);
          const x2 = 100 + r * Math.cos(angle);
          const y2 = 100 + r * Math.sin(angle);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={i < active ? color : "#d4d4d8"}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          );
        })}
        <text
          x={100}
          y={105}
          textAnchor="middle"
          fontSize={22}
          fontWeight={600}
          fill={DARK}
        >
          {value}%
        </text>
      </svg>
      {showLabels && min && max && (
        <div
          className="flex justify-between px-2 text-neutral-500"
          style={{ fontSize: 11 }}
        >
          <span>{min}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}

/* ───────────────── Logo SVG (modern woven loom) ───────────────── */
function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      stroke={ACCENT}
      strokeWidth={3}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1={10} y1={6} x2={10} y2={26} />
      <line x1={16} y1={6} x2={16} y2={26} />
      <line x1={22} y1={6} x2={22} y2={26} />
      
      <line x1={6} y1={10} x2={26} y2={10} />
      <line x1={6} y1={16} x2={26} y2={16} />
      <line x1={6} y1={22} x2={26} y2={22} />
    </svg>
  );
}

/* ───────────────── Main Component ───────────────── */
export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [publicForms, setPublicForms] = useState<ExploreForm[]>([]);
  const [formsLoading, setFormsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const results = await fetchExploreForms();
        if (!ignore) setPublicForms(results.slice(0, 6));
      } catch {
        // silently fail on landing page — not critical
      } finally {
        if (!ignore) setFormsLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, []);

  return (
    <div
      className="min-h-screen w-full bg-[#ededed]"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <PageMeta
        title="LoomForm — Beautiful Form Experiences"
        description="Create stunning Typeform-style forms, publish instantly, and analyze responses from a premium creator dashboard."
      />

      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');`}</style>

      {/* ──────────── HERO SECTION (Full viewport, rounded, clipped) ──────────── */}
      <div className="p-3 sm:p-4">
        <div className="relative w-full overflow-hidden bg-[#d9d9d9] rounded-2xl sm:rounded-3xl" style={{ height: "calc(100vh - 32px)" }}>
          {/* Background Video */}
          <video
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster="https://images.unsplash.com/photo-1557683316-973673baf926?w=1600&q=60"
          >
            <source
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260424_064411_9e9d7f84-9277-41f4-ab10-59172d89e6be.mp4"
              type="video/mp4"
            />
          </video>

          {/* Overlay */}
          <div className="absolute inset-0 bg-white/10" />

          {/* Foreground */}
          <div className="relative z-10">
            {/* ──── Navbar ──── */}
            <div className="flex justify-center pt-4 sm:pt-6 px-3 sm:px-4">
              <div className="bg-white rounded-full shadow-sm border border-neutral-200 pl-2 pr-2 py-2 w-full max-w-[760px] relative flex items-center">
                {/* Logo */}
                <div className="shrink-0 flex items-center gap-2 pl-1">
                  <LogoMark className="w-7 h-7 sm:w-8 sm:h-8" />
                  <span
                    className="font-semibold text-neutral-900 hidden sm:inline"
                    style={{ fontSize: 14 }}
                  >
                    LoomForm
                  </span>
                </div>

                {/* Desktop Links */}
                <div
                  className="hidden md:flex items-center gap-6 mx-auto"
                  style={{ fontSize: 14 }}
                >
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-neutral-900 font-medium"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-neutral-900"
                      style={{ marginTop: 1 }}
                    />
                    Home
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById("builder");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-neutral-600 hover:text-neutral-900 transition-colors"
                  >
                    Features
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById("analytics");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="text-neutral-600 hover:text-neutral-900 transition-colors"
                  >
                    Analytics
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById("pricing");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="flex items-center gap-0.5 font-medium transition-colors"
                    style={{ color: ACCENT }}
                  >
                    Templates
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Right cluster */}
                <div className="ml-auto flex items-center gap-2">
                  <Link
                    to="/signin"
                    className="hidden md:inline text-neutral-600 hover:text-neutral-900 transition-colors mr-2"
                    style={{ fontSize: 14 }}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-2 rounded-full text-white px-4 py-2 text-sm font-medium"
                    style={{ backgroundColor: ACCENT, fontSize: 14 }}
                  >
                    <span className="hidden sm:inline">Get started</span>
                    <span className="sm:hidden">Start</span>
                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </Link>

                  {/* Mobile hamburger */}
                  <button
                    type="button"
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="md:hidden p-1.5 text-neutral-700"
                  >
                    {menuOpen ? (
                      <X className="w-5 h-5" />
                    ) : (
                      <Menu className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Mobile dropdown */}
                {menuOpen && (
                  <div className="absolute top-full left-2 right-2 mt-2 bg-white rounded-2xl shadow-lg border border-neutral-200 p-3 z-20 md:hidden">
                    {["Home", "Features", "Analytics", "Templates"].map(
                      (item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setMenuOpen(false)}
                          className="block w-full text-left px-3 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg"
                        >
                          {item}
                        </button>
                      )
                    )}
                    <Link
                      to="/explore"
                      onClick={() => setMenuOpen(false)}
                      className="block w-full text-left px-3 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 rounded-lg"
                    >
                      Explore
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* ──── Hero Content ──── */}
            <div className="flex flex-col items-center px-4 pt-10 sm:pt-16 pb-8 sm:pb-12 text-center">
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-1.5 shadow-sm"
                style={{ fontSize: 13 }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: ACCENT }}
                />
                <span className="font-medium text-neutral-800">LoomForm</span>
              </div>

              {/* Headline */}
              <h1
                className="mt-5 sm:mt-6 max-w-4xl text-neutral-900"
                style={{
                  fontSize: "clamp(36px, 8vw, 72px)",
                  lineHeight: 1.05,
                  fontWeight: 500,
                  letterSpacing: "-0.02em",
                }}
              >
                Crafting{" "}
                <span
                  style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontStyle: "italic",
                    fontWeight: 400,
                  }}
                >
                  Beautiful
                </span>
                <br />
                Form Experiences
              </h1>

              {/* Subtitle */}
              <p
                className="mt-4 sm:mt-6 text-neutral-600 px-2 max-w-lg"
                style={{ fontSize: "clamp(13px, 3.5vw, 16px)" }}
              >
                The All-In-One Platform for Building Stunning Forms, Collecting
                Responses, and Analyzing Engagement
              </p>

              {/* CTA */}
              <Link
                to="/signup"
                className="mt-6 sm:mt-8 inline-flex items-center gap-3 text-white rounded-full pl-6 sm:pl-7 pr-2 py-2 sm:py-2.5"
                style={{ backgroundColor: DARK, fontSize: 14 }}
              >
                Start Building
                <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/15 flex items-center justify-center">
                  <ChevronRight className="w-4 h-4" />
                </span>
              </Link>
            </div>

            {/* ──── Dashboard Preview (bleeds off the bottom) ──── */}
            <div className="px-3 sm:px-4">
              <div className="bg-[#f5f2ee] rounded-3xl p-4 sm:p-6 w-full max-w-[880px] mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {/* Card 1 — Responses */}
                  <div className="bg-white rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span style={{ color: ACCENT, fontSize: 13 }} className="font-semibold">
                        Responses
                      </span>
                      <span className="text-neutral-400" style={{ fontSize: 13 }}>
                        This Month
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-neutral-900" style={{ fontSize: 28 }}>
                        1,284
                      </span>
                      <span
                        className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 rounded-full px-2 py-0.5"
                        style={{ fontSize: 11 }}
                      >
                        <TrendingUp className="w-3 h-3" />
                        +342 (12%)
                      </span>
                    </div>
                    <p className="text-neutral-400 mb-4" style={{ fontSize: 12 }}>
                      Compared to last month
                    </p>
                    <p className="text-center text-neutral-500 mb-2" style={{ fontSize: 12 }}>
                      Monthly Target achieved
                    </p>
                    <Gauge
                      value={78}
                      color={ACCENT}
                      showLabels
                      min="850"
                      max="1.5K"
                    />
                    <div className="mt-3 bg-neutral-100 rounded-full p-1 flex">
                      <span className="flex-1 text-center bg-white rounded-full py-1.5 shadow-sm text-neutral-900 font-medium" style={{ fontSize: 12 }}>
                        Responses
                      </span>
                      <span className="flex-1 text-center py-1.5 text-neutral-500" style={{ fontSize: 12 }}>
                        Views
                      </span>
                    </div>
                  </div>

                  {/* Card 2 — Form Settings */}
                  <div className="bg-white rounded-2xl p-5 flex flex-col gap-3">
                    <div>
                      <label className="block text-neutral-700 mb-1" style={{ fontSize: 12 }}>
                        Show analytics for
                      </label>
                      <button
                        type="button"
                        className="w-full flex items-center justify-between border border-neutral-200 rounded-lg px-3 py-2 text-neutral-800 text-left"
                        style={{ fontSize: 13 }}
                      >
                        All Forms
                        <ChevronDown className="w-4 h-4 text-neutral-400" />
                      </button>
                    </div>
                    <div>
                      <label className="block text-neutral-700 mb-1" style={{ fontSize: 12 }}>
                        Filter period by
                      </label>
                      <button
                        type="button"
                        className="w-full flex items-center justify-between border border-neutral-200 rounded-lg px-3 py-2 text-neutral-800 text-left"
                        style={{ fontSize: 13 }}
                      >
                        Month-to-date (MTD)
                        <ChevronDown className="w-4 h-4 text-neutral-400" />
                      </button>
                    </div>
                    <div>
                      <label className="block text-neutral-700 mb-1" style={{ fontSize: 12 }}>
                        Response target (This month)
                      </label>
                      <div className="flex items-center border border-neutral-200 rounded-lg px-3 py-2">
                        <span className="text-neutral-400 mr-1" style={{ fontSize: 13 }}>#</span>
                        <span className="text-neutral-800" style={{ fontSize: 13 }}>500</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-neutral-700 mb-1" style={{ fontSize: 12 }}>
                        Response target (This year)
                      </label>
                      <div className="flex items-center border border-neutral-200 rounded-lg px-3 py-2">
                        <span className="text-neutral-400 mr-1" style={{ fontSize: 13 }}>#</span>
                        <span className="text-neutral-800" style={{ fontSize: 13 }}>5,000</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-auto pt-2">
                      <button
                        type="button"
                        className="text-white rounded-lg px-5 py-2 font-medium"
                        style={{ backgroundColor: ACCENT, fontSize: 13 }}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="text-neutral-600 underline"
                        style={{ fontSize: 13 }}
                      >
                        Cancel
                      </button>
                      <button type="button" className="ml-auto text-neutral-400">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Card 3 — Completion Rate */}
                  <div className="bg-white rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span style={{ color: ACCENT, fontSize: 13 }} className="font-semibold">
                        Completion
                      </span>
                      <span className="text-neutral-400" style={{ fontSize: 13 }}>
                        Today
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-neutral-900" style={{ fontSize: 28 }}>
                        74%
                      </span>
                      <span
                        className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-500 rounded-full px-2 py-0.5"
                        style={{ fontSize: 11 }}
                      >
                        <TrendingUp className="w-3 h-3" />
                        +3.2%
                      </span>
                    </div>
                    <p className="text-neutral-400 mb-4" style={{ fontSize: 12 }}>
                      Compared to yesterday
                    </p>
                    <Gauge value={74} color="#9ca3af" />
                    <div className="mt-3 bg-neutral-100 rounded-full p-1 flex">
                      <span className="flex-1 text-center bg-white rounded-full py-1.5 shadow-sm text-neutral-900 font-medium" style={{ fontSize: 12 }}>
                        Completion
                      </span>
                      <span className="flex-1 text-center py-1.5 text-neutral-500" style={{ fontSize: 12 }}>
                        Drop-off
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ──────────── PAGE SECTIONS (below the hero, same warm palette) ──────────── */}

      {/* Social Proof */}
      <section className="px-3 sm:px-4 pt-16 sm:pt-24">
        <div className="max-w-[880px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-neutral-300 pb-8">
          <span
            className="text-neutral-500 font-medium tracking-widest uppercase"
            style={{ fontSize: 11 }}
          >
            Trusted by design-led teams
          </span>
          <div className="flex items-center gap-8 sm:gap-12 opacity-35">
            {["BuildStack", "OpenForge", "DevLaunch", "ByteLabs"].map(
              (brand) => (
                <span
                  key={brand}
                  className="font-bold tracking-wider uppercase text-neutral-900"
                  style={{ fontSize: 11 }}
                >
                  {brand}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* Explore Public Forms */}
      {!formsLoading && publicForms.length > 0 && (
        <section className="px-3 sm:px-4 pt-20 sm:pt-32">
          <div className="max-w-[880px] mx-auto">
            <div className="flex items-end justify-between mb-10 sm:mb-12">
              <div>
                <span
                  className="font-semibold tracking-widest uppercase"
                  style={{ fontSize: 11, color: ACCENT }}
                >
                  Public Forms
                </span>
                <h2
                  className="mt-3 text-neutral-900"
                  style={{
                    fontSize: "clamp(26px, 4.5vw, 40px)",
                    lineHeight: 1.1,
                    fontWeight: 500,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Explore what{" "}
                  <span
                    style={{
                      fontFamily: "'Instrument Serif', serif",
                      fontStyle: "italic",
                      fontWeight: 400,
                    }}
                  >
                    creators
                  </span>{" "}
                  are building.
                </h2>
              </div>
              <Link
                to="/explore"
                className="hidden sm:inline-flex items-center gap-1.5 text-neutral-500 hover:text-neutral-900 transition-colors font-medium"
                style={{ fontSize: 13 }}
              >
                View all
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {publicForms.map((form) => (
                <Link
                  key={form.id}
                  to={`/f/${form.slug}`}
                  className="group block bg-white rounded-2xl border border-neutral-200 p-5 hover:border-neutral-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            form.theme === "startup" ? "#3b82f6"
                            : form.theme === "anime" ? "#d946ef"
                            : form.theme === "game" || form.theme === "gaming" ? "#10b981"
                            : form.theme === "tech" ? "#06b6d4"
                            : form.theme === "event" ? "#f97316"
                            : form.theme === "community" ? "#0ea5e9"
                            : form.theme === "movie" ? "#f59e0b"
                            : "#9ca3af",
                        }}
                      />
                      <span
                        className="uppercase tracking-wider text-neutral-400 font-medium"
                        style={{ fontSize: 10 }}
                      >
                        {form.theme}
                      </span>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-neutral-600 transition-colors" />
                  </div>
                  <h3 className="font-semibold text-neutral-900" style={{ fontSize: 15 }}>
                    {form.title}
                  </h3>
                  {form.description && (
                    <p className="mt-1 text-neutral-500 line-clamp-2" style={{ fontSize: 12 }}>
                      {form.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className="bg-neutral-50 border border-neutral-100 rounded-md px-2 py-1 font-mono text-neutral-400"
                      style={{ fontSize: 10 }}
                    >
                      /f/{form.slug}
                    </span>
                    <span className="text-neutral-400" style={{ fontSize: 11 }}>
                      {form.field_count} fields
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-6 text-center sm:hidden">
              <Link
                to="/explore"
                className="inline-flex items-center gap-1.5 text-neutral-500 hover:text-neutral-900 transition-colors font-medium"
                style={{ fontSize: 13 }}
              >
                View all forms
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Builder Showcase */}
      <section id="builder" className="px-3 sm:px-4 pt-20 sm:pt-32 scroll-mt-20">
        <div className="max-w-[880px] mx-auto text-center mb-12 sm:mb-16">
          <span
            className="font-semibold tracking-widest uppercase"
            style={{ fontSize: 11, color: ACCENT }}
          >
            The Workspace
          </span>
          <h2
            className="mt-4 text-neutral-900 max-w-2xl mx-auto"
            style={{
              fontSize: "clamp(28px, 5vw, 44px)",
              lineHeight: 1.1,
              fontWeight: 500,
              letterSpacing: "-0.02em",
            }}
          >
            A builder designed for{" "}
            <span
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: "italic",
                fontWeight: 400,
              }}
            >
              visual
            </span>{" "}
            storytelling.
          </h2>
          <p
            className="mt-4 text-neutral-500 max-w-md mx-auto"
            style={{ fontSize: "clamp(13px, 3vw, 15px)" }}
          >
            Drag fields, preview in real time, and publish with one click. 
            Everything feels fast, minimal, and intentional.
          </p>
        </div>

        {/* Large builder preview (Apple marketing style) */}
        <div className="max-w-[880px] mx-auto rounded-2xl sm:rounded-3xl bg-[#d9d9d9] p-3 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-8">
            {/* Browser chrome */}
            <div className="flex items-center gap-1.5 pb-4 border-b border-neutral-100 mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-200" />
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-200" />
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-200" />
              <span className="ml-4 text-neutral-400 font-mono" style={{ fontSize: 11 }}>
                loomform.app / workspace / new-form
              </span>
            </div>

            <div className="grid gap-8 md:grid-cols-12">
              {/* Left: field controls */}
              <div className="md:col-span-5 space-y-4">
                <h3 className="font-semibold text-neutral-900" style={{ fontSize: 16 }}>
                  Form Fields
                </h3>
                <div className="space-y-2">
                  {[
                    { label: "Full Name", type: "Short text", active: true },
                    { label: "Email Address", type: "Email validated" },
                    { label: "Feedback Notes", type: "Long text" },
                    { label: "Attendance", type: "Single select" },
                  ].map((f) => (
                    <div
                      key={f.label}
                      className="flex items-center justify-between rounded-xl px-4 py-3 border transition-colors"
                      style={{
                        borderColor: f.active ? ACCENT : "#e5e5e5",
                        backgroundColor: f.active
                          ? `${ACCENT}08`
                          : "transparent",
                      }}
                    >
                      <div>
                        <p className="text-sm font-medium text-neutral-900">
                          {f.label}
                        </p>
                        <p className="text-neutral-500" style={{ fontSize: 11 }}>
                          {f.type}
                        </p>
                      </div>
                      <span
                        className="font-mono"
                        style={{
                          fontSize: 10,
                          color: f.active ? ACCENT : "#a3a3a3",
                        }}
                      >
                        {f.active ? "editing" : "ready"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: form preview */}
              <div className="md:col-span-7">
                <div className="rounded-2xl bg-[#fafaf9] border border-neutral-100 p-6 space-y-5">
                  <div>
                    <h4 className="font-semibold text-neutral-900" style={{ fontSize: 18 }}>
                      Community Meetup RSVP
                    </h4>
                    <p className="text-neutral-500 mt-1" style={{ fontSize: 13 }}>
                      Let us know if you are attending the spring event.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-neutral-600 mb-1.5" style={{ fontSize: 12 }}>
                        Full Name
                      </label>
                      <div className="h-10 bg-white border border-neutral-200 rounded-lg px-3 flex items-center text-neutral-400" style={{ fontSize: 13 }}>
                        e.g., Sarah Jenkins
                      </div>
                    </div>
                    <div>
                      <label className="block text-neutral-600 mb-1.5" style={{ fontSize: 12 }}>
                        Email Address
                      </label>
                      <div className="h-10 bg-white border border-neutral-200 rounded-lg px-3 flex items-center text-neutral-400" style={{ fontSize: 13 }}>
                        e.g., sarah@design.io
                      </div>
                    </div>
                    <div>
                      <label className="block text-neutral-600 mb-1.5" style={{ fontSize: 12 }}>
                        Attendance
                      </label>
                      <div className="flex gap-2">
                        {["Yes", "Maybe", "No"].map((opt, idx) => (
                          <span
                            key={opt}
                            className="rounded-full px-4 py-1.5 border font-medium"
                            style={{
                              fontSize: 12,
                              borderColor: idx === 0 ? ACCENT : "#e5e5e5",
                              backgroundColor: idx === 0 ? `${ACCENT}10` : "white",
                              color: idx === 0 ? ACCENT : "#737373",
                            }}
                          >
                            {opt}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="w-full text-white rounded-lg py-2.5 font-medium"
                    style={{ backgroundColor: DARK, fontSize: 14 }}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Showcase */}
      <section id="analytics" className="px-3 sm:px-4 pt-20 sm:pt-32 scroll-mt-20">
        <div className="max-w-[880px] mx-auto">
          <div className="grid gap-12 md:grid-cols-12 items-center">
            {/* Left copy */}
            <div className="md:col-span-5 space-y-5">
              <span
                className="font-semibold tracking-widest uppercase"
                style={{ fontSize: 11, color: ACCENT }}
              >
                Metrics
              </span>
              <h2
                className="text-neutral-900"
                style={{
                  fontSize: "clamp(26px, 4.5vw, 40px)",
                  lineHeight: 1.1,
                  fontWeight: 500,
                  letterSpacing: "-0.02em",
                }}
              >
                Quiet{" "}
                <span
                  style={{
                    fontFamily: "'Instrument Serif', serif",
                    fontStyle: "italic",
                    fontWeight: 400,
                  }}
                >
                  analytics.
                </span>
                <br />
                Clear visibility.
              </h2>
              <p className="text-neutral-500" style={{ fontSize: 14 }}>
                No chaotic dashboards. LoomForm presents clean trendlines 
                and a calm response feed — enough to act on, 
                nothing more.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-neutral-200">
                <div>
                  <p className="text-neutral-400 font-medium uppercase" style={{ fontSize: 10 }}>
                    Total responses
                  </p>
                  <p className="text-2xl font-semibold text-neutral-900 mt-1">
                    12.4k
                  </p>
                </div>
                <div>
                  <p className="text-neutral-400 font-medium uppercase" style={{ fontSize: 10 }}>
                    Completion rate
                  </p>
                  <p className="text-2xl font-semibold text-neutral-900 mt-1">
                    82.3%
                  </p>
                </div>
              </div>
            </div>

            {/* Right chart + feed */}
            <div className="md:col-span-7">
              <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                  <span className="font-semibold text-neutral-800" style={{ fontSize: 13 }}>
                    Completion Trends
                  </span>
                  <span className="text-neutral-400" style={{ fontSize: 11 }}>
                    7 days overview
                  </span>
                </div>

                {/* Chart */}
                <div className="h-28 flex items-end justify-between gap-3 pt-2">
                  {[35, 60, 45, 80, 55, 95, 72].map((val, idx) => (
                    <div
                      key={idx}
                      className="flex-1 bg-neutral-100 rounded-t-md relative overflow-hidden"
                      style={{ height: "100%" }}
                    >
                      <div
                        className="absolute bottom-0 left-0 right-0 rounded-t-md"
                        style={{
                          height: `${val}%`,
                          backgroundColor: `${ACCENT}30`,
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Day labels */}
                <div className="flex justify-between px-0.5">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (d) => (
                      <span
                        key={d}
                        className="flex-1 text-center text-neutral-400"
                        style={{ fontSize: 10 }}
                      >
                        {d}
                      </span>
                    )
                  )}
                </div>

                {/* Feed */}
                <div className="pt-3 border-t border-neutral-100 space-y-2">
                  {[
                    {
                      user: "dev@buildstack.io",
                      detail: "rsvp — yes",
                      time: "2m ago",
                    },
                    {
                      user: "lead@openforge.dev",
                      detail: "feedback — positive",
                      time: "14m ago",
                    },
                  ].map((row, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between border border-neutral-100 rounded-xl px-3.5 py-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: ACCENT }}
                        />
                        <span
                          className="font-medium text-neutral-800"
                          style={{ fontSize: 12 }}
                        >
                          {row.user}
                        </span>
                        <span className="text-neutral-400" style={{ fontSize: 11 }}>
                          ({row.detail})
                        </span>
                      </div>
                      <span className="text-neutral-400" style={{ fontSize: 10 }}>
                        {row.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Theme Presets (poster-like) */}
      <section className="px-3 sm:px-4 pt-20 sm:pt-32">
        <div className="max-w-[880px] mx-auto text-center mb-12 sm:mb-16">
          <span
            className="font-semibold tracking-widest uppercase"
            style={{ fontSize: 11, color: ACCENT }}
          >
            Presets
          </span>
          <h2
            className="mt-4 text-neutral-900 max-w-2xl mx-auto"
            style={{
              fontSize: "clamp(28px, 5vw, 44px)",
              lineHeight: 1.1,
              fontWeight: 500,
              letterSpacing: "-0.02em",
            }}
          >
            Calibrated{" "}
            <span
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: "italic",
                fontWeight: 400,
              }}
            >
              theme
            </span>{" "}
            presets.
          </h2>
          <p
            className="mt-4 text-neutral-500 max-w-md mx-auto"
            style={{ fontSize: "clamp(13px, 3vw, 15px)" }}
          >
            No design experience required. Select a layout package and publish
            immediately.
          </p>
        </div>

        <div className="max-w-[880px] mx-auto grid gap-4 sm:gap-6 md:grid-cols-3">
          {[
            {
              title: "Startup Clean",
              desc: "Monochrome typography for SaaS teams.",
              bg: "#fafaf9",
              accent: "#0b0f1a",
              btn: "#0b0f1a",
            },
            {
              title: "Chai Warmth",
              desc: "Amber tones for community events.",
              bg: "#fffbeb",
              accent: ACCENT,
              btn: ACCENT,
            },
            {
              title: "Cyber Neon",
              desc: "High-contrast dark for gaming channels.",
              bg: "#0f172a",
              accent: "#22d3ee",
              btn: "#22d3ee",
            },
          ].map((theme, i) => (
            <div
              key={i}
              className="rounded-2xl sm:rounded-3xl overflow-hidden border border-neutral-200 flex flex-col"
              style={{ minHeight: 360 }}
            >
              {/* Theme label */}
              <div className="px-5 pt-5 pb-3 bg-white">
                <span
                  className="font-medium tracking-wider uppercase"
                  style={{ fontSize: 10, color: theme.accent }}
                >
                  Theme {i + 1}
                </span>
                <h3
                  className="text-neutral-900 font-semibold mt-1"
                  style={{ fontSize: 18 }}
                >
                  {theme.title}
                </h3>
                <p className="text-neutral-500 mt-1" style={{ fontSize: 12 }}>
                  {theme.desc}
                </p>
              </div>

              {/* Mini form mockup in theme colors */}
              <div
                className="flex-1 p-5"
                style={{ backgroundColor: theme.bg }}
              >
                <div className="space-y-3">
                  <div
                    className="h-2 w-20 rounded"
                    style={{
                      backgroundColor:
                        theme.bg === "#0f172a"
                          ? "rgba(255,255,255,0.2)"
                          : "rgba(0,0,0,0.08)",
                    }}
                  />
                  <div
                    className="h-9 rounded-lg border"
                    style={{
                      borderColor:
                        theme.bg === "#0f172a"
                          ? "rgba(255,255,255,0.1)"
                          : "rgba(0,0,0,0.06)",
                      backgroundColor:
                        theme.bg === "#0f172a"
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(255,255,255,0.7)",
                    }}
                  />
                  <div
                    className="h-9 rounded-lg border"
                    style={{
                      borderColor:
                        theme.bg === "#0f172a"
                          ? "rgba(255,255,255,0.1)"
                          : "rgba(0,0,0,0.06)",
                      backgroundColor:
                        theme.bg === "#0f172a"
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(255,255,255,0.7)",
                    }}
                  />
                  <div
                    className="h-9 rounded-lg flex items-center justify-center font-medium"
                    style={{
                      backgroundColor: theme.btn,
                      color:
                        theme.bg === "#0f172a" ? "#0f172a" : "#ffffff",
                      fontSize: 12,
                    }}
                  >
                    Submit
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-3 sm:px-4 pt-20 sm:pt-32 scroll-mt-20">
        <div className="max-w-[880px] mx-auto text-center mb-12 sm:mb-16">
          <span
            className="font-semibold tracking-widest uppercase"
            style={{ fontSize: 11, color: ACCENT }}
          >
            Pricing
          </span>
          <h2
            className="mt-4 text-neutral-900"
            style={{
              fontSize: "clamp(28px, 5vw, 44px)",
              lineHeight: 1.1,
              fontWeight: 500,
              letterSpacing: "-0.02em",
            }}
          >
            Sane{" "}
            <span
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: "italic",
                fontWeight: 400,
              }}
            >
              plans
            </span>{" "}
            for serious builders.
          </h2>
        </div>

        <div className="max-w-[880px] mx-auto grid gap-4 sm:gap-6 md:grid-cols-3">
          {[
            {
              name: "Free",
              price: "$0",
              desc: "For solo creators and test projects.",
              features: ["3 Active Forms", "100 Responses / Month", "Public Slugs"],
              highlight: false,
            },
            {
              name: "Pro",
              price: "$19",
              desc: "For active campaigns and teams.",
              features: [
                "Unlimited Forms",
                "10k Responses / Month",
                "Unlisted Slugs",
                "Theme Presets",
              ],
              highlight: true,
            },
            {
              name: "Team",
              price: "$49",
              desc: "For organizations with strict governance.",
              features: [
                "Everything in Pro",
                "Unlimited Responses",
                "Role-Based Access",
                "Priority Support",
              ],
              highlight: false,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border flex flex-col justify-between relative"
              style={{
                borderColor: plan.highlight ? ACCENT : "#e5e5e5",
                boxShadow: plan.highlight
                  ? `0 20px 50px ${ACCENT}15`
                  : "none",
                minHeight: 380,
              }}
            >
              {plan.highlight && (
                <span
                  className="absolute -top-3 right-5 text-white rounded-full px-3 py-1 font-semibold"
                  style={{ fontSize: 10, backgroundColor: ACCENT }}
                >
                  POPULAR
                </span>
              )}
              <div>
                <p
                  className="font-medium uppercase tracking-wider"
                  style={{
                    fontSize: 11,
                    color: plan.highlight ? ACCENT : "#737373",
                  }}
                >
                  {plan.name}
                </p>
                <div className="mt-3 flex items-baseline text-neutral-900">
                  <span className="font-bold" style={{ fontSize: 36 }}>
                    {plan.price}
                  </span>
                  <span className="text-neutral-400 ml-1" style={{ fontSize: 13 }}>
                    /month
                  </span>
                </div>
                <p className="text-neutral-500 mt-2" style={{ fontSize: 13 }}>
                  {plan.desc}
                </p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2.5 text-neutral-700"
                      style={{ fontSize: 13 }}
                    >
                      <span
                        className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: plan.highlight
                            ? `${ACCENT}15`
                            : "#f5f5f5",
                        }}
                      >
                        <svg
                          className="w-2.5 h-2.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke={plan.highlight ? ACCENT : "#a3a3a3"}
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  to="/signup"
                  className="block w-full text-center rounded-full py-2.5 font-medium"
                  style={{
                    fontSize: 13,
                    backgroundColor: plan.highlight ? DARK : "transparent",
                    color: plan.highlight ? "white" : "#525252",
                    border: plan.highlight ? "none" : "1px solid #e5e5e5",
                  }}
                >
                  {plan.name === "Team" ? "Contact Sales" : "Get Started"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-3 sm:px-4 pt-20 sm:pt-32">
        <div className="max-w-[880px] mx-auto rounded-2xl sm:rounded-3xl bg-[#d9d9d9] p-8 sm:p-16 text-center relative overflow-hidden">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full blur-[100px] pointer-events-none opacity-30"
            style={{ backgroundColor: ACCENT }}
          />
          <div className="relative z-10 max-w-lg mx-auto">
            <LogoMark className="w-10 h-10 mx-auto mb-6" />
            <h2
              className="text-neutral-900"
              style={{
                fontSize: "clamp(26px, 5vw, 40px)",
                lineHeight: 1.1,
                fontWeight: 500,
                letterSpacing: "-0.02em",
              }}
            >
              Building forms can feel{" "}
              <span
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontStyle: "italic",
                  fontWeight: 400,
                }}
              >
                premium.
              </span>
            </h2>
            <p
              className="mt-4 text-neutral-600 max-w-sm mx-auto"
              style={{ fontSize: "clamp(13px, 3vw, 15px)" }}
            >
              Experience the form editor built for design-led creators and
              teams.
            </p>
            <Link
              to="/signup"
              className="mt-8 inline-flex items-center gap-3 text-white rounded-full pl-6 sm:pl-7 pr-2 py-2 sm:py-2.5"
              style={{ backgroundColor: DARK, fontSize: 14 }}
            >
              Create Free Account
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/15 flex items-center justify-center">
                <ChevronRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-3 sm:px-4 pt-10 pb-8">
        <div className="max-w-[880px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-300 pt-6">
          <div className="flex items-center gap-2">
            <LogoMark className="w-5 h-5" />
            <span className="text-neutral-500" style={{ fontSize: 11 }}>
              © {new Date().getFullYear()} LoomForm. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-6">
            {[
              { label: "Features", id: "builder" },
              { label: "Pricing", id: "pricing" },
            ].map((l) => (
              <button
                key={l.label}
                type="button"
                onClick={() => {
                  const el = document.getElementById(l.id);
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-neutral-400 hover:text-neutral-700 transition-colors"
                style={{ fontSize: 11 }}
              >
                {l.label}
              </button>
            ))}
            <Link
              to="/explore"
              className="text-neutral-400 hover:text-neutral-700 transition-colors"
              style={{ fontSize: 11 }}
            >
              Explore
            </Link>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="text-neutral-400 hover:text-neutral-700 transition-colors"
              style={{ fontSize: 11 }}
            >
              Docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
