// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type {
  CreateProviderRequest,
  UpdateProviderRequest,
  CreateProviderAccountRequest,
  UpdateProviderAccountRequest,
  TestProviderConnectionRequest,
  TestProviderConnectionResponse,
} from "../../types/account-pool.js";
import { AccountPoolDatabase } from "../../utils/account-pool-db.js";
import { getDb } from "../../utils/database.js";

const app = new Hono();

/**
 * 获取所有供应商
 */
app.get("/providers", async (c) => {
  const db = new AccountPoolDatabase(getDb(c));
  const providers = await db.getProviders();
  return c.json({ providers });
});

/**
 * 获取单个供应商详情
 */
app.get("/providers/:id", async (c) => {
  const db = new AccountPoolDatabase(getDb(c));
  const id = c.req.param("id");

  const provider = await db.getProvider(id);
  if (!provider) {
    throw new HTTPException(404, { message: "Provider not found" });
  }

  // 获取该供应商的所有账号
  const accounts = await db.getAccountsByProvider(id);

  // 计算统计信息
  const totalRequests = accounts.reduce((sum, a) => sum + (a.requestCount || 0), 0);
  const totalCost = accounts.reduce((sum, a) => sum + Number(a.totalCost || 0), 0);
  const avgSuccessRate =
    accounts.length > 0
      ? accounts.reduce((sum, a) => sum + Number(a.successRate || 0), 0) /
        accounts.length
      : 0;

  return c.json({
    provider: {
      ...provider,
      accountCount: accounts.length,
      totalRequests,
      totalCost: totalCost.toString(),
      avgSuccessRate,
    },
    accounts,
  });
});

/**
 * 创建供应商
 */
app.post("/providers", async (c) => {
  const db = new AccountPoolDatabase(getDb(c));
  const data = (await c.req.json()) as CreateProviderRequest;

  // 检查名称是否已存在
  const existing = await db.getProviderByName(data.name);
  if (existing) {
    throw new HTTPException(400, { message: "Provider name already exists" });
  }

  const provider = await db.createProvider({
    ...data,
    status: "active",
  });

  return c.json({ provider }, 201);
});

/**
 * 更新供应商
 */
app.put("/providers/:id", async (c) => {
  const db = new AccountPoolDatabase(getDb(c));
  const id = c.req.param("id");
  const data = (await c.req.json()) as UpdateProviderRequest;

  const provider = await db.updateProvider(id, data);
  if (!provider) {
    throw new HTTPException(404, { message: "Provider not found" });
  }

  return c.json({ provider });
});

/**
 * 删除供应商
 */
app.delete("/providers/:id", async (c) => {
  const db = new AccountPoolDatabase(getDb(c));
  const id = c.req.param("id");

  await db.deleteProvider(id);
  return c.json({ success: true });
});

/**
 * 启用/禁用供应商
 */
app.patch("/providers/:id/status", async (c) => {
  const db = new AccountPoolDatabase(getDb(c));
  const id = c.req.param("id");
  const { status } = await c.req.json();

  if (!["active", "inactive", "maintenance"].includes(status)) {
    throw new HTTPException(400, { message: "Invalid status" });
  }

  const provider = await db.updateProvider(id, { status });
  if (!provider) {
    throw new HTTPException(404, { message: "Provider not found" });
  }

  return c.json({ provider });
});

// ============================================
// 账号管理
// ============================================

/**
 * 获取供应商的所有账号
 */
app.get("/providers/:providerId/accounts", async (c) => {
  const db = new AccountPoolDatabase(getDb(c));
  const providerId = c.req.param("providerId");

  const accounts = await db.getAccountsByProvider(providerId);
  return c.json({ accounts });
});

/**
 * 创建账号
 */
