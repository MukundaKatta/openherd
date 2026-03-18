"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { OllamaInstance } from "@/types";
import { formatBytes } from "@/lib/utils";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import {
  Rocket, Wifi, WifiOff, Play, Square, Trash2, Download,
  RefreshCw, Server, Cpu, HardDrive, Loader2, CheckCircle2, AlertCircle
} from "lucide-react";

export default function DeployPage() {
  const searchParams = useSearchParams();
  const preselectedModelId = searchParams.get("model");
  const {
    models, ollamaConnected, ollamaInstances, setOllamaConnected,
    addOllamaInstance, updateOllamaInstance, removeOllamaInstance
  } = useAppStore();

  const [selectedModelId, setSelectedModelId] = useState(preselectedModelId || "");
  const [pulling, setPulling] = useState<string | null>(null);
  const [pullProgress, setPullProgress] = useState(0);
  const [gpuLayers, setGpuLayers] = useState(35);
  const [contextSize, setContextSize] = useState(4096);

  const deployableModels = models.filter((m) => m.ollama_id);

  const checkOllama = useCallback(async () => {
    try {
      const res = await fetch("/api/ollama/health");
      const data = await res.json();
      setOllamaConnected(data.connected);
    } catch {
      setOllamaConnected(false);
    }
  }, [setOllamaConnected]);

  useEffect(() => {
    checkOllama();
    const interval = setInterval(checkOllama, 10000);
    return () => clearInterval(interval);
  }, [checkOllama]);

  const handleDeploy = async () => {
    const model = models.find((m) => m.id === selectedModelId);
    if (!model || !model.ollama_id) return;

    if (!ollamaConnected) {
      toast.error("Ollama is not connected. Please start Ollama first.");
      return;
    }

    const instanceId = uuidv4();
    const instance: OllamaInstance = {
      id: instanceId,
      model_id: model.id,
      model_name: model.ollama_id,
      status: "pulling",
      port: 11434,
      pull_progress: 0,
      created_at: new Date().toISOString(),
      last_active: new Date().toISOString(),
      gpu_layers: gpuLayers,
      context_size: contextSize,
    };

    addOllamaInstance(instance);
    setPulling(instanceId);
    setPullProgress(0);

    try {
      const res = await fetch("/api/ollama/pull", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: model.ollama_id }),
      });

      if (!res.ok) throw new Error("Pull failed");

      // Simulate streaming progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          updateOllamaInstance(instanceId, {
            status: "running",
            pull_progress: 100,
          });
          setPulling(null);
          toast.success(`${model.name} deployed successfully!`);
        }
        setPullProgress(progress);
        updateOllamaInstance(instanceId, { pull_progress: Math.min(progress, 100) });
      }, 500);
    } catch {
      updateOllamaInstance(instanceId, { status: "error" });
      setPulling(null);
      toast.error("Failed to deploy model. Check Ollama connection.");
    }
  };

  const handleStop = (id: string) => {
    updateOllamaInstance(id, { status: "stopped" });
    toast.success("Model instance stopped");
  };

  const handleStart = (id: string) => {
    updateOllamaInstance(id, { status: "running", last_active: new Date().toISOString() });
    toast.success("Model instance started");
  };

  const handleDelete = (id: string) => {
    removeOllamaInstance(id);
    toast.success("Model instance removed");
  };

  const getStatusIcon = (status: OllamaInstance["status"]) => {
    switch (status) {
      case "running": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "pulling": return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case "stopped": return <Square className="h-4 w-4 text-gray-500" />;
      case "error": return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: OllamaInstance["status"]) => {
    switch (status) {
      case "running": return "text-green-400 bg-green-500/10";
      case "pulling": return "text-blue-400 bg-blue-500/10";
      case "stopped": return "text-gray-400 bg-gray-500/10";
      case "error": return "text-red-400 bg-red-500/10";
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Deploy Models</h1>
        <p className="text-gray-400 mt-1">One-click deployment using Ollama integration</p>
      </div>

      {/* Ollama Status */}
      <div className={`rounded-xl border p-4 flex items-center gap-4 ${
        ollamaConnected
          ? "border-green-500/30 bg-green-500/5"
          : "border-red-500/30 bg-red-500/5"
      }`}>
        {ollamaConnected ? (
          <Wifi className="h-5 w-5 text-green-500" />
        ) : (
          <WifiOff className="h-5 w-5 text-red-500" />
        )}
        <div className="flex-1">
          <p className={`text-sm font-medium ${ollamaConnected ? "text-green-400" : "text-red-400"}`}>
            {ollamaConnected ? "Ollama Connected" : "Ollama Not Detected"}
          </p>
          <p className="text-xs text-gray-500">
            {ollamaConnected
              ? "Ready to deploy models locally"
              : "Install and start Ollama to deploy models. Visit ollama.ai for instructions."}
          </p>
        </div>
        <button
          onClick={checkOllama}
          className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      </div>

      {/* Deploy Form */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Deploy a Model</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Select Model</label>
            <select
              value={selectedModelId}
              onChange={(e) => setSelectedModelId(e.target.value)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 focus:border-brand-500 focus:outline-none"
            >
              <option value="">Choose a model...</option>
              {deployableModels.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.parameter_size}) — {m.ollama_id}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Context Size</label>
            <select
              value={contextSize}
              onChange={(e) => setContextSize(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 focus:border-brand-500 focus:outline-none"
            >
              <option value={2048}>2048 tokens</option>
              <option value={4096}>4096 tokens</option>
              <option value={8192}>8192 tokens</option>
              <option value={16384}>16384 tokens</option>
              <option value={32768}>32768 tokens</option>
              <option value={65536}>65536 tokens</option>
              <option value={131072}>131072 tokens</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-1.5">
            GPU Layers: {gpuLayers}
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={gpuLayers}
            onChange={(e) => setGpuLayers(Number(e.target.value))}
            className="w-full accent-brand-500"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>CPU Only</span>
            <span>Full GPU</span>
          </div>
        </div>

        <button
          onClick={handleDeploy}
          disabled={!selectedModelId || !!pulling || !ollamaConnected}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pulling ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Pulling... {pullProgress.toFixed(0)}%
            </>
          ) : (
            <>
              <Rocket className="h-4 w-4" />
              Deploy Model
            </>
          )}
        </button>

        {pulling && (
          <div className="mt-4">
            <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-300"
                style={{ width: `${pullProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Downloading model weights...</p>
          </div>
        )}
      </div>

      {/* Running Instances */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Model Instances ({ollamaInstances.length})
        </h2>
        {ollamaInstances.length > 0 ? (
          <div className="space-y-3">
            {ollamaInstances.map((instance) => (
              <div
                key={instance.id}
                className="flex items-center gap-4 rounded-lg border border-gray-800 bg-gray-800/50 p-4"
              >
                {getStatusIcon(instance.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-white">{instance.model_name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(instance.status)}`}>
                      {instance.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Server className="h-3 w-3" />
                      Port {instance.port}
                    </span>
                    <span className="flex items-center gap-1">
                      <Cpu className="h-3 w-3" />
                      {instance.gpu_layers} GPU layers
                    </span>
                    <span className="flex items-center gap-1">
                      <HardDrive className="h-3 w-3" />
                      {instance.context_size} ctx
                    </span>
                  </div>
                  {instance.status === "pulling" && (
                    <div className="mt-2">
                      <div className="h-1.5 rounded-full bg-gray-700 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${instance.pull_progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {instance.status === "running" && (
                    <button
                      onClick={() => handleStop(instance.id)}
                      className="rounded-lg border border-gray-700 p-2 text-gray-400 hover:bg-gray-700 hover:text-gray-200 transition-colors"
                      title="Stop"
                    >
                      <Square className="h-4 w-4" />
                    </button>
                  )}
                  {instance.status === "stopped" && (
                    <button
                      onClick={() => handleStart(instance.id)}
                      className="rounded-lg border border-gray-700 p-2 text-gray-400 hover:bg-gray-700 hover:text-green-400 transition-colors"
                      title="Start"
                    >
                      <Play className="h-4 w-4" />
                    </button>
                  )}
                  {instance.status !== "pulling" && (
                    <button
                      onClick={() => handleDelete(instance.id)}
                      className="rounded-lg border border-gray-700 p-2 text-gray-400 hover:bg-gray-700 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Server className="h-10 w-10 text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No model instances yet</p>
            <p className="text-xs text-gray-600">Deploy a model above to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
