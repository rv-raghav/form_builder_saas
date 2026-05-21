import { useCallback, useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";
import { Activity, BarChart3, Clock3, Eye } from "lucide-react";

import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import { Modal } from "../../components/ui/modal";
import {
  fetchForms,
  fetchFormAnalytics,
  fetchFormResponses,
  fetchFormResponse,
  getErrorMessage,
  type FormListItem,
  type FormAnalyticsSummary,
  type FormResponseListItem,
  type FormResponseDetail,
} from "../../api/forms";
import { useToast } from "../../context/ToastContext";

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return "—";
  if (Array.isArray(val)) return val.join(", ");
  if (typeof val === "object") return JSON.stringify(val);
  return String(val);
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString();
}

export default function Submissions() {
  const { showError } = useToast();
  const [forms, setForms] = useState<FormListItem[]>([]);
  const [formId, setFormId] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<FormAnalyticsSummary | null>(null);
  const [rows, setRows] = useState<FormResponseListItem[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [loadingForms, setLoadingForms] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detail, setDetail] = useState<FormResponseDetail | null>(null);

  const loadForms = useCallback(async () => {
    try {
      setLoadingForms(true);
      const data = await fetchForms({ page_size: 100 });
      setForms(data.results);
      setFormId((prev) =>
        prev && data.results.some((f) => f.id === prev) ? prev : data.results[0]?.id ?? null,
      );
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setLoadingForms(false);
    }
  }, [showError]);

  const loadResponsesData = useCallback(async () => {
    if (!formId) {
      setAnalytics(null);
      setRows([]);
      setRowCount(0);
      return;
    }
    try {
      setLoadingData(true);
      const [sum, list] = await Promise.all([
        fetchFormAnalytics(formId),
        fetchFormResponses(formId, { page: 1, page_size: 50 }),
      ]);
      setAnalytics(sum);
      setRows(list.results);
      setRowCount(list.count);
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setLoadingData(false);
    }
  }, [formId, showError]);

  useEffect(() => {
    void loadForms();
  }, [loadForms]);

  useEffect(() => {
    setDetailId(null);
    setDetail(null);
  }, [formId]);

  useEffect(() => {
    void loadResponsesData();
  }, [loadResponsesData]);

  useEffect(() => {
    if (!detailId || !formId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    void fetchFormResponse(formId, detailId).then((d) => {
      if (!cancelled) setDetail(d);
    }).catch((err: unknown) => {
      showError(getErrorMessage(err));
      setDetailId(null);
    });
    return () => {
      cancelled = true;
    };
  }, [detailId, formId, showError]);

  const chartOptions = useMemo(() => {
    const data = analytics?.by_day ?? [];
    const isDark =
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark");

    return {
      chart: {
        type: "area" as const,
        toolbar: { show: false },
        fontFamily: "inherit",
        foreColor: isDark ? "#9ca3af" : "#6b7280",
      },
      colors: ["#6366F1"],
      dataLabels: { enabled: false },
      stroke: { curve: "smooth" as const, width: 2 },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.05,
        },
      },
      grid: {
        borderColor: isDark ? "#1f2937" : "#e5e7eb",
      },
      xaxis: {
        categories: data.map((d) => d.date.slice(5)),
        labels: { rotate: -45 },
      },
      yaxis: { min: 0, decimalsInFloat: 0 },
      tooltip: { theme: isDark ? "dark" : "light" },
    };
  }, [analytics]);

  const chartSeries = useMemo(
    () => [
      {
        name: "Submissions",
        data: analytics?.by_day?.map((d) => d.count) ?? [],
      },
    ],
    [analytics],
  );

  const selectedTitle = forms.find((f) => f.id === formId)?.title ?? "Form";

  return (
    <>
      <PageMeta title="Submissions | ChaiForms" description="Responses and analytics" />
      <PageBreadcrumb pageTitle="Submissions" />

      <div className="relative overflow-hidden rounded-3xl border border-gray-200/70 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-[#0B1020]/65">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 left-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/20" />
          <div className="absolute right-0 top-20 h-64 w-64 rounded-full bg-orange-400/10 blur-3xl dark:bg-orange-400/15" />
        </div>

        <div className="relative flex flex-col gap-4 border-b border-gray-200/70 p-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <BarChart3 className="h-4 w-4 text-indigo-500 dark:text-indigo-300" />
              Responses
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Pick a form to inspect submissions and analytics.
            </p>
          </div>
          <select
            value={formId ?? ""}
            onChange={(e) => setFormId(e.target.value || null)}
            disabled={loadingForms || forms.length === 0}
            className="max-w-xs rounded-xl border border-gray-300/80 bg-white/90 px-3 py-2 text-sm text-gray-800 shadow-sm dark:border-white/15 dark:bg-white/5 dark:text-white"
          >
            {forms.length === 0 ? (
              <option value="">No forms yet</option>
            ) : (
              forms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.title} ({f.status})
                </option>
              ))
            )}
          </select>
        </div>

        {formId ? (
          <div className="relative space-y-6 p-5">
            {loadingData ? (
              <div className="rounded-2xl border border-gray-200/80 bg-white/70 px-4 py-8 text-center text-sm text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
                Loading analytics and responses...
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-indigo-200/70 bg-linear-to-br from-indigo-50 to-white p-4 dark:border-indigo-400/20 dark:from-indigo-500/10 dark:to-white/5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">
                      Total responses
                    </p>
                    <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                      {analytics?.total_responses ?? 0}
                    </p>
                    <p className="mt-2 inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-200">
                      <Activity className="h-3.5 w-3.5" />
                      live aggregate
                    </p>
                  </div>
                  <div className="rounded-2xl border border-orange-200/70 bg-linear-to-br from-orange-50 to-white p-4 dark:border-orange-300/20 dark:from-orange-500/10 dark:to-white/5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-300">
                      Showing
                    </p>
                    <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
                      {rows.length}
                      <span className="text-base font-normal text-gray-500">
                        {" "}
                        of {rowCount}
                      </span>
                    </p>
                    <p className="mt-2 inline-flex items-center gap-1 text-xs text-orange-600 dark:text-orange-200">
                      <Eye className="h-3.5 w-3.5" />
                      current page
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200/70 bg-white/65 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-white">
                    <BarChart3 className="h-4 w-4 text-indigo-500 dark:text-indigo-300" />
                    Last 14 days (UTC)
                  </h3>
                  {analytics && analytics.by_day.length > 0 ? (
                    <Chart
                      options={chartOptions}
                      series={chartSeries}
                      type="area"
                      height={280}
                    />
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No data yet.</p>
                  )}
                </div>

                <div className="overflow-x-auto rounded-2xl border border-gray-200/70 bg-white/70 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                  <table className="min-w-full divide-y divide-gray-200/80 dark:divide-white/10">
                    <thead className="bg-gray-100/70 dark:bg-white/5">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                          Submitted
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                          Preview
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100/80 dark:divide-white/10">
                      {rows.length === 0 ? (
                        <tr>
                          <td colSpan={2} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-300">
                            No submissions yet for this form.
                          </td>
                        </tr>
                      ) : (
                        rows.map((r) => (
                          <tr
                            key={r.id}
                            className="cursor-pointer transition hover:bg-indigo-50/70 dark:hover:bg-indigo-400/10"
                            onClick={() => setDetailId(r.id)}
                          >
                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                              <span className="inline-flex items-center gap-1.5">
                                <Clock3 className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                                {formatDateTime(r.submitted_at)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                              <span className="line-clamp-1">{r.preview}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="p-10 text-center text-gray-600 dark:text-gray-300">
            Create a form first to collect responses.
          </div>
        )}
      </div>

      <Modal
        isOpen={detailId !== null}
        onClose={() => {
          setDetailId(null);
          setDetail(null);
        }}
        className="m-4 max-w-lg rounded-3xl border border-gray-200/80 bg-white/95 p-6 shadow-2xl dark:border-white/10 dark:bg-[#111827]/95"
      >
        {detail ? (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Submission — {selectedTitle}
            </h3>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Clock3 className="h-3.5 w-3.5" />
              {formatDateTime(detail.submitted_at)}
            </p>
            <ul className="mt-4 space-y-3 border-t border-gray-100 pt-4 dark:border-white/10">
              {detail.answers.map((a) => (
                <li key={a.field_id} className="rounded-xl border border-gray-200/70 bg-gray-50/70 p-3 dark:border-white/10 dark:bg-white/5">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {a.label}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {formatValue(a.value)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : detailId !== null ? (
          <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-300">Loading submission…</div>
        ) : null}
      </Modal>
    </>
  );
}
