# Example: OpenAI-compatible credential fields for Cruise (works without this package).
# In n8n UI: Credentials → OpenAI → Base URL + API Key.
#
# baseUrl: https://cruise.bytesbrains.net/v1
# apiKey:  cru_live_…   (or cru_demo_… against the demo host)
#
# Model ids: fetch from GET {baseUrl}/models — e.g. bb/chat-assistant, bb/agentic-coding.
# Never hardcode a provider id like gpt-4o; Cruise will refuse it as model_not_found.
