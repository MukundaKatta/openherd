"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { Review } from "@/types";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import {
  Star, MessageSquare, ThumbsUp, Plus, X, User, Send
} from "lucide-react";

export default function ReviewsPage() {
  const searchParams = useSearchParams();
  const preselectedModelId = searchParams.get("model") || "";
  const { models, reviews, addReview } = useAppStore();

  const [showForm, setShowForm] = useState(false);
  const [filterModelId, setFilterModelId] = useState(preselectedModelId);
  const [formData, setFormData] = useState({
    model_id: preselectedModelId,
    rating: 5,
    title: "",
    content: "",
    use_case: "",
    user_name: "",
    pros: [""],
    cons: [""],
  });

  const filteredReviews = filterModelId
    ? reviews.filter((r) => r.model_id === filterModelId)
    : reviews;

  const handleSubmit = () => {
    if (!formData.model_id || !formData.title || !formData.content || !formData.user_name) {
      toast.error("Please fill in all required fields");
      return;
    }

    const review: Review = {
      id: uuidv4(),
      model_id: formData.model_id,
      user_id: uuidv4(),
      user_name: formData.user_name,
      rating: formData.rating,
      title: formData.title,
      content: formData.content,
      use_case: formData.use_case,
      pros: formData.pros.filter(Boolean),
      cons: formData.cons.filter(Boolean),
      helpful_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    addReview(review);
    toast.success("Review submitted!");
    setShowForm(false);
    setFormData({
      model_id: "",
      rating: 5,
      title: "",
      content: "",
      use_case: "",
      user_name: "",
      pros: [""],
      cons: [""],
    });
  };

  const addProsCon = (type: "pros" | "cons") => {
    setFormData((prev) => ({
      ...prev,
      [type]: [...prev[type], ""],
    }));
  };

  const updateProsCon = (type: "pros" | "cons", index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].map((item, i) => (i === index ? value : item)),
    }));
  };

  const removeProsCon = (type: "pros" | "cons", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Community Reviews</h1>
          <p className="text-gray-400 mt-1">Read and write reviews for AI models</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Write Review
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <select
          value={filterModelId}
          onChange={(e) => setFilterModelId(e.target.value)}
          className="rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2.5 text-sm text-gray-300 focus:border-brand-500 focus:outline-none"
        >
          <option value="">All Models</option>
          {models.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
        <span className="text-sm text-gray-500">
          {filteredReviews.length} review{filteredReviews.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 animate-slide-in space-y-4">
          <h2 className="text-lg font-semibold text-white">Write a Review</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Your Name *</label>
              <input
                type="text"
                value={formData.user_name}
                onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1.5">Model *</label>
              <select
                value={formData.model_id}
                onChange={(e) => setFormData({ ...formData, model_id: e.target.value })}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 focus:border-brand-500 focus:outline-none"
              >
                <option value="">Select a model...</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Rating *</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="p-0.5"
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      star <= formData.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-700"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-400">{formData.rating}/5</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Summarize your experience"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Review *</label>
            <textarea
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Share your detailed experience with this model..."
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:border-brand-500 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Use Case</label>
            <input
              type="text"
              value={formData.use_case}
              onChange={(e) => setFormData({ ...formData, use_case: e.target.value })}
              placeholder="e.g. Code generation, Creative writing"
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-green-400 mb-1.5">Pros</label>
              {formData.pros.map((pro, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={pro}
                    onChange={(e) => updateProsCon("pros", i, e.target.value)}
                    placeholder="Add a pro..."
                    className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-brand-500 focus:outline-none"
                  />
                  {formData.pros.length > 1 && (
                    <button onClick={() => removeProsCon("pros", i)} className="text-gray-500 hover:text-red-400">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={() => addProsCon("pros")} className="text-xs text-green-400 hover:text-green-300">
                + Add pro
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-red-400 mb-1.5">Cons</label>
              {formData.cons.map((con, i) => (
                <div key={i} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={con}
                    onChange={(e) => updateProsCon("cons", i, e.target.value)}
                    placeholder="Add a con..."
                    className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-brand-500 focus:outline-none"
                  />
                  {formData.cons.length > 1 && (
                    <button onClick={() => removeProsCon("cons", i)} className="text-gray-500 hover:text-red-400">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              <button onClick={() => addProsCon("cons")} className="text-xs text-red-400 hover:text-red-300">
                + Add con
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
            >
              <Send className="h-4 w-4" />
              Submit Review
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

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review) => {
          const model = models.find((m) => m.id === review.model_id);
          return (
            <div key={review.id} className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-sm font-medium text-gray-400">
                  {review.user_name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{review.user_name}</span>
                    <span className="text-xs text-gray-600">reviewed</span>
                    <span className="text-sm font-medium text-brand-400">{model?.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3.5 w-3.5 ${
                            star <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-700"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                    {review.use_case && (
                      <span className="px-2 py-0.5 rounded-full bg-gray-800 text-xs text-gray-400">
                        {review.use_case}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <h3 className="text-sm font-semibold text-white mb-1">{review.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{review.content}</p>

              {(review.pros.length > 0 || review.cons.length > 0) && (
                <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-gray-800">
                  {review.pros.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-green-400 mb-1">Pros</p>
                      <ul className="space-y-0.5">
                        {review.pros.map((p, i) => (
                          <li key={i} className="text-xs text-gray-400">+ {p}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {review.cons.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-red-400 mb-1">Cons</p>
                      <ul className="space-y-0.5">
                        {review.cons.map((c, i) => (
                          <li key={i} className="text-xs text-gray-400">- {c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-800">
                <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  Helpful ({review.helpful_count})
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredReviews.length === 0 && (
        <div className="text-center py-16">
          <MessageSquare className="h-12 w-12 text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400">No reviews yet</h3>
          <p className="text-sm text-gray-600 mt-1">Be the first to share your experience!</p>
        </div>
      )}
    </div>
  );
}
