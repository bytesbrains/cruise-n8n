/**
 * Cruise answers spending refusals with the same HTTP status and OpenAI
 * `insufficient_quota` type on purpose. Branch on `error.code`, never status.
 */

export function cruiseRefusalMessage(error: unknown): string {
  const code = extractCruiseCode(error);
  const msg = extractCruiseMessage(error);

  if (code === "budget_exhausted") {
    return `Cruise budget_exhausted: ${msg} (wait for the period reset, or raise the project cap)`;
  }
  if (code === "wallet_exhausted") {
    return `Cruise wallet_exhausted: ${msg} (top-up or credit grant — retrying will not help)`;
  }
  if (code === "measurement_stale") {
    return `Cruise measurement_stale: ${msg} (use a lane, or another model from GET /v1/models)`;
  }
  if (code) {
    return `Cruise ${code}: ${msg}`;
  }
  return msg;
}

export function extractCruiseCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  const err = error as Record<string, unknown>;

  const fromBody =
    nestedField(err.response, "code") ??
    nestedField(err.cause, "code") ??
    nestedField(err.error, "code");
  if (typeof fromBody === "string") return fromBody;

  if (typeof err.code === "string" && isCruiseCode(err.code)) return err.code;

  // Some OpenAI SDK paths embed the body as text in message / description.
  const haystack = [err.message, err.description]
    .filter((v): v is string => typeof v === "string")
    .join("\n");
  for (const code of CRUISE_CODES) {
    if (new RegExp(`\\b${code}\\b`).test(haystack)) return code;
  }
  return undefined;
}

function extractCruiseMessage(error: unknown): string {
  if (!error || typeof error !== "object") {
    return typeof error === "string" ? error : "Cruise request failed";
  }
  const err = error as Record<string, unknown>;
  const nested =
    nestedField(err.response, "message") ??
    nestedField(err.cause, "message") ??
    nestedField(err.error, "message");
  if (typeof nested === "string") return nested;
  if (typeof err.message === "string" && err.message.length > 0) return err.message;
  if (typeof err.description === "string" && err.description.length > 0) return err.description;
  return "Cruise request failed";
}

/**
 * Walk the shapes OpenAI / n8n helpers put around an error body:
 * `{ body: { error: { code, message } } }` or `{ error: { … } }` or the object itself.
 */
function nestedField(value: unknown, field: "code" | "message"): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const obj = value as Record<string, unknown>;
  const body = obj.body ?? obj.error ?? obj;
  if (!body || typeof body !== "object") return undefined;
  const err = (body as Record<string, unknown>).error ?? body;
  if (!err || typeof err !== "object") return undefined;
  const found = (err as Record<string, unknown>)[field];
  return typeof found === "string" ? found : undefined;
}

const CRUISE_CODES = [
  "budget_exhausted",
  "wallet_exhausted",
  "measurement_stale",
  "model_not_found",
  "permission_error",
] as const;

function isCruiseCode(code: string): boolean {
  return (CRUISE_CODES as readonly string[]).includes(code);
}
