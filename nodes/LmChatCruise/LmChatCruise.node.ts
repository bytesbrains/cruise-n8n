import { supplyModel } from "@n8n/ai-node-sdk";
import type {
  INodeType,
  INodeTypeDescription,
  ISupplyDataFunctions,
  SupplyData,
} from "n8n-workflow";
import { NodeConnectionTypes } from "n8n-workflow";

import { cruiseRefusalMessage, extractCruiseCode } from "../../utils/cruise-refusal";

/**
 * Chat Model sub-node for AI Agent / LangChain chains. Speaks OpenAI chat
 * completions against the Cruise base URL so agents pick Cruise by name.
 *
 * Refusals: `onFailedAttempt` rewrites the error message when Cruise's
 * `error.code` is present — budget vs wallet share HTTP 429 on purpose.
 */
export class LmChatCruise implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Cruise Chat Model",
    name: "lmChatCruise",
    icon: "file:cruise.svg",
    group: ["transform"],
    version: [1],
    description:
      "Language model for AI Agent / chains via BytesBrains Cruise (keys, budgets, lanes)",
    defaults: {
      name: "Cruise Chat Model",
    },
    codex: {
      categories: ["AI"],
      subcategories: {
        AI: ["Language Models", "Root Nodes"],
        "Language Models": ["Chat Models (Recommended)"],
      },
      resources: {
        primaryDocumentation: [
          {
            url: "https://bytesbrains.com/cruise",
          },
        ],
      },
    },
    inputs: [],
    outputs: [NodeConnectionTypes.AiLanguageModel],
    outputNames: ["Model"],
    credentials: [
      {
        name: "cruiseApi",
        required: true,
      },
    ],
    properties: [
      {
        displayName:
          'Connect this to an AI Agent or chain. Model ids are Cruise ids from GET /v1/models (e.g. bb/agentic-coding) — not provider ids like gpt-4o. Spending refusals share HTTP 429; read error.code (budget_exhausted vs wallet_exhausted).',
        name: "notice",
        type: "notice",
        default: "",
      },
      {
        displayName: "Model",
        name: "model",
        type: "string",
        default: "bb/chat-assistant",
        required: true,
        description:
          "Cruise model or lane id from GET /v1/models. Prefer a lane (bb/…) for agent work.",
      },
      {
        displayName: "Options",
        name: "options",
        type: "collection",
        default: {},
        options: [
          {
            displayName: "Temperature",
            name: "temperature",
            type: "number",
            typeOptions: {
              minValue: 0,
              maxValue: 2,
              numberPrecision: 1,
            },
            default: 1,
          },
          {
            displayName: "Max Tokens",
            name: "maxTokens",
            type: "number",
            default: 1024,
            description: "Upper bound on completion tokens.",
          },
          {
            displayName: "Timeout (ms)",
            name: "timeout",
            type: "number",
            default: 120_000,
          },
          {
            displayName: "Max Retries",
            name: "maxRetries",
            type: "number",
            default: 2,
            description:
              "Retries on transient failures. Do not raise this hoping to clear wallet_exhausted — that never helps.",
          },
        ],
      },
    ],
  };

  async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
    const credentials = await this.getCredentials("cruiseApi");
    const model = this.getNodeParameter("model", itemIndex) as string;
    const options = this.getNodeParameter("options", itemIndex, {}) as {
      temperature?: number;
      maxTokens?: number;
      timeout?: number;
      maxRetries?: number;
    };

    const baseUrl = String(credentials.baseUrl ?? "").replace(/\/+$/, "");
    const apiKey = String(credentials.apiKey ?? "");

    return supplyModel(this, {
      type: "openai",
      baseUrl,
      apiKey,
      model,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
      timeout: options.timeout ?? 120_000,
      maxRetries: options.maxRetries ?? 2,
      // Cruise is OpenAI-compatible chat completions, not Responses API.
      useResponsesApi: false,
      supportsStrictToolCalling: false,
      onFailedAttempt: (error: unknown) => {
        if (!extractCruiseCode(error)) return;
        throw new Error(cruiseRefusalMessage(error));
      },
    });
  }
}
