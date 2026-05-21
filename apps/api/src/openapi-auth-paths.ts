/** Static OpenAPI paths for REST auth (documented in Scalar alongside tRPC). */
export const authOpenApiPaths = {
  "/auth/csrf/": {
    get: {
      tags: ["Auth"],
      summary: "Get CSRF token",
      responses: { "200": { description: "CSRF token" } },
    },
  },
  "/auth/login/": {
    post: {
      tags: ["Auth"],
      summary: "Login with email/username and password",
      responses: { "200": { description: "User + session cookie" } },
    },
  },
  "/auth/register/": {
    post: {
      tags: ["Auth"],
      summary: "Register new consumer account",
      responses: { "201": { description: "User created + session cookie" } },
    },
  },
  "/auth/logout/": {
    post: {
      tags: ["Auth"],
      summary: "Logout and clear session",
      responses: { "200": { description: "Success" } },
    },
  },
  "/auth/me/": {
    get: {
      tags: ["Auth"],
      summary: "Get current authenticated user",
      responses: { "200": { description: "AuthUser" }, "401": { description: "Unauthorized" } },
    },
  },
  "/auth/refresh/": {
    post: {
      tags: ["Auth"],
      summary: "Refresh session",
      responses: { "200": { description: "Success" } },
    },
  },
  "/password-reset/": {
    post: {
      tags: ["Auth"],
      summary: "Request password reset email",
      responses: { "200": { description: "Generic success message" } },
    },
  },
};
