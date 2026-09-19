import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from "n8n-workflow";

/**
 * Cruise virtual key + base URL. The key belongs in n8n's credential store —
 * never in a synced settings file or a committed workflow JSON.
 *
 * Default base URL includes `/v1`; nodes append `/chat/completions` etc.
 */
export class CruiseApi implements ICredentialType {
  name = "cruiseApi";

  displayName = "BytesBrains Cruise API";

  documentationUrl = "https://bytesbrains.com/cruise";

  properties: INodeProperties[] = [
    {
      displayName: "API Key",
      name: "apiKey",
      type: "string",
      typeOptions: { password: true },
      default: "",
      required: true,
      description:
        "A Cruise project key (`cru_live_…` or `cru_demo_…`). Issue with rate limits for any n8n host you do not control.",
    },
    {
      displayName: "Base URL",
      name: "baseUrl",
      type: "string",
      default: "https://cruise.bytesbrains.net/v1",
      required: true,
      description:
        "Include `/v1`. Use `https://cruise-demo.bytesbrains.net/v1` to rehearse without spend.",
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: "generic",
    properties: {
      headers: {
        Authorization: "=Bearer {{$credentials.apiKey}}",
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: "={{$credentials.baseUrl}}",
      url: "/models",
    },
  };
}
