// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

import { BaseRoutingStrategy } from "../strategy-base.js";
import type {
  RoutingDecision,
  RoutingRequestContext,
  ModelRoutingConfig,
} from "../../../types/routing.js";

/**
 * Nitro 策略（速度优先）
 *
 * 选择 TTFT（Time to First Token）最低的供应商
 * 适合需要快速响应的场景，如实时对话
 */
export class NitroStrategy extends BaseRoutingStrategy {
  name = "nitro" as const;
  description = "追求速度：选择 TTFT 最低的供应商";

  /**
   * 选择最优提供商
   */
  async select(
    config: ModelRoutingConfig,
    context: RoutingRequestContext
  ): Promise<RoutingDecision> {
    // 1. 过滤可用供应商
    const availableProviders = this.filterAvailableProviders(config.providers);

    if (availableProviders.length === 0) {
      throw new Error("No available providers for this model");
    }

    // 2. 评估每个供应商的速度得分
    const scores = new Map<string, number>();
    for (const provider of availableProviders) {
      const score = await this.score(provider, context);
      scores.set(`${provider.providerId}-${provider.accountId}`, score);
    }

    // 3. 按得分排序
    const sortedProviders = this.sortProvidersByScore(
      availableProviders,
      scores
    );

    // 4. 选择最优供应商
    const selected = sortedProviders[0];

    // 5. 获取备选方案
    const alternatives = this.getAlternatives(
      sortedProviders,
      selected,
      2
    ).map((alt) => ({
      ...alt,
      score: scores.get(`${alt.providerId}-${alt.accountId}`),
    }));

    // 6. 创建决策
    const estimatedTtft = selected.metrics?.avgTtftMs || 0;
    const reason = `Selected for lowest TTFT: ${estimatedTtft}ms`;

    return this.createDecision(selected, this.name, reason, alternatives, context);
  }

  /**
   * 评估供应商的速度得分
   *
   * 评分标准：
   * - TTFT 越低，得分越高（0-100）
   * - 吞吐量越高，得分越高（0-100）
   * - 综合得分 = TTFT得分 * 0.7 + 吞吐量得分 * 0.3
   */
  async score(
    provider: ModelRoutingConfig["providers"][0],
    context: RoutingRequestContext
  ): Promise<number> {
    const metrics = provider.metrics;

    // 如果没有性能数据，给予中等得分
    if (!metrics) {
      return 50;
    }

    let ttftScore = 50;
    let throughputScore = 50;

    // 评估 TTFT（首字延迟）
    if (metrics.avgTtftMs !== undefined) {
      // TTFT 越低越好
      // 假设：TTFT 范围在 100ms（优秀）到 5000ms（差）之间
      const minTtft = 100;
      const maxTtft = 5000;

      if (metrics.avgTtftMs <= minTtft) {
        ttftScore = 100;
      } else if (metrics.avgTtftMs >= maxTtft) {
        ttftScore = 0;
      } else {
        // 线性插值：TTFT 越低，得分越高
        ttftScore =
          100 - ((metrics.avgTtftMs - minTtft) / (maxTtft - minTtft)) * 100;
      }
    }

    // 评估吞吐量
    if (metrics.avgThroughput !== undefined) {
      // 吞吐量越高越好
      // 假设：吞吐量范围在 10 tokens/s（差）到 100 tokens/s（优秀）之间
      const minThroughput = 10;
      const maxThroughput = 100;

      if (metrics.avgThroughput >= maxThroughput) {
        throughputScore = 100;
      } else if (metrics.avgThroughput <= minThroughput) {
        throughputScore = 0;
      } else {
        // 线性插值：吞吐量越高，得分越高
        throughputScore =
          ((metrics.avgThroughput - minThroughput) /
            (maxThroughput - minThroughput)) *
          100;
      }
    }

    // 综合得分：TTFT 权重 70%，吞吐量权重 30%
    const totalScore = ttftScore * 0.7 + throughputScore * 0.3;

    return totalScore;
  }
}
