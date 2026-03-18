const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

export interface OllamaModel {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    parent_model: string;
    format: string;
    family: string;
    families: string[];
    parameter_size: string;
    quantization_level: string;
  };
}

export interface OllamaPullProgress {
  status: string;
  digest?: string;
  total?: number;
  completed?: number;
}

export interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: "GET",
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function listOllamaModels(): Promise<OllamaModel[]> {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
  if (!res.ok) throw new Error(`Ollama error: ${res.statusText}`);
  const data = await res.json();
  return data.models || [];
}

export async function pullOllamaModel(
  modelName: string,
  onProgress?: (progress: OllamaPullProgress) => void
): Promise<void> {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/pull`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: modelName, stream: true }),
  });

  if (!res.ok) throw new Error(`Failed to pull model: ${res.statusText}`);
  if (!res.body) throw new Error("No response body");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n").filter(Boolean);

    for (const line of lines) {
      try {
        const progress = JSON.parse(line) as OllamaPullProgress;
        onProgress?.(progress);
      } catch {
        // skip malformed lines
      }
    }
  }
}

export async function deleteOllamaModel(modelName: string): Promise<void> {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/delete`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: modelName }),
  });
  if (!res.ok) throw new Error(`Failed to delete model: ${res.statusText}`);
}

export async function generateCompletion(
  model: string,
  prompt: string,
  options?: {
    temperature?: number;
    max_tokens?: number;
    system?: string;
  }
): Promise<string> {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      system: options?.system,
      stream: false,
      options: {
        temperature: options?.temperature ?? 0.7,
        num_predict: options?.max_tokens ?? 512,
      },
    }),
  });

  if (!res.ok) throw new Error(`Generation failed: ${res.statusText}`);
  const data: OllamaGenerateResponse = await res.json();
  return data.response;
}

export async function chatCompletion(
  model: string,
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  options?: {
    temperature?: number;
    max_tokens?: number;
  }
): Promise<string> {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
      options: {
        temperature: options?.temperature ?? 0.7,
        num_predict: options?.max_tokens ?? 512,
      },
    }),
  });

  if (!res.ok) throw new Error(`Chat failed: ${res.statusText}`);
  const data = await res.json();
  return data.message?.content || "";
}

export async function getModelInfo(modelName: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/show`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: modelName }),
  });
  if (!res.ok) throw new Error(`Failed to get model info: ${res.statusText}`);
  return res.json();
}

export function getOllamaBaseUrl(): string {
  return OLLAMA_BASE_URL;
}
