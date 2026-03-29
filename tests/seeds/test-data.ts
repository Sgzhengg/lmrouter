// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

/**
 * 测试种子数据
 * 用于初始化测试数据库
 */

export const testProviders = [
  {
    id: "openai-official-id",
    name: "openai-official",
    displayName: "OpenAI Official",
    type: "openai",
    baseUrl: "https://api.openai.com/v1",
    description: "OpenAI 官方 API",
    status: "active",
    priority: 1,
  },
  {
    id: "azure-openai-id",
    name: "azure-openai",
    displayName: "Azure OpenAI",
    type: "openai",
    baseUrl: "https://dummy-azure.openai.com/v1",
    description: "Azure OpenAI (模拟)",
    status: "active",
    priority: 2,
  },
  {
    id: "reseller-cheap-id",
    name: "reseller-cheap",
    displayName: "Cheap Reseller",
    type: "openai",
    baseUrl: "https://dummy-reseller.com/v1",
    description: "第三方代理商（便宜）",
    status: "active",
    priority: 3,
  },
];

export const testAccounts = [
  // OpenAI Official 的账号
  {
    id: "openai-account-1",
    providerId: "openai-official-id",
    accountName: "openai-account-1",
    apiKeyEncrypted: "encrypted-key-1",
    status: "active",
    rpmLimit: 100,
    tpmLimit: 90000,
    weight: 100,
    priority: 0,
    failureCount: 0,
    successRate: "99.5",
    lastSuccessAt: new Date(),
    totalCost: "12.5",
    requestCount: 1250,
  },
  {
    id: "openai-account-2",
    providerId: "openai-official-id",
    accountName: "openai-account-2",
    apiKeyEncrypted: "encrypted-key-2",
    status: "active",
    rpmLimit: 100,
    tpmLimit: 90000,
    weight: 100,
    priority: 1,
    failureCount: 0,
    successRate: "98.0",
    lastSuccessAt: new Date(),
    totalCost: "10.2",
    requestCount: 1020,
  },
  // Azure OpenAI 的账号
  {
    id: "azure-account-1",
    providerId: "azure-openai-id",
    accountName: "azure-account-1",
    apiKeyEncrypted: "encrypted-key-3",
    status: "active",
    rpmLimit: 80,
    tpmLimit: 70000,
    weight: 90,
    priority: 0,
    failureCount: 0,
    successRate: "99.0",
    lastSuccessAt: new Date(),
    totalCost: "8.5",
    requestCount: 850,
  },
  // 代理商的账号（便宜但成功率低）
  {
    id: "reseller-account-1",
    providerId: "reseller-cheap-id",
    accountName: "reseller-account-1",
    apiKeyEncrypted: "encrypted-key-4",
    status: "active",
    rpmLimit: 60,
    tpmLimit: 50000,
    weight: 80,
    priority: 0,
    failureCount: 0,
    successRate: "95.0",
    lastSuccessAt: new Date(),
    totalCost: "5.0",
    requestCount: 500,
  },
  // 一个有问题的账号（用于测试故障转移）
  {
    id: "degraded-account-1",
    providerId: "openai-official-id",
    accountName: "degraded-account-1",
    apiKeyEncrypted: "encrypted-key-5",
    status: "degraded",
    rpmLimit: 100,
    tpmLimit: 90000,
    weight: 100,
    priority: 2,
    failureCount: 5,
    successRate: "70.0",
    lastFailureAt: new Date(),
    totalCost: "3.0",
    requestCount: 300,
  },
];

export const testModels = [
  {
    id: "gpt-4-turbo-id",
    name: "gpt-4-turbo",
    displayName: "GPT-4 Turbo",
    type: "language",
    description: "OpenAI GPT-4 Turbo model",
    contextWindow: 128000,
    maxTokens: 4096,
  },
  {
    id: "gpt-3.5-turbo-id",
    name: "gpt-3.5-turbo",
    displayName: "GPT-3.5 Turbo",
    type: "language",
    description: "OpenAI GPT-3.5 Turbo model",
    contextWindow: 16385,
    maxTokens: 4096,
  },
  {
    id: "claude-3-opus-id",
    name: "claude-3-opus",
    displayName: "Claude 3 Opus",
    type: "language",
    description: "Anthropic Claude 3 Opus",
    contextWindow: 200000,
    maxTokens: 4096,
  },
  {
    id: "claude-3-sonnet-id",
    name: "claude-3-sonnet",
    displayName: "Claude 3 Sonnet",
    type: "language",
    description: "Anthropic Claude 3 Sonnet",
    contextWindow: 200000,
    maxTokens: 4096,
  },
];

