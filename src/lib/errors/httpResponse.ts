import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError, ConflictError, ValidationError } from "./index";

export function toErrorResponse(error: unknown): NextResponse {
  if (error instanceof ValidationError) {
    return NextResponse.json(
      { error: error.message, fields: error.fields },
      { status: 422 }
    );
  }

  if (error instanceof ConflictError) {
    return NextResponse.json(
      { error: error.message, ...(error.field ? { field: error.field } : {}) },
      { status: 409 }
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    const fields: Record<string, string> = {};
    // Zod v4 uses `.issues`, v3 used `.errors` — support both
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const issues: any[] = (error as any).issues ?? (error as any).errors ?? [];
    issues.forEach((e: { path: (string | number)[]; message: string }) => {
      fields[e.path.join(".")] = e.message;
    });
    return NextResponse.json(
      { error: "Validation failed.", fields },
      { status: 422 }
    );
  }

  console.error("[API] Unhandled error:", error);
  return NextResponse.json(
    { error: "An unexpected error occurred." },
    { status: 500 }
  );
}
