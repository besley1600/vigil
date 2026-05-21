#!/usr/bin/env node
/**
 * Vigil A2A Gateway Server
 *
 * Implements Google's Agent-to-Agent (A2A) protocol, exposing all Vigil skills
 * as callable tasks. Any A2A-compliant agent framework — LangChain, AutoGen,
 * CrewAI, OpenAI Agents SDK, Vertex AI — can invoke Vigil skills via standard
 * HTTP + JSON-RPC, no MCP client or Claude interface required.
 *
 * Endpoints:
 *   GET  /.well-known/agent.json   — Agent card advertising all skills
 *   POST /                          — JSON-RPC: tasks/send, tasks/get, tasks/cancel
 *   POST /tasks/sendSubscribe       — SSE streaming for long-running skills
 *
 * Usage:
 *   node dist/index.js              # default port 41241
 *   A2A_PORT=8080 node dist/index.js
 *   A2A_URL=https://your-host.com node dist/index.js
 */

import { createServer, IncomingMessage, ServerResponse } from "http";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { spawn, ChildProcess } from "child_process";
import { randomUUID } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// a2a-server/dist/index.js → a2a-server/ → repo root
const REPO_ROOT = join(__dirname, "..", "..");
const DEFAULT_PORT = parseInt(process.env.A2A_PORT ?? "41241", 10);
const SERVER_URL = process.env.A2A_URL ?? `http://localhost:${DEFAULT_PORT}`;

// ── Types ────────────────────────────────────────────────────────────────────

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

type TaskState = "submitted" | "working" | "completed" | "failed" | "canceled";

interface MessagePart {
  type: string;
  text: string;
}

interface A2AMessage {
  role: string;
  parts: MessagePart[];
}

interface TaskStatus {
  state: TaskState;
  timestamp: string;
  message?: A2AMessage;
}

interface TaskArtifact {
  name?: string;
  mimeType?: string;
  parts: MessagePart[];
}

interface Task {
  id: string;
  sessionId?: string;
  status: TaskStatus;
  artifacts: TaskArtifact[];
  history: A2AMessage[];
  metadata?: Record<string, unknown>;
  skillSlug?: string;
  _subscribers: ServerResponse[];
  _childProcess?: ChildProcess;
  _completedAt?: number;
}

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

// ── State ─────────────────────────────────────────────────────────────────────

const tasks = new Map<string, Task>();
const skills = loadSkills();

const TASK_TTL_MS = 30 * 60 * 1000; // 30 minutes
const MAX_TASKS = 1000;

function evictStaleTasks(): void {
  const now = Date.now();
  for (const [id, task] of tasks) {
    if (task._completedAt && now - task._completedAt > TASK_TTL_MS) {
      tasks.delete(id);
    }
  }
  // Hard cap: if still over limit, drop oldest completed tasks
  if (tasks.size > MAX_TASKS) {
    const completed = [...tasks.entries()]
      .filter(([, t]) => t._completedAt)
      .sort((a, b) => (a[1]._completedAt ?? 0) - (b[1]._completedAt ?? 0));
    for (const [id] of completed) {
      tasks.delete(id);
      if (tasks.size <= MAX_TASKS) break;
    }
  }
}

// ── Skill loading ─────────────────────────────────────────────────────────────

function loadSkills(): Skill[] {
  const manifestPath = join(REPO_ROOT, "skills.json");
  if (!existsSync(manifestPath)) {
    process.stderr.write(`[vigil-a2a] skills.json not found at ${manifestPath}\n`);
    return [];
  }
  const manifest: SkillsManifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
  return manifest.skills ?? [];
}

function getSkillBySlug(slug: string): Skill | undefined {
  return skills.find((s) => s.slug === slug);
}

function pickSkillFromText(text: string): string | null {
  const lower = text.toLowerCase();
  const explicit = lower.match(/\b(?:vigil-)?([a-z0-9-]+)\b/);
  if (explicit && getSkillBySlug(explicit[1])) return explicit[1];
  if (lower.includes("research") || lower.includes("investigate")) return "deep-research";
  if (lower.includes("news") || lower.includes("hacker")) return "hacker-news-digest";
  if (lower.includes("pr") || lower.includes("pull request")) return "pr-review";
  if (lower.includes("crypto") || lower.includes("price") || lower.includes("token")) return "token-alert";
  if (lower.includes("tweet") || lower.includes("twitter")) return "write-tweet";
  if (lower.includes("article") || lower.includes("blog")) return "article";
  return skills[0]?.slug ?? null;
}

