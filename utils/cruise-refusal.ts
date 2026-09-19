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

  const fromBody = nestedCode(err.response) ?? nestedCode(err.cause) ?? nestedCode(err.error);
  if (fromBody) return fromBody;

  if (typeof err.code === "string" && isCruiseCode(err.code)) return err.code;

  // Some OpenAI SDK paths embed the body as JSON in message / error.error.message.
  const haystack = [err.message, err.description]
    .filter((v): v is string => typeof v === "string")
    .join("\n");
  for (const code of CRUISE_CODES) {
    if (haystack.includes(code)) return code;
  }
  return undefined;
}

function nestedCode(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const obj = value as Record<string, unknown>;
  const body = obj.body ?? obj.error ?? obj;
  if (!body || typeof body !== "object") return undefined;
  const err = (body as Record<string, unknown>).error ?? body;
  if (!err || typeof err !== "object") return undefined;
  const code = (err as Record<string, unknown>).code;
  return typeof code === "string" ? code : undefined;
}

function extractCruiseMessage(error: unknown): string {
  if (!error || typeof error !== "object") {
    return typeof error === "string" ? error : "Cruise request failed";
  }
  const err = error as Record<string, unknown>;
  const nested =
    nestedMessage(err.response) ?? nestedMessage(err.cause) ?? nestedMessage(err.error);
  if (nested) return nested;
  if (typeof err.message === "string" && err.message.length > 0) return err.message;
  if (typeof err.description === "string" && err.description.length > 0) return err.description;
  return "Cruise request failed";
}

function nestedMessage(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const obj = value as Record<string, unknown>;
  const body = obj.body ?? obj.error ?? obj;
  if (!body || typeof body !== "object") return undefined;
  const err = (body as Record<string, unknown>).error ?? body;
  if (!err || typeof err !== "object") return undefined;
  const message = (err as Record<string, unknown>).message;
  return typeof message === "string" ? message : undefined;
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
