import type {
  IDataObject,
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  JsonObject,
} from "n8n-workflow";
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from "n8n-workflow";

/**
 * Standalone Cruise chat node. Prefer this (or a future Chat Model sub-node)
 * over forging the generic OpenAI credential when you want Cruise-named
 * refusals and a fetched model list.
 *
 * Models are typed by the caller as Cruise ids from GET /v1/models — never
 * frozen into this package.
 */
export class Cruise implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Cruise",
    name: "cruise",
    icon: "file:cruise.svg",
    group: ["transform"],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["model"]}}',
    description: "Chat completions through BytesBrains Cruise (keys, budgets, lanes)",
    defaults: {
      name: "Cruise",
    },
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main],
    credentials: [
      {
        name: "cruiseApi",
        required: true,
      },
    ],
    properties: [
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        options: [
          {
            name: "Chat",
            value: "chat",
            action: "Create a chat completion",
            description: "POST /v1/chat/completions",
          },
        ],
        default: "chat",
      },
      {
        displayName: "Model",
        name: "model",
        type: "string",
        default: "bb/chat-assistant",
        required: true,
        description:
          "A Cruise model or lane id from GET /v1/models (e.g. bb/agentic-coding). Not a provider id like gpt-4o.",
      },
      {
        displayName: "Prompt",
        name: "prompt",
        type: "string",
        typeOptions: {
          rows: 4,
        },
        default: "",
        required: true,
        description: "User message content for a single-turn chat completion.",
      },
      {
        displayName: "System Message",
        name: "systemMessage",
        type: "string",
        typeOptions: {
          rows: 2,
        },
        default: "",
        description: "Optional system message prepended to the conversation.",
      },
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
        description: "Upper bound on completion tokens. Null/omit is not exposed here — set deliberately.",
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const operation = this.getNodeParameter("operation", i) as string;
      if (operation !== "chat") {
        throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
          itemIndex: i,
        });
      }

      const model = this.getNodeParameter("model", i) as string;
      const prompt = this.getNodeParameter("prompt", i) as string;
      const systemMessage = this.getNodeParameter("systemMessage", i, "") as string;
      const temperature = this.getNodeParameter("temperature", i) as number;
      const maxTokens = this.getNodeParameter("maxTokens", i) as number;

      const messages: IDataObject[] = [];
      if (systemMessage.trim() !== "") {
        messages.push({ role: "system", content: systemMessage });
      }
      messages.push({ role: "user", content: prompt });

      const body: IDataObject = {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      };

      let response: IDataObject;
      try {
        response = (await this.helpers.httpRequestWithAuthentication.call(this, "cruiseApi", {
          method: "POST",
          url: "/chat/completions",
          body,
          json: true,
        })) as IDataObject;
      } catch (error) {
        // Prefer Cruise's error.code over HTTP status — budget_exhausted and
        // wallet_exhausted share 429 / insufficient_quota on purpose.
        throw new NodeApiError(this.getNode(), error as JsonObject, {
          itemIndex: i,
          message: cruiseRefusalMessage(error),
        });
      }

      const choice = Array.isArray(response.choices)
        ? (response.choices[0] as IDataObject | undefined)
        : undefined;
      const message = choice?.message as IDataObject | undefined;

      returnData.push({
        json: {
          model: response.model ?? model,
          content: message?.content ?? null,
          finish_reason: choice?.finish_reason ?? null,
          usage: response.usage ?? null,
          raw: response,
        },
        pairedItem: { item: i },
      });
    }

    return [returnData];
  }
}

function cruiseRefusalMessage(error: unknown): string {
  const err = error as {
    message?: string;
    description?: string;
    response?: { body?: { error?: { code?: string; message?: string } } };
    cause?: { error?: { code?: string; message?: string } };
  };
  const code =
    err.response?.body?.error?.code ??
    err.cause?.error?.code ??
    undefined;
  const msg =
    err.response?.body?.error?.message ??
    err.cause?.error?.message ??
    err.message ??
    "Cruise request failed";

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
