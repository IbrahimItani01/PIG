import { NextResponse } from "next/server";
import { messages } from "@/config/messages";
import { requireApiUser } from "@/lib/auth/api-session";
import { assertOwnsEvaluation } from "@/lib/auth/authorization";
import { getPrisma } from "@/lib/db/prisma";
import { handleRouteError, jsonError } from "@/lib/utils/http";
import { serializeEvaluationDetail } from "@/lib/workspace/serializers";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, response } = await requireApiUser();
    if (!user) return response;
    const { id } = await params;
    const evaluation = await assertOwnsEvaluation(user.id, id);
    if (!evaluation) return jsonError(messages.errors.forbidden, 404);
    return NextResponse.json({ evaluation: serializeEvaluationDetail(evaluation) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { user, response } = await requireApiUser();
    if (!user) return response;
    const { id } = await params;
    const evaluation = await assertOwnsEvaluation(user.id, id);
    if (!evaluation) return jsonError(messages.errors.forbidden, 404);
    await getPrisma().promptEvaluation.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
