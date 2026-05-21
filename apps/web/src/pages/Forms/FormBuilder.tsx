import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Button from "../../components/ui/button/Button";
import Badge from "../../components/ui/badge/Badge";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import {
  FIELD_TYPES,
  FORM_THEMES,
  fetchForm,
  publishForm,
  unpublishForm,
  updateForm,
  getErrorMessage,
  type Form,
  type FormField,
} from "../../api/forms";
import { useToast } from "../../context/ToastContext";

function emptyField(order: number): FormField {
  return {
    type: "short_text",
    label: "New question",
    placeholder: "",
    required: false,
    sort_order: order,
    options: null,
  };
}

export default function FormBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<"public" | "unlisted">("unlisted");
  const [theme, setTheme] = useState("default");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [fields, setFields] = useState<FormField[]>([]);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const form: Form = await fetchForm(id);
      setTitle(form.title);
      setSlug(form.slug);
      setDescription(form.description ?? "");
      setVisibility(form.visibility);
      setTheme(form.theme);
      setStatus(form.status);
      setFields(form.fields);
    } catch (err) {
      showError(getErrorMessage(err));
      navigate("/forms");
    } finally {
      setLoading(false);
    }
  }, [id, navigate, showError]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (overrides?: Partial<{ status: "draft" | "published" }>) => {
    if (!id) return;
    try {
      setSaving(true);
      const form = await updateForm(id, {
        title,
        slug,
        description: description || null,
        visibility,
        theme,
        fields: fields.map((f, i) => ({
          ...f,
          sort_order: i,
          options:
            f.type === "single_select" || f.type === "multi_select"
              ? (f.options?.filter(Boolean) ?? ["Option 1"])
              : null,
        })),
      });
      setStatus(overrides?.status ?? form.status);
      showSuccess("Form saved");
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!id) return;
    try {
      setSaving(true);
      await save();
      const form = await publishForm(id);
      setStatus(form.status);
      showSuccess("Form published");
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleUnpublish = async () => {
    if (!id) return;
    try {
      setSaving(true);
      const form = await unpublishForm(id);
      setStatus(form.status);
      showSuccess("Form unpublished");
    } catch (err) {
      showError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const updateField = (index: number, patch: Partial<FormField>) => {
    setFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...patch } : f)),
    );
  };

  const removeField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const addField = () => {
    setFields((prev) => [...prev, emptyField(prev.length)]);
  };

  const moveField = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= fields.length) return;
    setFields((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.splice(next, 0, item!);
      return copy;
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <PageMeta title={`Edit: ${title} | ChaiForms`} description="Form builder" />
      <PageBreadcrumb pageTitle="Form builder" />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Link to="/forms" className="text-sm text-brand-600 hover:underline dark:text-brand-400">
          ← Back to forms
        </Link>
        <Badge size="sm" color={status === "published" ? "success" : "warning"}>
          {status}
        </Badge>
        {status === "published" && (
          <span className="text-xs text-gray-500">
            Public link (Phase 4): <code className="font-mono">/f/{slug}</code>
          </span>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-1">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="mb-4 font-semibold text-gray-800 dark:text-white">Settings</h3>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <Label>Slug</Label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
              </div>
              <div>
                <Label>Description</Label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div>
                <Label>Visibility</Label>
                <select
                  value={visibility}
                  onChange={(e) =>
                    setVisibility(e.target.value as "public" | "unlisted")
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  <option value="unlisted">Unlisted (direct link only)</option>
                  <option value="public">Public (explore listing in Phase 4)</option>
                </select>
              </div>
              <div>
                <Label>Theme</Label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  {FORM_THEMES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => save()} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
            {status === "draft" ? (
              <Button variant="success" onClick={handlePublish} disabled={saving}>
                Publish
              </Button>
            ) : (
              <Button variant="outline" onClick={handleUnpublish} disabled={saving}>
                Unpublish
              </Button>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 dark:text-white">Fields</h3>
              <Button size="sm" onClick={addField}>
                + Add field
              </Button>
            </div>

            {fields.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">
                No fields yet. Add a field to build your form.
              </p>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id ?? index}
                    className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"
                  >
                    <div className="mb-3 flex flex-wrap gap-2">
                      <Button size="sm" variant="ghost" onClick={() => moveField(index, -1)}>
                        ↑
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => moveField(index, 1)}>
                        ↓
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => removeField(index)}
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label>Type</Label>
                        <select
                          value={field.type}
                          onChange={(e) =>
                            updateField(index, {
                              type: e.target.value,
                              options:
                                e.target.value === "single_select" ||
                                e.target.value === "multi_select"
                                  ? field.options ?? ["Option 1"]
                                  : null,
                            })
                          }
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        >
                          {FIELD_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label>Label</Label>
                        <Input
                          value={field.label}
                          onChange={(e) => updateField(index, { label: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Placeholder</Label>
                        <Input
                          value={field.placeholder ?? ""}
                          onChange={(e) =>
                            updateField(index, { placeholder: e.target.value })
                          }
                        />
                      </div>
                      <div className="flex items-end gap-2 pb-2">
                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) =>
                              updateField(index, { required: e.target.checked })
                            }
                          />
                          Required
                        </label>
                      </div>
                    </div>
                    {(field.type === "single_select" ||
                      field.type === "multi_select") && (
                      <div className="mt-3">
                        <Label>Options (one per line)</Label>
                        <textarea
                          value={(field.options ?? []).join("\n")}
                          onChange={(e) =>
                            updateField(index, {
                              options: e.target.value
                                .split("\n")
                                .map((s) => s.trim())
                                .filter(Boolean),
                            })
                          }
                          rows={3}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}