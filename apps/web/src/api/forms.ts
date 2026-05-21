import { api } from "./auth";
import { API_ENDPOINTS } from "../config/api";

export type FormField = {
  id?: string;
  type: string;
  label: string;
  placeholder?: string | null;
  required: boolean;
  sort_order: number;
  options?: string[] | null;
};

export type Form = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: "draft" | "published";
  visibility: "public" | "unlisted";
  theme: string;
  published_at: string | null;
  created_at: string;
  updated_at: string | null;
  owner_id: string;
  owner_email?: string;
  fields: FormField[];
};

export type FormListItem = Omit<Form, "fields"> & { field_count: number };

export const FIELD_TYPES = [
  { value: "short_text", label: "Short text" },
  { value: "long_text", label: "Long text" },
  { value: "email", label: "Email" },
  { value: "number", label: "Number" },
  { value: "single_select", label: "Single select" },
  { value: "multi_select", label: "Multi select" },
] as const;

export const FORM_THEMES = [
  { value: "default", label: "Default" },
  { value: "movie", label: "Movie" },
  { value: "anime", label: "Anime" },
  { value: "game", label: "Game" },
  { value: "startup", label: "Startup" },
  { value: "tech", label: "Tech" },
  { value: "os", label: "OS" },
  { value: "event", label: "Event" },
  { value: "community", label: "Community" },
] as const;

export async function fetchForms(params?: {
  search?: string;
  status?: string;
  page?: number;
  page_size?: number;
}): Promise<{ results: FormListItem[]; count: number }> {
  const response = await api.get(API_ENDPOINTS.FORMS.LIST, { params });
  return response.data;
}

export async function fetchForm(id: string): Promise<Form> {
  const response = await api.get(API_ENDPOINTS.FORMS.DETAIL(id));
  return response.data;
}

export async function createForm(payload: {
  title: string;
  slug?: string;
  description?: string;
  visibility?: "public" | "unlisted";
  theme?: string;
  fields?: FormField[];
}): Promise<Form> {
  const response = await api.post(API_ENDPOINTS.FORMS.LIST, payload);
  return response.data;
}

export async function updateForm(
  id: string,
  payload: Partial<{
    title: string;
    slug: string;
    description: string | null;
    visibility: "public" | "unlisted";
    theme: string;
    fields: FormField[];
  }>,
): Promise<Form> {
  const response = await api.patch(API_ENDPOINTS.FORMS.UPDATE(id), payload);
  return response.data;
}

export async function deleteForm(id: string): Promise<void> {
  await api.delete(API_ENDPOINTS.FORMS.DELETE(id));
}

export async function publishForm(id: string): Promise<Form> {
  const response = await api.post(API_ENDPOINTS.FORMS.PUBLISH(id));
  return response.data;
}

export async function unpublishForm(id: string): Promise<Form> {
  const response = await api.post(API_ENDPOINTS.FORMS.UNPUBLISH(id));
  return response.data;
}

export async function duplicateForm(id: string): Promise<Form> {
  const response = await api.post(API_ENDPOINTS.FORMS.DUPLICATE(id));
  return response.data;
}

export type FormAnalyticsSummary = {
  total_responses: number;
  by_day: { date: string; count: number }[];
};

export type FormResponseListItem = {
  id: string;
  submitted_at: string;
  preview: string;
};

export type FormResponseAnswerRow = {
  field_id: string;
  label: string;
  type: string;
  value: unknown;
};

export type FormResponseDetail = {
  id: string;
  form_id: string;
  submitted_at: string;
  answers: FormResponseAnswerRow[];
};

export async function fetchFormAnalytics(formId: string): Promise<FormAnalyticsSummary> {
  const response = await api.get(API_ENDPOINTS.FORMS.ANALYTICS(formId));
  return response.data;
}

export async function fetchFormResponses(
  formId: string,
  params?: { page?: number; page_size?: number },
): Promise<{ results: FormResponseListItem[]; count: number }> {
  const response = await api.get(API_ENDPOINTS.FORMS.RESPONSES(formId), { params });
  return response.data;
}

export async function fetchFormResponse(
  formId: string,
  responseId: string,
): Promise<FormResponseDetail> {
  const response = await api.get(API_ENDPOINTS.FORMS.RESPONSE_DETAIL(formId, responseId));
  return response.data;
}

export function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object") {
    const axiosError = error as {
      response?: { data?: { detail?: string } & Record<string, unknown> };
      message?: string;
    };
    const data = axiosError.response?.data;
    if (data?.detail && typeof data.detail === "string") return data.detail;
    if (axiosError.message) return axiosError.message;
  }
  return "An unexpected error occurred";
}
