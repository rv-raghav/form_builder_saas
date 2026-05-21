import { z } from "zod";

export const FIELD_TYPES = [
  "short_text",
  "long_text",
  "email",
  "number",
  "single_select",
  "multi_select",
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

export const FORM_THEMES = [
  "default",
  "movie",
  "anime",
  "game",
  "startup",
  "tech",
  "os",
  "event",
  "community",
] as const;

export type FormTheme = (typeof FORM_THEMES)[number];

export const formFieldSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.enum(FIELD_TYPES),
  label: z.string().min(1).max(200),
  placeholder: z.string().max(500).optional().nullable(),
  required: z.boolean().default(false),
  sort_order: z.number().int().min(0).optional(),
  options: z.array(z.string().min(1)).optional().nullable(),
});

export type FormFieldInput = z.infer<typeof formFieldSchema>;

export const createFormSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens")
    .optional(),
  description: z.string().max(2000).optional().nullable(),
  visibility: z.enum(["public", "unlisted"]).default("unlisted"),
  theme: z.enum(FORM_THEMES).default("default"),
  fields: z.array(formFieldSchema).default([]),
});

export const updateFormSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z
    .string()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  description: z.string().max(2000).optional().nullable(),
  visibility: z.enum(["public", "unlisted"]).optional(),
  theme: z.enum(FORM_THEMES).optional(),
  fields: z.array(formFieldSchema).optional(),
});

export type CreateFormInput = z.infer<typeof createFormSchema>;
export type UpdateFormInput = z.infer<typeof updateFormSchema>;

export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "form";
}

/** Public submission: field UUID → value. Honeypot `website` must stay empty. */
export const publicFormSubmitSchema = z.object({
  answers: z.record(z.string(), z.unknown()),
  /** Anti-spam honeypot — must be empty */
  website: z.string().optional(),
});

export type PublicFormSubmitBody = z.infer<typeof publicFormSubmitSchema>;
