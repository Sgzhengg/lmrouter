// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

import type {
  providers,
  providerAccounts,
  models,
  modelProviders,
  accountUsageLogs,
  tenants,
  userTenants,
  routingLogs,
} from "../models/account-pool.js";

// ============================================
// Provider 类型
// ============================================
export type Provider = typeof providers.$inferSelect;
export type NewProvider = typeof providers.$inferInsert;

export interface ProviderWithStats extends Provider {
  accountCount?: number;
  totalRequests?: number;
  totalCost?: string;
  avgSuccessRate?: number;
}

// ============================================
// Provider Account 类型
// ============================================
export type ProviderAccount = typeof providerAccounts.$inferSelect;
export type NewProviderAccount = typeof providerAccounts.$inferInsert;

export interface ProviderAccountWithProvider extends ProviderAccount {
  provider: Provider;
}

export interface AccountHealthStatus {
  status: "healthy" | "degraded" | "down";
  uptimePercentage: number;
  avgTtftMs: number;
  avgThroughputTps: number;
  errorRate: number;
  lastCheckAt: Date;
}

// ============================================
// Model 类型
// ============================================
export type Model = typeof models.$inferSelect;
export type NewModel = typeof models.$inferInsert;

export interface ModelWithProviders extends Model {
  providers: Array<
    ModelProvider & {
      provider: Provider;
      account?: ProviderAccount;
    }
  >;
}

// ============================================
// Model Provider 类型
// ============================================
export type ModelProvider = typeof modelProviders.$inferSelect;
export type NewModelProvider = typeof modelProviders.$inferInsert;

export interface ProviderWithMetrics {
  account: ProviderAccount;
  provider: Provider;
  healthStatus: "healthy" | "degraded" | "down";
  avgTtftMs: number;
  avgThroughput: number;
  uptime: number;
}

// ============================================
// Account Usage Log 类型
// ============================================
export type AccountUsageLog = typeof accountUsageLogs.$inferSelect;
export type NewAccountUsageLog = typeof accountUsageLogs.$inferInsert;

// ============================================
// Tenant 类型
// ============================================
export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;

export interface TenantWithUsers extends Tenant {
  users: Array<
    UserTenant & {
      user: {
        id: string;
        name: string;
        email: string;
      };
    }
  >;
}

// ============================================
// User Tenant 类型
// ============================================
export type UserTenant = typeof userTenants.$inferSelect;
export type NewUserTenant = typeof userTenants.$inferInsert;

// ============================================
// Routing Log 类型
// ============================================
export type RoutingLog = typeof routingLogs.$inferSelect;
export type NewRoutingLog = typeof routingLogs.$inferInsert;

// ============================================
// 路由策略相关类型
// ============================================
export type RoutingStrategyType =
  | "nitro" // 追求速度
  | "floor" // 追求低价
  | "balanced" // 平衡模式
  | "round-robin" // 轮询
  | "sticky" // 粘性
  | "manual"; // 手动

export interface RequestContext {
  userId?: string;
  tenantId?: string;
  apiKey?: string;
  modelName: string;
  messages: Array<{ role: string; content: string }>;
  estimatedTokens?: {
    input: number;
    output: number;
  };
  preferences?: {
    strategy?: RoutingStrategyType;
    preferredProvider?: string;
    maxCost?: number;
    maxLatency?: number;
  };
}

export interface ProviderSelection {
  provider: Provider;
  account: ProviderAccount;
  reason: string;
  alternatives: Array<{
    provider: Provider;
    account: ProviderAccount;
    score?: number;
  }>;
  scores?: {
    price?: number;
    speed?: number;
    reliability?: number;
    total?: number;
  };
}

export interface RequestResult {
  success: boolean;
  latency: number;
  tokens: {
    input: number;
    output: number;
  };
  cost: number;
  errorCode?: string;
  errorMessage?: string;
  ttft?: number;
}

// ============================================
// 账号选择策略类型
// ============================================
export type AccountSelectionStrategyType =
  | "round-robin"
  | "weighted-least-connections"
  | "success-rate-priority"
  | "random";

export interface AccountSelectionContext {
  providerId: string;
  userId?: string;
  tenantId?: string;
  modelName: string;
  estimatedTokens?: number;
}

// ============================================
// 性能指标类型
// ============================================
export type MetricType = "ttft" | "throughput" | "latency" | "uptime";

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface MetricDataPoint {
  timestamp: Date;
  value: number;
  metadata?: Record<string, any>;
}

export interface ProviderStats {
  providerId: string;
  timeRange: TimeRange;
  totalRequests: number;
  successRate: number;
  avgTtftMs: number;
  avgLatencyMs: number;
  throughputTps: number;
  totalCost: number;
  errorRate: number;
}

export interface ProviderComparison {
  providerId: string;
  providerName: string;
  avgTtftMs: number;
  avgCostPer1kTokens: number;
  successRate: number;
  totalRequests: number;
}

// ============================================
// API 请求/响应类型
// ============================================
export interface CreateProviderRequest {
  name: string;
  displayName: string;
  type: "openai" | "anthropic" | "google" | "fireworks";
  baseUrl: string;
  icon?: string;
  description?: string;
  website?: string;
  priority?: number;
}

export interface UpdateProviderRequest {
  displayName?: string;
  baseUrl?: string;
  icon?: string;
  description?: string;
  website?: string;
  status?: "active" | "inactive" | "maintenance";
  priority?: number;
}

export interface CreateProviderAccountRequest {
  providerId: string;
  accountName: string;
  apiKey: string;
  rpmLimit?: number;
  tpmLimit?: number;
  weight?: number;
  priority?: number;
}

export interface UpdateProviderAccountRequest {
  accountName?: string;
  apiKey?: string;
  status?: "active" | "rate_limited" | "banned" | "maintenance" | "degraded";
  rpmLimit?: number;
  tpmLimit?: number;
  weight?: number;
  priority?: number;
}

export interface TestProviderConnectionRequest {
  providerId: string;
  accountId?: string;
  modelName?: string;
}

export interface TestProviderConnectionResponse {
  success: boolean;
  latencyMs: number;
  error?: string;
  details?: {
    modelName: string;
    responseTime: number;
    ttft?: number;
  };
}

export interface CreateModelRequest {
  name: string;
  displayName?: string;
  type: "language" | "image" | "embedding" | "audio";
  icon?: string;
  author?: string;
  description?: string;
  contextWindow?: number;
  maxTokens?: number;
}

export interface AddProviderToModelRequest {
  providerId: string;
  providerModelName: string;
  maxTokens?: number;
  pricingInput?: number;
  pricingOutput?: number;
  pricingImage?: number;
  pricingAudio?: number;
  priority?: number;
}

export interface RoutingLogQuery {
  startTime?: string;
  endTime?: string;
  provider?: string;
  strategy?: string;
  status?: "success" | "failed" | "fallback";
  limit?: number;
  offset?: number;
}

export interface RoutingStats {
  timeRange: string;
  groupBy: "provider" | "strategy" | "model";
  stats: Array<{
    key: string;
    count: number;
    successRate: number;
    avgTtftMs: number;
    totalCost: number;
  }>;
}
