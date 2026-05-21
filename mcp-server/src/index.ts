#!/usr/bin/env node
/**
 * Vigil MCP Server
 *
 * Exposes all Vigil skills as MCP tools so any Claude Desktop or Claude Code
 * user can invoke them directly from their Claude interface.
 *
 * Tool naming: vigil-{slug} (e.g. vigil-article, vigil-hacker-news-digest)
 * Each tool accepts a single optional `var` argument (the skill's variable input).
 *
 * Skill execution: spawns `claude -p -` with the skill prompt, exactly as
 * GitHub Actions does, so local runs are identical to scheduled runs.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join, dirname, relative } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// mcp-server/dist/index.js → mcp-server/ → repo root
const REPO_ROOT = join(__dirname, "..", "..");

interface Skill {
  slug: string;
  name: string;
  description: string;
  category: string;
  schedule: string;
  var: string;
}

interface SkillsManifest {
  version: string;
  repo: string;
  skills: Skill[];
}

function loadSkills(): Skill[] {
  const manifestPath = join(REPO_ROOT, "skills.json");
  if (!existsSync(manifestPath)) {
    process.stderr.write(
      `[vigil-mcp] skills.json not found at ${manifestPath}\n`
    );
    return [];
  }
  const manifest: SkillsManifest = JSON.parse(
    readFileSync(manifestPath, "utf-8")
  );
  return manifest.skills ?? [];
}

function skillToToolName(slug: string): string {
  return `vigil-${slug}`;
}

function toolNameToSlug(toolName: string): string {
  return toolName.replace(/^vigil-/, "");
}

function buildTools(skills: Skill[]) {
  return skills.map((skill) => ({
    name: skillToToolName(skill.slug),
    description: buildDescription(skill),
    inputSchema: {
      type: "object" as const,
      properties: {
        var: {
          type: "string",
          description: buildVarDescription(skill),
        },
      },
      required: [],
    },
  }));
}

function buildDescription(skill: Skill): string {
  const categoryLabel = categoryName(skill.category);
  const scheduleLabel =
    skill.schedule === "on-demand"
      ? "on-demand"
      : `cron: ${skill.schedule}`;
  return `[Vigil · ${categoryLabel}] ${skill.description} (${scheduleLabel})`;
}

function buildVarDescription(skill: Skill): string {
  if (skill.var) return skill.var;
  const defaults: Record<string, string> = {
    research: "Topic or keyword to focus the skill on (e.g. 'AI agents'). Leave empty for auto-selection.",
    dev: "Repo in owner/repo format to narrow scope. Leave empty to scan all watched repos.",
    crypto: "Token symbol or contract address to focus on. Leave empty for all tracked tokens.",
    social: "Topic, handle, or keyword. Leave empty to use configured defaults.",
    productivity: "Focus area or goal. Leave empty for general operation.",
  };
  return (
    defaults[skill.category] ??
    `Optional variable input for the ${skill.name} skill.`
  );
}

function categoryName(category: string): string {
  const labels: Record<string, string> = {
    research: "Research",
    dev: "Dev",
    crypto: "Crypto",
    social: "Social",
    productivity: "Productivity",
  };
  return labels[category] ?? category;
}

async function runSkill(slug: string, varValue: string): Promise<string> {
  const skillFile = join(REPO_ROOT, "skills", slug, "SKILL.md");
  if (!existsSync(skillFile)) {
    return [
      `Error: skill '${slug}' not found.`,
      `Expected SKILL.md at: ${skillFile}`,
      `Make sure you're running the MCP server from inside an Vigil repo clone.`,
    ].join("\n");
  }

  const today = new Date().toISOString().split("T")[0];
  let prompt = `Today is ${today}. Read and execute the skill defined in skills/${slug}/SKILL.md`;

  if (varValue.trim()) {
    prompt += `\n\nUse this variable (override the default in the skill file):\nvar=${varValue.trim()}`;
  }

  process.stderr.write(`[vigil-mcp] Running skill: ${slug}${varValue ? ` (var=${varValue})` : ""}\n`);

  const result = spawnSync("claude", ["-p", "-", "--output-format", "json"], {
    input: prompt,
    cwd: REPO_ROOT,
    timeout: 600_000, // 10 minutes — same as GitHub Actions timeout
    maxBuffer: 10 * 1024 * 1024, // 10 MB
    encoding: "utf-8",
  });

  if (result.error) {
    const msg = (result.error as NodeJS.ErrnoException).code === "ENOENT"
      ? `'claude' command not found. Install it with: npm install -g @anthropic-ai/claude-code`
      : `Failed to spawn claude: ${result.error.message}`;
    return `Error: ${msg}`;
  }

  if (result.status !== 0) {
    const output = (result.stderr || result.stdout || "").trim();
    return `Skill '${slug}' failed (exit ${result.status}):\n${output}`;
  }

  const stdout = (result.stdout || "").trim();
  if (!stdout) {
    return `Skill '${slug}' produced no output.`;
  }

  // The claude CLI with --output-format json wraps result in { result: "..." }
  try {
    const parsed = JSON.parse(stdout) as { result?: string };
    return parsed.result ?? stdout;
  } catch {
    return stdout;
  }
}

// ---- Server setup ----

// ---- Memory resources ----

const MEMORY_ROOT = join(REPO_ROOT, "memory");
const MEMORY_URI_PREFIX = "memory://vigil/";

interface MemoryResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

function listMemoryResources(): MemoryResource[] {
  if (!existsSync(MEMORY_ROOT)) return [];
  const resources: MemoryResource[] = [];

  function walk(dir: string): void {
    try {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        const rel = relative(MEMORY_ROOT, full);
        const stat = statSync(full);
        if (stat.isDirectory()) {
          walk(full);
        } else if (entry.endsWith(".md") || entry.endsWith(".json") || entry.endsWith(".csv") || entry.endsWith(".txt")) {
          resources.push({
            uri: MEMORY_URI_PREFIX + rel.replace(/\\/g, "/"),
            name: rel,
            description: describeMemoryFile(rel),
            mimeType: entry.endsWith(".json") ? "application/json"
              : entry.endsWith(".csv") ? "text/csv"
              : "text/markdown",
          });
        }
      }
    } catch {
      // skip unreadable dirs
    }
  }

  walk(MEMORY_ROOT);
  return resources;
}

function describeMemoryFile(rel: string): string {
  if (rel === "MEMORY.md") return "Vigil memory index — current goals, topics, recent activity";
  if (rel.startsWith("logs/")) return `Daily activity log: ${rel}`;
  if (rel.startsWith("topics/")) return `Topic notes: ${rel.replace("topics/", "")}`;
  if (rel.startsWith("issues/")) return `Issue tracker entry: ${rel.replace("issues/", "")}`;
  if (rel === "token-usage.csv") return "Token usage and cost tracking data";
  if (rel.startsWith("skill-health/")) return `Skill quality scores: ${rel.replace("skill-health/", "")}`;
  return `Vigil memory: ${rel}`;
}

function readMemoryResource(uri: string): string {
  const rel = uri.replace(MEMORY_URI_PREFIX, "").replace(/\//g, "/");
  const fullPath = join(MEMORY_ROOT, rel);
  // Safety: ensure path stays within MEMORY_ROOT
  if (!fullPath.startsWith(MEMORY_ROOT)) throw new Error("Access denied");
  if (!existsSync(fullPath)) throw new Error(`Resource not found: ${uri}`);
  return readFileSync(fullPath, "utf-8");
}

// ---- Server setup ----

const server = new Server(
  { name: "vigil-mcp", version: "1.0.0" },
  { capabilities: { tools: {}, resources: {} } }
);

const skills = loadSkills();
const tools = buildTools(skills);

process.stderr.write(
  `[vigil-mcp] Loaded ${skills.length} skills from ${REPO_ROOT}\n`
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: listMemoryResources(),
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  try {
    const text = readMemoryResource(uri);
    const mimeType = uri.endsWith(".json") ? "application/json"
      : uri.endsWith(".csv") ? "text/csv"
      : "text/plain";
    return { contents: [{ uri, mimeType, text }] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to read resource";
    return { contents: [{ uri, mimeType: "text/plain", text: `Error: ${msg}` }] };
  }
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  const slug = toolNameToSlug(toolName);
  const skill = skills.find((s) => s.slug === slug);

  if (!skill) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Unknown Vigil tool: ${toolName}\nAvailable tools: ${tools.map((t) => t.name).join(", ")}`,
        },
      ],
      isError: true,
    };
  }

  const varValue = (request.params.arguments?.var as string) ?? "";
  const output = await runSkill(slug, varValue);

  return {
    content: [{ type: "text" as const, text: output }],
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write("[vigil-mcp] Server running on stdio\n");
}

main().catch((err: unknown) => {
  process.stderr.write(`[vigil-mcp] Fatal error: ${err}\n`);
  process.exit(1);
});
