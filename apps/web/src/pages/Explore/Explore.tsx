import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Compass, Sparkles } from "lucide-react";
import PageMeta from "../../components/common/PageMeta";
import {
  fetchExploreForms,
  getPublicErrorMessage,
  type ExploreForm,
} from "../../api/public";

const themeDot: Record<string, string> = {
  default: "bg-slate-400",
  movie: "bg-amber-500",
  anime: "bg-fuchsia-500",
  game: "bg-emerald-500",
  startup: "bg-blue-500",
  tech: "bg-cyan-500",
  os: "bg-neutral-500",
  event: "bg-orange-500",
  community: "bg-sky-500",
};

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
    <div className="min-h-screen bg-[#0B1020] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="absolute left-0 top-20 h-80 w-80 rounded-full bg-orange-400/12 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/8 bg-[#0B1020]/65 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-400/80 to-orange-300/70" />
            <span className="text-sm font-semibold">ChaiForms</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/pricing" className="text-gray-300 transition hover:text-white">
              Pricing
            </Link>
            <Link to="/signin" className="text-gray-300 transition hover:text-white">
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <PageMeta title="Explore | ChaiForms" description="Public forms" />

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-10">
        <div className="rounded-3xl border border-white/10 bg-white/4 p-6 backdrop-blur-xl sm:p-8">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs font-semibold text-white/75">
                <Sparkles className="h-3.5 w-3.5 text-orange-200/90" />
                Curated public forms
              </p>
              <h1 className="mt-4 flex items-center gap-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                <Compass className="h-7 w-7 text-indigo-300" />
                Explore public forms
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-300 sm:text-base">
                Published forms with public visibility. Unlisted forms only work via direct link.
              </p>
            </div>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-linear-to-r from-indigo-500/90 to-orange-400/85 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_18px_60px_-28px_rgba(99,102,241,0.8)] transition hover:-translate-y-px"
            >
              Create your form
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {loading && (
            <div className="flex justify-center py-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-400 border-t-transparent" />
            </div>
          )}

          {error && (
            <p className="rounded-xl border border-red-900/40 bg-red-950/35 px-4 py-3 text-red-200">
              {error}
            </p>
          )}

          {!loading && !error && forms.length === 0 && (
            <p className="rounded-xl border border-white/10 bg-white/3 px-4 py-8 text-center text-gray-300">
              No public forms yet. Creators can publish a form with “public” visibility to list it here.
            </p>
          )}

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {forms.map((f, idx) => (
              <motion.li
                key={f.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20%" }}
                transition={{ duration: 0.45, delay: idx * 0.04 }}
              >
                <Link
                  to={`/f/${f.slug}`}
                  className="group block h-full rounded-2xl border border-white/10 bg-white/4 p-5 backdrop-blur-xl transition hover:-translate-y-px hover:border-indigo-300/35 hover:bg-white/7"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${themeDot[f.theme] ?? themeDot.default}`}
                      />
                      <span className="text-xs uppercase tracking-wide text-gray-400">
                        {f.theme}
                      </span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-gray-500 transition group-hover:text-indigo-300" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">{f.title}</h2>
                  {f.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-gray-300">
                      {f.description}
                    </p>
                  )}
                  <p className="mt-4 rounded-lg border border-white/10 bg-white/3 px-2 py-1 font-mono text-xs text-gray-400">
                    /f/{f.slug}
                  </p>
                  <p className="mt-2 text-xs text-gray-400">{f.field_count} fields</p>
                </Link>
              </motion.li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
