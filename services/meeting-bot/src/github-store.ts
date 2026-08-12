import { createAppAuth } from "@octokit/auth-app";
import { Octokit } from "@octokit/rest";
import type { AppConfig } from "./config.js";
import { buildDocumentUpdates } from "./github-documents.js";
import { kstDate } from "./time.js";
import type { MeetingMetadata, Minutes, TranscriptEntry } from "./types.js";

export interface GitHubSyncResult {
  commitSha: string;
  paths: string[];
}

export class GitHubStore {
  private constructor(
    private readonly octokit: Octokit,
    private readonly owner: string,
    private readonly repo: string,
    private readonly branch: string,
    private readonly allowPublicMinutes: boolean,
  ) {}

  static async create(config: AppConfig["github"]): Promise<GitHubStore> {
    const [owner, repo] = config.repository.split("/");
    if (!owner || !repo) {
      throw new Error("GITHUB_REPOSITORY must use owner/repository format");
    }

    let octokit: Octokit;
    if (config.token) {
      octokit = new Octokit({ auth: config.token });
    } else if (config.app) {
      octokit = new Octokit({
        authStrategy: createAppAuth,
        auth: {
          appId: config.app.appId,
          installationId: Number(config.app.installationId),
          privateKey: Buffer.from(config.app.privateKeyBase64, "base64").toString("utf8"),
        },
      });
    } else {
      throw new Error("GitHub authentication is not configured");
    }

    return new GitHubStore(
      octokit,
      owner,
      repo,
      config.branch,
      config.allowPublicMinutes,
    );
  }

  async syncMeeting(
    metadata: MeetingMetadata,
    minutes: Minutes,
    transcript: TranscriptEntry[],
  ): Promise<GitHubSyncResult> {
    await this.assertPublicationAllowed();

    let lastError: unknown;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        return await this.createAtomicCommit(metadata, minutes, transcript);
      } catch (error: unknown) {
        lastError = error;
      }
    }
    throw lastError instanceof Error ? lastError : new Error(String(lastError));
  }

  private async assertPublicationAllowed(): Promise<void> {
    const repository = await this.octokit.rest.repos.get({ owner: this.owner, repo: this.repo });
    if (!repository.data.private && !this.allowPublicMinutes) {
      throw new Error(
        "GitHub sync blocked: repository is public; set ALLOW_PUBLIC_GITHUB_MINUTES=true only after team approval",
      );
    }
  }

  private async createAtomicCommit(
    metadata: MeetingMetadata,
    minutes: Minutes,
    transcript: TranscriptEntry[],
  ): Promise<GitHubSyncResult> {
    const reference = await this.octokit.rest.git.getRef({
      owner: this.owner,
      repo: this.repo,
      ref: `heads/${this.branch}`,
    });
    const headSha = reference.data.object.sha;
    const commit = await this.octokit.rest.git.getCommit({
      owner: this.owner,
      repo: this.repo,
      commit_sha: headSha,
    });

    const date = kstDate(new Date(metadata.startedAt));
    const paths = [
      `docs/meetings/${date}.md`,
      `docs/meetings/transcripts/${date}.md`,
      "DECISIONS.md",
      "TASKS.md",
    ];
    const existing = Object.fromEntries(
      await Promise.all(paths.map(async (path) => [path, await this.readFile(path, headSha)] as const)),
    );
    const updates = buildDocumentUpdates(metadata, minutes, transcript, existing);
    if (updates.length === 0) {
      return { commitSha: headSha, paths: [] };
    }

    const tree = await this.octokit.rest.git.createTree({
      owner: this.owner,
      repo: this.repo,
      base_tree: commit.data.tree.sha,
      tree: updates.map((update) => ({
        path: update.path,
        mode: "100644" as const,
        type: "blob" as const,
        content: update.content,
      })),
    });
    const nextCommit = await this.octokit.rest.git.createCommit({
      owner: this.owner,
      repo: this.repo,
      message: `docs(meeting): add minutes ${metadata.id}`,
      tree: tree.data.sha,
      parents: [headSha],
    });
    await this.octokit.rest.git.updateRef({
      owner: this.owner,
      repo: this.repo,
      ref: `heads/${this.branch}`,
      sha: nextCommit.data.sha,
      force: false,
    });
    return { commitSha: nextCommit.data.sha, paths: updates.map((update) => update.path) };
  }

  private async readFile(path: string, reference: string): Promise<string> {
    try {
      const response = await this.octokit.rest.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
        ref: reference,
      });
      if (Array.isArray(response.data) || response.data.type !== "file" || !("content" in response.data)) {
        throw new Error(`expected ${path} to be a file`);
      }
      return Buffer.from(response.data.content, "base64").toString("utf8");
    } catch (error: unknown) {
      if ((error as { status?: number }).status === 404) {
        return "";
      }
      throw error;
    }
  }
}
