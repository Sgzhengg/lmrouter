// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

/**
 * 路由策略类型
 */
export type RoutingStrategyType =
  | "nitro" // 追求速度：选择 TTFT 最低的供应商
  | "floor" // 追求低价：选择价格最低的供应商
  | "balanced" // 平衡模式：综合考虑价格和性能
  | "round-robin" // 轮询：均匀分配请求
  | "sticky" // 粘性：同一用户使用同一供应商
  | "manual"; // 手动：用户指定供应商

/**
 * 路由请求上下文
 */
export interface RoutingRequestContext {
  userId?: string;
  tenantId?: string;
  apiKey?: string;
  modelName: string;
  messages: Array<{ role: string; content: string }>;
  stream?: boolean;

  // 用户偏好
  preferences?: {
    strategy?: RoutingStrategyType;
    preferredProvider?: string;
    preferredAccount?: string;
    maxCost?: number;
    maxLatency?: number;
    minSuccessRate?: number;
  };

  // 估算信息
  estimatedTokens?: {
    input: number;
    output: number;
  };
}

/**
 * 供应商性能指标
 */
export interface ProviderMetrics {
  providerId: string;
  accountId: string;

  // 性能指标
  avgTtftMs?: number; // 平均首字延迟
  avgThroughput?: number; // 平均吞吐量（tokens/sec）
  avgLatencyMs?: number; // 平均总延迟

  // 可靠性指标
  successRate?: number; // 成功率（0-100）
  uptime?: number; // 可用性（0-100）
  errorRate?: number; // 错误率（0-100）

  // 负载指标
  rpmUsed?: number; // 当前每分钟请求数
  rpmLimit?: number; // 每分钟请求限制
  tpmUsed?: number; // 当前每分钟 token 数
  tpmLimit?: number; // 每分钟 token 限制

  // 成本指标
  pricingInput?: number; // 输入价格（每 1K tokens）
  pricingOutput?: number; // 输出价格（每 1K tokens）

  // 时间信息
  lastRequestAt?: Date;
  lastSuccessAt?: Date;
  lastFailureAt?: Date;
}

/**
 * 模型配置
 */
export interface ModelRoutingConfig {
  modelId: string;
  modelName: string;
  providers: Array<{
    providerId: string;
    providerName: string;
    accountId: string;
    accountName: string;
    providerModelName: string;
    isEnabled: boolean;
    priority: number;
    weight: number;

    // 定价信息
    pricingInput?: number;
    pricingOutput?: number;

    // 性能信息
    metrics?: ProviderMetrics;
  }>;
}

/**
 * 路由决策结果
 */
export interface RoutingDecision {
  // 选择结果
  providerId: string;
  accountId: string;
  providerModelName: string;

  // 决策信息
  strategy: RoutingStrategyType;
  reason: string;
  confidence: number; // 0-1，决策置信度

  // 备选方案
  alternatives: Array<{
    providerId: string;
    accountId: string;
    score?: number;
    reason?: string;
  }>;

  // 预估信息
  estimatedCost?: number;
  estimatedLatency?: number;

  // 时间戳
  timestamp: Date;
}

/**
 * 路由策略接口
 */
export interface IRoutingStrategy {
  /**
   * 策略名称
   */
  name: RoutingStrategyType;

  /**
   * 策略描述
   */
  description: string;

  /**
   * 选择最优提供商和账号
   */
  select(
    config: ModelRoutingConfig,
    context: RoutingRequestContext
  ): Promise<RoutingDecision>;

  /**
   * 评估单个供应商的得分
   */
  score(
    provider: ModelRoutingConfig["providers"][0],
    context: RoutingRequestContext
  ): Promise<number>;
}

/**
 * 路由执行结果
 */
export interface RoutingExecutionResult {
  // 决策信息
  decision: RoutingDecision;

  // 执行结果
  success: boolean;
  ttftMs?: number;
  totalLatencyMs?: number;
  inputTokens?: number;
  outputTokens?: number;
  actualCost?: number;

  // 错误信息
  errorCode?: string;
  errorMessage?: string;

  // 是否使用了备选方案
  fallbackUsed?: boolean;
  fallbackCount?: number;
}

/**
 * 性能监控数据
 */
export interface PerformanceMetricData {
  accountId: string;
  providerId: string;
  modelName: string;

  // 性能指标
  ttftMs?: number;
  throughput?: number; // tokens/sec
  latencyMs?: number;

  // 使用指标
  inputTokens?: number;
  outputTokens?: number;

  // 时间戳
  timestamp: Date;
}

/**
 * 价格计算结果
 */
export interface PriceCalculationResult {
  // 输入成本
  inputCost: number;

  // 输出成本
  outputCost: number;

  // 总成本
  totalCost: number;

  // 单位
  currency: string;

  // 明细
  breakdown: {
    inputTokens: number;
    inputPrice: number;
    outputTokens: number;
    outputPrice: number;
  };
}

/**
 * 供应商统计信息
 */
export interface ProviderStats {
  providerId: string;
  accountId: string;

  // 性能指标
  avgTtftMs?: number;
  avgThroughput?: number;
  avgLatencyMs?: number;

  // 可靠性指标
  successRate?: number;
  uptime?: number;
  errorRate?: number;

  // 负载指标
  rpmUsed?: number;
  rpmLimit?: number;
  tpmUsed?: number;
  tpmLimit?: number;

  // 成本指标
  pricingInput?: number;
  pricingOutput?: number;
  avgCostPer1kTokens?: number;
  totalCost?: number;

  // 请求统计
  totalRequests?: number;

  // 吞吐量统计
  throughputTps?: number;

  // 时间信息
  lastRequestAt?: Date;
  lastSuccessAt?: Date;
  lastFailureAt?: Date;
  timeRange?: string;
}
