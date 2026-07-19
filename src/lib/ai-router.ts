// AI Router with multi-provider failover
// Providers: Agnes, Google, Cerebras, Groq

const PROVIDERS = [
  {
    id: "agnes" as const,
    name: "Agnes AI",
    apiKey: process.env.AGNES_AI_API_KEY,
    baseURL: "https://api.agnes-ai.com/v1",
    model: process.env.AGNES_AI_MODEL || "agnes-2.5-pro",
    priority: 1,
  },
  {
    id: "google" as const,
    name: "Google AI Studio",
    apiKey: process.env.GOOGLE_AI_STUDIO_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    model: process.env.GOOGLE_AI_MODEL || "gemini-2.5-flash",
    priority: 2,
  },
  {
    id: "cerebras" as const,
    name: "Cerebras",
    apiKey: process.env.CEREBRAS_API_KEY,
    baseURL: "https://api.cerebras.ai/v1",
    model: process.env.CEREBRAS_MODEL || "llama3.1-8b",
    priority: 3,
  },
  {
    id: "groq" as const,
    name: "Groq",
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
    model: process.env.GROQ_MODEL || "llama-3.3-70b",
    priority: 4,
  },
];

// Sort by priority (lowest number = highest priority)
PROVIDERS.sort((a, b) => a.priority - b.priority);

export type AIProvider = (typeof PROVIDERS)[number];
export type AISuccessProvider = (typeof PROVIDERS)[number]["id"];

// ========================================
// AI ROUTER
// ========================================

interface AIResponse {
  text: string;
  provider: AISuccessProvider;
  tokensInput?: number;
  tokensOutput?: number;
  durationMs?: number;
}

interface AIError {
  error: string;
  provider: string;
}

const AI_TIMEOUT_MS = 5000;

export async function routeAIRequest(
  messages: Array<{ role: string; content: string }>,
  taskType: string
): Promise<AIResponse | AIError[]> {
  const errors: AIError[] = [];
  const sortedProviders = [...PROVIDERS].filter((p) => p.apiKey);

  for (const provider of sortedProviders) {
    try {
      const startTime = Date.now();

      const response = await fetch(`${provider.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${provider.apiKey}`,
        },
        body: JSON.stringify({
          model: provider.model,
          messages: messages,
          max_tokens: 2048,
          temperature: 0.3,
        }),
        signal: AbortSignal.timeout(AI_TIMEOUT_MS),
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.text();
        errors.push({
          error: errorData,
          provider: provider.name,
        });
        continue;
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || "";

      return {
        text,
        provider: provider.id,
        tokensInput: data.usage?.prompt_tokens,
        tokensOutput: data.usage?.completion_tokens,
        durationMs: duration,
      };
    } catch (err) {
      errors.push({
        error: err instanceof Error ? err.message : "Unknown error",
        provider: provider.name,
      });
    }
  }

  return errors;
}

// ========================================
// TASK-SPECIFIC AI FUNCTIONS
// ========================================

export async function checkCompleteness(
  question: string,
  answer: string
): Promise<AIResponse | AIError[]> {
  const messages = [
    {
      role: "system" as const,
      content: `You are a quality checker for freelance client intake forms. 
Evaluate if the answer is sufficiently complete and specific.
If the answer is vague, too short, or doesn't provide enough detail, return a JSON object:
{"complete": false, "reason": "explanation", "suggestion": "what to add"}
If the answer is complete, return:
{"complete": true, "reason": "brief explanation"}`,
    },
    {
      role: "user" as const,
      content: `Question: "${question}"\nAnswer: "${answer}"`,
    },
  ];

  return routeAIRequest(messages, "completeness_check");
}

export async function summarizePortal(
  portalName: string,
  items: Array<{ label: string; answer: string }>
): Promise<AIResponse | AIError[]> {
  const context = items.map((i) => `${i.label}: ${i.answer}`).join("\n");

  const messages = [
    {
      role: "system" as const,
      content: `You are a helpful assistant. Summarize the following client intake responses in a concise paragraph for the freelance who requested them. Focus on actionable information.`,
    },
    {
      role: "user" as const,
      content: `Portal: ${portalName}\n\n${context}`,
    },
  ];

  return routeAIRequest(messages, "summary");
}

export async function verifyFileMatch(
  requestDescription: string,
  fileName: string,
  fileType: string
): Promise<AIResponse | AIError[]> {
  const messages = [
    {
      role: "system" as const,
      content: `You are a file format checker. Determine if the uploaded file likely matches what was requested.
Return JSON: {"match": true/false, "reason": "explanation", "warning": "optional warning message"}`,
    },
    {
      role: "user" as const,
      content: `Requested: "${requestDescription}"\nUploaded: "${fileName}" (${fileType})`,
    },
  ];

  return routeAIRequest(messages, "file_verification");
}
