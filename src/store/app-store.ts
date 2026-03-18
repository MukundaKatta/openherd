"use client";

import { create } from "zustand";
import {
  Model, ModelFilters, OllamaInstance, BenchmarkResult, FineTuneJob,
  ArenaMatch, ArenaLeaderboard, Review, APIEndpoint, ResourceUsage,
  ModelMergeJob, GGUFVariant
} from "@/types";
import {
  SEED_MODELS, SEED_BENCHMARKS, SEED_ARENA_LEADERBOARD,
  SEED_REVIEWS, SEED_GGUF_VARIANTS
} from "@/lib/seed-data";

interface AppState {
  // Models
  models: Model[];
  selectedModel: Model | null;
  filters: ModelFilters;
  setModels: (models: Model[]) => void;
  setSelectedModel: (model: Model | null) => void;
  setFilters: (filters: Partial<ModelFilters>) => void;
  getFilteredModels: () => Model[];

  // Ollama
  ollamaConnected: boolean;
  ollamaInstances: OllamaInstance[];
  setOllamaConnected: (connected: boolean) => void;
  setOllamaInstances: (instances: OllamaInstance[]) => void;
  addOllamaInstance: (instance: OllamaInstance) => void;
  updateOllamaInstance: (id: string, updates: Partial<OllamaInstance>) => void;
  removeOllamaInstance: (id: string) => void;

  // Benchmarks
  benchmarks: BenchmarkResult[];
  setBenchmarks: (benchmarks: BenchmarkResult[]) => void;

  // GGUF
  ggufVariants: GGUFVariant[];
  setGGUFVariants: (variants: GGUFVariant[]) => void;

  // Fine-tuning
  fineTuneJobs: FineTuneJob[];
  setFineTuneJobs: (jobs: FineTuneJob[]) => void;
  addFineTuneJob: (job: FineTuneJob) => void;
  updateFineTuneJob: (id: string, updates: Partial<FineTuneJob>) => void;

  // Arena
  arenaMatches: ArenaMatch[];
  arenaLeaderboard: ArenaLeaderboard[];
  setArenaMatches: (matches: ArenaMatch[]) => void;
  setArenaLeaderboard: (leaderboard: ArenaLeaderboard[]) => void;
  addArenaMatch: (match: ArenaMatch) => void;

  // Reviews
  reviews: Review[];
  setReviews: (reviews: Review[]) => void;
  addReview: (review: Review) => void;

  // API Endpoints
  apiEndpoints: APIEndpoint[];
  setApiEndpoints: (endpoints: APIEndpoint[]) => void;
  addApiEndpoint: (endpoint: APIEndpoint) => void;
  updateApiEndpoint: (id: string, updates: Partial<APIEndpoint>) => void;
  removeApiEndpoint: (id: string) => void;

  // Resource Monitor
  resourceHistory: ResourceUsage[];
  currentResources: ResourceUsage | null;
  setResourceHistory: (history: ResourceUsage[]) => void;
  addResourceSnapshot: (snapshot: ResourceUsage) => void;

  // Model Merging
  mergeJobs: ModelMergeJob[];
  setMergeJobs: (jobs: ModelMergeJob[]) => void;
  addMergeJob: (job: ModelMergeJob) => void;
  updateMergeJob: (id: string, updates: Partial<ModelMergeJob>) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Models
  models: SEED_MODELS.map((m) => ({
    ...m,
    gguf_variants: SEED_GGUF_VARIANTS.filter((g) => g.model_id === m.id),
  })),
  selectedModel: null,
  filters: {
    search: "",
    architecture: "",
    task_type: "",
    license: "",
    min_size: "",
    max_size: "",
    sort_by: "downloads",
    sort_order: "desc",
  },
  setModels: (models) => set({ models }),
  setSelectedModel: (model) => set({ selectedModel: model }),
  setFilters: (newFilters) =>
    set((state) => ({ filters: { ...state.filters, ...newFilters } })),
  getFilteredModels: () => {
    const { models, filters } = get();
    let filtered = [...models];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.author.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (filters.architecture) {
      filtered = filtered.filter((m) => m.architecture === filters.architecture);
    }
    if (filters.task_type) {
      filtered = filtered.filter((m) => m.task_type === filters.task_type);
    }
    if (filters.license) {
      filtered = filtered.filter((m) =>
        m.license.toLowerCase().includes(filters.license.toLowerCase())
      );
    }

    const sortKey = filters.sort_by;
    const sortDir = filters.sort_order === "asc" ? 1 : -1;
    filtered.sort((a, b) => {
      switch (sortKey) {
        case "downloads": return (a.downloads - b.downloads) * sortDir;
        case "likes": return (a.likes - b.likes) * sortDir;
        case "rating": return (a.avg_rating - b.avg_rating) * sortDir;
        case "newest": return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * sortDir;
        case "name": return a.name.localeCompare(b.name) * sortDir;
        default: return 0;
      }
    });

    return filtered;
  },

