export type FormsErrorOptions = {
  fieldErrors?: Record<string, string[]>;
  /** Machine-readable hint for public API clients (e.g. not_published, not_found) */
  code?: string;
};

export class FormsError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public options?: FormsErrorOptions,
  ) {
    super(message);
    this.name = "FormsError";
  }
}
