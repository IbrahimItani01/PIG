import { redirect } from "next/navigation";
import { type User as PrismaUser } from "@prisma/client";
import { createSupabaseServerClient } from "@/lib/auth/supabase-server";
import { getPrisma } from "@/lib/db/prisma";

export type AuthenticatedUser = PrismaUser & {
  authId: string;
};

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const prisma = getPrisma();
  const dbUser = await prisma.user.upsert({
    where: { id: user.id },
    update: {
      email: user.email,
      name: user.user_metadata?.name ?? user.user_metadata?.full_name ?? undefined,
      avatarUrl: user.user_metadata?.avatar_url ?? undefined,
    },
    create: {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name ?? user.user_metadata?.full_name ?? null,
      avatarUrl: user.user_metadata?.avatar_url ?? null,
    },
  });

  return { ...dbUser, authId: user.id };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
