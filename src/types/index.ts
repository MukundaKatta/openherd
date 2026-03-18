export interface Model {
  id: string;
  name: string;
  slug: string;
  author: string;
  description: string;
  long_description: string;
  architecture: ModelArchitecture;
  parameter_size: string;
  parameter_count: number;
  license: string;
  task_type: TaskType;
  tags: string[];
  downloads: number;
  likes: number;
  avg_rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
  huggingface_id: string | null;
  ollama_id: string | null;
  gguf_variants: GGUFVariant[];
  is_featured: boolean;
}

export type ModelArchitecture =
  | "transformer"
  | "llama"
  | "mistral"
  | "phi"
  | "gemma"
  | "qwen"
  | "mamba"
  | "rwkv"
  | "gpt-neox"
  | "falcon"
  | "bloom"
  | "starcoder"
  | "mixtral"
  | "command-r"
  | "deepseek"
  | "other";

export type TaskType =
  | "text-generation"
  | "chat"
  | "code-generation"
  | "summarization"
  | "translation"
  | "question-answering"
  | "text-classification"
  | "image-generation"
  | "embedding"
  | "multimodal"
  | "other";

export type QuantizationType =
  | "Q2_K"
  | "Q3_K_S"
  | "Q3_K_M"
  | "Q3_K_L"
  | "Q4_0"
  | "Q4_K_S"
  | "Q4_K_M"
  | "Q5_0"
  | "Q5_K_S"
  | "Q5_K_M"
  | "Q6_K"
  | "Q8_0"
  | "F16"
  | "F32";

export interface GGUFVariant {
  id: string;
  model_id: string;
  filename: string;
  quantization: QuantizationType;
  file_size_bytes: number;
  quality_score: number;
  download_url: string;
  sha256: string;
  created_at: string;
}

export interface OllamaInstance {
  id: string;
  model_id: string;
  model_name: string;
  status: "pulling" | "running" | "stopped" | "error";
  port: number;
  pull_progress: number;
  created_at: string;
  last_active: string;
  gpu_layers: number;
  context_size: number;
}

export interface BenchmarkResult {
  id: string;
  model_id: string;
  benchmark_name: string;
  benchmark_suite: BenchmarkSuite;
  score: number;
  max_score: number;
  metadata: Record<string, unknown>;
  run_at: string;
  duration_seconds: number;
}

export type BenchmarkSuite =
  | "mmlu"
  | "hellaswag"
  | "arc"
  | "truthfulqa"
  | "winogrande"
  | "gsm8k"
  | "humaneval"
  | "mt-bench"
  | "alpaca-eval"
  | "custom";

export interface FineTuneJob {
  id: string;
  model_id: string;
  base_model_name: string;
  job_name: string;
  status: "pending" | "preparing" | "training" | "completed" | "failed" | "cancelled";
  method: "lora" | "qlora";
  config: FineTuneConfig;
  dataset_filename: string;
  dataset_size: number;
  progress: number;
  current_epoch: number;
  current_loss: number;
  training_logs: TrainingLogEntry[];
  output_model_path: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
}

export interface FineTuneConfig {
  learning_rate: number;
  num_epochs: number;
  batch_size: number;
  max_seq_length: number;
  lora_r: number;
  lora_alpha: number;
  lora_dropout: number;
  target_modules: string[];
  warmup_steps: number;
  weight_decay: number;
  gradient_accumulation_steps: number;
  quantization_bits: 4 | 8 | null;
}

export interface TrainingLogEntry {
  epoch: number;
  step: number;
  loss: number;
  learning_rate: number;
  timestamp: string;
}

export interface ArenaMatch {
  id: string;
  model_a_id: string;
  model_b_id: string;
  model_a_name: string;
  model_b_name: string;
  prompt: string;
  response_a: string;
  response_b: string;
  winner: "a" | "b" | "tie" | null;
  voter_id: string;
  created_at: string;
}

export interface ArenaLeaderboard {
  model_id: string;
  model_name: string;
  elo_rating: number;
  total_matches: number;
  wins: number;
  losses: number;
  ties: number;
  win_rate: number;
}

export interface Review {
  id: string;
  model_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  title: string;
  content: string;
  use_case: string;
  pros: string[];
  cons: string[];
  helpful_count: number;
  created_at: string;
  updated_at: string;
}

export interface APIEndpoint {
  id: string;
  model_id: string;
  model_name: string;
  endpoint_url: string;
  port: number;
  status: "active" | "inactive" | "starting" | "error";
  format: "openai" | "custom";
  api_key: string;
  max_tokens: number;
  temperature: number;
  request_count: number;
  created_at: string;
  last_request_at: string | null;
}

export interface ResourceUsage {
  timestamp: string;
  cpu_percent: number;
  memory_used_mb: number;
  memory_total_mb: number;
  gpu_percent: number;
  gpu_memory_used_mb: number;
  gpu_memory_total_mb: number;
  gpu_temperature: number;
  disk_read_mb_s: number;
  disk_write_mb_s: number;
  network_in_mb_s: number;
  network_out_mb_s: number;
}

export interface ModelMergeJob {
  id: string;
  job_name: string;
  source_models: MergeSource[];
  merge_strategy: MergeStrategy;
  status: "pending" | "merging" | "completed" | "failed";
  progress: number;
  output_model_name: string;
  output_model_path: string | null;
  config: MergeConfig;
  created_at: string;
  completed_at: string | null;
  error_message: string | null;
}

export interface MergeSource {
  model_id: string;
  model_name: string;
  weight: number;
}

export type MergeStrategy = "linear" | "slerp" | "ties" | "dare" | "passthrough" | "task_arithmetic";

export interface MergeConfig {
  strategy: MergeStrategy;
  base_model_id: string | null;
  interpolation_weight: number;
  density: number;
  normalize: boolean;
  custom_params: Record<string, unknown>;
}

export interface ModelFilters {
  search: string;
  architecture: ModelArchitecture | "";
  task_type: TaskType | "";
  license: string;
  min_size: string;
  max_size: string;
  sort_by: "downloads" | "likes" | "rating" | "newest" | "name";
  sort_order: "asc" | "desc";
}
