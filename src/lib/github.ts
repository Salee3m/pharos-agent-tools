const GITHUB_USERNAME = "Salee3m";

export interface GitHubRepo {
  id: number;
  name: string;
  description: string;
  html_url: string;
  homepage: string;
  stargazers_count: number;
  language: string;
  topics: string[];
  fork: boolean;
  updated_at: string;
}

export async function fetchRepos(): Promise<GitHubRepo[]> {
  const res = await fetch(
    `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=20&type=source`
  );
  if (!res.ok) throw new Error("GitHub API error");
  return res.json();
}

export async function fetchReadme(repo: string): Promise<string> {
  const res = await fetch(
    `https://api.github.com/repos/${GITHUB_USERNAME}/${repo}/readme`,
    { headers: { Accept: "application/vnd.github.raw+json" } }
  );
  if (!res.ok) return "";
  return res.text();
}
