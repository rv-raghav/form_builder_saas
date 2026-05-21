import { Link, useLocation, useParams } from "react-router-dom";

export default function FormThankYou() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const title = (location.state as { title?: string } | null)?.title;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 dark:bg-gray-950">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl dark:bg-green-900/40">
          ✓
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
          Thank you
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {title
            ? `Your response to “${title}” was submitted successfully.`
            : "Your response was submitted successfully."}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-brand-600"
          >
            Home
          </Link>
          {slug && (
            <Link
              to={`/f/${slug}`}
              className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Submit another
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
