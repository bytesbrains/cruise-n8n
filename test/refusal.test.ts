import { describe, expect, it } from "vitest";

import { cruiseRefusalMessage, extractCruiseCode } from "../utils/cruise-refusal";

describe("cruiseRefusalMessage", () => {
  it("names budget_exhausted and tells the operator to wait or raise the cap", () => {
    const msg = cruiseRefusalMessage({
      response: { body: { error: { code: "budget_exhausted", message: "period spent" } } },
    });
    expect(msg).toContain("budget_exhausted");
    expect(msg).toContain("period spent");
    expect(msg.toLowerCase()).toContain("cap");
  });

  it("names wallet_exhausted and forbids retry-as-fix", () => {
    const msg = cruiseRefusalMessage({
      cause: { error: { code: "wallet_exhausted", message: "no credit" } },
    });
    expect(msg).toContain("wallet_exhausted");
    expect(msg).toContain("retrying will not help");
  });

  it("extracts a code embedded in a generic OpenAI-shaped message", () => {
    expect(extractCruiseCode({ message: "429 insufficient_quota: budget_exhausted" })).toBe(
      "budget_exhausted",
    );
  });

  it("does not treat a code as a substring of unrelated text", () => {
    expect(extractCruiseCode({ message: "not_budget_exhausted_anymore" })).toBeUndefined();
  });
});
