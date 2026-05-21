import type { AuthUserDto } from "@repo/services/auth";
import { getActorUser } from "@repo/services/admin";

export async function loadActorFromAuth(authUser: AuthUserDto) {
  return getActorUser(authUser.id);
}
