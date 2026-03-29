// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

import { eq, and, desc, sql, gt } from "drizzle-orm";
import type {
  ProviderAccount,
  NewAccountUsageLog,
} from "../types/account-pool.js";
import { accountPoolSchema } from "./database.js";

const {
  providers,
  providerAccounts,
  models,
  modelProviders,
  accountUsageLogs,
  tenants,
  userTenants,
  routingLogs,
} = accountPoolSchema;

/**
 * 账号池数据库操作类
 */
export class AccountPoolDatabase {
  constructor(private db: any) {}

  // ============================================
  // Provider 操作
  // ============================================

  async getProviders() {
    return await this.db.select().from(providers);
  }

  async getProvider(id: string) {
    const [provider] = await this.db
      .select()
      .from(providers)
      .where(eq(providers.id, id))
      .limit(1);
    return provider;
  }

  async getProviderByName(name: string) {
    const [provider] = await this.db
      .select()
      .from(providers)
      .where(eq(providers.name, name))
      .limit(1);
    return provider;
  }

  async createProvider(data: any) {
    const [provider] = await this.db
      .insert(providers)
      .values(data)
      .returning();
    return provider;
  }

  async updateProvider(id: string, data: any) {
    const [provider] = await this.db
      .update(providers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(providers.id, id))
      .returning();
    return provider;
  }

  async deleteProvider(id: string) {
    await this.db.delete(providers).where(eq(providers.id, id));
  }

  // ============================================
  // Provider Account 操作
  // ============================================

  async getAccountsByProvider(providerId: string): Promise<ProviderAccount[]> {
    return await this.db
      .select()
      .from(providerAccounts)
      .where(eq(providerAccounts.providerId, providerId));
  }

  async getAllAccounts(): Promise<ProviderAccount[]> {
    return await this.db.select().from(providerAccounts);
  }

  async getAccount(id: string): Promise<ProviderAccount | null> {
    const [account] = await this.db
      .select()
      .from(providerAccounts)
      .where(eq(providerAccounts.id, id))
      .limit(1);
    return account || null;
  }

  async getAccountByName(providerId: string, accountName: string) {
    const [account] = await this.db
      .select()
      .from(providerAccounts)
      .where(
        and(
          eq(providerAccounts.providerId, providerId),
          eq(providerAccounts.accountName, accountName)
        )
      )
      .limit(1);
    return account;
  }

  async createAccount(data: any) {
    const [account] = await this.db
      .insert(providerAccounts)
      .values({
        ...data,
        status: data.status || "active",
        weight: data.weight || 100,
        priority: data.priority || 0,
        failureCount: 0,
        successRate: "100",
      })
      .returning();
    return account;
  }

  async updateAccount(id: string, data: any) {
    const [account] = await this.db
      .update(providerAccounts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(providerAccounts.id, id))
      .returning();
    return account;
  }

  async deleteAccount(id: string) {
    await this.db.delete(providerAccounts).where(eq(providerAccounts.id, id));
  }

  async updateAccountStatus(id: string, status: string) {
    return await this.updateAccount(id, { status });
  }

  async updateAccountFailureCount(id: string, count: number) {
    return await this.updateAccount(id, { failureCount: count });
  }

  async resetAccountFailureCount(id: string) {
    return await this.updateAccount(id, { failureCount: 0 });
  }

  async updateAccountLastSuccess(id: string) {
    const account = await this.getAccount(id);
    if (!account) return;

    const newCount = (account.requestCount || 0) + 1;
    return await this.updateAccount(id, {
      lastSuccessAt: new Date(),
      requestCount: newCount,
    });
  }

  async updateAccountStats(id: string, stats: {
    success: boolean;
    latency: number;
    inputTokens: number;
    outputTokens: number;
    cost: number;
  }) {
    const account = await this.getAccount(id);
    if (!account) return;

    const newTotalCost = sql`${providerAccounts.totalCost} + ${stats.cost}`;
    const newRequestCount = (account.requestCount || 0) + 1;

    await this.db
      .update(providerAccounts)
      .set({
        totalCost: newTotalCost,
        requestCount: newRequestCount,
        lastFailureAt: stats.success ? undefined : new Date(),
      })
      .where(eq(providerAccounts.id, id));
  }

  async updateAccountSuccessRate(id: string, successRate: number) {
    return await this.updateAccount(id, {
      successRate: successRate.toString(),
    });
  }