export const testModelProviders = [
  // GPT-4 Turbo 的供应商配置
  {
    id: "gpt4-openai-official",
    modelId: "gpt-4-turbo-id",
    providerId: "openai-official-id",
    providerModelName: "gpt-4-turbo-preview",
    pricingInput: 0.01,
    pricingOutput: 0.03,
    isEnabled: true,
    priority: 1,
  },
  {
    id: "gpt4-azure",
    modelId: "gpt-4-turbo-id",
    providerId: "azure-openai-id",
    providerModelName: "gpt-4-turbo",
    pricingInput: 0.012,
    pricingOutput: 0.035,
    isEnabled: true,
    priority: 2,
  },
  {
    id: "gpt4-reseller",
    modelId: "gpt-4-turbo-id",
    providerId: "reseller-cheap-id",
    providerModelName: "gpt-4-turbo",
    pricingInput: 0.008,
    pricingOutput: 0.025,
    isEnabled: true,
    priority: 3,
  },
  // GPT-3.5 Turbo 的供应商配置
  {
    id: "gpt35-openai",
    modelId: "gpt-3.5-turbo-id",
    providerId: "openai-official-id",
    providerModelName: "gpt-3.5-turbo",
    pricingInput: 0.0005,
    pricingOutput: 0.0015,
    isEnabled: true,
    priority: 1,
  },
  {
    id: "gpt35-reseller",
    modelId: "gpt-3.5-turbo-id",
    providerId: "reseller-cheap-id",
    providerModelName: "gpt-3.5-turbo",
    pricingInput: 0.0003,
    pricingOutput: 0.001,
    isEnabled: true,
    priority: 2,
  },
  // Claude 3 Opus 的供应商配置
  {
    id: "claude-opus-openai",
    modelId: "claude-3-opus-id",
    providerId: "openai-official-id",
    providerModelName: "claude-3-opus-20240229",
    pricingInput: 0.015,
    pricingOutput: 0.075,
    isEnabled: true,
    priority: 1,
  },
  // Claude 3 Sonnet 的供应商配置
  {
    id: "claude-sonnet-openai",
    modelId: "claude-3-sonnet-id",
    providerId: "openai-official-id",
    providerModelName: "claude-3-sonnet-20240229",
    pricingInput: 0.003,
    pricingOutput: 0.015,
    isEnabled: true,
    priority: 1,
  },
];

export const testPerformanceMetrics = [
  // OpenAI Account 1 - 性能好
  {
    accountId: "openai-account-1",
    providerId: "openai-official-id",
    modelName: "gpt-4-turbo",
    ttftMs: 120,
    throughput: 80,
    latencyMs: 1000,
    inputTokens: 1000,
    outputTokens: 500,
    timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 分钟前
  },
  {
    accountId: "openai-account-1",
    providerId: "openai-official-id",
    modelName: "gpt-4-turbo",
    ttftMs: 130,
    throughput: 75,
    latencyMs: 1100,
    inputTokens: 1200,
    outputTokens: 600,
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 分钟前
  },
  // OpenAI Account 2 - 性能一般
  {
    accountId: "openai-account-2",
    providerId: "openai-official-id",
    modelName: "gpt-4-turbo",
    ttftMs: 180,
    throughput: 60,
    latencyMs: 1500,
    inputTokens: 800,
    outputTokens: 400,
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
  },
  // Azure Account - 性能中等
  {
    accountId: "azure-account-1",
    providerId: "azure-openai-id",
    modelName: "gpt-4-turbo",
    ttftMs: 150,
    throughput: 70,
    latencyMs: 1200,
    inputTokens: 900,
    outputTokens: 450,
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
  },
  // Reseller Account - 性能差但便宜
  {
    accountId: "reseller-account-1",
    providerId: "reseller-cheap-id",
    modelName: "gpt-4-turbo",
    ttftMs: 250,
    throughput: 40,
    latencyMs: 2000,
    inputTokens: 1100,
    outputTokens: 550,
    timestamp: new Date(Date.now() - 20 * 60 * 1000),
  },
];

/**
 * 创建测试种子数据的辅助函数
 */
export async function seedTestData(db: any): Promise<void> {
  console.log("开始创建测试种子数据...");

  // 创建供应商
  for (const provider of testProviders) {
    try {
      await db.createProvider(provider);
      console.log(`✓ 创建供应商: ${provider.name}`);
    } catch (error) {
      console.log(`- 供应商已存在: ${provider.name}`);
    }
  }

  // 创建模型
  for (const model of testModels) {
    try {
      await db.createModel(model);
      console.log(`✓ 创建模型: ${model.name}`);
    } catch (error) {
      console.log(`- 模型已存在: ${model.name}`);
    }
  }

  // 创建账号
  for (const account of testAccounts) {
    try {
      await db.createAccount(account);
      console.log(`✓ 创建账号: ${account.accountName}`);
    } catch (error) {
      console.log(`- 账号已存在: ${account.accountName}`);
    }
  }

  // 创建模型-供应商关联
  for (const modelProvider of testModelProviders) {
    try {
      await db.addProviderToModel(modelProvider);
      console.log(
        `✓ 创建模型关联: ${modelProvider.modelId} <-> ${modelProvider.providerId}`
      );
    } catch (error) {
      console.log(
        `- 模型关联已存在: ${modelProvider.modelId} <-> ${modelProvider.providerId}`
      );
    }
  }

  console.log("测试种子数据创建完成！");
}

/**
 * 清理测试数据
 */
export async function cleanupTestData(db: any): Promise<void> {
  console.log("开始清理测试数据...");

  for (const account of testAccounts) {
    try {
      await db.deleteAccount(account.id);
      console.log(`✓ 删除账号: ${account.accountName}`);
    } catch (error) {
      console.log(`- 删除账号失败: ${account.accountName}`);
    }
  }

  for (const model of testModels) {
    try {
      await db.deleteModel(model.id);
      console.log(`✓ 删除模型: ${model.name}`);
    } catch (error) {
      console.log(`- 删除模型失败: ${model.name}`);
    }
  }

  for (const provider of testProviders) {
    try {
      await db.deleteProvider(provider.id);
      console.log(`✓ 删除供应商: ${provider.name}`);
    } catch (error) {
      console.log(`- 删除供应商失败: ${provider.name}`);
    }
  }

  console.log("测试数据清理完成！");
}
