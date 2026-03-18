"use client";

import { useState } from "react";
import { useAppStore } from "@/store/app-store";
import { APIEndpoint } from "@/types";
import { generateApiKey } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import {
  Globe, Plus, Play, Square, Trash2, Copy, Eye, EyeOff,
  CheckCircle2, AlertCircle, Loader2, Code, Settings, Key
} from "lucide-react";

export default function EndpointsPage() {
  const {
    models, apiEndpoints, addApiEndpoint, updateApiEndpoint, removeApiEndpoint
  } = useAppStore();

  const [showForm, setShowForm] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState("");
  const [format, setFormat] = useState<"openai" | "custom">("openai");
  const [maxTokens, setMaxTokens] = useState(2048);
  const [temperature, setTemperature] = useState(0.7);
  const [port, setPort] = useState(8080);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

  const deployableModels = models.filter((m) => m.ollama_id);

  const handleCreate = () => {
    const model = models.find((m) => m.id === selectedModelId);
    if (!model) {
      toast.error("Please select a model");
      return;
    }

    const endpoint: APIEndpoint = {
      id: uuidv4(),
      model_id: model.id,
      model_name: model.name,
      endpoint_url: `http://localhost:${port}/v1`,
      port,
      status: "starting",
      format,
      api_key: generateApiKey(),
      max_tokens: maxTokens,
      temperature,
      request_count: 0,
      created_at: new Date().toISOString(),
      last_request_at: null,
    };

    addApiEndpoint(endpoint);

    // Simulate startup
    setTimeout(() => {
      updateApiEndpoint(endpoint.id, { status: "active" });
      toast.success(`API endpoint for ${model.name} is now active!`);
    }, 2000);

    setShowForm(false);
    setSelectedModelId("");
    setPort(port + 1);
  };

  const toggleKey = (id: string) => {
    setVisibleKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const getStatusIcon = (status: APIEndpoint["status"]) => {
    switch (status) {
      case "active": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "starting": return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case "inactive": return <Square className="h-4 w-4 text-gray-500" />;
      case "error": return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">API Endpoints</h1>
          <p className="text-gray-400 mt-1">Deploy models as REST APIs with OpenAI-compatible format</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Endpoint
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 animate-slide-in space-y-4">
          <h2 className="text-lg font-semibold text-white">Create API Endpoint</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Model</label>
              <select
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 focus:border-brand-500 focus:outline-none"
              >
                <option value="">Select a model...</option>
                {deployableModels.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Port</label>
              <input
                type="number"
                value={port}
                onChange={(e) => setPort(parseInt(e.target.value))}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">API Format</label>
            <div className="flex gap-3">
              <button
                onClick={() => setFormat("openai")}
                className={`flex-1 rounded-lg border p-3 text-left transition-colors ${
                  format === "openai"
                    ? "border-brand-500 bg-brand-500/10"
                    : "border-gray-700 bg-gray-800 hover:bg-gray-700"
                }`}
              >
                <p className="text-sm font-medium text-white">OpenAI Compatible</p>
                <p className="text-xs text-gray-500 mt-0.5">/v1/chat/completions, /v1/completions</p>
              </button>
              <button
                onClick={() => setFormat("custom")}
                className={`flex-1 rounded-lg border p-3 text-left transition-colors ${
                  format === "custom"
                    ? "border-brand-500 bg-brand-500/10"
                    : "border-gray-700 bg-gray-800 hover:bg-gray-700"
                }`}
              >
                <p className="text-sm font-medium text-white">Custom Format</p>
                <p className="text-xs text-gray-500 mt-0.5">Simple /generate and /chat endpoints</p>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Max Tokens</label>
              <input
                type="number"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Temperature</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="2"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
            >
              <Globe className="h-4 w-4" />
              Create Endpoint
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 text-sm text-gray-400 hover:text-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Endpoints List */}
      <div className="space-y-4">
        {apiEndpoints.map((endpoint) => (
          <div key={endpoint.id} className="rounded-xl border border-gray-800 bg-gray-900 p-5">
            <div className="flex items-center gap-3 mb-4">
              {getStatusIcon(endpoint.status)}
              <div className="flex-1">
                <h3 className="text-sm font-medium text-white">{endpoint.model_name}</h3>
                <p className="text-xs text-gray-500">
                  {endpoint.format === "openai" ? "OpenAI Compatible" : "Custom"} · Port {endpoint.port}
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                endpoint.status === "active" ? "text-green-400 bg-green-500/10" :
                endpoint.status === "starting" ? "text-blue-400 bg-blue-500/10" :
                endpoint.status === "error" ? "text-red-400 bg-red-500/10" :
                "text-gray-400 bg-gray-500/10"
              }`}>
                {endpoint.status}
              </span>
            </div>

            {/* Endpoint URL */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-16">URL</span>
                <div className="flex-1 flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2">
                  <code className="text-sm text-green-400 flex-1">{endpoint.endpoint_url}</code>
                  <button
                    onClick={() => copyToClipboard(endpoint.endpoint_url, "URL")}
                    className="text-gray-500 hover:text-gray-300"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-16">API Key</span>
                <div className="flex-1 flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2">
                  <code className="text-sm text-yellow-400 flex-1 font-mono">
                    {visibleKeys[endpoint.id] ? endpoint.api_key : "oh-" + "*".repeat(44)}
                  </code>
                  <button
                    onClick={() => toggleKey(endpoint.id)}
                    className="text-gray-500 hover:text-gray-300"
                  >
                    {visibleKeys[endpoint.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(endpoint.api_key, "API Key")}
                    className="text-gray-500 hover:text-gray-300"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Usage Example */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Code className="h-3.5 w-3.5 text-gray-500" />
                <span className="text-xs font-medium text-gray-400">Usage Example</span>
              </div>
              <pre className="rounded-lg bg-gray-950 p-3 text-xs text-gray-300 overflow-x-auto">
{`curl ${endpoint.endpoint_url}/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${visibleKeys[endpoint.id] ? endpoint.api_key : "<your-api-key>"}" \\
  -d '{
    "model": "${endpoint.model_name}",
    "messages": [{"role": "user", "content": "Hello!"}],
    "max_tokens": ${endpoint.max_tokens},
    "temperature": ${endpoint.temperature}
  }'`}
              </pre>
            </div>

            {/* Stats & Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-800">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>Requests: {endpoint.request_count}</span>
                <span>Max tokens: {endpoint.max_tokens}</span>
                <span>Temp: {endpoint.temperature}</span>
              </div>
              <div className="flex items-center gap-2">
                {endpoint.status === "active" && (
                  <button
                    onClick={() => updateApiEndpoint(endpoint.id, { status: "inactive" })}
                    className="rounded-lg border border-gray-700 p-2 text-gray-400 hover:text-yellow-400 transition-colors"
                    title="Stop"
                  >
                    <Square className="h-4 w-4" />
                  </button>
                )}
                {endpoint.status === "inactive" && (
                  <button
                    onClick={() => updateApiEndpoint(endpoint.id, { status: "active" })}
                    className="rounded-lg border border-gray-700 p-2 text-gray-400 hover:text-green-400 transition-colors"
                    title="Start"
                  >
                    <Play className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => { removeApiEndpoint(endpoint.id); toast.success("Endpoint removed"); }}
                  className="rounded-lg border border-gray-700 p-2 text-gray-400 hover:text-red-400 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {apiEndpoints.length === 0 && !showForm && (
        <div className="text-center py-16">
          <Globe className="h-12 w-12 text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400">No API endpoints</h3>
          <p className="text-sm text-gray-600 mt-1">Create an endpoint to serve your models as APIs</p>
        </div>
      )}
    </div>
  );
}
