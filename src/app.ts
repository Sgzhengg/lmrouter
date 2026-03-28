// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";

import { auth } from "./middlewares/auth.js";
import anthropicRouter from "./routes/v1/anthropic.js";
import openaiRouter from "./routes/v1/openai.js";
import v1Router from "./routes/v1.js";
import type { ContextEnv } from "./types/hono.js";
import { getConfig, loadConfigFromCloudflareKV } from "./utils/config.js";
import { getUptime } from "./utils/utils.js";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { extname } from "path";

const app = new Hono<ContextEnv>();

app.use((c, next) => loadConfigFromCloudflareKV(c).then(() => next()));
app.use(logger());
app.use((c, next) => {
  const cfg = getConfig(c);
  if (!cfg.auth.enabled || !cfg.auth.better_auth.trusted_origins) {
    return cors()(c, next);
  }
  return cors({
    origin: cfg.auth.better_auth.trusted_origins,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })(c, next);
});

// 获取文件的 Content-Type
const getContentType = (filePath: string): string => {
  const ext = extname(filePath);
  const mimeTypes: Record<string, string> = {
    ".js": "text/javascript",
    ".css": "text/css",
    ".html": "text/html",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".eot": "application/vnd.ms-fontobject",
  };
  return mimeTypes[ext] || "application/octet-stream";
};

// 静态文件服务 - 服务前端构建产物
app.get("/assets/*", (c) => {
  const requestPath = c.req.path as string;
  const filePath = join(process.cwd(), "web/dist", requestPath);
  if (existsSync(filePath)) {
    const content = readFileSync(filePath);
    const mime = getContentType(filePath);
    return c.newResponse(content, 200, {
      "Content-Type": mime,
      "Cache-Control": "public, max-age=31536000, immutable",
    });
  }
  return c.json({ error: { message: "File not found" } }, 404);
});

// API 健康检查
app.get("/api/health", auth, (c) => {
  return c.json({
    message: "Welcome to LMRouter!",
    uptime: getUptime(),
    apis_available: ["anthropic", "openai", "v1"],
  });
});

// API 路由（需要认证）
app.route("/anthropic", anthropicRouter);
app.route("/openai", openaiRouter);
app.route("/v1", v1Router);

// Favicon 处理 - 返回 204 No Content 避免浏览器报错
app.get("/favicon.ico", (c) => {
  return c.newResponse(null, 204);
});

// SPA 路由 - 返回前端 HTML（不需要认证）
app.get("/", (c) => {
  const indexPath = join(process.cwd(), "web/dist/index.html");
  if (existsSync(indexPath)) {
    const html = readFileSync(indexPath, "utf-8");
    return c.html(html);
  }
  // 如果前端未构建，返回 JSON 信息
  return c.json({
    message: "Welcome to LMRouter!",
    uptime: getUptime(),
    apis_available: ["anthropic", "openai", "v1"],
    note: "Frontend not built. To serve the UI, run 'pnpm build' in the web/ directory.",
  });
});

// SPA fallback - 对于所有其他非 API 路由，返回 index.html
app.get("/*", (c) => {
  const requestPath = c.req.path as string;
  // 跳过 API 路由
  if (requestPath.startsWith("/api/") || requestPath.startsWith("/openai/") || requestPath.startsWith("/v1/") || requestPath.startsWith("/anthropic/") || requestPath.startsWith("/assets/")) {
    return c.json({ error: { message: "Not Found" } }, 404);
  }

  const indexPath = join(process.cwd(), "web/dist/index.html");
  if (existsSync(indexPath)) {
    const html = readFileSync(indexPath, "utf-8");
    return c.html(html);
  }
  return c.json({ error: { message: "Frontend not built" } }, 404);
});

app.onError((err, c) => {
  console.error(err.stack);
  const cfg = getConfig(c);
  return c.json(
    {
      error: {
        message:
          err instanceof HTTPException ? err.message : "Internal Server Error",
        stack: cfg.server.logging === "dev" ? err.stack : undefined,
      },
    },
    err instanceof HTTPException ? err.status : 500,
  );
});

app.notFound((c) => {
  return c.json(
    {
      error: {
        message: "Not Found",
      },
    },
    404,
  );
});

export default app;
