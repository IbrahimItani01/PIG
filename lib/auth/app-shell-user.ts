import type { AuthenticatedUser } from "@/lib/auth/session";

export function toAppShellUser(user: AuthenticatedUser) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
  };
}
