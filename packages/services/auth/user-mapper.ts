import type { SelectUser } from "@repo/database/schema";
import { resolvePermissionsForUser } from "../permissions/resolver";

export type AuthUserDto = {
  id: string;
  email: string;
  name: string;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
  is_superadmin: boolean;
  must_reset_password: boolean;
  allowed_pages: { slug: string; name: string; path: string }[];
  allowed_components: {
    slug: string;
    name: string;
    description?: string;
    category?: string;
  }[];
};

export async function toAuthUserDto(user: SelectUser): Promise<AuthUserDto> {
  const { allowed_pages, allowed_components } =
    await resolvePermissionsForUser(user);

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    first_name: user.firstName ?? "",
    last_name: user.lastName ?? "",
    name: user.fullName,
    role: user.role,
    is_superadmin: user.role === "superadmin",
    must_reset_password: user.mustResetPassword,
    allowed_pages,
    allowed_components,
  };
}
