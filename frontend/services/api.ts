// services/api.ts

const BASE = "http://localhost:8000";

// ── Types ──────────────────────────────────────────────────────────────────

export interface AnalysisResult {
  callers: string[];
  callees: string[];
  blast_radius: string[];
}

export interface OwnershipResult {
  primary_owner: string;
  confidence: number;
}

export interface DecisionLog {
  why_it_exists: string;
  key_decisions: string[];
  linked_issues: string[];
  generated_at: string;
}

export interface FunctionData {
  repo: string;
  filepath: string;
  function_name: string;
  analysis?: AnalysisResult;
  ownership?: OwnershipResult;
  decision_log?: DecisionLog;
}

export interface RepoMapData {
  nodes: string[];
  edges: { caller: string; callee: string }[];
}

export interface Contributor {
  name: string;
  commits: number;
  functions: number;
}




export interface CommitFrequencyPoint {
  date: string;
  commits: number;
}

// ── Endpoints ──────────────────────────────────────────────────────────────

export async function analyzeFunction(params: {
  repo_path: string;
  filepath: string;
  function_name: string;
  owner: string;
  repo_name: string;
}): Promise<{ analysis: AnalysisResult; ownership: OwnershipResult }> {
  const url = new URL(`${BASE}/analyze`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), { method: "POST" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function explainFunction(params: {
  repo_path: string;
  filepath: string;
  function_name: string;
  owner: string;
  repo_name: string;
}): Promise<{ analysis: AnalysisResult; ownership: OwnershipResult; decision_log: DecisionLog }> {
  const res = await fetch(`${BASE}/explain-function`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getFunction(
  repo: string,
  filepath: string,
  function_name: string
): Promise<FunctionData> {
  const url = new URL(`${BASE}/function`);
  url.searchParams.set("repo", repo);
  url.searchParams.set("filepath", filepath);
  url.searchParams.set("function_name", function_name);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function listFunctions(repo_name: string): Promise<FunctionData[]> {
  const res = await fetch(`${BASE}/functions?repo_name=${encodeURIComponent(repo_name)}`);
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.functions;
}

export async function listFiles(repo_name: string): Promise<string[]> {
  const res = await fetch(`${BASE}/files?repo_name=${encodeURIComponent(repo_name)}`);
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.files;
}

export async function getRepoMap(repo: string): Promise<RepoMapData> {
  const res = await fetch(`${BASE}/repo-map?repo=${encodeURIComponent(repo)}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function getContributors(repo: string): Promise<Contributor[]> {
  const res = await fetch(`${BASE}/contributors?repo=${encodeURIComponent(repo)}`);
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.contributors;
}



export async function getCommitFrequency(repo: string): Promise<CommitFrequencyPoint[]> {
  const res = await fetch(`${BASE}/commit-frequency?repo=${encodeURIComponent(repo)}`);
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.commitFrequency;
}


export interface SearchResult {
  function_name: string;
  filepath: string;
  ownership: {
    primary_owner: string;
    confidence: number;
  };
}

export async function searchFunctions(repo: string, query: string): Promise<SearchResult[]> {
  const url = new URL(`${BASE}/search`);
  url.searchParams.set("repo", repo);
  url.searchParams.set("query", query);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.results;
}


// services/api.ts — add these types and function

export interface AskResponse {
  answer: string;
  sources: {
    function_name: string;
    filepath: string;
    ownership: { primary_owner: string; confidence: number };
  }[];
}

export async function askCodebase(
  repo: string,
  question: string
): Promise<AskResponse> {
  const url = new URL(`${BASE}/ask`);
  url.searchParams.set("repo", repo);
  url.searchParams.set("question", question);
  const res = await fetch(url.toString(), { method: "POST" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}