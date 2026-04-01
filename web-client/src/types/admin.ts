// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

/**
 * 管理界面类型定义
 */

// ============================================
// 供应商管理
// ============================================

export interface Provider {
  id: string
  name: string
  type: 'openai' | 'anthropic' | 'google' | 'cohere' | 'other'
  baseUrl: string
  status: 'active' | 'inactive' | 'error'
  enabled: boolean
  priority: number
  createdAt: string
  updatedAt: string
}

export interface ProviderAccount {
  id: string
  providerId: string
  accountName: string
  apiKey: string // 脱敏显示
  status: 'active' | 'inactive' | 'banned' | 'rate_limited'
  enabled: boolean
  priority: number
  weight: number
  metrics?: AccountMetrics
  createdAt: string
  updatedAt: string
}

export interface AccountMetrics {
  avgTtftMs?: number
  avgThroughput?: number
  avgLatencyMs?: number
  successRate?: number
  uptime?: number
  errorRate?: number
  rpmUsed?: number
  rpmLimit?: number
  lastRequestAt?: string
  lastSuccessAt?: string
  lastFailureAt?: string
}

// ============================================
// 路由策略
// ============================================

export type RoutingStrategyType = 'nitro' | 'floor' | 'balanced' | 'round-robin'

export interface RoutingStrategy {
  type: RoutingStrategyType
  name: string
  description: string
  enabled: boolean
  config?: Record<string, any>
}

export interface RoutingDecision {
  strategy: RoutingStrategyType
  selectedProvider: string
  selectedAccount: string
  decisionReason: string
  estimatedCost?: number
  estimatedLatency?: number
  alternatives: AlternativeProvider[]
  timestamp: string
}

export interface AlternativeProvider {
  providerId: string
  accountId: string
  score?: number
  reason?: string
}

// ============================================
// 性能监控
// ============================================

export interface PerformanceMetrics {
  providerId: string
  accountId: string
  modelName: string
  ttftMs?: number
  throughput?: number
  latencyMs?: number
  inputTokens?: number
  outputTokens?: number
  timestamp: string
}

export interface ProviderPerformanceStats {
  providerId: string
  accountId: string
  avgTtftMs: number
  avgThroughput: number
  avgLatencyMs: number
  successRate: number
  totalRequests: number
  errorRate: number
  uptime: number
  avgCostPer1kTokens: number
  totalCost: number
}

// ============================================
// 成本分析
// ============================================

export interface CostAnalysis {
  providerId: string
  accountId: string
  inputTokens: number
  outputTokens: number
  inputCost: number
  outputCost: number
  totalCost: number
  timestamp: string
}

export interface CostComparison {
  providerId: string
  accountId: string
  modelName: string
  totalCost: number
  totalTokens: number
  avgCostPer1kTokens: number
  requests: number
}

export interface CostSavings {
  originalCost: number
  optimizedCost: number
  saved: number
  savedPercentage: number
}

// ============================================
// API 响应类型
// ============================================

export interface ProvidersResponse {
  providers: Provider[]
  total: number
}

export interface ProviderAccountsResponse {
  accounts: ProviderAccount[]
  providerId: string
  total: number
}

export interface RoutingStrategiesResponse {
  strategies: RoutingStrategy[]
}

export interface PerformanceStatsResponse {
  stats: ProviderPerformanceStats[]
  timeRange: string
}

export interface CostAnalysisResponse {
  comparisons: CostComparison[]
  savings: CostSavings
  timeRange: string
}
