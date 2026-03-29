// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

import type {
  IRoutingStrategy,
  RoutingDecision,
  RoutingRequestContext,
  ModelRoutingConfig,
  ProviderMetrics,
  RoutingStrategyType,
} from "../../types/routing.js";

/**
 * 路由策略基类
 * 提供通用的辅助方法
 */
export abstract class BaseRoutingStrategy implements IRoutingStrategy {
  abstract name: RoutingStrategyType;
  abstract description: string;

  /**
   * 选择最优提供商和账号（子类必须实现）
   */
  abstract select(
    config: ModelRoutingConfig,
    context: RoutingRequestContext
  ): Promise<RoutingDecision>;

  /**
   * 评估单个供应商的得分（子类必须实现）
   */
  abstract score(
    provider: ModelRoutingConfig["providers"][0],
    context: RoutingRequestContext
  ): Promise<number>;

  /**
   * 过滤可用的供应商
   */
  protected filterAvailableProviders(
    providers: ModelRoutingConfig["providers"]
  ): ModelRoutingConfig["providers"] {
    return providers.filter((p) => {
      // 检查是否启用
      if (!p.isEnabled) return false;

      // 检查账号状态（这里简化处理，实际应该查询数据库）
      // if (p.account?.status !== "active") return false;

      // 检查速率限制
      if (p.metrics?.rpmLimit && p.metrics?.rpmUsed) {
        if (p.metrics.rpmUsed >= p.metrics.rpmLimit) {
          return false;
        }
      }

      // 检查成功率
      if (p.metrics?.successRate) {
        // 成功率低于 50% 的不使用
        if (p.metrics.successRate < 50) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * 按得分排序供应商
   */
  protected sortProvidersByScore(
    providers: ModelRoutingConfig["providers"],
    scores: Map<string, number>
  ): ModelRoutingConfig["providers"] {
    return providers.sort((a, b) => {
      const scoreA = scores.get(`${a.providerId}-${a.accountId}`) || 0;
      const scoreB = scores.get(`${b.providerId}-${b.accountId}`) || 0;
      return scoreB - scoreA; // 降序排列
    });
  }

  /**
   * 获取备选方案
   */
  protected getAlternatives(
    providers: ModelRoutingConfig["providers"],
    selected: ModelRoutingConfig["providers"][0],
    count: number = 2
  ): Array<{
    providerId: string;
    accountId: string;
    score?: number;
  }> {
    return providers
      .filter((p) => p.providerId !== selected.providerId)
      .slice(0, count)
      .map((p) => ({
        providerId: p.providerId,
        accountId: p.accountId,
      }));
  }

  /**
   * 估算 Token 数量
   */
  protected estimateTokens(
    messages: Array<{ role: string; content: string }>
  ): { input: number; output: number } {
    // 简单估算：4 个字符 ≈ 1 个 token
    const text = JSON.stringify(messages);
    const inputTokens = Math.ceil(text.length / 4);
    const outputTokens = Math.ceil(inputTokens * 0.75); // 假设输出是输入的 75%

    return { input: inputTokens, output: outputTokens };
  }

  /**
   * 计算请求成本
   */
  protected calculateCost(
    provider: ModelRoutingConfig["providers"][0],
    inputTokens: number,
    outputTokens: number
  ): number {
    const inputPrice = provider.pricingInput || 0;
    const outputPrice = provider.pricingOutput || 0;

    const inputCost = (inputTokens / 1000) * inputPrice;
    const outputCost = (outputTokens / 1000) * outputPrice;

    return inputCost + outputCost;
  }

  /**
   * 创建路由决策结果
   */
  protected createDecision(
    selected: ModelRoutingConfig["providers"][0],
    strategy: string,
    reason: string,
    alternatives: Array<{
      providerId: string;
      accountId: string;
      score?: number;
    }>,
    context: RoutingRequestContext
  ): RoutingDecision {
    const estimatedTokens =
      context.estimatedTokens || this.estimateTokens(context.messages);
    const estimatedCost = this.calculateCost(
      selected,
      estimatedTokens.input,
      estimatedTokens.output
    );

    return {
      providerId: selected.providerId,
      accountId: selected.accountId,
      providerModelName: selected.providerModelName,
      strategy: strategy as any,
      reason,
      confidence: 0.8, // 默认置信度
      alternatives,
      estimatedCost,
      estimatedLatency: selected.metrics?.avgTtftMs,
      timestamp: new Date(),
    };
  }

  /**
   * 归一化得分到 0-1 范围
   */
  protected normalizeScore(
    score: number,
    min: number,
    max: number
  ): number {
    if (max === min) return 0.5;
    return (score - min) / (max - min);
  }

  /**
   * 计算加权平均得分
   */
  protected calculateWeightedScore(
    scores: Record<string, number>,
    weights: Record<string, number>
  ): number {
    let totalScore = 0;
    let totalWeight = 0;

    for (const [key, value] of Object.entries(scores)) {
      const weight = weights[key] || 1;
      totalScore += value * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * 判断是否应该降级到备选方案
   */
  protected shouldDegrade(
    provider: ModelRoutingConfig["providers"][0]
  ): boolean {
    const metrics = provider.metrics;
    if (!metrics) return false;

    // 成功率低于 70%
    if (metrics.successRate && metrics.successRate < 70) {
      return true;
    }

    // 错误率高于 30%
    if (metrics.errorRate && metrics.errorRate > 30) {
      return true;
    }

    // TTFT 过高（超过 5 秒）
    if (metrics.avgTtftMs && metrics.avgTtftMs > 5000) {
      return true;
    }

    return false;
  }
}
