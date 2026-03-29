// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

// ============================================
// 供应商表（providers）
// ============================================
export const providers = pgTable(
  "providers",
  {
    id: text("id")
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    name: text("name").notNull().unique(),
    displayName: text("display_name").notNull(),
    type: text("type").notNull(), // 'openai', 'anthropic', 'google', 'fireworks'
    baseUrl: text("base_url").notNull(),
    icon: text("icon"),
    description: text("description"),
    website: text("website"),
    status: text("status").default("active"), // 'active', 'inactive', 'maintenance'
    priority: integer("priority").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    statusIdx: index("providers_status_idx").on(table.status),
  })
);

// ============================================
// 账号池表（provider_accounts）
// ============================================
export const providerAccounts = pgTable(
  "provider_accounts",
  {
    id: text("id")
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    providerId: text("provider_id")
      .notNull()
      .references(() => providers.id, { onDelete: "cascade" }),
    accountName: text("account_name").notNull(),
    apiKeyEncrypted: text("api_key_encrypted").notNull(),
    status: text("status").default("active"), // 'active', 'rate_limited', 'banned', 'maintenance', 'degraded'

    // 速率限制状态
    rpmUsed: integer("rpm_used").default(0),
    tpmUsed: integer("tpm_used").default(0),
    rpmLimit: integer("rpm_limit"),
    tpmLimit: integer("tpm_limit"),
    resetAt: timestamp("reset_at"),

    // 故障统计
    failureCount: integer("failure_count").default(0),
    lastFailureAt: timestamp("last_failure_at"),
    lastSuccessAt: timestamp("last_success_at"),
    successRate: numeric("success_rate", { precision: 5, scale: 2 }), // 最近 1 小时成功率

    // 轮询权重
    weight: integer("weight").default(100),
    priority: integer("priority").default(0),

    // 成本追踪
    totalCost: numeric("total_cost", { precision: 21, scale: 9 }).default("0"),
    requestCount: integer("request_count").default(0),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    providerStatusIdx: index("provider_accounts_provider_status_idx").on(
      table.providerId,
      table.status
    ),
    successRateIdx: index("provider_accounts_success_rate_idx").on(
      table.successRate
    ),
  })
);

// ============================================
// 模型表（models）
// ============================================
export const models = pgTable(
  "models",
  {
    id: text("id")
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    name: text("name").notNull().unique(),
    displayName: text("display_name"),
    type: text("type").notNull(), // 'language', 'image', 'embedding', 'audio'
    icon: text("icon"),
    author: text("author"),
    description: text("description"),
    contextWindow: integer("context_window"),
    maxTokens: integer("max_tokens"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    typeIdx: index("models_type_idx").on(table.type),
  })
);

// ============================================
// 模型-供应商关联表（model_providers）
// ============================================
export const modelProviders = pgTable(
  "model_providers",
  {
    id: text("id")
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    modelId: text("model_id")
      .notNull()
      .references(() => models.id, { onDelete: "cascade" }),
    providerId: text("provider_id")
      .notNull()
      .references(() => providers.id, { onDelete: "cascade" }),
    providerModelName: text("provider_model_name").notNull(),
    maxTokens: integer("max_tokens"),
    pricingInput: numeric("pricing_input", { precision: 21, scale: 9 }),
    pricingOutput: numeric("pricing_output", { precision: 21, scale: 9 }),
    pricingImage: numeric("pricing_image", { precision: 21, scale: 9 }),
    pricingAudio: numeric("pricing_audio", { precision: 21, scale: 9 }),
    isEnabled: boolean("is_enabled").default(true),
    priority: integer("priority").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    modelProviderUniqueIdx: index("model_providers_model_provider_unique_idx").on(
      table.modelId,
      table.providerId
    ),
    enabledIdx: index("model_providers_enabled_idx").on(table.isEnabled),
  })
);

// ============================================
// 账号使用日志表（account_usage_logs）
// ============================================
export const accountUsageLogs = pgTable(
  "account_usage_logs",
  {
    id: text("id")
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    accountId: text("account_id")
      .notNull()
      .references(() => providerAccounts.id, { onDelete: "cascade" }),
    userId: text("user_id"),
    requestId: text("request_id").notNull(),
    modelName: text("model_name").notNull(),
    status: text("status").notNull(), // 'success', 'rate_limited', 'error', 'banned'
    errorCode: text("error_code"),
    errorMessage: text("error_message"),
    latencyMs: integer("latency_ms"),
    inputTokens: integer("input_tokens"),
    outputTokens: integer("output_tokens"),
    cost: numeric("cost", { precision: 21, scale: 9 }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    accountTimeIdx: index("account_usage_logs_account_time_idx").on(
      table.accountId,
      table.createdAt
    ),
    statusIdx: index("account_usage_logs_status_idx").on(table.status),
  })
);

// ============================================
// 租户表（tenants）
// ============================================
export const tenants = pgTable(
  "tenants",
  {
    id: text("id")
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    name: text("name").notNull(),
    type: text("type").notNull(), // 'individual', 'enterprise'

    // 2B 企业信息
    companyName: text("company_name"),
    businessLicense: text("business_license"),
    contactPerson: text("contact_person"),
    contactEmail: text("contact_email"),

    // 配额
    monthlyQuota: numeric("monthly_quota", { precision: 21, scale: 9 }).default(
      "0"
    ),
    monthlyUsed: numeric("monthly_used", { precision: 21, scale: 9 }).default(
      "0"
    ),
    quotaResetAt: timestamp("quota_reset_at"),

    // 限制
    maxRequestsPerMinute: integer("max_requests_per_minute").default(60),
    maxConcurrentRequests: integer("max_concurrent_requests").default(5),

    // 状态
    status: text("status").default("active"), // 'active', 'suspended', 'deleted'
    tier: text("tier").default("free"), // 'free', 'pro', 'enterprise'

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    statusIdx: index("tenants_status_idx").on(table.status),
    typeIdx: index("tenants_type_idx").on(table.type),
  })
);

// ============================================
// 用户-租户关联表（user_tenants）
// ============================================
export const userTenants = pgTable(
  "user_tenants",
  {
    id: text("id")
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    userId: text("user_id")
      .notNull(),
    tenantId: text("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // 'owner', 'admin', 'member'
    invitedBy: text("invited_by"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userTenantUniqueIdx: index("user_tenants_user_tenant_unique_idx").on(
      table.userId,
      table.tenantId
    ),
  })
);

// ============================================
// 路由决策日志表（routing_logs）
// ============================================
export const routingLogs = pgTable(
  "routing_logs",
  {
    id: text("id")
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    requestId: text("request_id").notNull(),
    modelName: text("model_name").notNull(),
    strategy: text("strategy").notNull(), // 'nitro', 'floor', 'balanced', 'round-robin', 'manual'
    selectedProvider: text("selected_provider").notNull(),
    selectedAccount: text("selected_account").notNull(),
    alternatives: jsonb("alternatives"), // 备选提供商列表
    decisionReason: text("decision_reason"),
    ttftMs: integer("ttft_ms"),
    totalLatencyMs: integer("total_latency_ms"),
    inputTokens: integer("input_tokens"),
    outputTokens: integer("output_tokens"),
    cost: numeric("cost", { precision: 21, scale: 9 }),
    status: text("status"), // 'success', 'failed', 'fallback'
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    timestampIdx: index("routing_logs_timestamp_idx").on(table.createdAt),
    providerIdx: index("routing_logs_provider_idx").on(
      table.selectedProvider,
      table.createdAt
    ),
    strategyIdx: index("routing_logs_strategy_idx").on(table.strategy),
  })
);
