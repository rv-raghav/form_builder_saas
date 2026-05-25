import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import {
  fetchExploreForms,
  getPublicErrorMessage,
  type ExploreForm,
} from "../../api/public";

const ACCENT = "#D97706";

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

export default function Explore() {
  const [forms, setForms] = useState<ExploreForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const results = await fetchExploreForms();
        if (!ignore) {
          setForms(results);
          setError(null);
        }
      } catch (e) {
        if (!ignore) setError(getPublicErrorMessage(e));
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div
      className="min-h-screen w-full bg-[#ededed] pb-24"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <PageMeta title="Explore Public Forms | LoomForm" description="Explore beautiful forms built by the LoomForm creator community." />

      {/* Google Fonts */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');`}</style>

      {/* Floating Navbar */}
      <div className="flex justify-center pt-4 sm:pt-6 px-3 sm:px-4">
        <div className="bg-white rounded-full shadow-sm border border-neutral-200 pl-2 pr-2 py-2 w-full max-w-[760px] relative flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="shrink-0 flex items-center gap-2 pl-2">
            <LogoMark className="w-7 h-7 sm:w-8 sm:h-8" />
            <span
              className="font-semibold text-neutral-900 hidden sm:inline"
              style={{ fontSize: 14 }}
            >
              LoomForm
            </span>
          </Link>

          {/* Center Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link to="/" className="text-neutral-600 hover:text-neutral-900 transition-colors font-medium">
              Home
            </Link>
            <Link to="/explore" className="flex items-center gap-1.5 text-neutral-900 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" style={{ marginTop: 1 }} />
              Explore
            </Link>
          </div>

          {/* Right CTA */}
          <div className="flex items-center gap-2">
            <Link
              to="/signin"
              className="hidden sm:inline text-neutral-600 hover:text-neutral-900 transition-colors mr-2"
              style={{ fontSize: 14 }}
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-full text-white px-4 py-2 text-sm font-medium"
              style={{ backgroundColor: ACCENT, fontSize: 14 }}
            >
              <span>Get started</span>
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-[880px] mx-auto px-4 pt-16 sm:pt-24">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div>
            <span
              className="font-semibold tracking-widest uppercase"
              style={{ fontSize: 11, color: ACCENT }}
            >
              Public Forms
            </span>
            <h1
              className="mt-3 text-neutral-900"
              style={{
                fontSize: "clamp(32px, 6vw, 48px)",
                lineHeight: 1.1,
                fontWeight: 500,
                letterSpacing: "-0.02em",
              }}
            >
              Discover{" "}
              <span
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontStyle: "italic",
                  fontWeight: 400,
                }}
              >
                beautiful
              </span>{" "}
              public forms.
            </h1>
            <p className="mt-4 max-w-xl text-neutral-500 text-sm sm:text-base leading-relaxed">
              Explore forms created by our community. Unlisted forms remain private and only accessible via direct link.
            </p>
          </div>
          <Link
            to="/signup"
            className="shrink-0 inline-flex items-center gap-2 rounded-full text-white px-5 py-2.5 text-sm font-medium shadow-sm transition-transform hover:-translate-y-px"
            style={{ backgroundColor: ACCENT }}
          >
            Create your own form
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Content Section */}
        {loading && (
          <div className="flex justify-center py-24">
            <div
              className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent"
              style={{ borderColor: `${ACCENT} #d4d4d8 #d4d4d8 #d4d4d8` }}
            />
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && forms.length === 0 && (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
            <p className="text-neutral-500 text-sm">
              No public forms yet. Creators can publish a form with “public” visibility to list it here.
            </p>
          </div>
        )}

        {!loading && !error && forms.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {forms.map((form, idx) => (
              <motion.li
                key={form.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.45, delay: idx * 0.04 }}
              >
                <Link
                  to={`/f/${form.slug}`}
                  className="group block h-full bg-white rounded-2xl border border-neutral-200 p-5 hover:border-neutral-300 hover:shadow-sm transition-all"
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
              </motion.li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
