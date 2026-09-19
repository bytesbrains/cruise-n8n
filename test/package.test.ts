import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("community package contract", () => {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as {
    name: string;
    keywords: string[];
    n8n?: {
      n8nNodesApiVersion?: number;
      nodes?: string[];
      credentials?: string[];
    };
  };

  it("uses the n8n community package name prefix", () => {
    expect(pkg.name.startsWith("n8n-nodes-") || pkg.name.includes("/n8n-nodes-")).toBe(true);
  });

  it("declares the community-node keyword", () => {
    expect(pkg.keywords).toContain("n8n-community-node-package");
  });

  it("points n8n at compiled dist paths", () => {
    expect(pkg.n8n?.n8nNodesApiVersion).toBe(1);
    expect(pkg.n8n?.nodes?.length).toBeGreaterThan(0);
    expect(pkg.n8n?.credentials?.length).toBeGreaterThan(0);
    for (const path of [...(pkg.n8n?.nodes ?? []), ...(pkg.n8n?.credentials ?? [])]) {
      expect(path.startsWith("dist/")).toBe(true);
    }
  });
});

describe("Cruise node surface", () => {
  it("exports a node class with cruise credentials", async () => {
    const { Cruise } = await import("../nodes/Cruise/Cruise.node.ts");
    const node = new Cruise();
    expect(node.description.name).toBe("cruise");
    expect(node.description.credentials?.[0]?.name).toBe("cruiseApi");
    const model = node.description.properties.find((p) => p.name === "model");
    expect(model).toBeDefined();
  });

  it("exports a credential that tests GET /models", async () => {
    const { CruiseApi } = await import("../credentials/CruiseApi.credentials.ts");
    const cred = new CruiseApi();
    expect(cred.name).toBe("cruiseApi");
    expect(cred.test?.request?.url).toBe("/models");
    expect(cred.properties.some((p) => p.name === "apiKey")).toBe(true);
    expect(cred.properties.some((p) => p.name === "baseUrl")).toBe(true);
  });
});
