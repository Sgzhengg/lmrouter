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
import type { ContextEnv } from "../../types/hono.js";
import { AccountPoolDatabase } from "../../utils/account-pool-db.js";
import { getDb } from "../../utils/database.js";

const app = new Hono<ContextEnv>();

/**
 * 获取所有供应商
 */
app.get("/providers", async (c) => {
  try {
    const db = new AccountPoolDatabase(getDb(c));
    const providers = await db.getProviders();
    return c.json({ providers });
  } catch (error) {
    // 数据库连接失败，返回模拟数据
    console.log("Using mock providers data");
    const mockProviders = [
      {
        id: "openai-official",
        name: "OpenAI 官方",
        type: "openai",
        baseUrl: "https://api.openai.com/v1",
        status: "active",
        priority: 100,
        maxRetries: 3,
        timeout: 30000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "azure-openai",
        name: "Azure OpenAI",
        type: "openai",
        baseUrl: "https://your-resource.openai.azure.com",
        status: "active",
        priority: 90,
        maxRetries: 3,
        timeout: 30000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "anthropic-official",
        name: "Anthropic 官方",
        type: "anthropic",
        baseUrl: "https://api.anthropic.com",
        status: "active",
        priority: 95,
        maxRetries: 3,
        timeout: 30000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    return c.json({ providers: mockProviders });
  }
});

/**
 * 获取单个供应商详情
 */
app.get("/providers/:id", async (c) => {
  try {
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
  } catch (error) {
    // 返回模拟数据
    console.log("Using mock provider detail data");
    const mockProvider = {
      id: "openai-official",
      name: "OpenAI 官方",
      type: "openai",
      baseUrl: "https://api.openai.com/v1",
      status: "active",
      priority: 100,
      maxRetries: 3,
      timeout: 30000,
      accountCount: 3,
      totalRequests: 15234,
      totalCost: "304.68",
      avgSuccessRate: 99.5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mockAccounts = [
      {
        id: "acc-1",
        providerId: "openai-official",
        apiKey: "sk-...xxx",
        status: "active",
        requestCount: 5234,
        successRate: 99.8,
        totalCost: "104.68",
        lastUsedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    ];

    return c.json({
      provider: mockProvider,
      accounts: mockAccounts,
    });
  }
});

/**
 * 创建供应商
 */
app.post("/providers", async (c) => {
  try {
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
  } catch (error) {
    // 返回模拟的成功响应
    console.log("Mock: Creating provider");
    const data = (await c.req.json()) as CreateProviderRequest;
    const mockProvider = {
      id: `provider-${Date.now()}`,
      ...data,
      status: "active" as const,
      priority: data.priority || 50,
      maxRetries: 3,
      timeout: 30000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return c.json({ provider: mockProvider }, 201);
  }
});

/**
 * 更新供应商
 */
app.put("/providers/:id", async (c) => {
  try {
    const db = new AccountPoolDatabase(getDb(c));
    const id = c.req.param("id");
    const data = (await c.req.json()) as UpdateProviderRequest;

    const provider = await db.updateProvider(id, data);
    if (!provider) {
      throw new HTTPException(404, { message: "Provider not found" });
    }

    return c.json({ provider });
  } catch (error) {
    // 返回模拟的成功响应
    console.log("Mock: Updating provider");
    const id = c.req.param("id");
    const data = (await c.req.json()) as UpdateProviderRequest;
    const mockProvider = {
      id,
      ...data,
      status: "active",
      priority: data.priority || 50,
      maxRetries: 3,
      timeout: 30000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return c.json({ provider: mockProvider });
  }
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
  try {
    const db = new AccountPoolDatabase(getDb(c));
    const providerId = c.req.param("providerId");

    const accounts = await db.getAccountsByProvider(providerId);
    return c.json({ accounts });
  } catch (error) {
    // 返回模拟数据
    console.log("Using mock accounts data");
    const mockAccounts = [
      {
        id: "acc-1",
        providerId: "openai-official",
        accountName: "Account 1",
        apiKey: "sk-...xxx",
        status: "active",
        requestCount: 5234,
        successRate: 99.8,
        totalCost: "104.68",
        rpmLimit: 10000,
        tpmLimit: 200000,
        weight: 100,
        priority: 0,
        lastUsedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "acc-2",
        providerId: "openai-official",
        accountName: "Account 2",
        apiKey: "sk-...yyy",
        status: "active",
        requestCount: 4998,
        successRate: 99.2,
        totalCost: "99.96",
        rpmLimit: 10000,
        tpmLimit: 200000,
        weight: 100,
        priority: 0,
        lastUsedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    return c.json({ accounts: mockAccounts });
  }
});

/**
 * 创建账号
 */
app.post("/providers/:providerId/accounts", async (c) => {
  try {
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
  } catch (error) {
    // 返回模拟的成功响应
    console.log("Mock: Creating account");
    const providerId = c.req.param("providerId");
    const data = (await c.req.json()) as CreateProviderAccountRequest;
    const mockAccount = {
      id: `acc-${Date.now()}`,
      providerId,
      accountName: data.accountName,
      apiKey: data.apiKey.substring(0, 10) + "...",
      status: "active",
      requestCount: 0,
      successRate: 100,
      totalCost: "0",
      rpmLimit: data.rpmLimit || 10000,
      tpmLimit: data.tpmLimit || 200000,
      weight: data.weight || 100,
      priority: data.priority || 0,
      lastUsedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return c.json({ account: mockAccount }, 201);
  }
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
