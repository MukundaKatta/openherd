"use client";

import { useState, useCallback } from "react";
import { useAppStore } from "@/store/app-store";
import { FineTuneJob, FineTuneConfig } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { formatDuration } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  Wrench, Upload, Play, Pause, X, Loader2, CheckCircle2,
  AlertCircle, Clock, Cpu, Zap, Settings, FileText, Trash2
} from "lucide-react";

const DEFAULT_CONFIG: FineTuneConfig = {
  learning_rate: 2e-4,
  num_epochs: 3,
  batch_size: 4,
  max_seq_length: 2048,
  lora_r: 16,
  lora_alpha: 32,
  lora_dropout: 0.05,
  target_modules: ["q_proj", "v_proj", "k_proj", "o_proj"],
  warmup_steps: 100,
  weight_decay: 0.01,
  gradient_accumulation_steps: 4,
  quantization_bits: 4,
};

const TARGET_MODULES_OPTIONS = [
  "q_proj", "v_proj", "k_proj", "o_proj", "gate_proj", "up_proj", "down_proj",
  "embed_tokens", "lm_head",
];

export default function FineTunePage() {
  const { models, fineTuneJobs, addFineTuneJob, updateFineTuneJob } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState("");
  const [jobName, setJobName] = useState("");
  const [method, setMethod] = useState<"lora" | "qlora">("qlora");
  const [config, setConfig] = useState<FineTuneConfig>(DEFAULT_CONFIG);
  const [datasetFile, setDatasetFile] = useState<File | null>(null);

  const handleFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".json") || file.name.endsWith(".jsonl") || file.name.endsWith(".csv"))) {
      setDatasetFile(file);
    } else {
      toast.error("Please upload a .json, .jsonl, or .csv file");
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setDatasetFile(file);
  };

  const toggleModule = (mod: string) => {
    setConfig((prev) => ({
      ...prev,
      target_modules: prev.target_modules.includes(mod)
        ? prev.target_modules.filter((m) => m !== mod)
        : [...prev.target_modules, mod],
    }));
  };

  const handleLaunch = () => {
    if (!selectedModelId || !jobName || !datasetFile) {
      toast.error("Please fill in all required fields");
      return;
    }

    const model = models.find((m) => m.id === selectedModelId);
    if (!model) return;

    const job: FineTuneJob = {
      id: uuidv4(),
      model_id: selectedModelId,
      base_model_name: model.name,
      job_name: jobName,
      status: "pending",
      method,
      config,
      dataset_filename: datasetFile.name,
      dataset_size: datasetFile.size,
      progress: 0,
      current_epoch: 0,
      current_loss: 0,
      training_logs: [],
      output_model_path: null,
      created_at: new Date().toISOString(),
      started_at: null,
      completed_at: null,
      error_message: null,
    };

    addFineTuneJob(job);
    toast.success("Fine-tuning job created!");

    // Simulate training progress
    let progress = 0;
    let epoch = 0;
    let loss = 2.5;

    setTimeout(() => {
      updateFineTuneJob(job.id, { status: "preparing", started_at: new Date().toISOString() });
    }, 1000);

    setTimeout(() => {
      updateFineTuneJob(job.id, { status: "training" });
      const interval = setInterval(() => {
        progress += Math.random() * 5 + 1;
        loss = Math.max(0.3, loss - Math.random() * 0.15);
        epoch = Math.floor(progress / (100 / config.num_epochs));

        if (progress >= 100) {
          clearInterval(interval);
          updateFineTuneJob(job.id, {
            status: "completed",
            progress: 100,
            current_epoch: config.num_epochs,
            current_loss: loss,
            completed_at: new Date().toISOString(),
            output_model_path: `/models/finetuned/${jobName.replace(/\s+/g, "-").toLowerCase()}`,
          });
          toast.success(`Fine-tuning job "${jobName}" completed!`);
          return;
        }

        updateFineTuneJob(job.id, {
          progress: Math.min(progress, 100),
          current_epoch: Math.min(epoch + 1, config.num_epochs),
          current_loss: parseFloat(loss.toFixed(4)),
          training_logs: [
            ...(fineTuneJobs.find((j) => j.id === job.id)?.training_logs || []),
            {
              epoch: epoch + 1,
              step: Math.floor(progress * 10),
              loss,
              learning_rate: config.learning_rate * (1 - progress / 100),
              timestamp: new Date().toISOString(),
            },
          ],
        });
      }, 800);
    }, 3000);

    setShowForm(false);
    setJobName("");
    setSelectedModelId("");
    setDatasetFile(null);
    setConfig(DEFAULT_CONFIG);
  };

  const getStatusIcon = (status: FineTuneJob["status"]) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4 text-gray-500" />;
      case "preparing": return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case "training": return <Loader2 className="h-4 w-4 text-brand-500 animate-spin" />;
      case "completed": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed": return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "cancelled": return <X className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: FineTuneJob["status"]) => {
    switch (status) {
      case "pending": return "text-gray-400 bg-gray-500/10";
      case "preparing": return "text-blue-400 bg-blue-500/10";
      case "training": return "text-brand-400 bg-brand-500/10";
      case "completed": return "text-green-400 bg-green-500/10";
      case "failed": return "text-red-400 bg-red-500/10";
      case "cancelled": return "text-gray-400 bg-gray-500/10";
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Fine-Tuning</h1>
          <p className="text-gray-400 mt-1">Configure and launch LoRA/QLoRA fine-tuning jobs</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
        >
          <Wrench className="h-4 w-4" />
          New Fine-Tune Job
        </button>
      </div>

      {/* Job Creation Form */}
      {showForm && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 animate-slide-in space-y-6">
          <h2 className="text-lg font-semibold text-white">Configure Fine-Tuning Job</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Job Name *</label>
              <input
                type="text"
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
                placeholder="my-finetuned-model"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Base Model *</label>
              <select
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 focus:border-brand-500 focus:outline-none"
              >
                <option value="">Select a model...</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.parameter_size})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Method */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Training Method</label>
            <div className="flex gap-3">
              <button
                onClick={() => setMethod("qlora")}
                className={`flex-1 rounded-lg border p-3 text-left transition-colors ${
                  method === "qlora"
                    ? "border-brand-500 bg-brand-500/10"
                    : "border-gray-700 bg-gray-800 hover:bg-gray-700"
                }`}
              >
                <p className="text-sm font-medium text-white">QLoRA</p>
                <p className="text-xs text-gray-500 mt-0.5">4-bit quantized LoRA. Lower memory, great quality.</p>
              </button>
              <button
                onClick={() => setMethod("lora")}
                className={`flex-1 rounded-lg border p-3 text-left transition-colors ${
                  method === "lora"
                    ? "border-brand-500 bg-brand-500/10"
                    : "border-gray-700 bg-gray-800 hover:bg-gray-700"
                }`}
              >
                <p className="text-sm font-medium text-white">LoRA</p>
                <p className="text-xs text-gray-500 mt-0.5">Full precision LoRA. Higher quality, more memory.</p>
              </button>
            </div>
          </div>

          {/* Dataset Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Training Dataset *</label>
            <div
              onDrop={handleFileDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-gray-600 transition-colors cursor-pointer"
              onClick={() => document.getElementById("dataset-upload")?.click()}
            >
              {datasetFile ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="h-5 w-5 text-brand-400" />
                  <div>
                    <p className="text-sm text-white">{datasetFile.name}</p>
                    <p className="text-xs text-gray-500">{(datasetFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDatasetFile(null); }}
                    className="text-gray-500 hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Drop your dataset here or click to browse</p>
                  <p className="text-xs text-gray-600 mt-1">Supports .json, .jsonl, .csv</p>
                </>
              )}
              <input
                id="dataset-upload"
                type="file"
                accept=".json,.jsonl,.csv"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </div>

          {/* Hyperparameters */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Settings className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-medium text-gray-300">Hyperparameters</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Learning Rate</label>
                <input
                  type="number"
                  step="0.0001"
                  value={config.learning_rate}
                  onChange={(e) => setConfig({ ...config, learning_rate: parseFloat(e.target.value) })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-2.5 py-2 text-sm text-gray-200 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Epochs</label>
                <input
                  type="number"
                  value={config.num_epochs}
                  onChange={(e) => setConfig({ ...config, num_epochs: parseInt(e.target.value) })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-2.5 py-2 text-sm text-gray-200 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Batch Size</label>
                <input
                  type="number"
                  value={config.batch_size}
                  onChange={(e) => setConfig({ ...config, batch_size: parseInt(e.target.value) })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-2.5 py-2 text-sm text-gray-200 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max Seq Length</label>
                <input
                  type="number"
                  value={config.max_seq_length}
                  onChange={(e) => setConfig({ ...config, max_seq_length: parseInt(e.target.value) })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-2.5 py-2 text-sm text-gray-200 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">LoRA Rank (r)</label>
                <input
                  type="number"
                  value={config.lora_r}
                  onChange={(e) => setConfig({ ...config, lora_r: parseInt(e.target.value) })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-2.5 py-2 text-sm text-gray-200 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">LoRA Alpha</label>
                <input
                  type="number"
                  value={config.lora_alpha}
                  onChange={(e) => setConfig({ ...config, lora_alpha: parseInt(e.target.value) })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-2.5 py-2 text-sm text-gray-200 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">LoRA Dropout</label>
                <input
                  type="number"
                  step="0.01"
                  value={config.lora_dropout}
                  onChange={(e) => setConfig({ ...config, lora_dropout: parseFloat(e.target.value) })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-2.5 py-2 text-sm text-gray-200 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Grad Accum Steps</label>
                <input
                  type="number"
                  value={config.gradient_accumulation_steps}
                  onChange={(e) => setConfig({ ...config, gradient_accumulation_steps: parseInt(e.target.value) })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-2.5 py-2 text-sm text-gray-200 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Target Modules */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">Target Modules</label>
            <div className="flex flex-wrap gap-2">
              {TARGET_MODULES_OPTIONS.map((mod) => (
                <button
                  key={mod}
                  onClick={() => toggleModule(mod)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                    config.target_modules.includes(mod)
                      ? "bg-brand-600/20 text-brand-400 border border-brand-500/30"
                      : "bg-gray-800 text-gray-500 border border-gray-700 hover:text-gray-300"
                  }`}
                >
                  {mod}
                </button>
              ))}
            </div>
          </div>

          {/* Launch */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
            <button
              onClick={handleLaunch}
              className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
            >
              <Play className="h-4 w-4" />
              Launch Training
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex items-center gap-2 rounded-lg border border-gray-700 px-5 py-2.5 text-sm text-gray-400 hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Jobs List */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Training Jobs ({fineTuneJobs.length})
        </h2>
        {fineTuneJobs.length > 0 ? (
          <div className="space-y-3">
            {fineTuneJobs.map((job) => (
              <div
                key={job.id}
                className="rounded-lg border border-gray-800 bg-gray-800/50 p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  {getStatusIcon(job.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-white">{job.job_name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-gray-300">
                        {job.method.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Base: {job.base_model_name} · Dataset: {job.dataset_filename}
                    </p>
                  </div>
                  {(job.status === "pending" || job.status === "training") && (
                    <button
                      onClick={() => updateFineTuneJob(job.id, { status: "cancelled" })}
                      className="rounded-lg border border-gray-700 p-2 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {(job.status === "training" || job.status === "completed") && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Epoch {job.current_epoch}/{job.config.num_epochs}</span>
                      <span>Loss: {job.current_loss.toFixed(4)}</span>
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
            <Wrench className="h-10 w-10 text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No fine-tuning jobs yet</p>
            <p className="text-xs text-gray-600">Create a new job to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
