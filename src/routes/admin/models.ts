// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import type {
  CreateModelRequest,
  AddProviderToModelRequest,
} from "../../types/account-pool.js";
import type { ContextEnv } from "../../types/hono.js";
import { AccountPoolDatabase } from "../../utils/account-pool-db.js";
import { getDb } from "../../utils/database.js";

const app = new Hono<ContextEnv>();

/**
 * 获取所有模型
 */
app.get("/models", async (c) => {
  const db = new AccountPoolDatabase(getDb(c));
  const models = await db.getModels();
  return c.json({ models });
});

/**
 * 获取单个模型详情
 */
app.get("/models/:id", async (c) => {
  const db = new AccountPoolDatabase(getDb(c));
  const id = c.req.param("id");

  const model = await db.getModel(id);
  if (!model) {
    throw new HTTPException(404, { message: "Model not found" });
  }

  // 获取该模型的所有供应商
  const modelProviders = await db.getModelProviders(id);

  // TODO: 关联供应商和账号信息
  // const providersWithAccounts = await Promise.all(
  //   modelProviders.map(async (mp) => {
  //     const provider = await db.getProvider(mp.providerId);
  //     const accounts = await db.getAccountsByProvider(mp.providerId);
  //     return {
  //       ...mp,
  //       provider,
  //       accounts,
  //     };
  //   })
  // );

  return c.json({
    model,
    providers: modelProviders,
  });
});

/**
 * 创建模型
 */
app.post("/models", async (c) => {
  const db = new AccountPoolDatabase(getDb(c));
  const data = (await c.req.json()) as CreateModelRequest;

  // 检查名称是否已存在
  const existing = await db.getModelByName(data.name);
  if (existing) {
    throw new HTTPException(400, { message: "Model name already exists" });
  }

  const model = await db.createModel({
    ...data,
    type: data.type,
  });

  return c.json({ model }, 201);
});

/**
 * 更新模型
 */
app.put("/models/:id", async (c) => {
  const db = new AccountPoolDatabase(getDb(c));
  const id = c.req.param("id");
  const data = await c.req.json();

  const model = await db.updateModel(id, data);
  if (!model) {
    throw new HTTPException(404, { message: "Model not found" });
  }

  return c.json({ model });
});

/**
 * 删除模型
 */
app.delete("/models/:id", async (c) => {
  const db = new AccountPoolDatabase(getDb(c));
  const id = c.req.param("id");

  await db.deleteModel(id);
  return c.json({ success: true });
});

/**
 * 为模型添加供应商
 */
app.post("/models/:id/providers", async (c) => {
  const db = new AccountPoolDatabase(getDb(c));
  const modelId = c.req.param("id");
  const data = (await c.req.json()) as AddProviderToModelRequest;

  // 验证模型存在
  const model = await db.getModel(modelId);
  if (!model) {
    throw new HTTPException(404, { message: "Model not found" });
  }

  // 验证供应商存在
  const provider = await db.getProvider(data.providerId);
  if (!provider) {
    throw new HTTPException(404, { message: "Provider not found" });
  }

  // 检查是否已经添加过
  const existing = await db.getModelProviders(modelId);
  const alreadyAdded = existing.find((mp: any) => mp.providerId === data.providerId);
  if (alreadyAdded) {
    throw new HTTPException(400, {
      message: "Provider already added to this model",
    });
  }

  const modelProvider = await db.addProviderToModel({
    modelId,
    providerId: data.providerId,
    providerModelName: data.providerModelName,
    maxTokens: data.maxTokens,
    pricingInput: data.pricingInput?.toString(),
    pricingOutput: data.pricingOutput?.toString(),
    pricingImage: data.pricingImage?.toString(),
    pricingAudio: data.pricingAudio?.toString(),
    priority: data.priority || 0,
    isEnabled: true,
  });

  return c.json({ modelProvider }, 201);
});

/**
 * 更新模型的供应商配置
 */
app.put("/models/:id/providers/:providerId", async (c) => {
  const db = new AccountPoolDatabase(getDb(c));
  const modelId = c.req.param("id");
  const providerId = c.req.param("providerId");
  const data = await c.req.json();

  // 获取现有的 model provider
  const existing = await db.getModelProviders(modelId);
  const modelProvider = existing.find((mp: any) => mp.providerId === providerId);

  if (!modelProvider) {
    throw new HTTPException(404, {
      message: "Model provider not found",
    });
  }

  const updated = await db.updateModelProvider(modelProvider.id, data);

  return c.json({ modelProvider: updated });
});

/**
 * 从模型移除供应商
 */
app.delete("/models/:id/providers/:providerId", async (c) => {
  const db = new AccountPoolDatabase(getDb(c));
  const modelId = c.req.param("id");
  const providerId = c.req.param("providerId");

  // 获取现有的 model provider
  const existing = await db.getModelProviders(modelId);
  const modelProvider = existing.find((mp: any) => mp.providerId === providerId);

  if (!modelProvider) {
    throw new HTTPException(404, {
      message: "Model provider not found",
    });
  }

  await db.removeModelProvider(modelProvider.id);

  return c.json({ success: true });
});

/**
 * 启用/禁用模型的供应商
 */
app.patch("/models/:id/providers/:providerId/status", async (c) => {
  const db = new AccountPoolDatabase(getDb(c));
  const modelId = c.req.param("id");
  const providerId = c.req.param("providerId");
  const { isEnabled } = await c.req.json();

  // 获取现有的 model provider
  const existing = await db.getModelProviders(modelId);
  const modelProvider = existing.find((mp: any) => mp.providerId === providerId);

  if (!modelProvider) {
    throw new HTTPException(404, {
      message: "Model provider not found",
    });
  }

  const updated = await db.updateModelProvider(modelProvider.id, { isEnabled });

  return c.json({ modelProvider: updated });
});

export default app;
