import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import Input from "../../components/form/input/InputField";
import {
  createForm,
  deleteForm,
  duplicateForm,
  fetchForms,
  getErrorMessage,
  type FormListItem,
} from "../../api/forms";
import { useToast } from "../../context/ToastContext";
import ConfirmModal from "../../components/common/ConfirmModal";

export default function FormsList() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [forms, setForms] = useState<FormListItem[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchForms({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setForms(data.results);
      setCount(data.count);
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, showError]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const handleCreate = async () => {
    try {
      const form = await createForm({
        title: "Untitled form",
        visibility: "unlisted",
        fields: [],
      });
      showSuccess("Form created");
      navigate(`/forms/${form.id}/edit`);
    } catch (err) {
      showError(getErrorMessage(err));
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateForm(id);
      showSuccess("Form duplicated");
      load();
    } catch (err) {
      showError(getErrorMessage(err));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteForm(deleteId);
      showSuccess("Form deleted");
      setDeleteId(null);
      load();
    } catch (err) {
      showError(getErrorMessage(err));
    }
  };

  return (
    <>
      <PageMeta title="Forms | LoomForm" description="Manage your forms" />
      <PageBreadcrumb pageTitle="Forms" />

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 border-b border-gray-200 p-5 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Your forms
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {count} form{count !== 1 ? "s" : ""} total
            </p>
          </div>
          <Button onClick={handleCreate}>+ New form</Button>
        </div>

        <div className="flex flex-wrap gap-3 p-5 border-b border-gray-100 dark:border-gray-800">
          <Input
            placeholder="Search by title or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          </div>
        ) : forms.length === 0 ? (
          <div className="py-16 text-center text-gray-500 dark:text-gray-400">
            <p>No forms yet. Create your first form to get started.</p>
            <Button className="mt-4" onClick={handleCreate}>
              Create form
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
                <tr>
                  <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">
                    Title
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">
                    Slug
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">
                    Status
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">
                    Visibility
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">
                    Fields
                  </th>
                  <th className="px-5 py-3 font-medium text-gray-600 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {forms.map((form) => (
                  <tr
                    key={form.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-900/30"
                  >
                    <td className="px-5 py-4">
                      <Link
                        to={`/forms/${form.id}/edit`}
                        className="font-medium text-brand-600 hover:underline dark:text-brand-400"
                      >
                        {form.title}
                      </Link>
                      {form.owner_email && (
                        <p className="text-xs text-gray-400">{form.owner_email}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-gray-600 dark:text-gray-400">
                      {form.slug}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        size="sm"
                        color={form.status === "published" ? "success" : "warning"}
                      >
                        {form.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 capitalize text-gray-600 dark:text-gray-400">
                      {form.visibility}
                    </td>
                    <td className="px-5 py-4 text-gray-600 dark:text-gray-400">
                      {form.field_count}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(`/forms/${form.id}/edit`)}
                        >
                          Edit
                        </Button>
                        {form.status === "published" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const url = `${window.location.origin}/f/${form.slug}`;
                              navigator.clipboard.writeText(url);
                              showSuccess("Form link copied to clipboard!");
                            }}
                          >
                            Copy Link
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDuplicate(form.id)}
                        >
                          Duplicate
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => setDeleteId(form.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteId !== null}
        title="Delete form"
        message="This cannot be undone. All fields will be removed."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}
