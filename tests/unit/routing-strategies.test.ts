// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

import { describe, it, expect, beforeEach } from "vitest";
import { NitroStrategy } from "../../src/engine/routing/strategies/nitro.js";
import { FloorStrategy } from "../../src/engine/routing/strategies/floor.js";
import { BalancedStrategy } from "../../src/engine/routing/strategies/balanced.js";
import type {
  ModelRoutingConfig,
  RoutingRequestContext,
} from "../../src/types/routing.js";

describe("路由策略测试", () => {
  let mockConfig: ModelRoutingConfig;
  let mockContext: RoutingRequestContext;

  beforeEach(() => {
    // 创建测试配置
    mockConfig = {
      modelId: "gpt-4-turbo-id",
      modelName: "gpt-4-turbo",
      providers: [
        {
          providerId: "openai-official-id",
          providerName: "OpenAI Official",
          accountId: "openai-account-1",
          accountName: "OpenAI Account 1",
          providerModelName: "gpt-4-turbo-preview",
          isEnabled: true,
          priority: 1,
          weight: 100,
          pricingInput: 0.01,
          pricingOutput: 0.03,
          metrics: {
            avgTtftMs: 120, // 最快
            avgThroughput: 80, // 最高吞吐量
            avgLatencyMs: 1000,
            successRate: 99.5,
            uptime: 99.9,
            errorRate: 0.5,
          },
        },
        {
          providerId: "azure-openai-id",
          providerName: "Azure OpenAI",
          accountId: "azure-account-1",
          accountName: "Azure Account 1",
          providerModelName: "gpt-4-turbo",
          isEnabled: true,
          priority: 2,
          weight: 90,
          pricingInput: 0.012,
          pricingOutput: 0.035,
          metrics: {
            avgTtftMs: 150, // 中等速度
            avgThroughput: 70,
            avgLatencyMs: 1200,
            successRate: 99.0,
            uptime: 99.5,
            errorRate: 1.0,
          },
        },
        {
          providerId: "reseller-cheap-id",
          providerName: "Cheap Reseller",
          accountId: "reseller-account-1",
          accountName: "Reseller Account 1",
          providerModelName: "gpt-4-turbo",
          isEnabled: true,
          priority: 3,
          weight: 80,
          pricingInput: 0.008, // 最便宜
          pricingOutput: 0.025,
          metrics: {
            avgTtftMs: 250, // 最慢
            avgThroughput: 40,
            avgLatencyMs: 2000,
            successRate: 95.0,
            uptime: 98.0,
            errorRate: 5.0,
          },
        },
      ],
    };

    // 创建测试上下文
    mockContext = {
      userId: "test-user",
      modelName: "gpt-4-turbo",
      messages: [{ role: "user", content: "Hello, this is a test message." }],
      estimatedTokens: {
        input: 1000,
        output: 500,
      },
    };
  });

  describe("Nitro 策略（速度优先）", () => {
    it("应该选择 TTFT 最低的供应商", async () => {
      const strategy = new NitroStrategy();
      const decision = await strategy.select(mockConfig, mockContext);

      // 验证选择了最快的供应商
      expect(decision.providerId).toBe("openai-official-id");
      expect(decision.accountId).toBe("openai-account-1");
      expect(decision.reason).toContain("TTFT: 120ms");
    });

    it("应该正确计算速度得分", async () => {
      const strategy = new NitroStrategy();

      // OpenAI - 最快
      const openaiScore = await strategy.score(
        mockConfig.providers[0],
        mockContext
      );
      // Azure - 中等
      const azureScore = await strategy.score(
        mockConfig.providers[1],
        mockContext
      );
      // Reseller - 最慢
      const resellerScore = await strategy.score(
        mockConfig.providers[2],
        mockContext
      );

      // OpenAI 应该得分最高
      expect(openaiScore).toBeGreaterThan(azureScore);
      expect(azureScore).toBeGreaterThan(resellerScore);
    });

    it("应该提供备选方案", async () => {
      const strategy = new NitroStrategy();
      const decision = await strategy.select(mockConfig, mockContext);

      expect(decision.alternatives).toBeDefined();
      expect(decision.alternatives.length).toBeGreaterThan(0);
    });
  });

  describe("Floor 策略（价格优先）", () => {
    it("应该选择价格最低的供应商", async () => {
      const strategy = new FloorStrategy();
      const decision = await strategy.select(mockConfig, mockContext);

      // 验证选择了最便宜的供应商（reseller）
      expect(decision.providerId).toBe("reseller-cheap-id");
      expect(decision.accountId).toBe("reseller-account-1");
      expect(decision.reason).toContain("cost");
    });

    it("应该正确计算价格得分", async () => {
      const strategy = new FloorStrategy();

      // Reseller - 最便宜
      const resellerScore = await strategy.score(
        mockConfig.providers[2],
        mockContext
      );
      // OpenAI - 中等
      const openaiScore = await strategy.score(
        mockConfig.providers[0],
        mockContext
      );
      // Azure - 最贵
      const azureScore = await strategy.score(
        mockConfig.providers[1],
        mockContext
      );

      // Reseller 应该得分最高（价格最低）
      expect(resellerScore).toBeGreaterThan(openaiScore);
      expect(openaiScore).toBeGreaterThan(azureScore);
    });

    it("应该正确计算请求成本", async () => {
      const strategy = new FloorStrategy();
      const decision = await strategy.select(mockConfig, mockContext);

      // 预估成本
      const expectedCost =
        (1000 / 1000) * 0.008 + (500 / 1000) * 0.025; // reseller 的价格

      expect(decision.estimatedCost).toBeCloseTo(expectedCost, 2);
    });
  });

  describe("Balanced 策略（平衡模式）", () => {
    it("应该综合考虑价格、速度和可靠性", async () => {
      const strategy = new BalancedStrategy();
      const decision = await strategy.select(mockConfig, mockContext);

      // 验证做出了选择
      expect(decision.providerId).toBeDefined();
      expect(decision.accountId).toBeDefined();
      expect(decision.reason).toContain("balance");
    });

    it("应该正确计算综合得分", async () => {
      const strategy = new BalancedStrategy();

      const openaiScore = await strategy.score(
        mockConfig.providers[0],
        mockContext
      );
      const azureScore = await strategy.score(
        mockConfig.providers[1],
        mockContext
      );
      const resellerScore = await strategy.score(
        mockConfig.providers[2],
        mockContext
      );

      // 所有得分应该在 0-100 之间
      expect(openaiScore).toBeGreaterThanOrEqual(0);
      expect(openaiScore).toBeLessThanOrEqual(100);
      expect(azureScore).toBeGreaterThanOrEqual(0);
      expect(azureScore).toBeLessThanOrEqual(100);
      expect(resellerScore).toBeGreaterThanOrEqual(0);
      expect(resellerScore).toBeLessThanOrEqual(100);
    });

    it("应该支持自定义权重", async () => {
      const strategy = new BalancedStrategy();

      // 设置自定义权重：更重视价格
      strategy.setWeights({
        price: 0.6, // 价格权重 60%
        speed: 0.2, // 速度权重 20%
        reliability: 0.2, // 可靠性权重 20%
      });

      const weights = strategy.getWeights();
      expect(weights.price).toBe(0.6);
      expect(weights.speed).toBe(0.2);
      expect(weights.reliability).toBe(0.2);
    });
  });

  describe("边界情况测试", () => {
    it("应该处理没有性能指标的情况", async () => {
      const configNoMetrics: ModelRoutingConfig = {
        ...mockConfig,
        providers: mockConfig.providers.map((p) => ({
          ...p,
          metrics: undefined,
        })),
      };

      const strategy = new NitroStrategy();
      const decision = await strategy.select(configNoMetrics, mockContext);

      // 应该仍然能做出选择
      expect(decision.providerId).toBeDefined();
    });

    it("应该处理所有供应商都禁用的情况", async () => {
      const configAllDisabled: ModelRoutingConfig = {
        ...mockConfig,
        providers: mockConfig.providers.map((p) => ({
          ...p,
          isEnabled: false,
        })),
      };

      const strategy = new NitroStrategy();

      // 应该抛出错误
      await expect(strategy.select(configAllDisabled, mockContext)).rejects.toThrow(
        "No available providers"
      );
    });

    it("应该处理只有一个可用供应商的情况", async () => {
      const configSingleProvider: ModelRoutingConfig = {
        ...mockConfig,
        providers: [mockConfig.providers[0]],
      };

      const strategy = new NitroStrategy();
      const decision = await strategy.select(configSingleProvider, mockContext);

      // 应该选择唯一的供应商
      expect(decision.providerId).toBe("openai-official-id");
      expect(decision.alternatives).toHaveLength(0);
    });
  });

  describe("成本估算测试", () => {
    it("应该正确估算请求成本", async () => {
      const strategy = new FloorStrategy();

      // 计算 1000 input + 500 output tokens 的成本
      const cost1 = strategy["calculateCost"](
        mockConfig.providers[0],
        1000,
        500
      );

      const expectedCost1 = (1000 / 1000) * 0.01 + (500 / 1000) * 0.03;
      expect(cost1).toBeCloseTo(expectedCost1, 4);

      // 计算 5000 input + 2000 output tokens 的成本
      const cost2 = strategy["calculateCost"](
        mockConfig.providers[0],
        5000,
        2000
      );

      const expectedCost2 = (5000 / 1000) * 0.01 + (2000 / 1000) * 0.03;
      expect(cost2).toBeCloseTo(expectedCost2, 4);
    });

    it("应该正确估算 Token 数量", async () => {
      const strategy = new FloorStrategy();

      const shortMessage = {
        messages: [{ role: "user", content: "Hi" }],
      };
      const tokens1 = strategy["estimateTokens"](shortMessage.messages);

      expect(tokens1.input).toBeGreaterThan(0);
      expect(tokens1.output).toBeGreaterThan(0);
      expect(tokens1.input).toBeGreaterThan(tokens1.output);

      const longMessage = {
        messages: [
          {
            role: "user",
            content:
              "This is a very long message that contains a lot of text and should result in more tokens being estimated by the strategy.",
          },
        ],
      };
      const tokens2 = strategy["estimateTokens"](longMessage.messages);

      expect(tokens2.input).toBeGreaterThan(tokens1.input);
    });
  });
});
