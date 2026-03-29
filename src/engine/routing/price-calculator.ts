// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

import type {
  PriceCalculationResult,
  ModelRoutingConfig,
} from "../../types/routing.js";
import { Decimal } from "decimal.js";

/**
 * 价格计算模块
 *
 * 负责计算 API 请求的成本
 */
export class PriceCalculator {
  /**
   * 计算请求成本
   */
  calculateRequestCost(
    provider: ModelRoutingConfig["providers"][0],
    inputTokens: number,
    outputTokens: number
  ): PriceCalculationResult {
    const inputPrice = provider.pricingInput || 0;
    const outputPrice = provider.pricingOutput || 0;

    // 计算输入成本
    const inputCost = new Decimal(inputTokens)
      .div(1000)
      .mul(inputPrice)
      .toDecimalPlaces(8);

    // 计算输出成本
    const outputCost = new Decimal(outputTokens)
      .div(1000)
      .mul(outputPrice)
      .toDecimalPlaces(8);

    // 计算总成本
    const totalCost = inputCost.plus(outputCost);

    return {
      inputCost: inputCost.toNumber(),
      outputCost: outputCost.toNumber(),
      totalCost: totalCost.toNumber(),
      currency: "USD",
      breakdown: {
        inputTokens,
        inputPrice,
        outputTokens,
        outputPrice,
      },
    };
  }

  /**
   * 获取最低价格供应商
   */
  getCheapestProvider(
    providers: ModelRoutingConfig["providers"],
    estimatedInputTokens: number,
    estimatedOutputTokens: number
  ): {
    provider: ModelRoutingConfig["providers"][0];
    cost: number;
  } {
    let cheapest = providers[0];
    let lowestCost = Infinity;

    for (const provider of providers) {
      if (!provider.isEnabled) continue;

      const result = this.calculateRequestCost(
        provider,
        estimatedInputTokens,
        estimatedOutputTokens
      );

      if (result.totalCost < lowestCost) {
        lowestCost = result.totalCost;
        cheapest = provider;
      }
    }

    return {
      provider: cheapest,
      cost: lowestCost,
    };
  }

  /**
   * 估算 Token 数量
   */
  estimateTokens(messages: Array<{ role: string; content: string }>): {
    input: number;
    output: number;
  } {
    // 简单估算：4 个字符 ≈ 1 个 token
    const text = JSON.stringify(messages);
    const inputTokens = Math.ceil(text.length / 4);
    const outputTokens = Math.ceil(inputTokens * 0.75); // 假设输出是输入的 75%

    return { input: inputTokens, output: outputTokens };
  }

  /**
   * 计算性价比最优供应商
   *
   * 性价比 = 综合得分 / 价格
   */
  getBestValueProvider(
    providers: ModelRoutingConfig["providers"],
    estimatedInputTokens: number,
    estimatedOutputTokens: number,
    scores: Map<string, number>, // 供应商的综合得分（0-100）
    weights: {
      price: number;
      performance: number;
    } = { price: 0.5, performance: 0.5 }
  ): {
    provider: ModelRoutingConfig["providers"][0];
    score: number;
    cost: number;
  } {
    let bestProvider = providers[0];
    let bestScore = -Infinity;

    // 找出最高和最低价格，用于归一化
    const costs = providers.map((p) =>
      this.calculateRequestCost(p, estimatedInputTokens, estimatedOutputTokens)
    );
    const maxCost = Math.max(...costs.map((c) => c.totalCost));
    const minCost = Math.min(...costs.map((c) => c.totalCost));

    for (const provider of providers) {
      if (!provider.isEnabled) continue;

      const key = `${provider.providerId}-${provider.accountId}`;
      const performanceScore = scores.get(key) || 50;

      // 归一化价格得分（价格越低得分越高）
      const costResult = this.calculateRequestCost(
        provider,
        estimatedInputTokens,
        estimatedOutputTokens
      );
      const priceScore =
        maxCost > minCost
          ? ((maxCost - costResult.totalCost) / (maxCost - minCost)) * 100
          : 50;

      // 计算加权得分
      const totalScore =
        performanceScore * weights.performance + priceScore * weights.price;

      if (totalScore > bestScore) {
        bestScore = totalScore;
        bestProvider = provider;
      }
    }

    const costResult = this.calculateRequestCost(
      bestProvider,
      estimatedInputTokens,
      estimatedOutputTokens
    );

    return {
      provider: bestProvider,
      score: bestScore,
      cost: costResult.totalCost,
    };
  }

  /**
   * 批量计算多个供应商的成本
   */
  calculateBatchCosts(
    providers: ModelRoutingConfig["providers"],
    inputTokens: number,
    outputTokens: number
  ): Array<{
    providerId: string;
    accountId: string;
    cost: PriceCalculationResult;
  }> {
    return providers.map((provider) => ({
      providerId: provider.providerId,
      accountId: provider.accountId,
      cost: this.calculateRequestCost(provider, inputTokens, outputTokens),
    }));
  }

  /**
   * 计算成本节省
   */
  calculateSavings(
    originalCost: number,
    newCost: number
  ): {
    saved: number;
    percentage: number;
  } {
    const saved = originalCost - newCost;
    const percentage = originalCost > 0 ? (saved / originalCost) * 100 : 0;

    return {
      saved,
      percentage,
    };
  }

  /**
   * 预估月度成本
   */
  estimateMonthlyCost(
    perRequestCost: number,
    requestsPerDay: number,
    daysPerMonth: number = 30
  ): {
    daily: number;
    monthly: number;
  } {
    const daily = perRequestCost * requestsPerDay;
    const monthly = daily * daysPerMonth;

    return {
      daily,
      monthly,
    };
  }
}
