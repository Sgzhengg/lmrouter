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
import adminProvidersRouter from "./routes/admin/providers.js";
import adminModelsRouter from "./routes/admin/models.js";
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

// 静态文件服务 - 客户端构建产物
app.get("/assets/*", (c) => {
  const requestPath = c.req.path as string;
  const filePath = join(process.cwd(), "web-client/dist", requestPath);
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

// 静态文件服务 - 管理后台构建产物
app.get("/admin/assets/*", (c) => {
  const requestPath = c.req.path as string;
  // 移除 /admin 前缀
  const relativePath = requestPath.replace("/admin", "");
  const filePath = join(process.cwd(), "web-admin/dist", relativePath);
  if (existsSync(filePath)) {
    const content = readFileSync(filePath);
    const mime = getContentType(filePath);
    return c.newResponse(content, 200, {
      "Content-Type": mime,
      "Cache-Control": "no-cache, no-store, must-revalidate",
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

// Admin API 路由（需要管理员权限）
// TODO: 添加管理员权限中间件
app.route("/admin", adminProvidersRouter);
app.route("/admin", adminModelsRouter);

// Favicon 处理 - 返回 204 No Content 避免浏览器报错
app.get("/favicon.ico", (c) => {
  return c.newResponse(null, 204);
});

// SPA 路由 - 客户端首页（不需要认证）
app.get("/", (c) => {
  const indexPath = join(process.cwd(), "web-client/dist/index.html");
  if (existsSync(indexPath)) {
    const html = readFileSync(indexPath, "utf-8");
    return c.html(html);
  }
  // 如果前端未构建，返回 JSON 信息
  return c.json({
    message: "Welcome to LMRouter!",
    uptime: getUptime(),
    apis_available: ["anthropic", "openai", "v1"],
    note: "Client frontend not built. Run 'cd web-client && pnpm build'.",
  });
});

// SPA 路由 - 管理后台首页（需要认证）
app.get("/admin", (c) => {
  const indexPath = join(process.cwd(), "web-admin/dist/index.html");
  if (existsSync(indexPath)) {
    const html = readFileSync(indexPath, "utf-8");
    return c.newResponse(html, 200, {
      "Content-Type": "text/html",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    });
  }
  return c.json({
    error: { message: "Admin frontend not built. Run 'cd web-admin && pnpm build'." }
  }, 404);
});

// 管理后台特殊页面 - 清除缓存指南
app.get("/admin/clear-cache.html", (c) => {
  const clearCachePath = join(process.cwd(), "web-admin/dist/clear-cache.html");
  if (existsSync(clearCachePath)) {
    const content = readFileSync(clearCachePath, "utf-8");
    return c.newResponse(content, 200, {
      "Content-Type": "text/html",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    });
  }
  return c.json({ error: { message: "Clear cache page not found" } }, 404);
});

// 管理后台特殊页面 - 后端测试工具
app.get("/admin/test-backend.html", (c) => {
  const testPath = join(process.cwd(), "web-admin/dist/test-backend.html");
  if (existsSync(testPath)) {
    const content = readFileSync(testPath, "utf-8");
    return c.newResponse(content, 200, {
      "Content-Type": "text/html",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    });
  }
  return c.json({ error: { message: "Test page not found" } }, 404);
});

// SPA fallback - 客户端路由
app.get("/*", (c) => {
  const requestPath = c.req.path as string;

  // 如果是管理后台路径，返回管理后台的 index.html
  if (requestPath.startsWith("/admin")) {
    const indexPath = join(process.cwd(), "web-admin/dist/index.html");
    if (existsSync(indexPath)) {
      const html = readFileSync(indexPath, "utf-8");
      return c.html(html);
    }
    return c.json({
      error: { message: "Admin frontend not found." }
    }, 404);
  }

  // 否则返回客户端的 index.html
  const indexPath = join(process.cwd(), "web-client/dist/index.html");
  if (existsSync(indexPath)) {
    const html = readFileSync(indexPath, "utf-8");
    return c.html(html);
  }

  // 如果前端未构建，返回 JSON 信息
  return c.json({
    message: "Welcome to LMRouter!",
    uptime: getUptime(),
    apis_available: ["anthropic", "openai", "v1"],
    path: requestPath,
  });
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
