-- OpenHerd Database Schema

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Models table
CREATE TABLE models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  author TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT NOT NULL DEFAULT '',
  architecture TEXT NOT NULL,
  parameter_size TEXT NOT NULL,
  parameter_count BIGINT NOT NULL DEFAULT 0,
  license TEXT NOT NULL DEFAULT '',
  task_type TEXT NOT NULL DEFAULT 'text-generation',
  tags TEXT[] NOT NULL DEFAULT '{}',
  downloads BIGINT NOT NULL DEFAULT 0,
  likes BIGINT NOT NULL DEFAULT 0,
  avg_rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count INT NOT NULL DEFAULT 0,
  huggingface_id TEXT,
  ollama_id TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_models_slug ON models(slug);
CREATE INDEX idx_models_architecture ON models(architecture);
CREATE INDEX idx_models_task_type ON models(task_type);
CREATE INDEX idx_models_downloads ON models(downloads DESC);
CREATE INDEX idx_models_likes ON models(likes DESC);
CREATE INDEX idx_models_avg_rating ON models(avg_rating DESC);

-- GGUF Variants
CREATE TABLE gguf_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  quantization TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL DEFAULT 0,
  quality_score INT NOT NULL DEFAULT 50,
  download_url TEXT NOT NULL DEFAULT '',
  sha256 TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_gguf_model_id ON gguf_variants(model_id);
CREATE INDEX idx_gguf_quantization ON gguf_variants(quantization);

-- Benchmark Results
CREATE TABLE benchmark_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  benchmark_name TEXT NOT NULL,
  benchmark_suite TEXT NOT NULL,
  score NUMERIC(8,2) NOT NULL,
  max_score NUMERIC(8,2) NOT NULL DEFAULT 100,
  metadata JSONB NOT NULL DEFAULT '{}',
  run_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration_seconds INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_benchmarks_model_id ON benchmark_results(model_id);
CREATE INDEX idx_benchmarks_suite ON benchmark_results(benchmark_suite);

-- Ollama Instances
CREATE TABLE ollama_instances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  model_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'stopped',
  port INT NOT NULL DEFAULT 11434,
  pull_progress NUMERIC(5,2) NOT NULL DEFAULT 0,
  gpu_layers INT NOT NULL DEFAULT 0,
  context_size INT NOT NULL DEFAULT 4096,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fine-Tune Jobs
CREATE TABLE finetune_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  base_model_name TEXT NOT NULL,
  job_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  method TEXT NOT NULL DEFAULT 'qlora',
  config JSONB NOT NULL DEFAULT '{}',
  dataset_filename TEXT NOT NULL DEFAULT '',
  dataset_size BIGINT NOT NULL DEFAULT 0,
  progress NUMERIC(5,2) NOT NULL DEFAULT 0,
  current_epoch INT NOT NULL DEFAULT 0,
  current_loss NUMERIC(10,6) NOT NULL DEFAULT 0,
  training_logs JSONB NOT NULL DEFAULT '[]',
  output_model_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

CREATE INDEX idx_finetune_model_id ON finetune_jobs(model_id);
CREATE INDEX idx_finetune_status ON finetune_jobs(status);

-- Arena Matches
CREATE TABLE arena_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_a_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  model_b_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  model_a_name TEXT NOT NULL,
  model_b_name TEXT NOT NULL,
  prompt TEXT NOT NULL DEFAULT '',
  response_a TEXT NOT NULL DEFAULT '',
  response_b TEXT NOT NULL DEFAULT '',
  winner TEXT NOT NULL DEFAULT '',
  voter_id TEXT NOT NULL DEFAULT 'anonymous',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_arena_model_a ON arena_matches(model_a_id);
CREATE INDEX idx_arena_model_b ON arena_matches(model_b_id);

-- Arena Leaderboard (materialized for performance)
CREATE TABLE arena_leaderboard (
  model_id UUID PRIMARY KEY REFERENCES models(id) ON DELETE CASCADE,
  model_name TEXT NOT NULL,
  elo_rating INT NOT NULL DEFAULT 1200,
  total_matches INT NOT NULL DEFAULT 0,
  wins INT NOT NULL DEFAULT 0,
  losses INT NOT NULL DEFAULT 0,
  ties INT NOT NULL DEFAULT 0,
  win_rate NUMERIC(5,2) NOT NULL DEFAULT 0
);

CREATE INDEX idx_leaderboard_elo ON arena_leaderboard(elo_rating DESC);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  use_case TEXT NOT NULL DEFAULT '',
  pros TEXT[] NOT NULL DEFAULT '{}',
  cons TEXT[] NOT NULL DEFAULT '{}',
  helpful_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_model_id ON reviews(model_id);
CREATE INDEX idx_reviews_rating ON reviews(rating DESC);

-- API Endpoints
CREATE TABLE api_endpoints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id UUID NOT NULL REFERENCES models(id) ON DELETE CASCADE,
  model_name TEXT NOT NULL,
  endpoint_url TEXT NOT NULL,
  port INT NOT NULL DEFAULT 8080,
  status TEXT NOT NULL DEFAULT 'inactive',
  format TEXT NOT NULL DEFAULT 'openai',
  api_key TEXT NOT NULL,
  max_tokens INT NOT NULL DEFAULT 2048,
  temperature NUMERIC(3,2) NOT NULL DEFAULT 0.7,
  request_count BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_request_at TIMESTAMPTZ
);

CREATE INDEX idx_endpoints_model_id ON api_endpoints(model_id);
CREATE INDEX idx_endpoints_status ON api_endpoints(status);

-- Model Merge Jobs
CREATE TABLE merge_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_name TEXT NOT NULL,
  source_models JSONB NOT NULL DEFAULT '[]',
  merge_strategy TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  progress NUMERIC(5,2) NOT NULL DEFAULT 0,
  output_model_name TEXT NOT NULL DEFAULT '',
  output_model_path TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

CREATE INDEX idx_merge_status ON merge_jobs(status);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER models_updated_at
  BEFORE UPDATE ON models
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update avg_rating trigger
CREATE OR REPLACE FUNCTION update_model_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE models SET
    avg_rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE model_id = COALESCE(NEW.model_id, OLD.model_id)),
    review_count = (SELECT COUNT(*) FROM reviews WHERE model_id = COALESCE(NEW.model_id, OLD.model_id))
  WHERE id = COALESCE(NEW.model_id, OLD.model_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reviews_rating_insert
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_model_rating();

CREATE TRIGGER reviews_rating_update
  AFTER UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_model_rating();

CREATE TRIGGER reviews_rating_delete
  AFTER DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_model_rating();
