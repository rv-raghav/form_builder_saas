/** Static catalog for pages and components (seeded into DB). */

export type PageCatalogEntry = {
  slug: string;
  name: string;
  path: string;
  category: string;
};

export type ComponentCatalogEntry = {
  slug: string;
  name: string;
  description: string;
  pageSlug: string;
  category: string;
};

export const PAGE_CATALOG: PageCatalogEntry[] = [
  { slug: "dashboard", name: "Dashboard", path: "/dashboard", category: "main" },
  { slug: "forms", name: "Forms", path: "/forms", category: "main" },
  { slug: "submissions", name: "Submissions", path: "/submissions", category: "main" },
  { slug: "explore", name: "Explore", path: "/explore", category: "main" },
  {
    slug: "user-management",
    name: "User Management",
    path: "/user-management",
    category: "administration",
  },
  {
    slug: "access-control",
    name: "Access Control",
    path: "/access-control",
    category: "administration",
  },
];

export const COMPONENT_CATALOG: ComponentCatalogEntry[] = [
  {
    slug: "search-bar",
    name: "Search Bar",
    description: "Global search in header",
    pageSlug: "dashboard",
    category: "header",
  },
  {
    slug: "notifications",
    name: "Notifications",
    description: "Notification bell in header",
    pageSlug: "dashboard",
    category: "header",
  },
];

export const ROLE_CATALOG = [
  {
    slug: "superadmin",
    name: "Super Admin",
    description: "Full platform access",
  },
  {
    slug: "admin",
    name: "Admin",
    description: "Platform administration",
  },
  {
    slug: "consumer",
    name: "Creator",
    description: "Form builder and own content",
  },
] as const;

/** Default page access by role slug (before DB overrides). */
export const DEFAULT_ROLE_PAGE_ACCESS: Record<string, Set<string>> = {
  superadmin: new Set(PAGE_CATALOG.map((p) => p.slug)),
  admin: new Set([
    "dashboard",
    "forms",
    "submissions",
    "explore",
    "user-management",
    "access-control",
  ]),
  consumer: new Set(["dashboard", "forms", "submissions", "explore"]),
};

export const DEFAULT_ROLE_COMPONENT_ACCESS: Record<string, Set<string>> = {
  superadmin: new Set(COMPONENT_CATALOG.map((c) => c.slug)),
  admin: new Set(COMPONENT_CATALOG.map((c) => c.slug)),
  consumer: new Set(["search-bar"]),
};
