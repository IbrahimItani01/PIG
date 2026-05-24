import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { messages } from "@/config/messages";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function handleRouteError(error: unknown) {
  if (error instanceof ZodError) {
    return jsonError(messages.errors.invalidInput, 422);
  }

  console.error("Route error", error);
  return jsonError(messages.errors.generic, 500);
}
