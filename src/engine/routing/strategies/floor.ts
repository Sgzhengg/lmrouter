// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

import { BaseRoutingStrategy } from "../strategy-base.js";
import type {
  RoutingDecision,
  RoutingRequestContext,
  ModelRoutingConfig,
} from "../../../types/routing.js";

/**
 * Floor 策略（价格优先）
 *
 * 选择价格最低的供应商
 * 适合对成本敏感的场景，如批量处理
 */
export class FloorStrategy extends BaseRoutingStrategy {
  name = "floor" as const;
  description = "追求低价：选择价格最低的供应商";

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

    // 2. 估算 Token 数量
    const estimatedTokens =
      context.estimatedTokens || this.estimateTokens(context.messages);

    // 3. 评估每个供应商的价格得分
    const scores = new Map<string, number>();
    const costs = new Map<string, number>();

    for (const provider of availableProviders) {
      const cost = this.calculateCost(
        provider,
        estimatedTokens.input,
        estimatedTokens.output
      );
      costs.set(`${provider.providerId}-${provider.accountId}`, cost);

      const score = await this.score(provider, context);
      scores.set(`${provider.providerId}-${provider.accountId}`, score);
    }

    // 4. 按得分排序（得分越高 = 价格越低）
    const sortedProviders = this.sortProvidersByScore(
      availableProviders,
      scores
    );

    // 5. 选择最优供应商
    const selected = sortedProviders[0];
    const selectedCost =
      costs.get(`${selected.providerId}-${selected.accountId}`) || 0;

    // 6. 获取备选方案
    const alternatives = this.getAlternatives(
      sortedProviders,
      selected,
      2
    ).map((alt) => ({
      ...alt,
      score: scores.get(`${alt.providerId}-${alt.accountId}`),
    }));

    // 7. 创建决策
    const reason = `Selected for lowest cost: $${selectedCost.toFixed(6)} (${estimatedTokens.input} input + ${estimatedTokens.output} output tokens)`;

    return this.createDecision(selected, this.name, reason, alternatives, context);
  }

  /**
   * 评估供应商的价格得分
   *
   * 评分标准：
   * - 价格越低，得分越高（0-100）
   * - 考虑输入和输出的综合价格
   */
  async score(
    provider: ModelRoutingConfig["providers"][0],
    context: RoutingRequestContext
  ): Promise<number> {
    const pricingInput = provider.pricingInput;
    const pricingOutput = provider.pricingOutput;

    // 如果没有定价信息，给予中等得分
    if (pricingInput === undefined || pricingOutput === undefined) {
      return 50;
    }

    // 估算 Token 数量
    const estimatedTokens =
      context.estimatedTokens || this.estimateTokens(context.messages);

    // 计算总成本
    const totalCost = this.calculateCost(
      provider,
      estimatedTokens.input,
      estimatedTokens.output
    );

    // 价格评分：价格越低，得分越高
    // 假设合理价格范围：$0.0001（便宜）到 $0.1（昂贵）
    const minCost = 0.0001;
    const maxCost = 0.1;

    let priceScore: number;
    if (totalCost <= minCost) {
      priceScore = 100;
    } else if (totalCost >= maxCost) {
      priceScore = 0;
    } else {
      // 线性插值：价格越低，得分越高
      priceScore = 100 - ((totalCost - minCost) / (maxCost - minCost)) * 100;
    }

    return priceScore;
  }
}
