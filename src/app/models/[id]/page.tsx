"use client";

import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { formatNumber, formatBytes, getQuantizationQuality } from "@/lib/utils";
import Link from "next/link";
import {
  ArrowLeft, Download, Star, Heart, Tag, Cpu, Scale, FileCode,
  Rocket, BarChart3, MessageSquare, ExternalLink, Clock
} from "lucide-react";

export default function ModelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { models, benchmarks, reviews } = useAppStore();

  const model = models.find((m) => m.id === params.id);
  if (!model) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-gray-400">Model not found</h2>
        <Link href="/models" className="text-brand-400 hover:text-brand-300 mt-2 inline-block">
          Back to catalog
        </Link>
      </div>
    );
  }

  const modelBenchmarks = benchmarks.filter((b) => b.model_id === model.id);
  const modelReviews = reviews.filter((r) => r.model_id === model.id);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to catalog
      </button>

      {/* Header */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white text-2xl font-bold">
            {model.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white">{model.name}</h1>
              {model.is_featured && (
                <span className="px-2.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-medium">
                  Featured
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400 mb-4">by {model.author}</p>
            <p className="text-gray-300 leading-relaxed">{model.long_description}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t border-gray-800">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mb-1">
              <Download className="h-3.5 w-3.5" /> Downloads
            </div>
            <p className="text-lg font-semibold text-white">{formatNumber(model.downloads)}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mb-1">
              <Heart className="h-3.5 w-3.5" /> Likes
            </div>
            <p className="text-lg font-semibold text-white">{formatNumber(model.likes)}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mb-1">
              <Star className="h-3.5 w-3.5 text-yellow-500" /> Rating
            </div>
            <p className="text-lg font-semibold text-white">{model.avg_rating.toFixed(1)} / 5.0</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mb-1">
              <Cpu className="h-3.5 w-3.5" /> Parameters
            </div>
            <p className="text-lg font-semibold text-white">{model.parameter_size}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mb-1">
              <MessageSquare className="h-3.5 w-3.5" /> Reviews
            </div>
            <p className="text-lg font-semibold text-white">{model.review_count}</p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-6">
          {model.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-800 text-xs text-gray-400"
            >
              <Tag className="h-3 w-3" />
              {tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-800">
          {model.ollama_id && (
            <Link
              href={`/deploy?model=${model.id}`}
              className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
            >
              <Rocket className="h-4 w-4" />
              Deploy with Ollama
            </Link>
          )}
          <Link
            href={`/benchmarks?model=${model.id}`}
            className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            View Benchmarks
          </Link>
          {model.huggingface_id && (
            <a
              href={`https://huggingface.co/${model.huggingface_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              HuggingFace
            </a>
          )}
        </div>
      </div>

      {/* Model Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Model Details</h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Architecture</dt>
              <dd className="text-sm text-gray-200 capitalize">{model.architecture}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Task Type</dt>
              <dd className="text-sm text-gray-200">{model.task_type}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">License</dt>
              <dd className="text-sm text-gray-200">{model.license}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Parameters</dt>
              <dd className="text-sm text-gray-200">{model.parameter_size}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Ollama ID</dt>
              <dd className="text-sm text-gray-200 font-mono">{model.ollama_id || "N/A"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Created</dt>
              <dd className="text-sm text-gray-200">{new Date(model.created_at).toLocaleDateString()}</dd>
            </div>
          </dl>
        </div>

        {/* Benchmarks Preview */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Benchmark Scores</h2>
          {modelBenchmarks.length > 0 ? (
            <div className="space-y-3">
              {modelBenchmarks.map((b) => (
                <div key={b.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-400">{b.benchmark_name}</span>
                    <span className="text-sm font-medium text-white">{b.score.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400"
                      style={{ width: `${(b.score / b.max_score) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No benchmark results available</p>
          )}
        </div>
      </div>

      {/* GGUF Variants */}
      {model.gguf_variants.length > 0 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">GGUF Variants</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-800">
                  <th className="pb-3 font-medium">Quantization</th>
                  <th className="pb-3 font-medium">File Size</th>
                  <th className="pb-3 font-medium">Quality</th>
                  <th className="pb-3 font-medium">Filename</th>
                  <th className="pb-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {model.gguf_variants.map((v) => {
                  const quality = getQuantizationQuality(v.quantization);
                  return (
                    <tr key={v.id} className="border-b border-gray-800/50">
                      <td className="py-3 font-mono text-gray-200">{v.quantization}</td>
                      <td className="py-3 text-gray-300">{formatBytes(v.file_size_bytes)}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 rounded-full bg-gray-800 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${quality.quality}%`, backgroundColor: quality.color }}
                            />
                          </div>
                          <span className="text-xs" style={{ color: quality.color }}>
                            {quality.label}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-gray-400 font-mono text-xs">{v.filename}</td>
                      <td className="py-3 text-right">
                        <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-600/10 text-brand-400 text-xs hover:bg-brand-600/20 transition-colors">
                          <Download className="h-3 w-3" />
                          Download
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Community Reviews</h2>
          <Link
            href={`/reviews?model=${model.id}`}
            className="text-sm text-brand-400 hover:text-brand-300"
          >
            Write a review
          </Link>
        </div>
        {modelReviews.length > 0 ? (
          <div className="space-y-4">
            {modelReviews.map((review) => (
              <div key={review.id} className="border-b border-gray-800 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm font-medium text-gray-400">
                    {review.user_name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-200">{review.user_name}</p>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-700"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="ml-auto text-xs text-gray-600">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="text-sm font-medium text-white mb-1">{review.title}</h4>
                <p className="text-sm text-gray-400">{review.content}</p>
                {(review.pros.length > 0 || review.cons.length > 0) && (
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    {review.pros.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-green-400 mb-1">Pros</p>
                        <ul className="space-y-1">
                          {review.pros.map((p, i) => (
                            <li key={i} className="text-xs text-gray-400">+ {p}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {review.cons.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-red-400 mb-1">Cons</p>
                        <ul className="space-y-1">
                          {review.cons.map((c, i) => (
                            <li key={i} className="text-xs text-gray-400">- {c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No reviews yet. Be the first to review!</p>
        )}
      </div>
    </div>
  );
}
