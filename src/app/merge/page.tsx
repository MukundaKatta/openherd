"use client";

import { useState } from "react";
import { useAppStore } from "@/store/app-store";
import { ModelMergeJob, MergeSource, MergeStrategy, MergeConfig } from "@/types";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import {
  GitMerge, Plus, X, Play, CheckCircle2, AlertCircle,
  Loader2, Settings, Layers, Trash2
} from "lucide-react";

const MERGE_STRATEGIES: { value: MergeStrategy; label: string; desc: string }[] = [
  { value: "linear", label: "Linear Interpolation", desc: "Weighted average of model parameters" },
  { value: "slerp", label: "SLERP", desc: "Spherical linear interpolation for smoother blending" },
  { value: "ties", label: "TIES Merging", desc: "Trim, Elect, and Sign — resolves parameter conflicts" },
  { value: "dare", label: "DARE", desc: "Drop And REscale — pruning-based merge" },
  { value: "passthrough", label: "Passthrough", desc: "Stack layers from different models" },
  { value: "task_arithmetic", label: "Task Arithmetic", desc: "Add/subtract task vectors" },
];

export default function MergePage() {
  const { models, mergeJobs, addMergeJob, updateMergeJob } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [jobName, setJobName] = useState("");
  const [outputName, setOutputName] = useState("");
  const [strategy, setStrategy] = useState<MergeStrategy>("slerp");
  const [sources, setSources] = useState<MergeSource[]>([
    { model_id: "", model_name: "", weight: 0.5 },
    { model_id: "", model_name: "", weight: 0.5 },
  ]);
  const [baseModelId, setBaseModelId] = useState("");
  const [density, setDensity] = useState(0.5);
  const [normalize, setNormalize] = useState(true);

  const addSource = () => {
    setSources([...sources, { model_id: "", model_name: "", weight: 0.5 }]);
  };

  const removeSource = (index: number) => {
    if (sources.length <= 2) {
      toast.error("Need at least 2 models");
      return;
    }
    setSources(sources.filter((_, i) => i !== index));
  };

  const updateSource = (index: number, field: keyof MergeSource, value: string | number) => {
    setSources(sources.map((s, i) => {
      if (i !== index) return s;
      if (field === "model_id") {
        const model = models.find((m) => m.id === value);
        return { ...s, model_id: value as string, model_name: model?.name || "" };
      }
      return { ...s, [field]: value };
    }));
  };

  const normalizeWeights = () => {
    const total = sources.reduce((acc, s) => acc + s.weight, 0);
    if (total === 0) return;
    setSources(sources.map((s) => ({ ...s, weight: parseFloat((s.weight / total).toFixed(3)) })));
  };

  const handleLaunch = () => {
    if (!jobName || !outputName) {
      toast.error("Please fill in job name and output name");
      return;
    }

    const validSources = sources.filter((s) => s.model_id);
    if (validSources.length < 2) {
      toast.error("Select at least 2 models");
      return;
    }

    const config: MergeConfig = {
      strategy,
      base_model_id: baseModelId || null,
      interpolation_weight: sources[0].weight,
      density,
      normalize,
      custom_params: {},
    };

    const job: ModelMergeJob = {
      id: uuidv4(),
      job_name: jobName,
      source_models: validSources,
      merge_strategy: strategy,
      status: "pending",
      progress: 0,
      output_model_name: outputName,
      output_model_path: null,
      config,
      created_at: new Date().toISOString(),
      completed_at: null,
      error_message: null,
    };

    addMergeJob(job);
    toast.success("Merge job created!");

    // Simulate merging
    setTimeout(() => {
      updateMergeJob(job.id, { status: "merging" });
    }, 1000);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 8 + 2;
      if (progress >= 100) {
        clearInterval(interval);
        updateMergeJob(job.id, {
          status: "completed",
          progress: 100,
          output_model_path: `/models/merged/${outputName.replace(/\s+/g, "-").toLowerCase()}`,
          completed_at: new Date().toISOString(),
        });
        toast.success(`Merge job "${jobName}" completed!`);
        return;
      }
      updateMergeJob(job.id, { progress: Math.min(progress, 100) });
    }, 600);

    setShowForm(false);
    setJobName("");
    setOutputName("");
    setSources([
      { model_id: "", model_name: "", weight: 0.5 },
      { model_id: "", model_name: "", weight: 0.5 },
    ]);
  };

  const getStatusIcon = (status: ModelMergeJob["status"]) => {
    switch (status) {
      case "pending": return <Loader2 className="h-4 w-4 text-gray-500" />;
      case "merging": return <Loader2 className="h-4 w-4 text-brand-500 animate-spin" />;
      case "completed": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed": return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Model Merge</h1>
          <p className="text-gray-400 mt-1">Combine multiple models using various merge strategies</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
        >
          <GitMerge className="h-4 w-4" />
          New Merge
        </button>
      </div>

      {/* Merge Form */}
      {showForm && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 animate-slide-in space-y-6">
          <h2 className="text-lg font-semibold text-white">Configure Model Merge</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Job Name *</label>
              <input
                type="text"
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
                placeholder="my-merged-model"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Output Model Name *</label>
              <input
                type="text"
                value={outputName}
                onChange={(e) => setOutputName(e.target.value)}
                placeholder="merged-llama-mistral"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Strategy Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Merge Strategy</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {MERGE_STRATEGIES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStrategy(s.value)}
                  className={`rounded-lg border p-3 text-left transition-colors ${
                    strategy === s.value
                      ? "border-brand-500 bg-brand-500/10"
                      : "border-gray-700 bg-gray-800 hover:bg-gray-700"
                  }`}
                >
                  <p className="text-sm font-medium text-white">{s.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Source Models */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-400">Source Models</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={normalizeWeights}
                  className="text-xs text-brand-400 hover:text-brand-300"
                >
                  Normalize Weights
                </button>
                <button
                  onClick={addSource}
                  className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300"
                >
                  <Plus className="h-3 w-3" />
                  Add Model
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {sources.map((source, idx) => (
                <div key={idx} className="flex items-center gap-3 rounded-lg border border-gray-700 bg-gray-800/50 p-3">
                  <Layers className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <select
                    value={source.model_id}
                    onChange={(e) => updateSource(idx, "model_id", e.target.value)}
                    className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm text-gray-200 focus:border-brand-500 focus:outline-none"
                  >
                    <option value="">Select model...</option>
                    {models.map((m) => (
                      <option key={m.id} value={m.id}>{m.name} ({m.parameter_size})</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <label className="text-xs text-gray-500">Weight:</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      max="1"
                      value={source.weight}
                      onChange={(e) => updateSource(idx, "weight", parseFloat(e.target.value))}
                      className="w-20 rounded-lg border border-gray-700 bg-gray-800 px-2 py-1.5 text-sm text-gray-200 text-center focus:border-brand-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => removeSource(idx)}
                    className="flex-shrink-0 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Weight Visualization */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">Weight Distribution</label>
            <div className="flex h-6 rounded-lg overflow-hidden bg-gray-800">
              {sources.filter((s) => s.model_id).map((source, idx) => {
                const colors = ["bg-blue-500", "bg-purple-500", "bg-green-500", "bg-orange-500", "bg-pink-500"];
                const total = sources.reduce((acc, s) => acc + s.weight, 0);
                const pct = total > 0 ? (source.weight / total) * 100 : 0;
                return (
                  <div
                    key={idx}
                    className={`${colors[idx % colors.length]} flex items-center justify-center text-xs text-white font-medium transition-all duration-300`}
                    style={{ width: `${pct}%` }}
                    title={`${source.model_name}: ${pct.toFixed(1)}%`}
                  >
                    {pct >= 15 ? `${pct.toFixed(0)}%` : ""}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Advanced Settings */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Settings className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-300">Advanced Settings</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Base Model (optional)</label>
                <select
                  value={baseModelId}
                  onChange={(e) => setBaseModelId(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-2.5 py-2 text-sm text-gray-200 focus:border-brand-500 focus:outline-none"
                >
                  <option value="">None</option>
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Density</label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  value={density}
                  onChange={(e) => setDensity(parseFloat(e.target.value))}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-2.5 py-2 text-sm text-gray-200 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={normalize}
                    onChange={(e) => setNormalize(e.target.checked)}
                    className="rounded border-gray-600 bg-gray-800 text-brand-500 focus:ring-brand-500"
                  />
                  <span className="text-sm text-gray-300">Normalize Weights</span>
                </label>
              </div>
            </div>
          </div>

          {/* Launch */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
            <button
              onClick={handleLaunch}
              className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
            >
              <Play className="h-4 w-4" />
              Launch Merge
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

      {/* Jobs List */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Merge Jobs ({mergeJobs.length})
        </h2>
        {mergeJobs.length > 0 ? (
          <div className="space-y-3">
            {mergeJobs.map((job) => (
              <div key={job.id} className="rounded-lg border border-gray-800 bg-gray-800/50 p-4">
                <div className="flex items-center gap-3 mb-3">
                  {getStatusIcon(job.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-white">{job.job_name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        job.status === "completed" ? "text-green-400 bg-green-500/10" :
                        job.status === "merging" ? "text-brand-400 bg-brand-500/10" :
                        job.status === "failed" ? "text-red-400 bg-red-500/10" :
                        "text-gray-400 bg-gray-500/10"
                      }`}>
                        {job.status}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                        {job.merge_strategy}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {job.source_models.map((s) => s.model_name).join(" + ")} → {job.output_model_name}
                    </p>
                  </div>
                </div>

                {/* Source model weights */}
                <div className="flex h-4 rounded-lg overflow-hidden bg-gray-700 mb-2">
                  {job.source_models.map((source, idx) => {
                    const colors = ["bg-blue-500", "bg-purple-500", "bg-green-500", "bg-orange-500", "bg-pink-500"];
                    const total = job.source_models.reduce((acc, s) => acc + s.weight, 0);
                    const pct = total > 0 ? (source.weight / total) * 100 : 0;
                    return (
                      <div
                        key={idx}
                        className={`${colors[idx % colors.length]} flex items-center justify-center text-[10px] text-white font-medium`}
                        style={{ width: `${pct}%` }}
                        title={`${source.model_name}: ${source.weight}`}
                      >
                        {pct >= 20 ? source.model_name.split(" ")[0] : ""}
                      </div>
                    );
                  })}
                </div>

                {(job.status === "merging" || job.status === "completed") && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Progress</span>
                      <span>{job.progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          job.status === "completed"
                            ? "bg-gradient-to-r from-green-600 to-green-400"
                            : "bg-gradient-to-r from-brand-600 to-brand-400"
                        }`}
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {job.status === "completed" && job.output_model_path && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-green-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Output: <span className="font-mono">{job.output_model_path}</span>
                  </div>
                )}

                {job.error_message && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-red-400">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {job.error_message}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <GitMerge className="h-10 w-10 text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No merge jobs yet</p>
            <p className="text-xs text-gray-600">Create a new merge to combine models</p>
          </div>
        )}
      </div>
    </div>
  );
}
