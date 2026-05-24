import { messages } from "@/config/messages";
import { getCurrentUser } from "@/lib/auth/session";
import { jsonError } from "@/lib/utils/http";

export async function requireApiUser() {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, response: jsonError(messages.errors.authRequired, 401) };
  }
  return { user, response: null };
}
