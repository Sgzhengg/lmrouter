// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

import { BaseRoutingStrategy } from "../strategy-base.js";
import type {
  RoutingDecision,
  RoutingRequestContext,
  ModelRoutingConfig,
} from "../../../types/routing.js";

/**
 * Balanced 策略（平衡模式）
 *
 * 综合考虑价格、速度和可靠性
 * 适合大多数使用场景
 */
export class BalancedStrategy extends BaseRoutingStrategy {
  name = "balanced" as const;
  description = "平衡模式：综合考虑价格、速度和可靠性";

  /**
   * 默认权重配置
   * 可以根据实际需求调整
   */
  private weights = {
    price: 0.35, // 价格权重 35%
    speed: 0.35, // 速度权重 35%
    reliability: 0.3, // 可靠性权重 30%
  };

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

    // 2. 评估每个供应商的综合得分
    const scores = new Map<string, number>();
    const detailedScores = new Map<
      string,
      { price: number; speed: number; reliability: number }
    >();

    for (const provider of availableProviders) {
      const { price, speed, reliability } = await this.calculateDetailedScores(
        provider,
        context
      );

      // 计算加权总分
      const totalScore =
        price * this.weights.price +
        speed * this.weights.speed +
        reliability * this.weights.reliability;

      const key = `${provider.providerId}-${provider.accountId}`;
      scores.set(key, totalScore);
      detailedScores.set(key, { price, speed, reliability });
    }

    // 3. 按得分排序
    const sortedProviders = this.sortProvidersByScore(
      availableProviders,
      scores
    );

    // 4. 选择最优供应商
    const selected = sortedProviders[0];
    const selectedKey = `${selected.providerId}-${selected.accountId}`;
    const selectedScores = detailedScores.get(selectedKey)!;

    // 5. 获取备选方案
    const alternatives = this.getAlternatives(
      sortedProviders,
      selected,
      2
    ).map((alt) => {
      const altKey = `${alt.providerId}-${alt.accountId}`;
      return {
        ...alt,
        score: scores.get(altKey),
        detailedScores: detailedScores.get(altKey),
      };
    });

    // 6. 创建决策
    const reason = `Selected for best balance (price: ${selectedScores.price.toFixed(1)}, speed: ${selectedScores.speed.toFixed(1)}, reliability: ${selectedScores.reliability.toFixed(1)})`;

    return this.createDecision(selected, this.name, reason, alternatives, context);
  }

  /**
   * 评估供应商的综合得分
   */
  async score(
    provider: ModelRoutingConfig["providers"][0],
    context: RoutingRequestContext
  ): Promise<number> {
    const { price, speed, reliability } = await this.calculateDetailedScores(
      provider,
      context
    );

    // 计算加权总分
    return (
      price * this.weights.price +
      speed * this.weights.speed +
      reliability * this.weights.reliability
    );
  }

  /**
   * 计算详细的得分（价格、速度、可靠性）
   */
  private async calculateDetailedScores(
    provider: ModelRoutingConfig["providers"][0],
    context: RoutingRequestContext
  ): Promise<{
    price: number;
    speed: number;
    reliability: number;
  }> {
    const metrics = provider.metrics;

    // 1. 计算价格得分（0-100）
    let priceScore = 50; // 默认中等得分
    if (provider.pricingInput !== undefined && provider.pricingOutput !== undefined) {
      const estimatedTokens =
        context.estimatedTokens || this.estimateTokens(context.messages);
      const totalCost = this.calculateCost(
        provider,
        estimatedTokens.input,
        estimatedTokens.output
      );

      // 价格越低，得分越高
      const minCost = 0.0001;
      const maxCost = 0.1;

      if (totalCost <= minCost) {
        priceScore = 100;
      } else if (totalCost >= maxCost) {
        priceScore = 0;
      } else {
        priceScore =
          100 - ((totalCost - minCost) / (maxCost - minCost)) * 100;
      }
    }

    // 2. 计算速度得分（0-100）
    let speedScore = 50; // 默认中等得分
    if (metrics) {
      // TTFT 越低，得分越高
      let ttftScore = 50;
      if (metrics.avgTtftMs !== undefined) {
        const minTtft = 100;
        const maxTtft = 5000;

        if (metrics.avgTtftMs <= minTtft) {
          ttftScore = 100;
        } else if (metrics.avgTtftMs >= maxTtft) {
          ttftScore = 0;
        } else {
          ttftScore =
            100 -
            ((metrics.avgTtftMs - minTtft) / (maxTtft - minTtft)) * 100;
        }
      }

      // 吞吐量越高，得分越高
      let throughputScore = 50;
      if (metrics.avgThroughput !== undefined) {
        const minThroughput = 10;
        const maxThroughput = 100;

        if (metrics.avgThroughput >= maxThroughput) {
          throughputScore = 100;
        } else if (metrics.avgThroughput <= minThroughput) {
          throughputScore = 0;
        } else {
          throughputScore =
            ((metrics.avgThroughput - minThroughput) /
              (maxThroughput - minThroughput)) *
            100;
        }
      }

      // 综合速度得分：TTFT 权重 70%，吞吐量权重 30%
      speedScore = ttftScore * 0.7 + throughputScore * 0.3;
    }

    // 3. 计算可靠性得分（0-100）
    let reliabilityScore = 50; // 默认中等得分
    if (metrics) {
      // 成功率越高，得分越高
      let successScore = 50;
      if (metrics.successRate !== undefined) {
        // 成功率直接作为得分（0-100）
        successScore = metrics.successRate;
      }

      // 可用性越高，得分越高
      let uptimeScore = 50;
      if (metrics.uptime !== undefined) {
        uptimeScore = metrics.uptime;
      }

      // 错误率越低，得分越高
      let errorScore = 50;
      if (metrics.errorRate !== undefined) {
        // 错误率转换为得分：错误率 0% = 100分，错误率 100% = 0分
        errorScore = 100 - metrics.errorRate;
      }

      // 综合可靠性得分：成功率 50%，可用性 30%，错误率 20%
      reliabilityScore =
        successScore * 0.5 + uptimeScore * 0.3 + errorScore * 0.2;
    }

    return {
      price: priceScore,
      speed: speedScore,
      reliability: reliabilityScore,
    };
  }

  /**
   * 设置自定义权重
   */
  setWeights(weights: {
    price?: number;
    speed?: number;
    reliability?: number;
  }): void {
    if (weights.price !== undefined) {
      this.weights.price = weights.price;
    }
    if (weights.speed !== undefined) {
      this.weights.speed = weights.speed;
    }
    if (weights.reliability !== undefined) {
      this.weights.reliability = weights.reliability;
    }

    // 确保权重总和为 1
    const total =
      this.weights.price + this.weights.speed + this.weights.reliability;
    if (total !== 1) {
      // 归一化
      this.weights.price /= total;
      this.weights.speed /= total;
      this.weights.reliability /= total;
    }
  }

  /**
   * 获取当前权重配置
   */
  getWeights() {
    return { ...this.weights };
  }
}
