export const REPO_KEY = "vortex_repo_path";

export function getSavedRepo(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REPO_KEY);
}

export function saveRepo(path: string) {
  localStorage.setItem(REPO_KEY, path);
}

export function clearRepo() {
  localStorage.removeItem(REPO_KEY);
}