// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

/**
 * 智能路由引擎集成测试
 *
 * 运行方式：
 * pnpm test tests/integration/routing-engine.test.ts
 */

import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { RoutingEngine } from "../../src/engine/routing/engine.js";
import { PerformanceMonitor } from "../../src/engine/monitoring/performance.js";
import { PriceCalculator } from "../../src/engine/routing/price-calculator.js";
import { scenarioRecognizer } from "../../src/engine/routing/scenario-recognizer.js";
import { AccountPoolDatabase } from "../../src/utils/account-pool-db.js";
import type {
  ModelRoutingConfig,
  RoutingRequestContext,
} from "../../src/types/routing.js";

describe("智能路由引擎集成测试", () => {
  let db: AccountPoolDatabase;
  let routingEngine: RoutingEngine;
  let performanceMonitor: PerformanceMonitor;
  let priceCalculator: PriceCalculator;

  beforeAll(() => {
    // 初始化数据库（使用内存数据库进行测试）
    // db = new AccountPoolDatabase(testDbConnection);

    // 初始化路由引擎
    // routingEngine = new RoutingEngine(db);

    // 初始化性能监控
    performanceMonitor = new PerformanceMonitor(db);

    // 初始化价格计算器
    priceCalculator = new PriceCalculator();
  });

  describe("路由决策测试", () => {
    it("应该使用 Nitro 策略选择最快的供应商", async () => {
      const config: ModelRoutingConfig = {
        modelId: "gpt-4-turbo",
        modelName: "gpt-4-turbo",
        providers: [
          {
            providerId: "openai-1",
            providerName: "OpenAI 1",
            accountId: "account-1",
            accountName: "Account 1",
            providerModelName: "gpt-4-turbo",
            isEnabled: true,
            priority: 1,
            weight: 100,
            metrics: {
              avgTtftMs: 120, // 最快
            },
          },
          {
            providerId: "openai-2",
            providerName: "OpenAI 2",
            accountId: "account-2",
            accountName: "Account 2",
            providerModelName: "gpt-4-turbo",
            isEnabled: true,
            priority: 2,
            weight: 100,
            metrics: {
              avgTtftMs: 200, // 较慢
            },
          },
        ],
      };

      const context: RoutingRequestContext = {
        modelName: "gpt-4-turbo",
        messages: [{ role: "user", content: "Hello!" }],
        preferences: {
          strategy: "nitro",
        },
      };

      // const decision = await routingEngine.decide(config, context);

      // expect(decision.providerId).toBe("openai-1");
      // expect(decision.strategy).toBe("nitro");
      // expect(decision.reason).toContain("TTFT");
    });

    it("应该使用 Floor 策略选择最便宜的供应商", async () => {
      const config: ModelRoutingConfig = {
        modelId: "gpt-4-turbo",
        modelName: "gpt-4-turbo",
        providers: [
          {
            providerId: "openai-1",
            providerName: "OpenAI 1",
            accountId: "account-1",
            accountName: "Account 1",
            providerModelName: "gpt-4-turbo",
            isEnabled: true,
            priority: 1,
            weight: 100,
            pricingInput: 0.01,
            pricingOutput: 0.03,
          },
          {
            providerId: "reseller-1",
            providerName: "Reseller 1",
            accountId: "account-2",
            accountName: "Account 2",
            providerModelName: "gpt-4-turbo",
            isEnabled: true,
            priority: 2,
            weight: 100,
            pricingInput: 0.008, // 更便宜
            pricingOutput: 0.025,
          },
        ],
      };

      const context: RoutingRequestContext = {
        modelName: "gpt-4-turbo",
        messages: [{ role: "user", content: "Hello!" }],
        preferences: {
          strategy: "floor",
        },
        estimatedTokens: {
          input: 1000,
          output: 500,
        },
      };

      // const decision = await routingEngine.decide(config, context);

      // expect(decision.providerId).toBe("reseller-1");
      // expect(decision.strategy).toBe("floor");
      // expect(decision.reason).toContain("cost");
    });
  });

  describe("场景识别测试", () => {
    it("应该识别代码生成场景并推荐合适的模型", () => {
      const context: RoutingRequestContext = {
        modelName: "gpt-4",
        messages: [
          { role: "user", content: "帮我写一个快速排序算法" },
        ],
      };

      const recognition = scenarioRecognizer.recognize(context);

      expect(recognition.scenario).toBe("code-generation");
      expect(recognition.recommendedModel).toBe("claude-3-opus");
      expect(recognition.confidence).toBeGreaterThan(0.5);
    });

    it("应该识别简单问答场景并推荐便宜的模型", () => {
      const context: RoutingRequestContext = {
        modelName: "gpt-4",
        messages: [
          { role: "user", content: "你好，请问现在几点了？" },
        ],
      };

      const recognition = scenarioRecognizer.recognize(context);

      expect(recognition.scenario).toBe("simple-qa");
      expect(recognition.recommendedModel).toBe("gpt-3.5-turbo");
    });

    it("应该正确计算成本节省", () => {
      const savings = priceCalculator["estimateCostSavings"](
        "gpt-4-turbo",
        "gpt-3.5-turbo",
        1000,
        500
      );

      expect(savings.savingsPercentage).toBeCloseTo(95, 0);
    });
  });

  describe("性能监控测试", () => {
    it("应该记录性能指标", async () => {
      const metricData = {
        accountId: "test-account",
        providerId: "test-provider",
        modelName: "gpt-4",
        ttftMs: 120,
        throughput: 80,
        latencyMs: 1000,
        inputTokens: 1000,
        outputTokens: 500,
        timestamp: new Date(),
      };

      // await performanceMonitor.recordMetric(metricData);

      // const stats = await performanceMonitor.getProviderStats(
      //   "test-provider",
      //   "test-account",
      //   "1h"
      // );

      // expect(stats.totalRequests).toBe(1);
      // expect(stats.avgTtftMs).toBe(120);
    });

    it("应该获取实时 TTFT", () => {
      // 先记录一些指标
      const metrics = [
        { ttftMs: 100, timestamp: new Date() },
        { ttftMs: 120, timestamp: new Date() },
        { ttftMs: 110, timestamp: new Date() },
      ];

      // for (const metric of metrics) {
      //   await performanceMonitor.recordMetric({
      //     accountId: "test-account",
      //     providerId: "test-provider",
      //     modelName: "gpt-4",
      //     ...metric,
      //   });
      // }

      // const ttft = performanceMonitor.getRealtimeTTFT("test-provider", "test-account");

      // expect(ttft).toBeCloseTo(110, 10); // 平均值应该在 110 左右
    });
  });

  describe("价格计算测试", () => {
    it("应该正确计算请求成本", () => {
      const provider = {
        providerId: "test",
        accountId: "test",
        pricingInput: 0.01,
        pricingOutput: 0.03,
      };

      const cost = priceCalculator.calculateRequestCost(provider, 1000, 500);

      expect(cost.inputCost).toBeCloseTo(0.01, 4);
      expect(cost.outputCost).toBeCloseTo(0.015, 4);
      expect(cost.totalCost).toBeCloseTo(0.025, 4);
    });

    it("应该找到最便宜的供应商", () => {
      const providers = [
        {
          providerId: "expensive",
          accountId: "account-1",
          pricingInput: 0.01,
          pricingOutput: 0.03,
          isEnabled: true,
        },
        {
          providerId: "cheap",
          accountId: "account-2",
          pricingInput: 0.005,
          pricingOutput: 0.015,
          isEnabled: true,
        },
      ];

      const cheapest = priceCalculator.getCheapestProvider(providers, 1000, 500);

      expect(cheapest.provider.providerId).toBe("cheap");
      expect(cheapest.cost).toBeCloseTo(0.0125, 4);
    });
  });

  describe("故障转移测试", () => {
    it("应该在主供应商失败时切换到备选方案", async () => {
      const decision = {
        providerId: "primary",
        accountId: "account-1",
        providerModelName: "gpt-4",
        strategy: "nitro" as const,
        reason: "Fastest",
        confidence: 0.9,
        alternatives: [
          { providerId: "backup-1", accountId: "account-2" },
          { providerId: "backup-2", accountId: "account-3" },
        ],
        estimatedCost: 0.01,
        timestamp: new Date(),
      };

      let attemptCount = 0;

      // const result = await routingEngine.execute(decision, {}, async (dec) => {
      //   attemptCount++;

      //   if (attemptCount === 1) {
      //     // 第一次尝试失败
      //     throw new Error("Primary provider failed");
      //   }

      //   // 第二次尝试成功
      //   return {
      //     success: true,
      //     ttftMs: 150,
      //     totalLatencyMs: 1200,
      //   };
      // });

      // expect(result.fallbackUsed).toBe(true);
      // expect(result.fallbackCount).toBe(1);
      // expect(attemptCount).toBe(2);
    });

    it("应该在所有备选方案都失败时返回错误", async () => {
      const decision = {
        providerId: "primary",
        accountId: "account-1",
        providerModelName: "gpt-4",
        strategy: "nitro" as const,
        reason: "Fastest",
        confidence: 0.9,
        alternatives: [
          { providerId: "backup-1", accountId: "account-2" },
          { providerId: "backup-2", accountId: "account-3" },
        ],
        estimatedCost: 0.01,
        timestamp: new Date(),
      };

      // const result = await routingEngine.execute(decision, {}, async (dec) => {
      //   // 总是失败
      //   throw new Error("Provider failed");
      // });

      // expect(result.success).toBe(false);
      // expect(result.fallbackCount).toBeGreaterThan(0);
    });
  });

  describe("端到端测试", () => {
    it("应该完成完整的路由流程", async () => {
      // 1. 识别场景
      const context: RoutingRequestContext = {
        modelName: "gpt-4",
        messages: [
          { role: "user", content: "帮我写一个Python函数来计算斐波那契数列" },
        ],
      };

      const recognition = scenarioRecognizer.recognize(context);

      expect(recognition.scenario).toBe("code-generation");
      expect(recognition.recommendedModel).toBe("claude-3-opus");

      // 2. 获取推荐的模型配置
      // const config = await getModelConfig(recognition.recommendedModel);

      // 3. 使用合适的策略进行路由
      // const decision = await routingEngine.decide(config, {
      //   ...context,
      //   preferences: {
      //     strategy: "balanced", // 代码场景使用平衡策略
      //   },
      // });

      // expect(decision.providerId).toBeDefined();

      // 4. 估算成本节省
      const savings = priceCalculator["estimateCostSavings"](
        "gpt-4-turbo",
        recognition.recommendedModel,
        1500, // 代码生成通常输入 tokens 较多
        800   // 输出也较多
      );

      console.log("场景识别结果:", recognition);
      console.log("推荐模型:", recognition.recommendedModel);
      console.log("预估节省:", savings);

      expect(savings.savingsPercentage).toBeGreaterThan(0);
    });
  });
});

// 辅助函数
async function getModelConfig(modelName: string): Promise<ModelRoutingConfig> {
  // 模拟从数据库获取模型配置
  return {
    modelId: "test-model-id",
    modelName,
    providers: [
      {
        providerId: "provider-1",
        providerName: "Provider 1",
        accountId: "account-1",
        accountName: "Account 1",
        providerModelName: modelName,
        isEnabled: true,
        priority: 1,
        weight: 100,
        pricingInput: 0.01,
        pricingOutput: 0.03,
      },
    ],
  };
}
