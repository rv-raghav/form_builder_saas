import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import {
  fetchPublicForm,
  getPublicErrorCode,
  getPublicErrorMessage,
  getPublicValidationErrors,
  submitPublicForm,
  type PublicForm,
  type PublicFormField,
} from "../../api/public";

const themeShell: Record<string, string> = {
  default: "bg-slate-50 text-slate-900",
  movie: "bg-zinc-950 text-amber-50",
  anime: "bg-fuchsia-950 text-white",
  game: "bg-emerald-950 text-white",
  startup: "bg-white text-slate-900",
  tech: "bg-slate-900 text-cyan-50",
  os: "bg-neutral-100 text-neutral-900",
  event: "bg-amber-50 text-amber-950",
  community: "bg-sky-50 text-sky-950",
};

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
    "w-full rounded-xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-500 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white";

  if (field.type === "long_text") {
    return (
      <textarea
        className={`${base} min-h-[100px]`}
        placeholder={field.placeholder ?? ""}
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
        placeholder={field.placeholder ?? ""}
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
      <select
        className={base}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
      >
        <option value="">Choose…</option>
        {(field.options ?? []).map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
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
      <div className="space-y-2">
        {(field.options ?? []).map((opt) => (
          <label key={opt} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => toggle(opt)}
            />
            {opt}
          </label>
        ))}
      </div>
    );
  }

  return (
    <input
      type={field.type === "email" ? "email" : "text"}
      className={base}
      placeholder={field.placeholder ?? ""}
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

  const t = form ? themeShell[form.theme] ?? themeShell.default : themeShell.default;

  if (loading) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${t}`}>
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (fatal || !form) {
    return (
      <div className={`flex min-h-screen flex-col items-center justify-center px-4 ${t}`}>
        <div className="max-w-md text-center">
          <h1 className="mb-2 text-xl font-semibold">Form unavailable</h1>
          <p className="text-gray-600 dark:text-gray-400">{fatal?.message}</p>
          {fatal?.code === "not_published" && (
            <p className="mt-2 text-sm text-gray-500">
              The creator may still be editing this form.
            </p>
          )}
          <Link
            to="/"
            className="mt-6 inline-block text-brand-600 hover:underline dark:text-brand-400"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${t}`}>
      <header className="border-b border-black/5 px-6 py-4 dark:border-white/10">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <span className="font-semibold text-brand-600 dark:text-brand-400">
            ChaiForms
          </span>
          <Link
            to="/explore"
            className="text-sm opacity-80 hover:opacity-100"
          >
            Explore
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-6 py-10">
        <h1 className="mb-2 text-2xl font-bold">{form.title}</h1>
        {form.description && (
          <p className="mb-8 text-sm opacity-80">{form.description}</p>
        )}

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
            <div key={field.id}>
              <label className="mb-1 block text-sm font-medium">
                {field.label}
                {field.required && <span className="text-red-500"> *</span>}
              </label>
              <FieldInput
                field={field}
                value={answers[field.id]}
                onChange={(v) => setAnswer(field.id, v)}
                error={fieldErrors[field.id]}
              />
              {fieldErrors[field.id] && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors[field.id]}</p>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-brand-500 py-3 font-medium text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {submitting ? "Submitting…" : "Submit"}
          </button>
        </form>
      </main>
    </div>
  );
}
