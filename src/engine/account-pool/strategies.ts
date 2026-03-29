// SPDX-License-Identifier: MIT
// Copyright (c) 2025 LMRouter Contributors

import type {
  ProviderAccount,
  AccountSelectionContext,
} from "../../types/account-pool.js";

/**
 * 账号选择策略接口
 */
export interface AccountSelectionStrategy {
  name: AccountSelectionStrategyType;
  selectAccount(
    accounts: ProviderAccount[],
    context: AccountSelectionContext
  ): ProviderAccount | null;
}

export type AccountSelectionStrategyType =
  | "round-robin"
  | "weighted-least-connections"
  | "success-rate-priority"
  | "random";

/**
 * 策略 1: 轮询（Round Robin）
 * 均匀分配请求到各个账号
 */
export class RoundRobinStrategy implements AccountSelectionStrategy {
  name: AccountSelectionStrategyType = "round-robin";
  private currentIndex = new Map<string, number>();

  selectAccount(
    accounts: ProviderAccount[],
    context: AccountSelectionContext
  ): ProviderAccount | null {
    // 过滤健康的账号
    const healthyAccounts = accounts.filter((account) => {
      if (account.status !== "active") return false;
      const successRate = Number(account.successRate || 0);
      return successRate >= 50; // 成功率至少 50%
    });

    if (healthyAccounts.length === 0) return null;

    // 获取或初始化索引
    const key = context.providerId;
    const index = this.currentIndex.get(key) || 0;
    const account = healthyAccounts[index % healthyAccounts.length];

    // 更新索引
    this.currentIndex.set(key, index + 1);

    return account;
  }

  reset(): void {
    this.currentIndex.clear();
  }
}

/**
 * 策略 2: 加权最少连接（Weighted Least Connections）
 * 优先选择负载最低的账号，考虑权重
 */
export class WeightedLeastConnectionsStrategy
  implements AccountSelectionStrategy
{
  name: AccountSelectionStrategyType = "weighted-least-connections";

  selectAccount(
    accounts: ProviderAccount[],
    context: AccountSelectionContext
  ): ProviderAccount | null {
    const healthyAccounts = accounts.filter((account) => {
      if (account.status !== "active") return false;
      // 检查速率限制
      if (
        account.rpmLimit &&
        account.rpmUsed &&
        account.rpmUsed >= account.rpmLimit
      ) {
        return false;
      }
      return true;
    });

    if (healthyAccounts.length === 0) return null;

    // 计算每个账号的负载得分
    const accountWithScore = healthyAccounts.map((account) => {
      const rpmLimit = account.rpmLimit || 100;
      const rpmUsed = account.rpmUsed || 0;
      const weight = account.weight || 100;

      // 负载率（已使用 / 限制）
      const loadRate = rpmUsed / rpmLimit;

      // 加权得分（负载率 / 权重），分数越低越好
      const score = (loadRate * 100) / weight;

      return { account, score };
    });

    // 选择得分最低的
    accountWithScore.sort((a, b) => a.score - b.score);
    return accountWithScore[0].account;
  }
}

/**
 * 策略 3: 成功率优先（Success Rate Priority）
 * 优先使用成功率高的账号
 */
export class SuccessRatePriorityStrategy implements AccountSelectionStrategy {
  name: AccountSelectionStrategyType = "success-rate-priority";

  selectAccount(
    accounts: ProviderAccount[],
    context: AccountSelectionContext
  ): ProviderAccount | null {
    const healthyAccounts = accounts.filter((account) => {
      return account.status === "active";
    });

    if (healthyAccounts.length === 0) return null;

    // 按成功率和权重综合排序
    const sorted = healthyAccounts.sort((a, b) => {
      const successRateA = Number(a.successRate || 0);
      const successRateB = Number(b.successRate || 0);
      const weightA = a.weight || 100;
      const weightB = b.weight || 100;

      // 综合得分 = 成功率 * 权重系数
      const scoreA = successRateA * (weightA / 100);
      const scoreB = successRateB * (weightB / 100);

      return scoreB - scoreA;
    });

    return sorted[0];
  }
}

/**
 * 策略 4: 随机选择（Random）
 * 随机选择一个可用账号
 */
export class RandomStrategy implements AccountSelectionStrategy {
  name: AccountSelectionStrategyType = "random";

  selectAccount(
    accounts: ProviderAccount[],
    context: AccountSelectionContext
  ): ProviderAccount | null {
    const healthyAccounts = accounts.filter((account) => {
      if (account.status !== "active") return false;
      const successRate = Number(account.successRate || 0);
      return successRate >= 50;
    });

    if (healthyAccounts.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * healthyAccounts.length);
    return healthyAccounts[randomIndex];
  }
}

/**
 * 账号选择策略工厂
 */
export class AccountSelectionStrategyFactory {
  private strategies: Map<AccountSelectionStrategyType, AccountSelectionStrategy>;

  constructor() {
    this.strategies = new Map([
      ["round-robin", new RoundRobinStrategy()],
      ["weighted-least-connections", new WeightedLeastConnectionsStrategy()],
      ["success-rate-priority", new SuccessRatePriorityStrategy()],
      ["random", new RandomStrategy()],
    ]);
  }

  getStrategy(type: AccountSelectionStrategyType): AccountSelectionStrategy {
    const strategy = this.strategies.get(type);
    if (!strategy) {
      throw new Error(`Unknown strategy: ${type}`);
    }
    return strategy;
  }

  registerStrategy(
    type: AccountSelectionStrategyType,
    strategy: AccountSelectionStrategy
  ): void {
    this.strategies.set(type, strategy);
  }

  availableStrategies(): AccountSelectionStrategyType[] {
    return Array.from(this.strategies.keys());
  }
}