/**
 * Parse a skill slug and optional var from an A2A message.
 * Accepts: "vigil-<slug>", "skill: <slug>", or a bare slug (if exact match).
 * Var extraction: "var=<value>", "var: <value>", or var="<value>".
 */
function parseSkillFromMessage(message: A2AMessage): { slug: string; varValue: string } | null {
  const text = message.parts.find((p) => p.type === "text")?.text ?? "";

  const slugMatch =
    text.match(/\bvigil-([a-z0-9-]+)\b/i) ??
    text.match(/\bskill:\s*([a-z0-9-]+)\b/i) ??
    text.match(/^([a-z0-9-]+)$/);

  if (!slugMatch) return null;
  const slug = slugMatch[1].toLowerCase();
  if (!getSkillBySlug(slug)) return null;

  const varMatch = text.match(/\bvar\s*[=:]\s*["']?([^"'\n]+?)["']?(?:\s|$)/i);
  return { slug, varValue: varMatch ? varMatch[1].trim() : "" };
}

// ── Skill execution ───────────────────────────────────────────────────────────

function runSkillAsync(task: Task, slug: string, varValue: string): void {
  const skillFile = join(REPO_ROOT, "skills", slug, "SKILL.md");
  if (!existsSync(skillFile)) {
    completeTask(task, "failed", `Error: skill '${slug}' not found at ${skillFile}`);
    return;
  }

  const today = new Date().toISOString().split("T")[0];
  let prompt = `Today is ${today}. Read and execute the skill defined in skills/${slug}/SKILL.md`;
  if (varValue) {
    prompt += `\n\nUse this variable (override the default in the skill file):\nvar=${varValue}`;
  }

  process.stderr.write(
    `[vigil-a2a] Starting skill: ${slug}${varValue ? ` (var=${varValue})` : ""}\n`
  );

  setTaskState(task, "working");

  const chunks: string[] = [];
  const child = spawn("claude", ["-p", "-", "--output-format", "json"], {
    cwd: REPO_ROOT,
    env: { ...process.env },
  });
  task._childProcess = child;

  child.stdin.write(prompt);
  child.stdin.end();

  child.stdout.on("data", (chunk: Buffer) => chunks.push(chunk.toString()));

  child.on("close", (code) => {
    const raw = chunks.join("").trim();
    if (code !== 0) {
      completeTask(task, "failed", `Skill '${slug}' failed (exit ${code}):\n${raw}`);
      return;
    }
    let result = raw;
    try {
      const parsed = JSON.parse(raw) as { result?: string };
      result = parsed.result ?? raw;
    } catch {
      // use raw output
    }
    completeTask(task, "completed", result);
  });

  child.on("error", (err) => {
    const code = (err as NodeJS.ErrnoException).code;
    const msg =
      code === "ENOENT"
        ? "'claude' CLI not found. Install: npm install -g @anthropic-ai/claude-code"
        : `Failed to spawn claude: ${err.message}`;
    completeTask(task, "failed", msg);
  });
}

function setTaskState(task: Task, state: TaskState): void {
  task.status = { state, timestamp: new Date().toISOString() };
  broadcastSSE(task, "status", { id: task.id, status: task.status });
}

function completeTask(task: Task, state: TaskState, text: string): void {
  const msg: A2AMessage = { role: "agent", parts: [{ type: "text", text }] };
  task.status = { state, timestamp: new Date().toISOString() };
  task.history.push(msg);
  task._completedAt = Date.now();
  task._childProcess = undefined;

  if (state === "completed") {
    task.artifacts = [{ mimeType: "text/plain", parts: [{ type: "text", text }] }];
    broadcastSSE(task, "artifact", {
      id: task.id,
      artifact: task.artifacts[0],
    });
  }

  broadcastSSE(task, "status", { id: task.id, status: task.status });

  // Close all SSE connections
  for (const res of task._subscribers) {
    if (!res.writableEnded) {
      writeSSE(res, "close", {});
      res.end();
    }
  }
  task._subscribers = [];
}

// ── SSE helpers ───────────────────────────────────────────────────────────────

