"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/store/app-store";
import { ArenaMatch } from "@/types";
import { calculateElo } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import toast from "react-hot-toast";
import {
  Swords, Trophy, TrendingUp, TrendingDown, Minus, Send,
  RefreshCw, Eye, EyeOff, ArrowRight, Crown
} from "lucide-react";

const SAMPLE_PROMPTS = [
  "Explain quantum computing to a 10-year-old.",
  "Write a Python function that finds all prime numbers up to N using the Sieve of Eratosthenes.",
  "What are the key differences between TCP and UDP? When would you use each?",
  "Compose a short poem about the feeling of discovering something new.",
  "Design a database schema for a social media application. Explain your choices.",
  "Explain the concept of recursion using a real-world analogy.",
  "What are the ethical implications of AI in healthcare?",
  "Write a TypeScript generic function that deeply merges two objects.",
];

export default function ArenaPage() {
  const { models, arenaLeaderboard, arenaMatches, addArenaMatch, setArenaLeaderboard } = useAppStore();
  const [prompt, setPrompt] = useState("");
  const [modelAId, setModelAId] = useState("");
  const [modelBId, setModelBId] = useState("");
  const [responseA, setResponseA] = useState("");
  const [responseB, setResponseB] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [voted, setVoted] = useState(false);

  const chatModels = models.filter((m) => m.ollama_id);

  const startBattle = () => {
    if (chatModels.length < 2) {
      toast.error("Need at least 2 models for a battle");
      return;
    }

    const shuffled = [...chatModels].sort(() => Math.random() - 0.5);
    const a = shuffled[0];
    const b = shuffled[1];

    setModelAId(a.id);
    setModelBId(b.id);
    setRevealed(false);
    setVoted(false);

    const selectedPrompt = prompt || SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)];
    setPrompt(selectedPrompt);
    setGenerating(true);

    // Simulate generation
    setTimeout(() => {
      setResponseA(generateSampleResponse(a.name, selectedPrompt));
      setResponseB(generateSampleResponse(b.name, selectedPrompt));
      setGenerating(false);
    }, 1500);
  };

  const handleVote = (winner: "a" | "b" | "tie") => {
    if (voted) return;

    const modelA = models.find((m) => m.id === modelAId);
    const modelB = models.find((m) => m.id === modelBId);
    if (!modelA || !modelB) return;

    const match: ArenaMatch = {
      id: uuidv4(),
      model_a_id: modelAId,
      model_b_id: modelBId,
      model_a_name: modelA.name,
      model_b_name: modelB.name,
      prompt,
      response_a: responseA,
      response_b: responseB,
      winner,
      voter_id: "anonymous",
      created_at: new Date().toISOString(),
    };

    addArenaMatch(match);

    // Update ELO
    const entryA = arenaLeaderboard.find((e) => e.model_id === modelAId);
    const entryB = arenaLeaderboard.find((e) => e.model_id === modelBId);

    if (entryA && entryB) {
      const { newRatingA, newRatingB } = calculateElo(entryA.elo_rating, entryB.elo_rating, winner);
      const updated = arenaLeaderboard.map((e) => {
        if (e.model_id === modelAId) {
          return {
            ...e,
            elo_rating: newRatingA,
            total_matches: e.total_matches + 1,
            wins: e.wins + (winner === "a" ? 1 : 0),
            losses: e.losses + (winner === "b" ? 1 : 0),
            ties: e.ties + (winner === "tie" ? 1 : 0),
            win_rate: ((e.wins + (winner === "a" ? 1 : 0)) / (e.total_matches + 1)) * 100,
          };
        }
        if (e.model_id === modelBId) {
          return {
            ...e,
            elo_rating: newRatingB,
            total_matches: e.total_matches + 1,
            wins: e.wins + (winner === "b" ? 1 : 0),
            losses: e.losses + (winner === "a" ? 1 : 0),
            ties: e.ties + (winner === "tie" ? 1 : 0),
            win_rate: ((e.wins + (winner === "b" ? 1 : 0)) / (e.total_matches + 1)) * 100,
          };
        }
        return e;
      });
      setArenaLeaderboard(updated.sort((a, b) => b.elo_rating - a.elo_rating));
    }

    setVoted(true);
    setRevealed(true);
    toast.success("Vote recorded! ELO ratings updated.");
  };

  const sortedLeaderboard = useMemo(() => {
    return [...arenaLeaderboard].sort((a, b) => b.elo_rating - a.elo_rating);
  }, [arenaLeaderboard]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Model Arena</h1>
        <p className="text-gray-400 mt-1">Blind A/B testing between models with ELO rating system</p>
      </div>

      {/* Battle Area */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Swords className="h-5 w-5 text-amber-400" />
            Battle Arena
          </h2>
          <button
            onClick={startBattle}
            disabled={generating}
            className="flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${generating ? "animate-spin" : ""}`} />
            {responseA ? "New Battle" : "Start Battle"}
          </button>
        </div>

        {/* Prompt */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Prompt (leave empty for random)</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter a prompt or leave empty for a random one..."
              className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Responses */}
        {(responseA || generating) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-blue-400">
                  {revealed ? models.find((m) => m.id === modelAId)?.name : "Model A"}
                </h3>
                {revealed && <Eye className="h-4 w-4 text-gray-500" />}
                {!revealed && <EyeOff className="h-4 w-4 text-gray-600" />}
              </div>
              {generating ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Generating...</span>
                </div>
              ) : (
                <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{responseA}</p>
              )}
            </div>
            <div className="rounded-lg border border-gray-700 bg-gray-800/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-purple-400">
                  {revealed ? models.find((m) => m.id === modelBId)?.name : "Model B"}
                </h3>
                {revealed && <Eye className="h-4 w-4 text-gray-500" />}
                {!revealed && <EyeOff className="h-4 w-4 text-gray-600" />}
              </div>
              {generating ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Generating...</span>
                </div>
              ) : (
                <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">{responseB}</p>
              )}
            </div>
          </div>
        )}

        {/* Voting */}
        {responseA && !generating && (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => handleVote("a")}
              disabled={voted}
              className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-colors ${
                voted && !revealed ? "opacity-50" :
                voted ? "bg-blue-600/20 text-blue-400 border border-blue-500/30" :
                "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              <Trophy className="h-4 w-4" />
              {revealed ? models.find((m) => m.id === modelAId)?.name || "A" : "A"} Wins
            </button>
            <button
              onClick={() => handleVote("tie")}
              disabled={voted}
              className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-colors ${
                voted ? "opacity-50" :
                "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <Minus className="h-4 w-4" />
              Tie
            </button>
            <button
              onClick={() => handleVote("b")}
              disabled={voted}
              className={`flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium transition-colors ${
                voted && !revealed ? "opacity-50" :
                voted ? "bg-purple-600/20 text-purple-400 border border-purple-500/30" :
                "bg-purple-600 text-white hover:bg-purple-700"
              }`}
            >
              <Trophy className="h-4 w-4" />
              {revealed ? models.find((m) => m.id === modelBId)?.name || "B" : "B"} Wins
            </button>
            {!revealed && !voted && (
              <button
                onClick={() => setRevealed(true)}
                className="flex items-center gap-2 rounded-lg border border-gray-700 px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-800 transition-colors"
              >
                <Eye className="h-4 w-4" />
                Reveal
              </button>
            )}
          </div>
        )}
      </div>

      {/* ELO Leaderboard */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-400" />
          ELO Leaderboard
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-800">
                <th className="pb-3 font-medium w-12">Rank</th>
                <th className="pb-3 font-medium">Model</th>
                <th className="pb-3 font-medium text-center">ELO</th>
                <th className="pb-3 font-medium text-center">Matches</th>
                <th className="pb-3 font-medium text-center">W/L/T</th>
                <th className="pb-3 font-medium text-center">Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {sortedLeaderboard.map((entry, idx) => (
                <tr key={entry.model_id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="py-3">
                    <span className={`text-sm font-bold ${
                      idx === 0 ? "text-yellow-400" :
                      idx === 1 ? "text-gray-300" :
                      idx === 2 ? "text-orange-400" :
                      "text-gray-500"
                    }`}>
                      #{idx + 1}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="font-medium text-white">{entry.model_name}</span>
                  </td>
                  <td className="py-3 text-center">
                    <span className={`font-mono font-bold ${
                      entry.elo_rating >= 1200 ? "text-green-400" :
                      entry.elo_rating >= 1100 ? "text-yellow-400" :
                      "text-red-400"
                    }`}>
                      {entry.elo_rating}
                    </span>
                  </td>
                  <td className="py-3 text-center text-gray-400">{entry.total_matches}</td>
                  <td className="py-3 text-center">
                    <span className="text-green-400">{entry.wins}</span>
                    {" / "}
                    <span className="text-red-400">{entry.losses}</span>
                    {" / "}
                    <span className="text-gray-400">{entry.ties}</span>
                  </td>
                  <td className="py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {entry.win_rate >= 50 ? (
                        <TrendingUp className="h-3.5 w-3.5 text-green-400" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5 text-red-400" />
                      )}
                      <span className={entry.win_rate >= 50 ? "text-green-400" : "text-red-400"}>
                        {entry.win_rate.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function generateSampleResponse(modelName: string, prompt: string): string {
  const responses: Record<string, string[]> = {
    default: [
      `This is a thoughtful question. Let me break it down step by step.\n\nFirst, we need to understand the core concepts involved. The key insight here is that complex problems often have elegant solutions when approached from the right angle.\n\nIn my analysis, there are three main factors to consider:\n\n1. The fundamental principles at play\n2. The practical implications for real-world applications\n3. The tradeoffs involved in different approaches\n\nEach of these deserves careful consideration. The first factor relates to the theoretical foundation, which provides the basis for everything else.\n\nOverall, I believe a balanced approach that considers all perspectives leads to the best outcomes. The nuances matter greatly in situations like this.`,
      `Great question! Let me provide a comprehensive answer.\n\nThe topic you're asking about has several important dimensions:\n\n**Background**: This area has evolved significantly over recent years, with new developments changing our understanding.\n\n**Key Points**:\n- There are multiple valid perspectives to consider\n- Evidence supports a nuanced view\n- Practical applications vary by context\n\n**My Recommendation**: Start with the fundamentals, build a solid understanding, and then explore the more advanced aspects. This approach has proven effective across many different scenarios.\n\nWould you like me to elaborate on any specific aspect?`,
      `Let me think about this carefully.\n\nThe question touches on several interconnected topics. To give you a thorough answer, I'll address each component:\n\n1. **The Core Concept**: At its heart, this is about understanding how different elements interact and influence each other.\n\n2. **Practical Considerations**: In practice, you'll want to consider the context, constraints, and goals of your specific situation.\n\n3. **Best Practices**: Based on current knowledge and experience, the recommended approach is to:\n   - Start simple and iterate\n   - Test your assumptions\n   - Be prepared to adapt\n\nThis framework should give you a solid foundation to work from. The details will vary depending on your specific circumstances.`,
    ],
  };

  const options = responses.default;
  return options[Math.floor(Math.random() * options.length)];
}