app.post("/providers/:providerId/accounts", async (c) => {
  const db = new AccountPoolDatabase(getDb(c));
  const providerId = c.req.param("providerId");
  const data = (await c.req.json()) as CreateProviderAccountRequest;

  // 验证供应商存在
  const provider = await db.getProvider(providerId);
  if (!provider) {
    throw new HTTPException(404, { message: "Provider not found" });
  }

  // 检查账号名是否已存在
  const existing = await db.getAccountByName(providerId, data.accountName);
  if (existing) {
    throw new HTTPException(400, { message: "Account name already exists" });
  }

  // TODO: 加密 API Key
  const apiKeyEncrypted = data.apiKey; // 暂时不加密，后续需要实现加密

  const account = await db.createAccount({
    providerId,
    accountName: data.accountName,
    apiKeyEncrypted,
    rpmLimit: data.rpmLimit,
    tpmLimit: data.tpmLimit,
    weight: data.weight || 100,
    priority: data.priority || 0,
  });

  return c.json({ account }, 201);
});

/**
 * 更新账号
 */
app.put("/providers/:providerId/accounts/:accountId", async (c) => {
  const db = new AccountPoolDatabase(getDb(c));
  const providerId = c.req.param("providerId");
  const accountId = c.req.param("accountId");
  const data = (await c.req.json()) as UpdateProviderAccountRequest;

  // 验证账号存在
  const account = await db.getAccount(accountId);
  if (!account || account.providerId !== providerId) {
    throw new HTTPException(404, { message: "Account not found" });
  }

  // 如果更新 API Key，需要重新加密
  let apiKeyEncrypted = undefined;
  if (data.apiKey) {
    // TODO: 加密 API Key
    apiKeyEncrypted = data.apiKey;
  }

  const updatedAccount = await db.updateAccount(accountId, {
    ...data,
    ...(apiKeyEncrypted && { apiKeyEncrypted }),
  });

  return c.json({ account: updatedAccount });
});

/**
 * 删除账号
 */
app.delete("/providers/:providerId/accounts/:accountId", async (c) => {
  const db = new AccountPoolDatabase(getDb(c));
  const providerId = c.req.param("providerId");
  const accountId = c.req.param("accountId");

  // 验证账号存在
  const account = await db.getAccount(accountId);
  if (!account || account.providerId !== providerId) {
    throw new HTTPException(404, { message: "Account not found" });
  }

  await db.deleteAccount(accountId);
  return c.json({ success: true });
});

/**
 * 测试供应商连接
 */
app.post("/providers/:id/test", async (c) => {
  const db = new AccountPoolDatabase(getDb(c));
  const id = c.req.param("id");
  const data = (await c.req.json()) as TestProviderConnectionRequest;

  const provider = await db.getProvider(id);
  if (!provider) {
    throw new HTTPException(404, { message: "Provider not found" });
  }

  const startTime = Date.now();

  try {
    // TODO: 实现真实的连接测试
    // 这里需要根据 provider.type 调用相应的 API
    // 暂时返回模拟数据
    const latencyMs = Date.now() - startTime;

    const response: TestProviderConnectionResponse = {
      success: true,
      latencyMs,
      details: {
        modelName: data.modelName || "test-model",
        responseTime: latencyMs,
      },
    };

    return c.json(response);
  } catch (error) {
    const response: TestProviderConnectionResponse = {
      success: false,
      latencyMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : "Unknown error",
    };
    return c.json(response, 500);
  }
});

/**
 * 获取账号健康状态
 */
app.get("/providers/:providerId/accounts/:accountId/health", async (c) => {
  const db = new AccountPoolDatabase(getDb(c));
  const providerId = c.req.param("providerId");
  const accountId = c.req.param("accountId");

  // 验证账号存在
  const account = await db.getAccount(accountId);
  if (!account || account.providerId !== providerId) {
    throw new HTTPException(404, { message: "Account not found" });
  }

  // 获取最近的使用统计
  const stats = await db.getAccountLogsStats(accountId, "1h");

  return c.json({
    accountId,
    status: account.status,
    health: {
      successRate: stats.successRate,
      totalRequests: stats.total,
      errorRate: (stats.errors / stats.total) * 100 || 0,
      avgLatencyMs: stats.avgLatency,
      recentErrors: stats.errors,
      recentRateLimited: stats.rateLimited,
      recentBanned: stats.banned,
    },
    lastSuccessAt: account.lastSuccessAt,
    lastFailureAt: account.lastFailureAt,
  });
});

export default app;
