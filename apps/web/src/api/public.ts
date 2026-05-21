import axios from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "../config/api";

const publicClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  headers: { "Content-Type": "application/json" },
});

export type PublicFormField = {
  id: string;
  type: string;
  label: string;
  placeholder: string | null;
  required: boolean;
  sort_order: number;
  options: string[] | null;
};

export type PublicForm = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  theme: string;
  fields: PublicFormField[];
};

export type ExploreForm = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  theme: string;
  field_count: number;
};

export async function fetchPublicForm(slug: string): Promise<PublicForm> {
  const { data } = await publicClient.get<PublicForm>(API_ENDPOINTS.PUBLIC.FORM(slug));
  return data;
}

export async function fetchExploreForms(): Promise<ExploreForm[]> {
  const { data } = await publicClient.get<{ results: ExploreForm[] }>(
    API_ENDPOINTS.PUBLIC.EXPLORE,
  );
  return data.results;
}

export async function submitPublicForm(
  slug: string,
  payload: { answers: Record<string, unknown>; website?: string },
): Promise<{ success: boolean; id: string }> {
  const { data } = await publicClient.post(API_ENDPOINTS.PUBLIC.SUBMIT(slug), payload);
  return data;
}

export function getPublicErrorMessage(error: unknown): string {
  if (error && typeof error === "object") {
    const ax = error as {
      response?: { data?: { detail?: string } };
      message?: string;
    };
    if (ax.response?.data?.detail) return ax.response.data.detail;
    if (ax.message) return ax.message;
  }
  return "Something went wrong.";
}

export function getPublicErrorCode(error: unknown): string | undefined {
  if (error && typeof error === "object") {
    const ax = error as { response?: { data?: { code?: string } } };
    return ax.response?.data?.code;
  }
  return undefined;
}

export function getPublicValidationErrors(
  error: unknown,
): Record<string, string[]> | undefined {
  if (error && typeof error === "object") {
    const ax = error as { response?: { data?: { errors?: Record<string, string[]> } } };
    return ax.response?.data?.errors;
  }
  return undefined;
}
