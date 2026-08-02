# Spec: AI Router

> Multi-provider AI router with automatic failover. Product works 100% without AI.

## Routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/ai` | Required | Execute AI task |

## Providers (Priority Order)

| Priority | Provider | Model | Env Var (Key) | Env Var (BaseURL) | Env Var (Model) | Timeout |
|----------|----------|-------|---------------|-------------------|-----------------|---------|
| 1 | Agnes AI | agnes-2.5-pro | `AGNES_AI_API_KEY` | `https://api.agnes-ai.com/v1` | `AGNES_AI_MODEL` | 5s |
| 2 | Google AI Studio | gemini-2.5-flash | `GOOGLE_AI_STUDIO_API_KEY` | `https://generativelanguage.googleapis.com/v1beta/openai/` | `GOOGLE_AI_MODEL` | 5s |
| 3 | Cerebras | llama3.1-8b | `CEREBRAS_API_KEY` | `https://api.cerebras.ai/v1` | `CEREBRAS_MODEL` | 5s |
| 4 | Groq | llama-3.3-70b | `GROQ_API_KEY` | `https://api.groq.com/openai/v1` | `GROQ_MODEL` | 5s |

## Task Types

### 1. Completeness Check

**Purpose:** Detect vague/incomplete text answers in real-time.

**Input:**
```json
{
  "taskType": "completeness_check",
  "portalId": "uuid",
  "question": "Describe your company logo",
  "answer": "It's a logo"
}
```

**Prompt (system):**
```
You are a quality checker for freelance client intake forms.
Evaluate if the answer is sufficiently complete and specific.
If vague, too short, or lacking detail, return JSON:
{"complete": false, "reason": "...", "suggestion": "..."}
If complete, return JSON:
{"complete": true, "reason": "..."}
```

**Response:**
```json
{
  "success": true,
  "text": "{\"complete\": false, \"reason\": \"Too vague\", \"suggestion\": \"Describe the style, colors, and purpose of your logo\"}",
  "provider": "agnes",
  "tokensInput": 45,
  "tokensOutput": 12,
  "durationMs": 320
}
```

### 2. Portal Summary

**Purpose:** Auto-generate summary when portal is fully submitted.

**Input:**
```json
{
  "taskType": "summary",
  "portalId": "uuid",
  "items": [
    { "label": "Company Name", "answer": "Acme Corp" },
    { "label": "Project Brief", "answer": "We need a new website..." }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "text": "Acme Corp is requesting a new website. Key requirements include...",
  "provider": "agnes",
  "tokensUsed": 256
}
```

### 3. File Verification

**Purpose:** Check if uploaded file matches what was requested.

**Input:**
```json
{
  "taskType": "file_verification",
  "portalId": "uuid",
  "requestDescription": "High-resolution PNG logo",
  "fileName": "sketch.jpg",
  "fileType": "image/jpeg"
}
```

**Response:**
```json
{
  "success": true,
  "text": "{\"match\": false, \"reason\": \"Requested PNG but received JPG\", \"warning\": \"Consider requesting the correct format\"}",
  "provider": "google"
}
```

## API Request/Response

### POST /api/ai → 200 OK

```json
{
  "success": true,
  "text": "AI response text",
  "provider": "agnes",
  "tokensInput": 45,
  "tokensOutput": 12,
  "durationMs": 320
}
```

### POST /api/ai → 503 Service Unavailable

```json
{
  "success": false,
  "error": "All AI providers unavailable",
  "errors": [
    { "provider": "Agnes AI", "error": "401 Unauthorized" },
    { "provider": "Google", "error": "429 Rate limited" }
  ]
}
```

## Business Logic

1. **Receive request** → validate taskType + required params
2. **Check KV cache** → if same portalId + taskType + items hash exists in cache, return cached result
3. **Iterate providers** in priority order:
   a. Build OpenAI-compatible request
   b. Set 5s timeout via `AbortSignal.timeout(5000)`
   c. On success: parse response → log to `ai_call_logs` → return
   d. On failure: log error → try next provider
4. **All providers fail** → log all errors → return 503
5. **Cache result** in KV for 1 hour (TTL_AI)

## Logging

Every AI call logged to `ai_call_logs`:

```typescript
{
  portalId: "uuid",
  taskType: "completeness_check" | "summary" | "file_verification",
  providerAttempted: "agnes" | "google" | "cerebras" | "groq",
  providerSuccess: "agnes" | null,
  status: "success" | "failed" | "timeout",
  errorMessage: string | null,
  tokensInput: number | null,
  tokensOutput: number | null,
  durationMs: number,
}
```

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| No AI API keys configured | Return 503 immediately (don't try providers) |
| One provider key missing | Skip that provider, try next |
| All providers timeout | Return 503 with list of timeout errors |
| AI response malformed JSON | Log error, try next provider |
| Cache hit | Return cached result without calling any provider |
| User has no active license | Still allow AI calls (AI is a feature, not a gate) |

## Files

| File | Role |
|------|------|
| `src/lib/ai-router.ts` | Router logic, provider config, task functions |
| `src/app/api/ai/route.ts` | HTTP endpoint |
