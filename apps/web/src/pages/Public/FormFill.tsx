import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { ChevronRight } from "lucide-react";
import {
  fetchPublicForm,
  getPublicErrorCode,
  getPublicErrorMessage,
  getPublicValidationErrors,
  submitPublicForm,
  type PublicForm,
  type PublicFormField,
} from "../../api/public";

const ACCENT = "#D97706";
const DARK = "#0b0f1a";

const themeColors: Record<string, string> = {
  startup: "#3b82f6",     // blue
  anime: "#d946ef",       // fuchsia
  game: "#10b981",        // emerald
  gaming: "#10b981",      // emerald
  tech: "#06b6d4",        // cyan
  event: "#f97316",       // orange
  community: "#0ea5e9",   // sky
  movie: "#f59e0b",       // amber
  os: "#737373",          // neutral
  default: "#D97706",     // warm amber
};

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

function FieldInput({
  field,
  value,
  onChange,
  error,
}: {
  field: PublicFormField;
  value: unknown;
  onChange: (v: unknown) => void;
  error?: string;
}) {
  const base =
    "w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all text-neutral-800 border-neutral-200 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 bg-white";

  if (field.type === "long_text") {
    return (
      <textarea
        className={`${base} min-h-[100px] resize-y`}
        placeholder={field.placeholder ?? "Enter your response..."}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
      />
    );
  }

  if (field.type === "number") {
    return (
      <input
        type="number"
        className={base}
        placeholder={field.placeholder ?? "0"}
        value={value === "" || value === undefined ? "" : String(value)}
        onChange={(e) =>
          onChange(e.target.value === "" ? "" : Number(e.target.value))
        }
        aria-invalid={!!error}
      />
    );
  }

  if (field.type === "single_select") {
    return (
      <div className="relative">
        <select
          className={`${base} appearance-none pr-10`}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
        >
          <option value="">Choose an option...</option>
          {(field.options ?? []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-neutral-500">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    );
  }

  if (field.type === "multi_select") {
    const selected = Array.isArray(value) ? (value as string[]) : [];
    const toggle = (opt: string) => {
      if (selected.includes(opt)) {
        onChange(selected.filter((x) => x !== opt));
      } else {
        onChange([...selected, opt]);
      }
    };
    return (
      <div className="grid gap-2.5">
        {(field.options ?? []).map((opt) => {
          const isChecked = selected.includes(opt);
          return (
            <label
              key={opt}
              className={`flex items-center gap-3 text-sm text-neutral-700 border rounded-xl px-4 py-3 cursor-pointer transition-all ${
                isChecked
                  ? "bg-neutral-50 border-neutral-850"
                  : "bg-white border-neutral-200/60 hover:bg-neutral-50/50"
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggle(opt)}
                className="rounded text-neutral-900 focus:ring-neutral-900 w-4 h-4 accent-neutral-900 cursor-pointer"
              />
              <span className="font-medium text-neutral-800">{opt}</span>
            </label>
          );
        })}
      </div>
    );
  }

  return (
    <input
      type={field.type === "email" ? "email" : "text"}
      className={base}
      placeholder={field.placeholder ?? "Enter text..."}
      value={typeof value === "string" ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      aria-invalid={!!error}
    />
  );
}

export default function FormFill() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { showError } = useToast();
  const [form, setForm] = useState<PublicForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fatal, setFatal] = useState<{ message: string; code?: string } | null>(
    null,
  );
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [honeypot, setHoneypot] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!slug) return;
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchPublicForm(slug);
        if (!ignore) {
          setForm(data);
          setFatal(null);
        }
      } catch (e) {
        if (!ignore) {
          setFatal({
            message: getPublicErrorMessage(e),
            code: getPublicErrorCode(e),
          });
          setForm(null);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [slug]);

  const setAnswer = (id: string, v: unknown) => {
    setAnswers((prev) => ({ ...prev, [id]: v }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || !form) return;
    setSubmitting(true);
    setFieldErrors({});
    try {
      await submitPublicForm(slug, { answers, website: honeypot });
      navigate(`/f/${slug}/thank-you`, {
        replace: true,
        state: { title: form.title },
      });
    } catch (err) {
      const ve = getPublicValidationErrors(err);
      if (ve) {
        const flat: Record<string, string> = {};
        for (const [k, msgs] of Object.entries(ve)) {
          flat[k] = msgs[0] ?? "Invalid";
        }
        setFieldErrors(flat);
      } else {
        showError(getPublicErrorMessage(err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const themeColor = form ? themeColors[form.theme] ?? themeColors.default : themeColors.default;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#ededed]">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent"
          style={{ borderColor: `${ACCENT} #d4d4d8 #d4d4d8 #d4d4d8` }}
        />
      </div>
    );
  }

  if (fatal || !form) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#ededed] px-4" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="max-w-md text-center bg-white border border-neutral-200 rounded-3xl p-8 shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500 font-semibold text-lg border border-red-100">
            !
          </div>
          <h1 className="mb-2 text-xl font-bold text-neutral-900">Form unavailable</h1>
          <p className="text-neutral-500 text-sm leading-relaxed">{fatal?.message}</p>
          {fatal?.code === "not_published" && (
            <p className="mt-2 text-xs text-neutral-400">
              The creator may still be editing this form.
            </p>
          )}
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

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

      <main className="max-w-[560px] mx-auto px-4 mt-16 sm:mt-24">
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
          {/* Top accent bar representing form theme */}
          <div className="h-1.5 w-full" style={{ backgroundColor: themeColor }} />

          <div className="p-6 sm:p-10">
            {/* Category Indicator */}
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: themeColor }} />
              <span
                className="uppercase tracking-widest text-neutral-400 font-semibold"
                style={{ fontSize: 10 }}
              >
                {form.theme} Form
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight leading-tight">
              {form.title}
            </h1>
            {form.description && (
              <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
                {form.description}
              </p>
            )}

            <hr className="my-6 border-neutral-100" />

            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="absolute left-[-9999px] h-0 w-0 opacity-0"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
              />

              {form.fields.map((field) => (
                <div key={field.id} className="flex flex-col">
                  <label className="text-xs font-semibold text-neutral-600 tracking-wide mb-2 block">
                    {field.label}
                    {field.required && <span className="text-amber-600 font-semibold ml-0.5">*</span>}
                  </label>
                  <FieldInput
                    field={field}
                    value={answers[field.id]}
                    onChange={(v) => setAnswer(field.id, v)}
                    error={fieldErrors[field.id]}
                  />
                  {fieldErrors[field.id] && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">{fieldErrors[field.id]}</p>
                  )}
                </div>
              ))}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-all hover:bg-neutral-800 active:scale-[0.995] disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: DARK }}
              >
                {submitting ? "Submitting response..." : "Submit Response"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
