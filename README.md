# Vortex

> Git blame for humans — understand your codebase through static analysis, ownership tracking, and LLM-powered decision logs.

Vortex answers three questions about any function in your Python codebase:
- **What does it affect?** — blast radius via AST call graph analysis
- **Who owns it?** — commit-weighted ownership from git history
- **Why does it exist?** — LLM-synthesized decision log from commits, diffs, and PRs

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Frontend                          │
│              Next.js 14 · TypeScript · Tailwind          │
│   Dashboard · Inspector · Graph · Ask · Documents        │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP (REST)
┌─────────────────────▼───────────────────────────────────┐
│                        Backend                           │
│                    FastAPI · Python                      │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │  Miner   │  │ Analyzer │  │   LLM    │  │   DB   │  │
│  │ git log  │→ │   AST    │→ │  Ollama  │  │ Mongo  │  │
│  │ GitHub   │  │  graph   │  │ llama3.2 │  │        │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Features

### Inspector
Analyze any function by filepath and name. Returns:
- **Callers & callees** — direct call relationships from AST parsing
- **Blast radius** — all functions transitively affected if this one changes
- **Primary owner** — author with highest commit count on the file
- **Decision log** — LLM-generated explanation of why the function exists, key design decisions, and linked issues/PRs

### Dependency Graph
Interactive D3 visualization of the repository call graph. Click any node to re-root the graph around that function. Nodes are colored by relationship type — root, direct impact, indirect impact, callees.

### Ask
Natural language Q&A over your entire codebase. Ask questions like:
- "Who owns the authentication logic?"
- "What breaks if `analyze` changes?"
- "Why does `compute_ownership` exist?"

Backed by semantic scoring over MongoDB + Ollama context window.

### Dashboard
Repository overview showing total functions analyzed, top contributors by commit count, ownership breakdown pie chart, and recently analyzed functions.

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| API | FastAPI |
| Git mining | GitPython |
| AST analysis | Python `ast` module |
| LLM | Ollama (`llama3.2`) |
| Database | MongoDB |
| GitHub integration | GitHub REST API |

### Frontend
| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Graph | D3.js |
| Charts | Recharts |
| Animations | Motion (Framer) |

---

## Project Structure

### Backend
```
backend/
├── api/
│   ├── main.py          # FastAPI app, CORS config
│   ├── routes.py        # All API endpoints
│   ├── schemas.py       # Pydantic request models
│   └── webhook.py       # GitHub webhook handler
├── analyzer/
│   ├── ast_graph.py     # File-level AST call graph + blast radius
│   ├── repo_graph.py    # Repo-wide call graph walker
│   ├── blast_radius.py  # BFS traversal for impact analysis
│   ├── ownership.py     # Commit-weighted ownership computation
│   └── analyze.py       # Pipeline orchestrator
├── miner/
│   ├── git_processor.py # Git log mining, diff extraction
│   └── github_fetcher.py# PR and issue context from GitHub API
├── llm/
│   ├── prompts.py       # Decision log prompt builder
│   └── synthesizer.py   # Ollama chat wrapper
├── service/
│   └── explain_function.py # End-to-end explain pipeline
├── db/
│   ├── mongodb.py       # MongoClient setup
│   └── repository.py   # CRUD operations
└── shared/
    └── types.py         # Dataclasses: GitContext, AnalysisResult, etc.
```

### Frontend
```
frontend/
├── app/
│   ├── page.tsx         # Dashboard
│   ├── inspect/         # Function inspector
│   ├── graph/           # Dependency graph
│   ├── search/          # Ask / NL search
│   ├── documents/       # Export center
│   └── setup/           # Repo path onboarding
├── components/
│   ├── dashboard/       # RepoDashboard, StatsPanel
│   ├── inspector/       # FunctionPanel, BlastRadiusList, OwnerCard
│   ├── graph/           # DependencyGraph (D3)
│   ├── documents/       # DocumentPreview, DownloadButton
│   └── ui/              # card, button, badge, sidebar
├── hooks/
│   ├── useExplain.ts    # Explain function hook
│   └── useAsk.ts        # Ask codebase hook
├── services/
│   └── api.ts           # All fetch calls to backend
└── lib/
    └── config.ts        # localStorage repo path helpers
```

---

## How It Works

### Analysis Pipeline

```
1. mine_git_history()
   └── git log on filepath → CommitInfo[], PRContext[]

2. build_ast_graph()
   └── ast.parse(file) → CallGraphBuilder → callers, callees

3. build_repo_graph()
   └── walk all .py files → full repo call graph

4. compute_repo_blast_radius()
   └── reverse graph → BFS from function → all affected functions

5. compute_ownership()
   └── count commits per author → primary owner + confidence

6. generate_decision_log()  [only on /explain-function]
   └── build prompt with full context → Ollama → why_it_exists, key_decisions, linked_issues
```

### Ask Pipeline

```
1. POST /ask { repo, question }
2. Score all functions in MongoDB against question keywords
3. Pull top 5 functions with full context (commits, PRs, analysis, decision log)
4. Build structured prompt with that context
5. Ollama generates answer grounded in actual codebase data
6. Return answer + source functions
```

---

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB running locally (`mongodb://localhost:27017`)
- Ollama installed with `llama3.2` pulled

```bash
ollama pull llama3.2
```

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt

# create .env
echo "MONGO_URI=mongodb://localhost:27017" > .env

uvicorn api.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. On first load you'll be prompted to enter the absolute path to your local git repository.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/analyze` | Run full analysis on a function |
| `POST` | `/explain-function` | Analyze + generate LLM decision log |
| `POST` | `/ask` | Natural language question about codebase |
| `GET` | `/functions` | List all analyzed functions for a repo |
| `GET` | `/function` | Get single function data |
| `GET` | `/repo-map` | Call graph nodes and edges |
| `GET` | `/contributors` | Contributor stats by ownership |
| `GET` | `/search` | Keyword search across functions |
| `GET` | `/files` | List analyzed files |
| `GET` | `/commit-frequency` | Weekly commit activity |
| `POST` | `/github-webhook` | Trigger graph rebuild on push |

---

## Scalability

The system is designed to scale horizontally at each layer:

- **Storage** — every document is keyed by `repo`, making MongoDB sharding straightforward with no schema changes
- **Analysis** — the pipeline is stateless and can be moved to a Celery job queue for parallel processing
- **LLM** — Ollama can be replaced with any OpenAI-compatible API; responses are cached in MongoDB to avoid redundant generation
- **Git mining** — the GitHub webhook endpoint enables event-driven incremental updates instead of full re-analysis on every request
- **Multi-repo** — fully supported by design; each repo's data is completely isolated

---

## Environment Variables

### Backend `.env`
```
MONGO_URI=mongodb://localhost:27017
```

### GitHub API (optional, for PR context)
Add a `GITHUB_TOKEN` to `.env` and pass it as a header in `github_fetcher.py` to avoid rate limiting on private repos.

---

## License

MIT
