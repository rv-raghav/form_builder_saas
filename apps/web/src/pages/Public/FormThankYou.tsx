import { Link, useLocation, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";

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

export default function FormThankYou() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const title = (location.state as { title?: string } | null)?.title;

  return (
    <div
      className="min-h-screen w-full bg-[#ededed] pb-24"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
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
            <Link to="/explore" className="text-neutral-600 hover:text-neutral-900 transition-colors font-medium">
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

      <main className="max-w-[500px] mx-auto px-4 mt-20 sm:mt-32">
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-8 sm:p-10 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 text-xl font-semibold border border-emerald-100">
            ✓
          </div>
          <h1 className="mb-3 text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight leading-none">
            Thank you!
          </h1>
          <p className="text-neutral-500 text-sm sm:text-base leading-relaxed max-w-sm mx-auto">
            {title
              ? `Your response to “${title}” was submitted successfully.`
              : "Your response was submitted successfully."}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800 transition-all"
            >
              Back to Home
            </Link>
            {slug && (
              <Link
                to={`/f/${slug}`}
                className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-all"
              >
                Submit another
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
