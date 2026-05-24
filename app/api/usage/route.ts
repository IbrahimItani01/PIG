import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth/api-session";
import { getPrisma } from "@/lib/db/prisma";
import { handleRouteError } from "@/lib/utils/http";

export async function GET() {
  try {
    const { user, response } = await requireApiUser();
    if (!user) return response;
    const usage = await getPrisma().usageEvent.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ usage });
  } catch (error) {
    return handleRouteError(error);
  }
}