  // Ollama
  ollamaConnected: false,
  ollamaInstances: [],
  setOllamaConnected: (connected) => set({ ollamaConnected: connected }),
  setOllamaInstances: (instances) => set({ ollamaInstances: instances }),
  addOllamaInstance: (instance) =>
    set((state) => ({ ollamaInstances: [...state.ollamaInstances, instance] })),
  updateOllamaInstance: (id, updates) =>
    set((state) => ({
      ollamaInstances: state.ollamaInstances.map((i) =>
        i.id === id ? { ...i, ...updates } : i
      ),
    })),
  removeOllamaInstance: (id) =>
    set((state) => ({
      ollamaInstances: state.ollamaInstances.filter((i) => i.id !== id),
    })),

  // Benchmarks
  benchmarks: SEED_BENCHMARKS,
  setBenchmarks: (benchmarks) => set({ benchmarks }),

  // GGUF
  ggufVariants: SEED_GGUF_VARIANTS,
  setGGUFVariants: (variants) => set({ ggufVariants: variants }),

  // Fine-tuning
  fineTuneJobs: [],
  setFineTuneJobs: (jobs) => set({ fineTuneJobs: jobs }),
  addFineTuneJob: (job) =>
    set((state) => ({ fineTuneJobs: [...state.fineTuneJobs, job] })),
  updateFineTuneJob: (id, updates) =>
    set((state) => ({
      fineTuneJobs: state.fineTuneJobs.map((j) =>
        j.id === id ? { ...j, ...updates } : j
      ),
    })),

  // Arena
  arenaMatches: [],
  arenaLeaderboard: SEED_ARENA_LEADERBOARD,
  setArenaMatches: (matches) => set({ arenaMatches: matches }),
  setArenaLeaderboard: (leaderboard) => set({ arenaLeaderboard: leaderboard }),
  addArenaMatch: (match) =>
    set((state) => ({ arenaMatches: [...state.arenaMatches, match] })),

  // Reviews
  reviews: SEED_REVIEWS,
  setReviews: (reviews) => set({ reviews }),
  addReview: (review) =>
    set((state) => ({ reviews: [review, ...state.reviews] })),

  // API Endpoints
  apiEndpoints: [],
  setApiEndpoints: (endpoints) => set({ apiEndpoints: endpoints }),
  addApiEndpoint: (endpoint) =>
    set((state) => ({ apiEndpoints: [...state.apiEndpoints, endpoint] })),
  updateApiEndpoint: (id, updates) =>
    set((state) => ({
      apiEndpoints: state.apiEndpoints.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    })),
  removeApiEndpoint: (id) =>
    set((state) => ({
      apiEndpoints: state.apiEndpoints.filter((e) => e.id !== id),
    })),

  // Resource Monitor
  resourceHistory: [],
  currentResources: null,
  setResourceHistory: (history) => set({ resourceHistory: history }),
  addResourceSnapshot: (snapshot) =>
    set((state) => ({
      currentResources: snapshot,
      resourceHistory: [...state.resourceHistory.slice(-59), snapshot],
    })),

  // Model Merging
  mergeJobs: [],
  setMergeJobs: (jobs) => set({ mergeJobs: jobs }),
  addMergeJob: (job) =>
    set((state) => ({ mergeJobs: [...state.mergeJobs, job] })),
  updateMergeJob: (id, updates) =>
    set((state) => ({
      mergeJobs: state.mergeJobs.map((j) =>
        j.id === id ? { ...j, ...updates } : j
      ),
    })),
}));
