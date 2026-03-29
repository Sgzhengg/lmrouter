// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

/**
 * 账号池功能集成测试
 * 测试账号选择、故障转移、性能监控等核心功能
 */

import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { AccountPoolManager } from "../../src/engine/account-pool/manager.js";
import { AccountPoolDatabase } from "../../src/utils/account-pool-db.js";
import type {
  ProviderAccount,
  AccountSelectionContext,
  RequestResult,
} from "../../src/types/account-pool.js";

describe("账号池管理器测试", () => {
  let db: AccountPoolDatabase;
  let manager: AccountPoolManager;
  let testProviderId: string;
  let testAccounts: ProviderAccount[] = [];

  beforeAll(async () => {
    // TODO: 初始化测试数据库
    // db = new AccountPoolDatabase(testDbConnection);
    // manager = new AccountPoolManager(db);

    // 创建测试供应商
    // const provider = await db.createProvider({
    //   name: "test-provider",
    //   displayName: "Test Provider",
    //   type: "openai",
    //   baseUrl: "https://api.test.com",
    // });
    // testProviderId = provider.id;

    // 创建测试账号
    // testAccounts = await createTestAccounts(db, testProviderId);
  });

  afterEach(async () => {
    // 每个测试后重置账号状态
    for (const account of testAccounts) {
      // await db.updateAccount(account.id, {
      //   status: "active",
      //   failureCount: 0,
      //   successRate: "100",
      // });
    }
  });

  describe("账号选择策略测试", () => {
    it("应该使用 success-rate-priority 策略选择成功率最高的账号", async () => {
      // 准备测试数据
      const context: AccountSelectionContext = {
        providerId: testProviderId,
        modelName: "gpt-4",
      };

      // 设置不同的成功率
      // await db.updateAccount(testAccounts[0].id, { successRate: "95", weight: 100 });
      // await db.updateAccount(testAccounts[1].id, { successRate: "85", weight: 100 });
      // await db.updateAccount(testAccounts[2].id, { successRate: "90", weight: 100 });

      // 执行选择
      // const selected = await manager.selectAccount(context, "success-rate-priority");

      // 验证结果
      // expect(selected).not.toBeNull();
      // expect(selected?.id).toBe(testAccounts[0].id); // 成功率最高的
    });

    it("应该使用 round-robin 策略轮询选择账号", async () => {
      const context: AccountSelectionContext = {
        providerId: testProviderId,
        modelName: "gpt-4",
      };

      // 第一次选择
      // const first = await manager.selectAccount(context, "round-robin");
      // expect(first).not.toBeNull();

      // 第二次选择
      // const second = await manager.selectAccount(context, "round-robin");
      // expect(second).not.toBeNull();
      // expect(second?.id).not.toBe(first?.id); // 应该选择不同的账号
    });

    it("应该使用 weighted-least-connections 策略选择负载最低的账号", async () => {
      const context: AccountSelectionContext = {
        providerId: testProviderId,
        modelName: "gpt-4",
      };

      // 设置不同的负载
      // await db.updateAccount(testAccounts[0].id, { rpmUsed: 10, rpmLimit: 100, weight: 100 });
      // await db.updateAccount(testAccounts[1].id, { rpmUsed: 50, rpmLimit: 100, weight: 100 });
      // await db.updateAccount(testAccounts[2].id, { rpmUsed: 30, rpmLimit: 100, weight: 100 });

      // 执行选择
      // const selected = await manager.selectAccount(context, "weighted-least-connections");

      // 验证结果（应该选择负载最低的账号0）
      // expect(selected).not.toBeNull();
      // expect(selected?.id).toBe(testAccounts[0].id);
    });
  });

  describe("故障处理测试", () => {
    it("应该正确处理账号被封的情况", async () => {
      const accountId = testAccounts[0].id;

      // 模拟账号被封
      // await manager.markAccountBanned(accountId, "Test ban");

      // 验证账号状态
      // const account = await db.getAccount(accountId);
      // expect(account?.status).toBe("banned");

      // 验证被封账号不会被选中
      // const context: AccountSelectionContext = {
      //   providerId: testProviderId,
      //   modelName: "gpt-4",
      // };
      // const selected = await manager.selectAccount(context);
      // expect(selected?.id).not.toBe(accountId);
    });

    it("应该正确处理速率限制的情况", async () => {
      const accountId = testAccounts[0].id;

      // 模拟多次速率限制错误
      const result: RequestResult = {
        success: false,
        latency: 100,
        tokens: { input: 10, output: 0 },
        cost: 0,
        errorCode: "rate_limited",
        errorMessage: "Rate limit exceeded",
      };

      // 连续触发5次
      // for (let i = 0; i < 5; i++) {
      //   await manager.recordRequestResult(accountId, `req-${i}`, result, {
      //     modelName: "gpt-4",
      //   });
      // }

      // 验证账号被标记为 rate_limited
      // const account = await db.getAccount(accountId);
      // expect(account?.status).toBe("rate_limited");
    });

    it("应该在主账号失败时自动降级到备用账号", async () => {
      // 将第一个账号标记为降级
      // await db.updateAccount(testAccounts[0].id, {
      //   status: "degraded",
      //   successRate: "20",
      // });

      // 执行选择
      // const context: AccountSelectionContext = {
      //   providerId: testProviderId,
      //   modelName: "gpt-4",
      // };
      // const selected = await manager.selectAccount(context);

      // 验证选择了健康的账号
      // expect(selected).not.toBeNull();
      // expect(selected?.id).not.toBe(testAccounts[0].id);
    });
  });

  describe("性能监控测试", () => {
    it("应该正确记录请求结果", async () => {
      const accountId = testAccounts[0].id;
      const requestId = "test-request-001";

      const result: RequestResult = {
        success: true,
        latency: 150,
        tokens: { input: 100, output: 50 },
        cost: 0.002,
        ttft: 120,
      };

      // 记录结果
      // await manager.recordRequestResult(accountId, requestId, result, {
      //   userId: "test-user",
      //   modelName: "gpt-4",
      // });

      // 验证日志被创建
      // const logs = await db.getRecentAccountLogs(accountId, "1h");
      // expect(logs).toHaveLength(1);
      // expect(logs[0].requestId).toBe(requestId);
      // expect(logs[0].status).toBe("success");
    });

    it("应该正确计算账号健康状态", async () => {
      const accountId = testAccounts[0].id;

      // 设置测试数据
      // await db.updateAccount(accountId, {
      //   successRate: "95",
      //   failureCount: 0,
      //   lastSuccessAt: new Date(),
      // });

      // 获取健康状态
      // const health = await manager.getAccountHealth(accountId);

      // 验证结果
      // expect(health.status).toBe("healthy");
      // expect(health.successRate).toBe(95);
      // expect(health.failureCount).toBe(0);
    });
  });

  describe("边界情况测试", () => {
    it("应该在所有账号都不可用时返回 null", async () => {
      // 将所有账号标记为不可用
      // for (const account of testAccounts) {
      //   await db.updateAccount(account.id, { status: "banned" });
      // }

      // 执行选择
      // const context: AccountSelectionContext = {
      //   providerId: testProviderId,
      //   modelName: "gpt-4",
      // };
      // const selected = await manager.selectAccount(context);

      // 验证结果
      // expect(selected).toBeNull();
    });

    it("应该在提供商没有账号时返回 null", async () => {
      // 使用不存在的提供商 ID
      // const context: AccountSelectionContext = {
      //   providerId: "non-existent-provider",
      //   modelName: "gpt-4",
      // };
      // const selected = await manager.selectAccount(context);

      // 验证结果
      // expect(selected).toBeNull();
    });
  });
});

/**
 * 辅助函数：创建测试账号
 */
async function createTestAccounts(
  db: AccountPoolDatabase,
  providerId: string
): Promise<ProviderAccount[]> {
  const accounts = [
    {
      providerId,
      accountName: "test-account-1",
      apiKeyEncrypted: "encrypted-key-1",
      rpmLimit: 100,
      tpmLimit: 10000,
      weight: 100,
      priority: 0,
    },
    {
      providerId,
      accountName: "test-account-2",
      apiKeyEncrypted: "encrypted-key-2",
      rpmLimit: 100,
      tpmLimit: 10000,
      weight: 100,
      priority: 1,
    },
    {
      providerId,
      accountName: "test-account-3",
      apiKeyEncrypted: "encrypted-key-3",
      rpmLimit: 100,
      tpmLimit: 10000,
      weight: 100,
      priority: 2,
    },
  ];

  const created: ProviderAccount[] = [];
  for (const accountData of accounts) {
    // const account = await db.createAccount(accountData);
    // created.push(account);
  }

  return created;
}
