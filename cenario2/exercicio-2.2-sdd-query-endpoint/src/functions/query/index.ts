import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import pino from "pino";

import { queryRequestSchema } from "./schemas";

const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  base: undefined,
});

function jsonResponse(status: number, body: unknown): HttpResponseInit {
  return {
    status,
    jsonBody: body,
    headers: {
      "content-type": "application/json",
    },
  };
}

export async function queryHandler(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  const requestId = context.invocationId;

  if (request.method !== "POST") {
    logger.warn({
      requestId,
      route: "/api/query",
      outcome: "method_not_allowed",
      method: request.method,
    });

    return jsonResponse(405, {
      code: "METHOD_NOT_ALLOWED",
      message: "Only POST is allowed for this endpoint",
      details: { method: request.method },
    });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    logger.info({ requestId, route: "/api/query", outcome: "invalid_json" });

    return jsonResponse(400, {
      code: "INVALID_JSON",
      message: "Request body must be valid JSON",
    });
  }

  const parsed = queryRequestSchema.safeParse(body);

  if (!parsed.success) {
    logger.info({
      requestId,
      route: "/api/query",
      outcome: "validation_error",
      issues: parsed.error.issues,
    });

    return jsonResponse(400, {
      code: "VALIDATION_ERROR",
      message: "Invalid request payload",
      details: parsed.error.flatten(),
    });
  }

  // TQ-001 scope: only endpoint setup and input validation.
  logger.info({ requestId, route: "/api/query", outcome: "validated" });

  return jsonResponse(200, {
    message: "Input validated. Endpoint base is ready for next tasks.",
    question: parsed.data.question,
  });
}

app.http("query", {
  methods: ["POST"],
  authLevel: "function",
  route: "query",
  handler: queryHandler,
});