function writeSSE(res: ServerResponse, event: string, data: unknown): void {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function broadcastSSE(task: Task, event: string, data: unknown): void {
  for (const res of task._subscribers) {
    if (!res.writableEnded) writeSSE(res, event, data);
  }
}

// ── Agent Card ────────────────────────────────────────────────────────────────

function buildAgentCard(): Record<string, unknown> {
  return {
    name: "Vigil",
    description:
      `Background intelligence agent with ${skills.length} skills across research, dev tooling, ` +
      "crypto monitoring, and productivity. Runs on GitHub Actions — always available, " +
      "no infra required.",
    url: SERVER_URL,
    version: "1.0.0",
    documentationUrl: "https://github.com/besley1600/vigil",
    capabilities: {
      streaming: true,
      pushNotifications: false,
      stateTransitionHistory: true,
    },
    authentication: {
      schemes: [],
    },
    defaultInputModes: ["text"],
    defaultOutputModes: ["text"],
    skills: skills.map((s) => ({
      id: `vigil-${s.slug}`,
      name: s.name,
      description: s.description,
      tags: [s.category, "vigil", "background-agent"],
      inputModes: ["text"],
      outputModes: ["text"],
      examples: [
        {
          role: "user",
          parts: [
            {
              type: "text",
              text: `Run vigil-${s.slug}${s.var ? ` with var="${s.var}"` : ""}`,
            },
          ],
        },
      ],
    })),
  };
}

// ── JSON-RPC handlers ─────────────────────────────────────────────────────────

type RpcResult<T> = T | { error: { code: number; message: string } };

function handleTasksSend(params: Record<string, unknown>): RpcResult<Task> {
  const id = (params.id as string | undefined) ?? randomUUID();
  const message = params.message as A2AMessage | undefined;
  const skillId = params.skillId as string | undefined;
  const varOverride = params.var as string | undefined;

  let slug: string | undefined;
  let varValue = varOverride ?? "";

  if (skillId) {
    slug = skillId.replace(/^vigil-/, "");
  } else if (message) {
    const parsed = parseSkillFromMessage(message);
    if (parsed) {
      slug = parsed.slug;
      if (!varOverride) varValue = parsed.varValue;
    }
  }

  if (!slug || !getSkillBySlug(slug)) {
    const examples = skills
      .slice(0, 5)
      .map((s) => `vigil-${s.slug}`)
      .join(", ");
    return {
      error: {
        code: -32602,
        message:
          `No valid skill found. Pass skillId (e.g. "vigil-deep-research") or ` +
          `mention an vigil-<slug> in your message. Examples: ${examples}, ...`,
      },
    };
  }

  const task: Task = {
    id,
    status: { state: "submitted", timestamp: new Date().toISOString() },
    artifacts: [],
    history: message ? [message] : [],
    metadata: params.metadata as Record<string, unknown> | undefined,
    skillSlug: slug,
    _subscribers: [],
  };
  tasks.set(id, task);
  evictStaleTasks();

  // Kick off async — return submitted state immediately
  setImmediate(() => runSkillAsync(task, slug!, varValue));

  return task;
}

function handleTasksGet(params: Record<string, unknown>): RpcResult<Record<string, unknown>> {
  const id = params.id as string;
  const task = tasks.get(id);
  if (!task) {
    return { error: { code: -32602, message: `Task not found: ${id}` } };
  }
  const historyLength = (params.historyLength as number | undefined) ?? task.history.length;
  // Omit internal _subscribers from response
  const { _subscribers: _, ...safe } = task;
  return { ...safe, history: task.history.slice(-historyLength) };
}

function handleTasksCancel(params: Record<string, unknown>): RpcResult<Record<string, unknown>> {
  const id = params.id as string;
  const task = tasks.get(id);
  if (!task) {
    return { error: { code: -32602, message: `Task not found: ${id}` } };
  }
  if (task.status.state === "submitted" || task.status.state === "working") {
    if (task._childProcess) {
      task._childProcess.kill("SIGTERM");
    }
    completeTask(task, "canceled", "Task canceled by caller.");
  }
  const { _subscribers: _, ...safe } = task;
  return safe;
}

// ── HTTP request handling ─────────────────────────────────────────────────────

const MAX_BODY_BYTES = 1024 * 1024; // 1 MB

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        req.destroy();
        reject(new Error("Request body too large"));
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function json(res: ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json", ...CORS_HEADERS });
  res.end(JSON.stringify(data));
}

function rpcError(id: string | number, code: number, message: string): Record<string, unknown> {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url ?? "/", "http://localhost");
  const method = req.method ?? "GET";

  // CORS preflight
  if (method === "OPTIONS") {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  // Agent card — the discovery endpoint A2A clients fetch first
  if (method === "GET" && url.pathname === "/.well-known/agent.json") {
    json(res, 200, buildAgentCard());
    return;
  }

  // OpenAI-compatible models list
  if (method === "GET" && url.pathname === "/v1/models") {
    json(res, 200, {
      object: "list",
      data: [
        { id: "vigil", object: "model", description: "Auto-routes to best skill from message" },
        ...skills.map(s => ({
          id: `vigil-${s.slug}`,
          object: "model",
          description: s.description,
        })),
      ],
    });
    return;
  }

  // OpenAI-compatible chat completions — dispatches skills via GitHub Actions
  if (method === "POST" && url.pathname === "/v1/chat/completions") {
    let body: string;
    try { body = await readBody(req); } catch { json(res, 400, { error: "Cannot read body" }); return; }

    let oaiReq: {
      model?: string;
      messages?: Array<{ role: string; content: string }>;
      stream?: boolean;
    };
    try { oaiReq = JSON.parse(body); } catch { json(res, 400, { error: "Invalid JSON" }); return; }

    const model = oaiReq.model ?? "vigil";
    const messages = oaiReq.messages ?? [];
    const lastUser = [...messages].reverse().find(m => m.role === "user");
    const userText = lastUser?.content?.trim() ?? "";

    // Resolve skill slug from model name
    const slug = model === "vigil"
      ? pickSkillFromText(userText)
      : model.replace(/^vigil-/, "");

    const skill = slug ? getSkillBySlug(slug) : null;

    if (!skill) {
      const examples = skills.slice(0, 5).map(s => `vigil-${s.slug}`);
      json(res, 404, {
        error: {
          message: `Model not found: ${model}. Use "vigil-<slug>" or "vigil" for auto-routing. Examples: ${examples.join(", ")}`,
          type: "invalid_request_error",
        }
      });
      return;
    }

    // Create an A2A task and run it
    const taskId = randomUUID();
    const task: Task = {
      id: taskId,
      status: { state: "submitted", timestamp: new Date().toISOString() },
      artifacts: [],
      history: [],
      skillSlug: slug,
      _subscribers: [],
    };
    tasks.set(taskId, task);

    if (oaiReq.stream) {
      // SSE streaming in OpenAI delta format
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        ...CORS_HEADERS,
      });

      const send = (data: unknown) => res.write(`data: ${JSON.stringify(data)}\n\n`);
      const completionId = `chatcmpl-${randomUUID().replace(/-/g, "").slice(0, 24)}`;

      send({ id: completionId, object: "chat.completion.chunk", choices: [{ index: 0, delta: { role: "assistant", content: `Running skill: ${slug}...\n` }, finish_reason: null }] });

      task._subscribers.push({
        writableEnded: false,
        write: (chunk: string) => {
          const match = chunk.match(/data: ({.*})\n\n/);
          if (!match) return true;
          try {
            const evt = JSON.parse(match[1]) as { type?: string };
            if (evt.type === "artifact" || evt.type === "status") {
              // forward progress as a delta
              send({ id: completionId, object: "chat.completion.chunk", choices: [{ index: 0, delta: { content: "" }, finish_reason: null }] });
            }
          } catch { /* ignore */ }
          return true;
        },
        end: () => {
          const output = task.artifacts[0]?.parts[0]?.text ?? "Skill completed.";
          send({ id: completionId, object: "chat.completion.chunk", choices: [{ index: 0, delta: { content: output }, finish_reason: null }] });
          send({ id: completionId, object: "chat.completion.chunk", choices: [{ index: 0, delta: {}, finish_reason: "stop" }] });
          res.write("data: [DONE]\n\n");
          res.end();
        },
      } as unknown as ServerResponse);

      setImmediate(() => runSkillAsync(task, slug, userText));
    } else {
      // Synchronous — run and wait (skills can be long; we wait up to 10 min)
      await new Promise<void>(resolve => {
        const origComplete = completeTask;
        void origComplete; // reference to avoid lint warning
        setImmediate(() => runSkillAsync(task, slug, userText));

        const interval = setInterval(() => {
          if (task.status.state === "completed" || task.status.state === "failed" || task.status.state === "canceled") {
            clearInterval(interval);
            resolve();
          }
        }, 1000);

        // 10-minute hard timeout
        setTimeout(() => { clearInterval(interval); resolve(); }, 600_000);
      });

      const output = task.artifacts[0]?.parts[0]?.text ?? (task.status.state === "failed" ? "Skill failed." : "Skill completed with no output.");
      const completionId = `chatcmpl-${randomUUID().replace(/-/g, "").slice(0, 24)}`;
      json(res, 200, {
        id: completionId,
        object: "chat.completion",
        created: Math.floor(Date.now() / 1000),
        model,
        choices: [{ index: 0, message: { role: "assistant", content: output }, finish_reason: "stop" }],
        usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      });
    }
    return;
  }

  // SSE streaming: POST /tasks/sendSubscribe
  if (method === "POST" && url.pathname === "/tasks/sendSubscribe") {
    let body: string;
    try {
      body = await readBody(req);
    } catch {
      json(res, 400, { error: "Cannot read request body" });
      return;
    }

    let rpc: JsonRpcRequest;
    try {
      rpc = JSON.parse(body);
    } catch {
      json(res, 400, { error: "Invalid JSON" });
      return;
    }

    const result = handleTasksSend((rpc.params ?? {}) as Record<string, unknown>);
    if ("error" in result) {
      json(res, 400, { jsonrpc: "2.0", id: rpc.id, error: result.error });
      return;
    }

    const task = result as Task;
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      ...CORS_HEADERS,
    });

    writeSSE(res, "status", { id: task.id, status: task.status });
    task._subscribers.push(res);

    req.on("close", () => {
      task._subscribers = task._subscribers.filter((s) => s !== res);
    });
    return;
  }

  // JSON-RPC endpoint: POST /  or  POST /rpc
  if (method === "POST" && (url.pathname === "/" || url.pathname === "/rpc")) {
    let body: string;
    try {
      body = await readBody(req);
    } catch {
      json(res, 400, rpcError(0, -32700, "Parse error"));
      return;
    }

    let rpc: JsonRpcRequest;
    try {
      rpc = JSON.parse(body);
    } catch {
      json(res, 400, rpcError(0, -32700, "Parse error"));
      return;
    }

    if (rpc.jsonrpc !== "2.0" || !rpc.method) {
      json(res, 400, rpcError(rpc?.id ?? 0, -32600, "Invalid Request"));
      return;
    }

    const params = (rpc.params ?? {}) as Record<string, unknown>;

    switch (rpc.method) {
      case "tasks/send": {
        const r = handleTasksSend(params);
        if ("error" in r) {
          json(res, 200, { jsonrpc: "2.0", id: rpc.id, error: r.error });
          return;
        }
        const { _subscribers: _, ...safe } = r as Task;
        json(res, 200, { jsonrpc: "2.0", id: rpc.id, result: safe });
        return;
      }
      case "tasks/get": {
        const r = handleTasksGet(params);
        if ("error" in r) {
          json(res, 200, { jsonrpc: "2.0", id: rpc.id, error: r.error });
          return;
        }
        json(res, 200, { jsonrpc: "2.0", id: rpc.id, result: r });
        return;
      }
      case "tasks/cancel": {
        const r = handleTasksCancel(params);
        if ("error" in r) {
          json(res, 200, { jsonrpc: "2.0", id: rpc.id, error: r.error });
          return;
        }
        json(res, 200, { jsonrpc: "2.0", id: rpc.id, result: r });
        return;
      }
      default:
        json(res, 200, rpcError(rpc.id, -32601, `Method not found: ${rpc.method}`));
        return;
    }
  }

  json(res, 404, { error: "Not found" });
}

