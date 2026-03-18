"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/app-store";

export function useOllamaHealth() {
  const { ollamaConnected, setOllamaConnected } = useAppStore();
  const [checking, setChecking] = useState(false);

  const checkHealth = useCallback(async () => {
    setChecking(true);
    try {
      const res = await fetch("/api/ollama/health");
      const data = await res.json();
      setOllamaConnected(data.connected);
    } catch {
      setOllamaConnected(false);
    } finally {
      setChecking(false);
    }
  }, [setOllamaConnected]);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  return { connected: ollamaConnected, checking, refresh: checkHealth };
}

export function useOllamaModels() {
  const [models, setModels] = useState<Array<{
    name: string;
    size: number;
    details: { family: string; parameter_size: string; quantization_level: string };
  }>>([]);
  const [loading, setLoading] = useState(false);

  const fetchModels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ollama/models");
      const data = await res.json();
      setModels(data.models || []);
    } catch {
      setModels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  return { models, loading, refresh: fetchModels };
}

export function useOllamaGenerate() {
  const [generating, setGenerating] = useState(false);

  const generate = useCallback(async (
    model: string,
    prompt: string,
    options?: { temperature?: number; max_tokens?: number; system?: string }
  ): Promise<string> => {
    setGenerating(true);
    try {
      const res = await fetch("/api/ollama/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, prompt, ...options }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      return data.response;
    } finally {
      setGenerating(false);
    }
  }, []);

  const chat = useCallback(async (
    model: string,
    messages: { role: string; content: string }[],
    options?: { temperature?: number; max_tokens?: number }
  ): Promise<string> => {
    setGenerating(true);
    try {
      const res = await fetch("/api/ollama/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, messages, ...options }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      return data.message?.content || "";
    } finally {
      setGenerating(false);
    }
  }, []);

  return { generate, chat, generating };
}
