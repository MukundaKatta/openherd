# OpenHerd

**Open-Source Model Registry and Deployment Platform**

OpenHerd is an all-in-one platform to browse, deploy, benchmark, fine-tune, and compare AI models. Manage a catalog of open-source models, run one-click deployments via Ollama, benchmark with standardized evaluations, and host community reviews.

## Features

- **Model Catalog** -- Browse and search open-source models with metadata and downloads
- **One-Click Deploy** -- Deploy models via Ollama with a single click
- **Benchmark Suite** -- Standardized evaluations with leaderboard rankings
- **GGUF Browser** -- Browse and download quantized model variants
- **Fine-Tuning** -- Launch LoRA/QLoRA training jobs from the UI
- **Model Arena** -- Blind A/B comparison for community-driven rankings
- **Community Reviews** -- User ratings and written reviews for models
- **API Endpoints** -- OpenAI-compatible API gateway for deployed models
- **Resource Monitor** -- Real-time GPU, CPU, and RAM usage tracking
- **Model Merge** -- Combine models with merge strategies
- **Model Compare** -- Side-by-side model comparison on key metrics

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Supabase (Auth, Database, SSR)
- **State Management:** Zustand
- **Charts:** Recharts
- **File Upload:** react-dropzone
- **Markdown:** react-markdown
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase project
- Ollama installed (for model deployment)

### Installation

```bash
git clone <repository-url>
cd openherd
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Home dashboard
│   ├── models/           # Model catalog & detail pages
│   ├── deploy/           # Deployment manager
│   ├── benchmarks/       # Benchmark leaderboards
│   ├── gguf/             # Quantized model browser
│   ├── finetune/         # Fine-tuning jobs
│   ├── arena/            # Blind model comparison
│   ├── reviews/          # Community reviews
│   ├── endpoints/        # API gateway
│   ├── monitor/          # Resource monitoring
│   ├── merge/            # Model merging
│   └── compare/          # Side-by-side comparison
├── components/           # Reusable UI components
├── store/                # Zustand state management
└── lib/                  # Utilities and helpers
```

## License

MIT
