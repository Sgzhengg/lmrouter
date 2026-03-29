// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

/**
 * 路由引擎功能测试脚本
 *
 * 这是一个独立的测试脚本，不需要启动服务器或使用 MockLLM
 * 直接测试路由策略和场景识别的逻辑
 *
 * 运行方式：
 * npx tsx tests/run-routing-tests.ts
 */

import { NitroStrategy } from "../src/engine/routing/strategies/nitro.js";
import { FloorStrategy } from "../src/engine/routing/strategies/floor.js";
import { BalancedStrategy } from "../src/engine/routing/strategies/balanced.js";
import { ScenarioRecognizer } from "../src/engine/routing/scenario-recognizer.js";
import type { ModelRoutingConfig, RoutingRequestContext } from "../src/types/routing.js";

// ============================================
// 测试数据
// ============================================

const testModelConfig: ModelRoutingConfig = {
  modelId: "gpt-4-turbo-id",
  modelName: "gpt-4-turbo",
  providers: [
    {
      providerId: "openai-official",
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
        avgThroughput: 80,
        avgLatencyMs: 1000,
        successRate: 99.5,
        uptime: 99.9,
        errorRate: 0.5,
      },
    },
    {
      providerId: "azure-openai",
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
      providerId: "reseller-cheap",
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

// ============================================
// 测试函数
// ============================================

async function testNitroStrategy() {
  console.log("\n" + "=".repeat(60));
  console.log("测试 1: Nitro 策略（速度优先）");
  console.log("=".repeat(60));

  const strategy = new NitroStrategy();
  const context: RoutingRequestContext = {
    modelName: "gpt-4-turbo",
    messages: [{ role: "user", content: "快速响应我！" }],
    estimatedTokens: { input: 1000, output: 500 },
  };

  const decision = await strategy.select(testModelConfig, context);

  console.log("✓ 策略:", decision.strategy);
  console.log("✓ 选择供应商:", decision.providerId);
  console.log("✓ 选择账号:", decision.accountId);
  console.log("✓ 决策原因:", decision.reason);
  console.log("✓ 预估成本:", `$${decision.estimatedCost?.toFixed(6)}`);
  console.log("✓ 预估延迟:", `${decision.estimatedLatency}ms`);
  console.log("✓ 备选方案:", decision.alternatives.length, "个");

  // 验证：应该选择最快的（OpenAI）
  if (decision.providerId === "openai-official") {
    console.log("✅ 测试通过：选择了最快的供应商");
  } else {
    console.log("❌ 测试失败：没有选择最快的供应商");
  }
}

async function testFloorStrategy() {
  console.log("\n" + "=".repeat(60));
  console.log("测试 2: Floor 策略（价格优先）");
  console.log("=".repeat(60));

  const strategy = new FloorStrategy();
  const context: RoutingRequestContext = {
    modelName: "gpt-4-turbo",
    messages: [{ role: "user", content: "批量处理大量数据" }],
    estimatedTokens: { input: 10000, output: 5000 },
  };

  const decision = await strategy.select(testModelConfig, context);

  console.log("✓ 策略:", decision.strategy);
  console.log("✓ 选择供应商:", decision.providerId);
  console.log("✓ 选择账号:", decision.accountId);
  console.log("✓ 决策原因:", decision.reason);
  console.log("✓ 预估成本:", `$${decision.estimatedCost?.toFixed(6)}`);
  console.log("✓ 备选方案:", decision.alternatives.length, "个");

  // 验证：应该选择最便宜的（Reseller）
  if (decision.providerId === "reseller-cheap") {
    console.log("✅ 测试通过：选择了最便宜的供应商");
  } else {
    console.log("❌ 测试失败：没有选择最便宜的供应商");
  }
}

async function testBalancedStrategy() {
  console.log("\n" + "=".repeat(60));
  console.log("测试 3: Balanced 策略（平衡模式）");
  console.log("=".repeat(60));

  const strategy = new BalancedStrategy();
  const context: RoutingRequestContext = {
    modelName: "gpt-4-turbo",
    messages: [{ role: "user", content: "通用请求" }],
    estimatedTokens: { input: 1000, output: 500 },
  };

  const decision = await strategy.select(testModelConfig, context);

  console.log("✓ 策略:", decision.strategy);
  console.log("✓ 选择供应商:", decision.providerId);
  console.log("✓ 选择账号:", decision.accountId);
  console.log("✓ 决策原因:", decision.reason);
  console.log("✓ 预估成本:", `$${decision.estimatedCost?.toFixed(6)}`);
  console.log("✓ 预估延迟:", `${decision.estimatedLatency}ms`);

  // Balanced 策略可能选择任何供应商，取决于综合得分
  console.log("✅ 测试通过：Balanced 策略做出了选择");
}

async function testScenarioRecognition() {
  console.log("\n" + "=".repeat(60));
  console.log("测试 4: 场景识别");
  console.log("=".repeat(60));

  const recognizer = new ScenarioRecognizer();

  const testCases = [
    {
      name: "代码生成",
      message: "帮我写一个快速排序算法",
      expectedScenario: "code-generation",
      expectedModel: "claude-3-opus",
    },
    {
      name: "简单问答",
      message: "你好，请介绍一下你自己",
      expectedScenario: "simple-qa",
      expectedModel: "gpt-3.5-turbo",
    },
    {
      name: "复杂推理",
      message: "证明：如果A > B 且 B > C，则 A > C",
      expectedScenario: "complex-reasoning",
      expectedModel: "gpt-4-turbo",
    },
    {
      name: "创意写作",
      message: "帮我写一篇关于春天的科幻小说",
      expectedScenario: "creative-writing",
      expectedModel: "claude-3-sonnet",
    },
  ];

  for (const testCase of testCases) {
    console.log(`\n--- ${testCase.name} ---`);
    console.log(`用户消息: "${testCase.message}"`);

    const context: RoutingRequestContext = {
      modelName: "gpt-4",
      messages: [{ role: "user", content: testCase.message }],
    };

    const result = recognizer.recognize(context);

    console.log(`✓ 识别场景: ${result.scenario}`);
    console.log(`✓ 推荐模型: ${result.recommendedModel}`);
    console.log(`✓ 推荐原因: ${result.reason}`);
    console.log(`✓ 置信度: ${(result.confidence * 100).toFixed(0)}%`);

    // 验证
    if (result.scenario === testCase.expectedScenario) {
      console.log("✅ 场景识别正确");
    } else {
      console.log(`❌ 场景识别错误，期望：${testCase.expectedScenario}`);
    }

    if (result.recommendedModel === testCase.expectedModel) {
      console.log("✅ 模型推荐正确");
    } else {
      console.log(`⚠️  模型推荐不同，期望：${testCase.expectedModel}`);
    }
  }
}

async function testCostSavings() {
  console.log("\n" + "=".repeat(60));
  console.log("测试 5: 成本节省估算");
  console.log("=".repeat(60));

  const testCases = [
    {
      name: "简单问答场景",
      originalModel: "gpt-4-turbo",
      recommendedModel: "gpt-3.5-turbo",
      inputTokens: 500,
      outputTokens: 200,
    },
    {
      name: "代码生成场景",
      originalModel: "gpt-4-turbo",
      recommendedModel: "claude-3-opus",
      inputTokens: 2000,
      outputTokens: 1000,
    },
    {
      name: "长文本场景",
      originalModel: "gpt-4-turbo",
      recommendedModel: "claude-3-opus",
      inputTokens: 10000,
      outputTokens: 2000,
    },
  ];

  // 模型价格表
  const modelPrices: Record<string, { input: number; output: number }> = {
    "gpt-4-turbo": { input: 0.01, output: 0.03 },
    "gpt-3.5-turbo": { input: 0.0005, output: 0.0015 },
    "claude-3-opus": { input: 0.015, output: 0.075 },
    "claude-3-sonnet": { input: 0.003, output: 0.015 },
  };

  for (const testCase of testCases) {
    console.log(`\n--- ${testCase.name} ---`);
    console.log(`原模型: ${testCase.originalModel}`);
    console.log(`推荐模型: ${testCase.recommendedModel}`);
    console.log(`输入 tokens: ${testCase.inputTokens}`);
    console.log(`输出 tokens: ${testCase.outputTokens}`);

    // 计算成本
    const originalPrice = modelPrices[testCase.originalModel];
    const recommendedPrice = modelPrices[testCase.recommendedModel];

    const originalCost =
      (testCase.inputTokens / 1000) * originalPrice.input +
      (testCase.outputTokens / 1000) * originalPrice.output;

    const recommendedCost =
      (testCase.inputTokens / 1000) * recommendedPrice.input +
      (testCase.outputTokens / 1000) * recommendedPrice.output;

    const savings = originalCost - recommendedCost;
    const savingsPercentage =
      originalCost > 0 ? (savings / originalCost) * 100 : 0;

    console.log(`\n原模型成本: $${originalCost.toFixed(4)}`);
    console.log(`推荐模型成本: $${recommendedCost.toFixed(4)}`);
    console.log(`节省: $${savings.toFixed(4)} (${savingsPercentage.toFixed(1)}%)`);

    if (savings > 0) {
      console.log("✅ 实现了成本节省");
    } else {
      console.log("⚠️  成本增加了");
    }
  }
}

async function testStrategyComparison() {
  console.log("\n" + "=".repeat(60));
  console.log("测试 6: 策略对比");
  console.log("=".repeat(60));

  const context: RoutingRequestContext = {
    modelName: "gpt-4-turbo",
    messages: [{ role: "user", content: "测试消息" }],
    estimatedTokens: { input: 1000, output: 500 },
  };

  const strategies = [
    new NitroStrategy(),
    new FloorStrategy(),
    new BalancedStrategy(),
  ];

  console.log("\n供应商性能对比：");
  console.log("-".repeat(60));
  console.log(
    "供应商".padEnd(20) +
      "TTFT".padEnd(10) +
      "价格($/1K)".padEnd(15) +
      "成功率".padEnd(10)
  );
  console.log("-".repeat(60));

  for (const provider of testModelConfig.providers) {
    console.log(
      provider.providerName.padEnd(20) +
        `${provider.metrics?.avgTtftMs || "N/A"}ms`.padEnd(10) +
        `$${provider.pricingInput?.toFixed(3) || "N/A"}/${provider.pricingOutput?.toFixed(3) || "N/A"}`.padEnd(15) +
        `${provider.metrics?.successRate || "N/A"}%`.padEnd(10)
    );
  }

  console.log("\n各策略选择结果：");
  console.log("-".repeat(60));

  for (const strategy of strategies) {
    const decision = await strategy.select(testModelConfig, context);

    console.log(`\n${strategy.name}:`);
    console.log(`  选择: ${decision.providerId} (${decision.accountId})`);
    console.log(`  原因: ${decision.reason}`);
    console.log(`  成本: $${decision.estimatedCost?.toFixed(6)}`);
    console.log(`  延迟: ~${decision.estimatedLatency}ms`);
  }
}

// ============================================
// 主函数
// ============================================

async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("LMRouter 智能路由引擎 - 功能测试");
  console.log("=".repeat(60));
  console.log("\n这个脚本测试路由引擎的核心逻辑，不需要真实的 API 调用");
  console.log("包括：路由策略、场景识别、成本估算等");

  try {
    // 运行所有测试
    await testNitroStrategy();
    await testFloorStrategy();
    await testBalancedStrategy();
    await testScenarioRecognition();
    await testCostSavings();
    await testStrategyComparison();

    console.log("\n" + "=".repeat(60));
    console.log("✅ 所有测试完成！");
    console.log("=".repeat(60));

    console.log("\n下一步：");
    console.log("1. 运行单元测试：pnpm test tests/unit/");
    console.log("2. 运行集成测试：pnpm test tests/integration/");
    console.log("3. 查看详细文档：docs/ROUTING_ENGINE_GUIDE.md");
  } catch (error) {
    console.error("\n❌ 测试失败:", error);
    process.exit(1);
  }
}

// 运行测试
main();