// ── Entry point ───────────────────────────────────────────────────────────────

const httpServer = createServer((req, res) => {
  handleRequest(req, res).catch((err: unknown) => {
    process.stderr.write(`[vigil-a2a] Unhandled error: ${err}\n`);
    if (!res.headersSent) {
      json(res, 500, { error: "Internal server error" });
    }
  });
});

httpServer.listen(DEFAULT_PORT, () => {
  process.stderr.write(`[vigil-a2a] Server running on port ${DEFAULT_PORT}\n`);
  process.stderr.write(`[vigil-a2a] Agent card : ${SERVER_URL}/.well-known/agent.json\n`);
  process.stderr.write(`[vigil-a2a] JSON-RPC   : POST ${SERVER_URL}/\n`);
  process.stderr.write(`[vigil-a2a] SSE stream : POST ${SERVER_URL}/tasks/sendSubscribe\n`);
  process.stderr.write(`[vigil-a2a] Loaded ${skills.length} skills\n`);
});

httpServer.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    process.stderr.write(
      `[vigil-a2a] Port ${DEFAULT_PORT} already in use. Set A2A_PORT=<port> to change.\n`
    );
  } else {
    process.stderr.write(`[vigil-a2a] Server error: ${err.message}\n`);
  }
  process.exit(1);
});
