import crypto from "node:crypto";

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

export type IdempotencyRequest = {
  key: string;
  requestPath: string;
  requestParams: Record<string, unknown>;
  requestMethod?: string;
};

function normalize(value: unknown): JsonValue {
  if (value === null || value === undefined) return null;
  if (typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("Idempotency request contains a non-finite number");
    return value;
  }
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(normalize);
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, entry]) => entry !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, normalize(entry)])
    );
  }
  throw new Error(`Unsupported idempotency request value: ${typeof value}`);
}

export function canonicalIdempotencyParams(params: Record<string, unknown>): Record<string, JsonValue> {
  return normalize(params) as Record<string, JsonValue>;
}

export function idempotencyFingerprint(params: Record<string, unknown>): string {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(canonicalIdempotencyParams(params)))
    .digest("hex");
}

function storedFingerprint(requestParams: unknown): string {
  const params = requestParams && typeof requestParams === "object"
    ? { ...(requestParams as Record<string, unknown>) }
    : {};
  const recorded = typeof params._fingerprint === "string" ? params._fingerprint : null;
  delete params._fingerprint;
  const calculated = idempotencyFingerprint(params);
  if (recorded && recorded !== calculated) {
    throw new Error("Stored idempotency request fingerprint is invalid");
  }
  return calculated;
}

export function assertIdempotencyRequest(attempt: any, request: IdempotencyRequest): void {
  const method = request.requestMethod || "POST";
  const expectedFingerprint = idempotencyFingerprint(request.requestParams);
  if (
    attempt.requestMethod !== method ||
    attempt.requestPath !== request.requestPath ||
    storedFingerprint(attempt.requestParams) !== expectedFingerprint
  ) {
    throw new Error("Idempotency key was already used with a different request");
  }
}

export async function findIdempotencyAttempt(
  prisma: any,
  request: IdempotencyRequest
): Promise<any | null> {
  const key = request.key.trim();
  if (!key) throw new Error("Idempotency key is required");
  const existing = await prisma.idempotencyKey.findUnique({ where: { idempotencyKey: key } });
  if (existing) assertIdempotencyRequest(existing, { ...request, key });
  return existing;
}

export async function getOrCreateIdempotencyAttempt(
  prisma: any,
  request: IdempotencyRequest
): Promise<{ attempt: any; replay: boolean }> {
  const key = request.key.trim();
  if (!key) throw new Error("Idempotency key is required");
  const normalizedParams = canonicalIdempotencyParams(request.requestParams);
  const data = {
    idempotencyKey: key,
    requestMethod: request.requestMethod || "POST",
    requestPath: request.requestPath,
    requestParams: {
      ...normalizedParams,
      _fingerprint: idempotencyFingerprint(request.requestParams),
    },
    recoveryPoint: "started",
    lockedAt: new Date(),
  };

  const existing = await findIdempotencyAttempt(prisma, { ...request, key });
  if (existing) return { attempt: existing, replay: true };

  try {
    const attempt = await prisma.idempotencyKey.create({ data });
    return { attempt, replay: false };
  } catch (error: any) {
    if (error?.code !== "P2002") throw error;
    const raced = await prisma.idempotencyKey.findUnique({ where: { idempotencyKey: key } });
    if (!raced) throw error;
    assertIdempotencyRequest(raced, { ...request, key });
    return { attempt: raced, replay: true };
  }
}

export async function updateIdempotencyAttempt(
  prisma: any,
  attemptId: string,
  recoveryPoint: string,
  responseBody?: Record<string, unknown>,
  responseCode?: number
): Promise<void> {
  await prisma.idempotencyKey.update({
    where: { id: attemptId },
    data: {
      recoveryPoint,
      responseBody,
      responseCode,
      lockedAt: ["completed", "failed"].includes(recoveryPoint) ? null : new Date(),
    },
  });
}