  async incrementAccountRpm(id: string) {
    const account = await this.getAccount(id);
    if (!account) return;

    const newRpm = (account.rpmUsed || 0) + 1;
    await this.updateAccount(id, { rpmUsed: newRpm });
  }

  async resetAccountRpm(id: string) {
    await this.updateAccount(id, { rpmUsed: 0, tpmUsed: 0 });
  }

  // ============================================
  // Account Usage Logs 操作
  // ============================================

  async createAccountUsageLog(data: NewAccountUsageLog) {
    const [log] = await this.db
      .insert(accountUsageLogs)
      .values(data)
      .returning();
    return log;
  }

  async getRecentAccountLogs(accountId: string, timeRange: string = "1h") {
    const startTime = new Date();
    const intervalMs = timeRange === "1h" ? 60 * 60 * 1000 :
                      timeRange === "24h" ? 24 * 60 * 60 * 1000 :
                      7 * 24 * 60 * 60 * 1000;
    startTime.setTime(startTime.getTime() - intervalMs);

    return await this.db
      .select()
      .from(accountUsageLogs)
      .where(
        and(
          eq(accountUsageLogs.accountId, accountId),
          gt(accountUsageLogs.createdAt, startTime)
        )
      )
      .orderBy(desc(accountUsageLogs.createdAt));
  }

  async getAccountLogsStats(accountId: string, timeRange: string = "1h") {
    const logs = await this.getRecentAccountLogs(accountId, timeRange);

    const total = logs.length;
    const successful = logs.filter((l: any) => l.status === "success").length;
    const errors = logs.filter((l: any) => l.status === "error").length;
    const rateLimited = logs.filter((l: any) => l.status === "rate_limited").length;
    const banned = logs.filter((l: any) => l.status === "banned").length;

    const avgLatency = logs.reduce((sum: number, l: any) => sum + (l.latencyMs || 0), 0) / total;
    const totalCost = logs.reduce((sum: number, l: any) => sum + Number(l.cost || 0), 0);

    return {
      total,
      successful,
      errors,
      rateLimited,
      banned,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      avgLatency: avgLatency || 0,
      totalCost,
    };
  }

  // ============================================
  // Model 操作
  // ============================================

  async getModels() {
    return await this.db.select().from(models);
  }

  async getModel(id: string) {
    const [model] = await this.db
      .select()
      .from(models)
      .where(eq(models.id, id))
      .limit(1);
    return model;
  }

  async getModelByName(name: string) {
    const [model] = await this.db
      .select()
      .from(models)
      .where(eq(models.name, name))
      .limit(1);
    return model;
  }

  async createModel(data: any) {
    const [model] = await this.db.insert(models).values(data).returning();
    return model;
  }

  async updateModel(id: string, data: any) {
    const [model] = await this.db
      .update(models)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(models.id, id))
      .returning();
    return model;
  }

  async deleteModel(id: string) {
    await this.db.delete(models).where(eq(models.id, id));
  }

  // ============================================
  // Model Provider 操作
  // ============================================

  async getModelProviders(modelId: string) {
    return await this.db
      .select()
      .from(modelProviders)
      .where(eq(modelProviders.modelId, modelId));
  }

  async addProviderToModel(data: any) {
    const [modelProvider] = await this.db
      .insert(modelProviders)
      .values(data)
      .returning();
    return modelProvider;
  }

  async updateModelProvider(id: string, data: any) {
    const [modelProvider] = await this.db
      .update(modelProviders)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(modelProviders.id, id))
      .returning();
    return modelProvider;
  }

  async removeModelProvider(id: string) {
    await this.db.delete(modelProviders).where(eq(modelProviders.id, id));
  }

  // ============================================
  // Routing Logs 操作
  // ============================================

  async createRoutingLog(data: any) {
    const [log] = await this.db.insert(routingLogs).values(data).returning();
    return log;
  }

  async getRoutingLogs(filters: {
    startTime?: Date;
    endTime?: Date;
    provider?: string;
    strategy?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    let query = this.db.select().from(routingLogs);

    if (filters.startTime) {
      query = query.where(gt(routingLogs.createdAt, filters.startTime));
    }
    if (filters.endTime) {
      // Add end time filter
    }
    if (filters.provider) {
      // Add provider filter
    }
    if (filters.strategy) {
      // Add strategy filter
    }
    if (filters.status) {
      // Add status filter
    }

    return await query
      .orderBy(desc(routingLogs.createdAt))
      .limit(filters.limit || 100)
      .offset(filters.offset || 0);
  }
}

/**
 * Database 类型别名
 */
export type Database = AccountPoolDatabase;
